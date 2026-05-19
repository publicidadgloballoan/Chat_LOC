#!/usr/bin/env python3
"""Guardar QR en HTML"""
import json
import urllib.request

# Obtener QR
req = urllib.request.Request(
    "http://localhost:8080/instance/connect/punto_a_bot",
    headers={"apikey": "evolution_api_key_2024_punto_a"}
)

with urllib.request.urlopen(req) as response:
    data = json.loads(response.read())
    qr_data = data if 'count' in data else data.get('qrcode', {})
    base64 = qr_data.get('base64', '')
    count = qr_data.get('count', 0)

html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>QR WhatsApp - Punto A Bot</title>
    <meta http-equiv="refresh" content="40">
    <style>
        body {{
            font-family: Arial;
            text-align: center;
            background: #f0f0f0;
            padding: 20px;
        }}
        .container {{
            background: white;
            padding: 40px;
            border-radius: 10px;
            display: inline-block;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        h1 {{ color: #25D366; margin-bottom: 30px; }}
        img {{
            border: 3px solid #25D366;
            border-radius: 10px;
            max-width: 400px;
        }}
        .note {{
            background: #fff3cd;
            padding: 15px;
            margin-top: 20px;
            border-radius: 5px;
            color: #856404;
        }}
        .count {{ font-size: 12px; color: #999; margin-top: 10px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🔗 Escanea con WhatsApp</h1>
        <img src="{base64}" alt="QR Code">
        <div class="count">Código #{count}</div>
        <div class="note">
            <strong>📱 Pasos:</strong><br><br>
            1. Abre WhatsApp en tu teléfono<br>
            2. Menú → Dispositivos vinculados<br>
            3. Vincular un dispositivo<br>
            4. Escanea este código<br><br>
            <em>⏱️ Se actualiza automáticamente cada 40 segundos</em>
        </div>
    </div>
</body>
</html>'''

with open(r'C:\RouthLocal\punto_a\qr_whatsapp.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"HTML creado con QR #{count}")
print("Archivo: C:\\RouthLocal\\punto_a\\qr_whatsapp.html")
