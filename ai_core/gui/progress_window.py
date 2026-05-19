"""
progress_window.py — Ventana de progreso de instalación.
Muestra un log scrollable con timestamps y una barra de progreso general.
"""

from datetime import datetime
from typing import List

import customtkinter as ctk


STEPS = [
    "Verificando Docker Desktop",
    "Creando directorios de datos",
    "Iniciando servicios Docker (PostgreSQL, n8n, WhatsApp Service)",
    "Esperando que los servicios estén listos",
    "Instalando Ollama",
    "Descargando modelo LLM (~2.2 GB)",
    "Importando workflow de chatbot a n8n",
    "Iniciando bridge de recursos",
    "Configuración completada",
]


class ProgressWindow(ctk.CTkToplevel):
    """
    Ventana que se abre durante la instalación.
    Muestra el progreso paso a paso y el log de salida de los servicios.
    """

    def __init__(self, parent):
        super().__init__(parent)

        self.title("Instalando ChatBot Punto A...")
        self.geometry("680x540")
        self.resizable(True, False)
        self.grab_set()  # bloquea la ventana principal mientras se instala

        self._current_step = 0
        self._total_steps = len(STEPS)

        self._build_ui()

    # ------------------------------------------------------------------
    # UI
    # ------------------------------------------------------------------

    def _build_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)

        # Título
        ctk.CTkLabel(
            self,
            text="Instalando ChatBot Punto A",
            font=ctk.CTkFont(size=18, weight="bold"),
        ).grid(row=0, column=0, sticky="w", padx=20, pady=(16, 4))

        # Barra y label de paso actual
        progress_frame = ctk.CTkFrame(self, fg_color="transparent")
        progress_frame.grid(row=1, column=0, sticky="ew", padx=20, pady=(0, 12))
        progress_frame.grid_columnconfigure(0, weight=1)

        self._lbl_step = ctk.CTkLabel(
            progress_frame,
            text="Iniciando...",
            font=ctk.CTkFont(size=12),
            text_color="#aaaacc",
            anchor="w",
        )
        self._lbl_step.grid(row=0, column=0, sticky="w", pady=(0, 6))

        self._progress_bar = ctk.CTkProgressBar(progress_frame, height=14)
        self._progress_bar.grid(row=1, column=0, sticky="ew")
        self._progress_bar.set(0.0)

        self._lbl_pct = ctk.CTkLabel(
            progress_frame,
            text="0%",
            font=ctk.CTkFont(size=11),
            text_color="#8888aa",
        )
        self._lbl_pct.grid(row=1, column=1, padx=(8, 0))

        # Log scrollable
        log_frame = ctk.CTkFrame(self)
        log_frame.grid(row=2, column=0, sticky="nsew", padx=20, pady=(0, 12))
        log_frame.grid_columnconfigure(0, weight=1)
        log_frame.grid_rowconfigure(1, weight=1)

        ctk.CTkLabel(
            log_frame,
            text="Log de instalación",
            font=ctk.CTkFont(size=11),
            text_color="#666688",
            anchor="w",
        ).grid(row=0, column=0, sticky="w", padx=10, pady=(8, 2))

        self._log_text = ctk.CTkTextbox(
            log_frame,
            state="disabled",
            font=ctk.CTkFont(family="Courier New", size=10),
            fg_color="#0d0d1a",
            text_color="#ccccdd",
            wrap="word",
            height=300,
        )
        self._log_text.grid(row=1, column=0, sticky="nsew", padx=10, pady=(0, 10))

        # Botón cerrar (deshabilitado durante instalación)
        self._btn_cerrar = ctk.CTkButton(
            self,
            text="Cerrando...",
            state="disabled",
            command=self.destroy,
            height=36,
        )
        self._btn_cerrar.grid(row=3, column=0, padx=20, pady=(0, 16), sticky="e")

    # ------------------------------------------------------------------
    # API pública
    # ------------------------------------------------------------------

    def log(self, mensaje: str):
        """Agrega una línea al log con timestamp."""
        ts = datetime.now().strftime("%H:%M:%S")
        linea = f"[{ts}] {mensaje}\n"

        self._log_text.configure(state="normal")
        self._log_text.insert("end", linea)
        self._log_text.see("end")
        self._log_text.configure(state="disabled")

        # Forzar actualización de la UI
        self.update_idletasks()

    def set_step(self, numero: int, nombre: str = ""):
        """Avanza al paso número `numero` (1-indexado)."""
        self._current_step = numero
        label = nombre or (STEPS[numero - 1] if 0 < numero <= len(STEPS) else f"Paso {numero}")
        self._lbl_step.configure(text=f"Paso {numero}/{self._total_steps}: {label}")

        pct = numero / self._total_steps
        self._progress_bar.set(pct)
        self._lbl_pct.configure(text=f"{int(pct * 100)}%")
        self.update_idletasks()

    def set_model_progress(self, pct: int):
        """
        Actualiza el porcentaje de descarga del modelo LLM.
        Solo afecta la barra si el paso actual es la descarga del modelo (paso 6).
        """
        if self._current_step != 6:
            return
        # Interpolar: el paso 6 va del 5/9 al 6/9 de la barra total
        base = 5 / self._total_steps
        rango = 1 / self._total_steps
        valor = base + rango * (pct / 100)
        self._progress_bar.set(valor)
        self._lbl_pct.configure(text=f"{int(valor * 100)}%")
        self.update_idletasks()

    def completado(self):
        """Marca la instalación como completada."""
        self._progress_bar.set(1.0)
        self._lbl_pct.configure(text="100%")
        self._lbl_step.configure(text="✅ Instalación completada", text_color="#22dd55")
        self._btn_cerrar.configure(state="normal", text="Cerrar")
        self.log("=" * 50)
        self.log("✅ ChatBot Punto A instalado correctamente.")
        self.log("Podés cerrar esta ventana y vincular WhatsApp con el botón QR.")

    def error(self, mensaje: str):
        """Muestra un error en el log y permite cerrar."""
        self._lbl_step.configure(text="❌ Error en la instalación", text_color="#ff6666")
        self.log(f"ERROR: {mensaje}")
        self._btn_cerrar.configure(state="normal", text="Cerrar")
