#!/usr/bin/env python3
"""Mostrar código QR de WhatsApp en ventana"""
import tkinter as tk
from tkinter import ttk
import json
import urllib.request
import base64
from PIL import Image, ImageTk
from io import BytesIO

def mostrar_qr():
    """Obtener y mostrar el código QR"""
    try:
        # Obtener QR desde la API
        req = urllib.request.Request(
            "http://localhost:8080/instance/connect/punto_a_bot",
            headers={"apikey": "evolution_api_key_2024_punto_a"}
        )

        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            qr_base64 = data.get('qrcode', {}).get('base64', '')

            if not qr_base64:
                print("No hay código QR disponible")
                return

            # Decodificar la imagen base64
            qr_data = qr_base64.split(',')[1]  # Remover "data:image/png;base64,"
            img_data = base64.b64decode(qr_data)
            img = Image.open(BytesIO(img_data))

            # Crear ventana
            root = tk.Tk()
            root.title("Código QR WhatsApp - Punto A Bot")
            root.geometry("600x700")
            root.configure(bg='#f0f0f0')

            # Frame principal
            main_frame = ttk.Frame(root, padding="20")
            main_frame.pack(expand=True, fill='both')

            # Título
            title_label = tk.Label(
                main_frame,
                text="Escanea este código QR con WhatsApp",
                font=("Arial", 16, "bold"),
                fg="#25D366",
                bg='#f0f0f0'
            )
            title_label.pack(pady=10)

            # Imagen QR
            photo = ImageTk.PhotoImage(img)
            img_label = tk.Label(main_frame, image=photo, bg='#f0f0f0')
            img_label.image = photo  # Mantener referencia
            img_label.pack(pady=20)

            # Instrucciones
            instructions = """
Pasos para vincular:
1. Abre WhatsApp en tu teléfono
2. Toca en Menú o Configuración
3. Toca en "Dispositivos vinculados"
4. Toca en "Vincular un dispositivo"
5. Apunta tu teléfono hacia esta pantalla

Nota: El código expira cada 45 segundos.
Si expira, cierra esta ventana y ejecútala nuevamente.
            """

            instructions_label = tk.Label(
                main_frame,
                text=instructions,
                font=("Arial", 10),
                fg="#666",
                bg='#f0f0f0',
                justify='left'
            )
            instructions_label.pack(pady=10)

            # Botón de actualizar
            def actualizar_qr():
                root.destroy()
                mostrar_qr()

            refresh_btn = tk.Button(
                main_frame,
                text="🔄 Actualizar QR",
                command=actualizar_qr,
                font=("Arial", 12),
                bg="#25D366",
                fg="white",
                padx=20,
                pady=10
            )
            refresh_btn.pack(pady=10)

            root.mainloop()

    except Exception as e:
        print(f"Error al mostrar QR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    mostrar_qr()
