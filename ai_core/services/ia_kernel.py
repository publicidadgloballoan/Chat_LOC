import os
import json
import time
import requests
import logging
import sqlite3
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv(r"c:\SaaSIA\backend\.env")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

class IAKernel:
    def __init__(self):
        self.timeout_local = 300
        self.ollama_url = "http://localhost:11434/api/chat"
        self.max_history = 10
        self.pricing = self._load_pricing()
        self.db_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'brain_sessions.db')
        self.logistics = self._load_logistics()

    def _update_stats(self, model_name, tokens=0, success=0, fail=0):
        try:
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()
            c.execute("SELECT 1 FROM ai_models_stats WHERE model_name = ?", (model_name,))
            if c.fetchone():
                c.execute("UPDATE ai_models_stats SET tokens_used = tokens_used + ?, success_count = success_count + ?, fail_count = fail_count + ? WHERE model_name = ?", (tokens, success, fail, model_name))
            else:
                c.execute("INSERT INTO ai_models_stats (model_name, tokens_used, success_count, fail_count) VALUES (?, ?, ?, ?)", (model_name, tokens, success, fail))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error updating model stats for {model_name}: {e}")

    def _load_pricing(self):
        try:
            path = r"c:\SaaSIA\ai_core\config\ventas_nico_meta\configs\pricing.json"
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data.get("data", {}).get("breeds", [])
        except:
            return []

    def _load_logistics(self):
        try:
            path = r"c:\SaaSIA\ai_core\config\company_1\configs\logistics.json"
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data.get("data", {}).get("shipping_zones", [])
        except:
            return []

    def get_structured_catalog(self):
        catalog = ["¡Claro! Aquí tienes nuestro catálogo numerado:\n"]
        for i, breed in enumerate(self.pricing, 1):
            name = breed.get("name", "")
            price = breed.get("price", "Consultar")
            catalog.append(f"{i}. {name} - ${price:,}")
        catalog.append("\nPor favor, responde solo con el número de la raza que te interesa para darte más detalles.")
        return "\n".join(catalog)

    def find_breed_by_query(self, query):
        query = str(query).strip().lower()
        
        # Intentar extraer un nÃºmero del texto (ej: "el 4", "quiero el 12", "numero 5")
        import re
        num_match = re.search(r'\b(\d+)\b', query)
        if num_match:
            idx = int(num_match.group(1)) - 1
            if 0 <= idx < len(self.pricing):
                return self.pricing[idx]

        for breed in self.pricing:
            b_name = breed.get("name", "").lower()
            if b_name and (b_name in query or query in b_name):
                return breed
        return None

    def build_system_prompt(self, base_prompt):
        catalog = self.get_structured_catalog()
        rules = f"""
REGLAS ESTRUCTURADAS (MUY IMPORTANTES):

1. Si el cliente pide catÃ¡logo, lista de razas, quÃ© tienen, precios, etc.:
   â†’ Responde con el catÃ¡logo numerado completo.
   â†’ Al final pregunta: "Â¿QuÃ© nÃºmero te interesa? Te puedo mandar fotos y detalles."

2. Si menciona un nÃºmero (ej: "el 5", "quiero el nÃºmero 12", "el 8"):
   â†’ Busca esa raza y responde con precio, caracterÃ­sticas y confirma si quiere fotos.

3. MantÃ©n un tono amigable y profesional.

CATÃLOGO COMPLETO:
{catalog}
"""
        return base_prompt + "\n\n" + rules

    def query_groq_fallback(self, messages):
        groq_key = os.getenv("GROQ_API_KEY") or GROQ_API_KEY
        if not groq_key:
            logger.warning("[GROQ FALLBACK] GROQ_API_KEY no encontrada.")
            return None
        
        # Protege contra error 413 (Payload Too Large) de Groq limitando el system prompt a 12k chars
        safe_messages = []
        for m in messages:
            content = m.get("content", "")
            if m.get("role") == "system" and len(content) > 12000:
                content = content[:12000] + "\n\n[... Base de conocimiento recortada para consulta rápida ...]"
            safe_messages.append({"role": m.get("role", "user"), "content": content})

        for model_name in ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"]:
            try:
                r = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                    json={"model": model_name, "messages": safe_messages, "temperature": 0.6, "max_tokens": 800},
                    timeout=12
                )
                if r.status_code == 200:
                    data = r.json()
                    usage = data.get('usage', {})
                    logger.info(f"[GROQ] Modelo {model_name} Tokens: {usage.get('total_tokens')}")
                    self._update_stats(f"Groq ({model_name})", tokens=usage.get('total_tokens', 0), success=1)
                    return data['choices'][0]['message']['content']
                else:
                    logger.error(f"[GROQ] Error {r.status_code} con {model_name}: {r.text[:100]}")
            except Exception as e:
                logger.error(f"[GROQ] Error con {model_name}: {e}")
        self._update_stats("Groq", fail=1)
        return None

    def query_gemini_fallback(self, messages):
        gemini_key = os.getenv("GEMINI_API_KEY") or GEMINI_API_KEY
        if not gemini_key:
            logger.warning("[GEMINI FALLBACK] GEMINI_API_KEY no encontrada.")
            return None
        try:
            prompt = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
            prompt += "\n\nIMPORTANTE: Si el usuario manda '__MULTIMEDIA__', asume que es el comprobante de pago válido y responde confirmando la recepción y pidiendo los últimos datos de envío si faltan."
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            r = requests.post(url, json=payload, timeout=15)
            if r.status_code == 200:
                data = r.json()
                logger.info("[GEMINI FALLBACK] Respuesta generada exitosamente.")
                self._update_stats("Gemini 1.5 Flash", success=1)
                return data['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            logger.error(f"[GEMINI FALLBACK] Excepción: {e}")
        self._update_stats("Gemini 1.5 Flash", fail=1)
        return None

    def query_cerebras_fallback(self, messages):
        cerebras_key = os.getenv("CEREBRAS_API_KEY") or CEREBRAS_API_KEY
        if not cerebras_key:
            logger.warning("[CEREBRAS FALLBACK] CEREBRAS_API_KEY no encontrada.")
            return None
        try:
            r = requests.post(
                "https://api.cerebras.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {cerebras_key}", "Content-Type": "application/json"},
                json={"model": "gemma-4-31b", "messages": messages, "temperature": 0.6, "max_tokens": 1024},
                timeout=15
            )
            if r.status_code == 200:
                logger.info("[CEREBRAS FALLBACK] Respuesta generada exitosamente.")
                self._update_stats("Cerebras Cloud", success=1)
                return r.json()['choices'][0]['message']['content']
            else:
                logger.error(f"[CEREBRAS FALLBACK] Error {r.status_code}: {r.text}")
        except Exception as e:
            logger.error(f"[CEREBRAS FALLBACK] Excepción: {e}")
        self._update_stats("Cerebras Cloud", fail=1)
        return None

    def query_openrouter(self, messages):
        openrouter_key = os.getenv("OPENROUTER_API_KEY") or OPENROUTER_API_KEY
        if not openrouter_key:
            logger.warning("[OPENROUTER] OPENROUTER_API_KEY no encontrada.")
            return None
        try:
            r = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openrouter_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "meta-llama/llama-3.1-8b-instruct", 
                    "messages": messages, 
                    "temperature": 0.6, 
                    "max_tokens": 1024
                },
                timeout=20
            )
            if r.status_code == 200:
                data = r.json()
                total_t = data.get('usage', {}).get('total_tokens', 0)
                logger.info(f"[OPENROUTER] Tokens: {total_t}")
                content = data['choices'][0]['message']['content']
                if content is None:
                    logger.warning("[OPENROUTER] Content is None (possibly hit max_tokens during reasoning).")
                    self._update_stats("OpenRouter (Llama 3.1 8B)", tokens=total_t, fail=1)
                    return None
                self._update_stats("OpenRouter (Llama 3.1 8B)", tokens=total_t, success=1)
                return content
            else:
                logger.error(f"[OPENROUTER] Error de la API: {r.text}")
                self._update_stats("OpenRouter (Llama 3.1 8B)", fail=1)
        except Exception as e:
            import traceback
            logger.error(f"[OPENROUTER] Excepción: {e}\n{traceback.format_exc()}")
            if 'data' in locals():
                logger.error(f"OpenRouter Raw Data: {data}")
            self._update_stats("OpenRouter (Llama 3.1 8B)", fail=1)
        return None

    def get_response(self, user_msg, system_prompt, history=None):
        msg_lower = user_msg.lower()
        
        # Check if this is an internal prompt from nucleo_ia
        internal_prompts = ["Conversation Summarizer", "Extractor de CatÃ¡logo", "Buscador de Zonas", "Coordinador de flujo", "Resume en 3 lineas", "Media Analyzer"]
        is_internal = any(system_prompt.startswith(p) for p in internal_prompts)

        is_dogs_company = any(k in system_prompt.lower() for k in ["perro", "raza", "cachorro", "canes", "nico ventas"])
        is_other_company = any(k in system_prompt.lower() for k in ["colaboratium", "fintech", "kyc", "p2p", "prestamo", "préstamo", "iabox", "ia box", "baulera", "box", "guardado", "estados unidos 2339", "oficina virtual"])

        if not is_internal and is_dogs_company and not is_other_company:
            import re
            catalog_regex = re.compile(r'\b(hola|buenas|buen dia|buen día|buenas tardes|buenas noches|cuales|cuáles|qué|que)\s*(tenés|tenes|tienes|tienen|razas|opciones|perros|hay)?\b|\b(catalogo|catálogo|lista|razas|listado|precios|ver todo)\b', re.IGNORECASE)
            
            # 1. Petición explícita de catálogo o saludos genéricos
            if catalog_regex.search(msg_lower):
                return {"source": "LOCAL_RULE_CATALOG", "text": self.get_structured_catalog()}

            # 2. Selección por número de catálogo o raza
            breed_found = self.find_breed_by_query(user_msg)
            if breed_found:
                b_name = breed_found.get("name", "")
                b_price = breed_found.get("price", 0)
                price_fmt = f"${b_price:,}" if isinstance(b_price, (int, float)) else str(b_price)
                reply = f"¡Excelente elección! 🐶 El *{b_name}* tiene un costo de {price_fmt}.\n\n¿Te gustaría recibir las fotos e información completa de esta raza?"
                return {"source": "LOCAL_RULE_CATALOG", "text": reply}

        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history)
        if not history or history[-1]["content"] != user_msg:
            messages.append({"role": "user", "content": user_msg})

        is_multimedia = user_msg == "__MULTIMEDIA__"

        # Routing Inteligente de Fallbacks
        if is_internal:
            logger.info("Detectado prompt interno. Enrutando directo a Groq para ahorrar Ollama.")
            groq_res = self.query_groq_fallback(messages)
            if groq_res:
                return {"source": "GROQ_INTERNAL", "text": groq_res}
            # Si Groq falla, seguimos al flujo normal (Ollama)
            
        # Llamada Principal de Alta Velocidad (Groq)
        logger.info("Enrutando consulta a Groq Cloud (Ultra Rápido)...")
        groq_res = self.query_groq_fallback(messages)
        if groq_res:
            return {"source": "GROQ_CLOUD", "text": groq_res}

        # Fallback a Cerebras
        logger.warning("Falla en Groq, intentando con Cerebras Cloud...")
        cerebras_res = self.query_cerebras_fallback(messages)
        if cerebras_res:
            return {"source": "CEREBRAS_CLOUD", "text": cerebras_res}

        # Fallback a Gemini
        logger.warning("Falla en Groq, intentando con Gemini...")
        gemini_res = self.query_gemini_fallback(messages)
        if gemini_res:
            return {"source": "GEMINI_FALLBACK", "text": gemini_res}

        # Fallback a OpenRouter
        logger.warning("Falla en Gemini, intentando con OpenRouter...")
        openrouter_res = self.query_openrouter(messages)
        if openrouter_res:
            return {"source": "OPENROUTER_NEX_N2", "text": openrouter_res}
        else:
            logger.warning("Falla en Nex-N2 Pro, intentando con Ollama Local...")
            try:
                r = requests.post("http://localhost:11434/api/chat", json={
                    "model": "llama3.2:3b-instruct-q4_K_M",
                    "messages": messages,
                    "options": {"num_ctx": 8192, "temperature": 0.35, "num_predict": 1200},
                    "stream": False
                }, timeout=self.timeout_local)

                if r.status_code == 200:
                    res_data = r.json()
                    text = res_data.get('message', {}).get('content', '')
                    if text:
                        toks = res_data.get('prompt_eval_count', 0) + res_data.get('eval_count', 0)
                        if toks == 0:
                            toks = (len(str(messages)) + len(text)) // 4
                        self._update_stats("Local Ollama", tokens=toks, success=1)
                        return {"source": "LOCAL_OLLAMA", "text": text}
                else:
                    logger.error(f"Ollama devolvió código {r.status_code}: {r.text}")
                    self._update_stats("Local Ollama", tokens=0, fail=1)

            except requests.exceptions.Timeout:
                logger.warning(f"Ollama superÃ³ los {self.timeout_local}s. Intentando Failovers...")
                self._update_stats("Local Ollama", fail=1)
            except Exception as e:
                logger.error(f"Falla crÃ­tica en Ollama Local: {e}")
                self._update_stats("Local Ollama", fail=1)

        # Routing Inteligente de Fallbacks
        if is_multimedia:
            logger.info("Detectado __MULTIMEDIA__. Enrutando fallback hacia Gemini 1.5 Flash.")
            gemini_res = self.query_gemini_fallback(messages)
            if gemini_res:
                return {"source": "GEMINI_FALLBACK", "text": gemini_res}
        else:
            logger.info("Mensaje de texto. Enrutando fallback hacia Groq.")
            groq_res = self.query_groq_fallback(messages)
            if groq_res:
                return {"source": "GROQ_FALLBACK", "text": groq_res}

        # Fallback Final (Ollama Falló)
        logger.warning("Fallo en Ollama Local. Retornando respuesta segura.")

        if 'REGLA ESTRICTA DE VENTAS (PASO 1)' in system_prompt:
            return {"source": "MOCK", "text": "¡Excelente elección! Esa opción es ideal. El precio es el oficial que manejamos. ¿Te gustaría ver fotos y videos disponibles?"}
        if 'REGLA ESTRICTA DE VENTAS (PASO 2)' in system_prompt:
            return {"source": "MOCK", "text": "Te acabo de enviar las fotos y videos. Trabajamos con envíos seguros y todas las facilidades de pago. ¿Te interesaría avanzar con la operación?"}
        return {"source": "ERROR", "text": "Tenemos una demora técnica. Un asesor te contactará pronto."}

ia_kernel = IAKernel()
