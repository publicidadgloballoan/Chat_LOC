import requests
import os

URL = "https://github.com/tesseract-ocr/tessdata/raw/main/spa.traineddata"
DEST = r"C:\Program Files\Tesseract-OCR\tessdata\spa.traineddata"

print(f"Descargando {URL}...")
try:
    r = requests.get(URL, stream=True, timeout=60)
    r.raise_for_status()
    with open(DEST, 'wb') as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"OK! Guardado en {DEST}")
except Exception as e:
    print(f"Error descargando: {e}")
