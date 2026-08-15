import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\SaaSIA\IABOX\web_bundle.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Extraer el array de productos
# Busca [{key:"...", label:"...", ...}]
prod_match = re.search(r'\[\{key:"[^"]+",label:"[^"]+".*?\}\]', js)
if prod_match:
    print("=== PRODUCTOS RAW ENCONTRADOS ===")
    prod_raw = prod_match.group(0)
    print(prod_raw[:1500])

# 2. Extraer FAQs
# Busca array de preguntas [[ "Pregunta", "Respuesta" ], ...]
faq_match = re.search(r'\[\["¿[^"]+","[^"]+"\](?:,\["[^"]+","[^"]+"\])*\]', js)
if faq_match:
    print("\n=== FAQS ENCONTRADAS ===")
    faqs = json.loads(faq_match.group(0))
    for q, a in faqs:
        print(f"P: {q}\nR: {a}\n")

# 3. Extraer Constantes de Contacto
for var in ['email', 'phone', 'address', 'instagram', 'facebook']:
    m = re.findall(rf'"{var}":"([^"]+)"', js, re.IGNORECASE)
    if m:
        print(f"{var}:", set(m))
