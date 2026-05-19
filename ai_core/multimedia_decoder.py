import os
print(" >>> MULTIMEDIA_DECODER LOADED <<<")
import requests
import base64
import tempfile
import speech_recognition as sr
from pydub import AudioSegment
import fitz  # PyMuPDF
from PIL import Image
import pytesseract

import logging
logger = logging.getLogger("multimedia_decoder")
logger.setLevel(logging.INFO)
# Evitar duplicados si ya tiene handlers
if not logger.handlers:
    fh = logging.FileHandler(os.path.join(os.path.dirname(__file__), "nucleo_debug.log"))
    fh.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s]  %(message)s'))
    logger.addHandler(fh)

def procesar_multimedia(evo_url, evo_key, instance_name, msg):
    try:
        logger.info(f" [DEC-START] Procesando multimedia para {instance_name}...")
        # Normalizar estructura
        if isinstance(msg, dict) and 'key' in msg and 'message' in msg:
            inner_msg = msg.get('message', {})
        else:
            inner_msg = msg 

        # --- OPTIMIZACIÓN NICO VENTAS: Si es imagen y solo necesitamos saber que existe, retornamos rápido ---
        # Esto evita cuelgues si Tesseract o FFmpeg fallan
        if inner_msg.get('imageMessage'):
            logger.info(" [DEC-IMG] Imagen detectada. Retornando flag rápido.")
            return "[MULTIMEDIA_IMAGE]"

        url = f"{evo_url}/message/base64/{instance_name}"
        headers = {"apikey": evo_key, "Content-Type": "application/json"}
        req_data = {"message": inner_msg}
        logger.info(f" [DEC-API] Solicitando base64 a Evolution API: {url}...")
        res = requests.post(url, headers=headers, json=req_data, timeout=10)
        
        if res.status_code != 200:
            logger.error(f" [DEC-ERR] Error de descarga Evolution: {res.status_code} | {res.text[:100]}")
            return f"[Media fallida: HTTP {res.status_code}]"
            
        b64_data = res.json().get('base64')
        if not b64_data:
            return "[Media vacia]"
            
        file_bytes = base64.b64decode(b64_data)
        logger.info(f" [DEC-BYTES] Recibidos {len(file_bytes)} bytes.")
        
        if inner_msg.get('audioMessage'):
            logger.info(" [DEC-AUDIO] Iniciando transcripción...")
            return "[NOTA DE VOZ]: " + transcribir_audio(file_bytes)
        elif inner_msg.get('documentMessage'):
            logger.info(" [DEC-DOC] Iniciando extracción PDF...")
            mimetype = inner_msg.get('documentMessage', {}).get('mimetype', '')
            if 'pdf' in mimetype.lower():
                return "[PDF]: " + extraer_pdf(file_bytes)
            else:
                return "[Archivo Documento]"
        
        return "[Multimedia]"
                
    except Exception as e:
        logger.error(f" [DEC-EXC] {e}")
        return f"[Error multimedia: {e}]"


def transcribir_audio(file_bytes):
    """Transcribe audio OGG a texto usando Google Speech Recognition"""
    try:
        import subprocess
        # Escribir el OGG a un archivo temporal
        with tempfile.NamedTemporaryFile(delete=False, suffix=".ogg") as f_in:
            f_in.write(file_bytes)
            ogg_path = f_in.name
            
        wav_path = ogg_path + ".wav"
        
        # Intentar conversión con ffmpeg directo via subprocess (más confiable que pydub)
        ffmpeg_paths = [
            r"c:\RouthLocal\punto_a\ffmpeg.exe",
            r"c:\ffmpeg\bin\ffmpeg.exe",
            "ffmpeg"  # En PATH del sistema
        ]
        
        converted = False
        for ffmpeg_path in ffmpeg_paths:
            try:
                result = subprocess.run(
                    [ffmpeg_path, "-y", "-i", ogg_path, "-ar", "16000", "-ac", "1", wav_path],
                    capture_output=True, timeout=30
                )
                if result.returncode == 0 and os.path.exists(wav_path):
                    converted = True
                    break
            except (FileNotFoundError, subprocess.TimeoutExpired):
                continue
        
        if not converted:
            # Fallback: usar pydub si ffmpeg no funciona como subprocess
            try:
                AudioSegment.converter = r"c:\RouthLocal\punto_a\ffmpeg.exe"
                audio = AudioSegment.from_file(ogg_path)
                audio.export(wav_path, format="wav")
                converted = os.path.exists(wav_path)
            except Exception as pdub_err:
                return f"(Audio recibido - Transcripción no disponible: se necesita configurar FFMPEG)"
        
        if not converted:
            return "(Audio recibido - Transcripción no disponible: FFMPEG no encontrado)"
        
        # Transcribir el WAV con Google Speech
        r = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = r.record(source)
            text = r.recognize_google(audio_data, language="es-AR")
            
        try: 
            os.remove(ogg_path)
            os.remove(wav_path)
        except: pass
        
        return text if text.strip() else "(Audio ininteligible o vacío)"
        
    except Exception as e:
        return f"(Audio recibido - Error de transcripción: {type(e).__name__})"


def extraer_ocr(file_bytes):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as f_in:
            f_in.write(file_bytes)
            img_path = f_in.name
            
        if os.path.exists(r'C:\Program Files\Tesseract-OCR\tesseract.exe'):
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        
        img = Image.open(img_path)
        texto = pytesseract.image_to_string(img, lang="spa")
        
        try: os.remove(img_path)
        except: pass
        return texto.strip() if texto.strip() else "(Imagen sin texto reconocible)"
    except Exception as e:
        return f"(El motor de vision OCR requiere instalacion de software Tesseract)"

def extraer_pdf(file_bytes):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f_in:
            f_in.write(file_bytes)
            pdf_path = f_in.name
        
        doc = fitz.open(pdf_path)
        texto = ""
        for page in doc:
            texto += page.get_text()
            
        doc.close()
        try: os.remove(pdf_path)
        except: pass
        return texto.strip() if texto.strip() else "(PDF Escaneado o vacío)"
    except Exception as e:
        return f"(PDF encriptado o dañado)"
