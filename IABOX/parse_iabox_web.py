import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\SaaSIA\IABOX\web_bundle.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Buscar strings literales en el código JS
strings = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', js)
print(f"Total strings extraídos: {len(strings)}")

unique_texts = []
seen = set()
for s in strings:
    s_clean = s.encode().decode('unicode-escape', errors='ignore').strip()
    if len(s_clean) > 15 and s_clean not in seen:
        if any(k in s_clean.lower() for k in [
            'box', 'guardado', 'baulera', 'oficina', 'virtual', 'fiscal', 'cctv', 'acceso', 
            'seguridad', 'ubicación', 'estados unidos 2339', 'contacto', 'almacenamiento',
            'domicilio', 'recepción', 'correspondencia', 'contrato', 'paletizable', 'plan',
            'depósito', 'combo', 'precio', 'dimensiones', 'servicios', 'faq', 'pregunta'
        ]):
            seen.add(s_clean)
            unique_texts.append(s_clean)

print(f"Textos relevantes únicos: {len(unique_texts)}")
for t in unique_texts[:40]:
    print("-", t)
