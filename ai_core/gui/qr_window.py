"""
qr_window.py — Ventana para vincular WhatsApp mediante el QR de Evolution API.
Muestra el QR decodificando la imagen base64 que retorna la API, con refresh automático.
"""

import base64
import io
import threading
import time
from typing import Optional

import customtkinter as ctk
import requests
from PIL import Image, ImageTk


class QRWindow(ctk.CTkToplevel):
    """
    Muestra el código QR de Evolution API para vincular WhatsApp.
    Refresca el QR cada 30 segundos hasta que la conexión se confirme.
    """

    def __init__(self, parent, evolution_url: str, api_key: str, instance: str, on_connected=None):
        super().__init__(parent)

        self._evolution_url = evolution_url
        self._api_key = api_key
        self._instance = instance
        self._on_connected = on_connected

        self._polling = True
        self._connected = False

        self.title("Vincular WhatsApp — Escaneá el QR")
        self.geometry("420x560")
        self.resizable(False, False)
        self.grab_set()

        self.protocol("WM_DELETE_WINDOW", self._on_close)
        self._build_ui()
        self._start_polling()

    # ------------------------------------------------------------------
    # UI
    # ------------------------------------------------------------------

    def _build_ui(self):
        self.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            self,
            text="Vinculá tu WhatsApp",
            font=ctk.CTkFont(size=18, weight="bold"),
        ).grid(row=0, column=0, pady=(20, 4))

        ctk.CTkLabel(
            self,
            text="Abrí WhatsApp en tu celular → Dispositivos vinculados → Vincular dispositivo",
            font=ctk.CTkFont(size=11),
            text_color="#888888",
            wraplength=360,
        ).grid(row=1, column=0, pady=(0, 16))

        # Canvas para el QR
        self._qr_frame = ctk.CTkFrame(
            self, width=300, height=300, fg_color="#ffffff", corner_radius=12
        )
        self._qr_frame.grid(row=2, column=0, padx=20)
        self._qr_frame.grid_propagate(False)

        self._qr_label = ctk.CTkLabel(self._qr_frame, text="Cargando QR...", text_color="#333333")
        self._qr_label.place(relx=0.5, rely=0.5, anchor="center")

        # Estado
        self._lbl_status = ctk.CTkLabel(
            self,
            text="⏳ Esperando QR de WhatsApp...",
            font=ctk.CTkFont(size=12),
            text_color="#aaaacc",
        )
        self._lbl_status.grid(row=3, column=0, pady=(16, 4))

        self._lbl_timer = ctk.CTkLabel(
            self,
            text="",
            font=ctk.CTkFont(size=11),
            text_color="#666688",
        )
        self._lbl_timer.grid(row=4, column=0, pady=(0, 12))

        # Botón refrescar manual
        self._btn_refrescar = ctk.CTkButton(
            self,
            text="Refrescar QR",
            command=self._fetch_qr,
            fg_color="#333355",
            hover_color="#444477",
        )
        self._btn_refrescar.grid(row=5, column=0, pady=(0, 8))

        self._btn_cerrar = ctk.CTkButton(
            self,
            text="Cerrar",
            command=self._on_close,
            fg_color="#553333",
            hover_color="#774444",
        )
        self._btn_cerrar.grid(row=6, column=0, pady=(0, 20))

    # ------------------------------------------------------------------
    # Polling y lógica de QR
    # ------------------------------------------------------------------

    def _start_polling(self):
        """Inicia el ciclo de polling en un hilo daemon."""
        threading.Thread(target=self._polling_loop, daemon=True).start()

    def _polling_loop(self):
        """Refresca el QR cada 28 segundos (el QR de WhatsApp expira a los 60s)."""
        while self._polling and not self._connected:
            self._fetch_qr()
            for i in range(28, 0, -1):
                if not self._polling or self._connected:
                    break
                self.after(0, lambda s=i: self._lbl_timer.configure(
                    text=f"Nuevo QR en {s}s"
                ))
                time.sleep(1)

    def _fetch_qr(self):
        """Consulta Evolution API para obtener el QR o el estado de conexión."""
        try:
            # Crear instancia si no existe
            self._ensure_instance()

            # Verificar estado de conexión
            try:
                r = requests.get(
                    f"{self._evolution_url}/instance/connectionState/{self._instance}",
                    headers={"apikey": self._api_key},
                    timeout=10,
                )

                if r.status_code == 200:
                    data = r.json()
                    state = data.get("instance", {}).get("state") or data.get("state", "")

                    if state == "open":
                        self.after(0, self._on_whatsapp_connected)
                        return
            except:
                pass  # Si falla connectionState, continuar con connect

            # Obtener QR
            r_qr = requests.get(
                f"{self._evolution_url}/instance/connect/{self._instance}",
                headers={"apikey": self._api_key},
                timeout=10,
            )

            print(f"[DEBUG] QR Response Status: {r_qr.status_code}")
            print(f"[DEBUG] QR Response Headers: {r_qr.headers}")

            if r_qr.status_code == 200:
                qr_data = r_qr.json()
                print(f"[DEBUG] QR Data keys: {qr_data.keys()}")
                qr_base64 = (
                    qr_data.get("base64") or
                    qr_data.get("qrcode", {}).get("base64") or
                    qr_data.get("code")
                )
                print(f"[DEBUG] QR base64 present: {bool(qr_base64)}")
                if qr_base64:
                    print(f"[DEBUG] Displaying QR, length: {len(qr_base64)}")
                    self.after(0, lambda q=qr_base64: self._display_qr(q))
                    return
                else:
                    print(f"[DEBUG] No QR base64 found in response")

            print(f"[DEBUG] Showing waiting message")
            self.after(0, lambda: self._lbl_status.configure(
                text="⏳ Esperando que el servicio esté listo...", text_color="#aaaacc"
            ))

        except requests.exceptions.ConnectionError as e:
            print(f"[DEBUG] Connection Error: {e}")
            self.after(0, lambda: self._lbl_status.configure(
                text="⚠️ Evolution API no disponible. Verificá que la instalación esté completa.",
                text_color="#ffaa44",
            ))
        except Exception as e:
            print(f"[DEBUG] Exception: {type(e).__name__}: {e}")
            self.after(0, lambda: self._lbl_status.configure(
                text=f"Error: {e}", text_color="#ff6666"
            ))

    def _ensure_instance(self):
        """Crea la instancia de Evolution API si no existe."""
        try:
            # Verificar si la instancia existe
            r = requests.get(
                f"{self._evolution_url}/instance/fetchInstances",
                headers={"apikey": self._api_key},
                timeout=10,
            )
            if r.status_code == 200:
                instances = r.json()
                names = [i.get("instance", {}).get("instanceName") or i.get("name") for i in instances]
                if self._instance in names:
                    return

            # Crear la instancia
            requests.post(
                f"{self._evolution_url}/instance/create",
                headers={"apikey": self._api_key, "Content-Type": "application/json"},
                json={"instanceName": self._instance, "integration": "WHATSAPP-BAILEYS"},
                timeout=10,
            )
        except Exception:
            pass

    def _display_qr(self, qr_base64: str):
        """Decodifica el QR base64 y lo muestra en la ventana."""
        try:
            # El base64 puede venir con prefijo "data:image/png;base64,"
            if ";base64," in qr_base64:
                qr_base64 = qr_base64.split(";base64,")[1]

            img_data = base64.b64decode(qr_base64)
            img = Image.open(io.BytesIO(img_data)).resize((280, 280), Image.LANCZOS)

            # Guardar referencia para evitar garbage collection
            self._qr_photo = ImageTk.PhotoImage(img)
            self._qr_label.configure(image=self._qr_photo, text="")
            self._lbl_status.configure(
                text="📲 Escaneá el código QR con tu celular", text_color="#22dd55"
            )
        except Exception as e:
            self._lbl_status.configure(
                text=f"Error mostrando QR: {e}", text_color="#ffaa44"
            )

    def _on_whatsapp_connected(self):
        """Se llama cuando WhatsApp se vincula exitosamente."""
        print("[DEBUG] _on_whatsapp_connected invoked!")
        self._connected = True
        self._polling = False

        self._qr_label.configure(
            image="",
            text="✅",
            font=ctk.CTkFont(size=72),
            text_color="#22aa55",
        )
        self._lbl_status.configure(
            text="✅ WhatsApp vinculado correctamente",
            text_color="#22dd55",
            font=ctk.CTkFont(size=14, weight="bold"),
        )
        self._lbl_timer.configure(text="El chatbot ya está activo y recibiendo mensajes.")
        self._btn_refrescar.configure(state="disabled")
        self._btn_cerrar.configure(text="Cerrar", fg_color="#22aa55", hover_color="#1a8844")

        if self._on_connected:
            print("[DEBUG] Calling on_connected callback...")
            self._on_connected()
            print("[DEBUG] on_connected callback completed")
        else:
            print("[DEBUG] WARNING: on_connected callback is None!")

    # ------------------------------------------------------------------
    # Cierre
    # ------------------------------------------------------------------

    def _on_close(self):
        self._polling = False
        self.destroy()
