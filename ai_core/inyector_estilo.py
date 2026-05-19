import os
import zipfile
import re

zips = [
    r"c:\RouthLocal\punto_a\assets\Chats\Chat de WhatsApp con +54 9 11 5047-3657.zip",
    r"c:\RouthLocal\punto_a\assets\Chats\Chat de WhatsApp con +54 9 11 5471-9870.zip",
    r"c:\RouthLocal\punto_a\assets\Chats\Chat de WhatsApp con +54 9 11 5612-7713.zip",
    r"c:\RouthLocal\punto_a\assets\Chats\Chat de WhatsApp con +54 9 11 6975-1185.zip"
]

historial_completo = ""

print("1. Descomprimiendo y leyendo estilo de chats de Nico Ventas...")
for z_path in zips:
    if os.path.exists(z_path):
        try:
            with zipfile.ZipFile(z_path, 'r') as z:
                # Buscar el archivo txt dentro del zip
                for fname in z.namelist():
                    if fname.endswith('.txt'):
                        with z.open(fname) as f:
                            chat_content = f.read().decode('utf-8', errors='ignore')
                            # Limpiar formato básico de Whatsapp
                            chat_content = re.sub(r'\[.*?\] ', '', chat_content)
                            historial_completo += f"--- Inicio Chat ---\n{chat_content}\n"
        except Exception as e:
            print(f"Error procesando {z_path}: {e}")

dest_path = r"c:\RouthLocal\punto_a\config\nico_ventas_canal\chat_history.txt"

print("2. Guardando historial de mimetización...")
os.makedirs(os.path.dirname(dest_path), exist_ok=True)
with open(dest_path, "w", encoding="utf-8") as f:
    f.write(historial_completo)

print(f" [+] Estilo de ventas cargado en: {dest_path}")
