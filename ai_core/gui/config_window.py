"""
config_window.py — Ventana de configuración del chatbot (CTkToplevel).
Se abre desde el menú hamburguesa de la ventana principal.
Tabs: Conversaciones | Menú A1 | IA A2 | Tickets A3
"""

import sys
from pathlib import Path
from typing import Optional

import customtkinter as ctk

# Paleta consistente con installer_window
C_BG      = "#0f0f1a"
C_CARD    = "#1a1a2e"
C_BORDER  = "#2a2a4a"
C_MUTED   = "#888899"
C_LABEL   = "#c8c8e0"
C_HEAD_BG = "#0d0d1e"
C_ACCENT  = "#4a6cf7"


TAB_NAMES = [
    "💬 Conversaciones",
    "🔘 Menú A1",
    "🤖 IA A2",
    "🎫 Tickets A3",
]


class ConfigWindow(ctk.CTkToplevel):
    """
    Ventana de configuración del chatbot.
    Abre las 4 secciones (A1, A2, A3, conversaciones) en tabs dentro
    del mismo proceso — sin subproceso.
    """

    def __init__(self, parent, initial_tab: int = 0):
        super().__init__(parent)

        self.title("Configuración — ChatBot Punto A")
        self.geometry("1150x780")
        self.resizable(True, True)
        self.configure(fg_color=C_BG)

        # Asegurar que la ventana aparezca encima de la ventana principal
        self.transient(parent)
        self.update_idletasks()
        self.deiconify()
        self.attributes("-topmost", True)
        self.lift()
        self.focus_force()
        # Quitar topmost luego de mostrarse para no bloquear otras apps
        self.after(400, lambda: self.attributes("-topmost", False))

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        self._build_header()
        self._build_tabs()
        self._build_statusbar()

        # Activar la pestaña solicitada
        if 0 <= initial_tab < len(TAB_NAMES):
            self._tabs.set(TAB_NAMES[initial_tab])

        self._load_tab_modules()

    # ── Header ────────────────────────────────────────────────────────────────

    def _build_header(self):
        hdr = ctk.CTkFrame(self, fg_color=C_HEAD_BG, corner_radius=0, height=56)
        hdr.grid(row=0, column=0, sticky="ew")
        hdr.grid_propagate(False)
        hdr.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            hdr,
            text="⚙️  Configuración del Chatbot",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color="#dde0ff",
        ).grid(row=0, column=0, sticky="w", padx=20, pady=16)

        ctk.CTkButton(
            hdr,
            text="✕",
            width=36, height=36,
            fg_color="transparent",
            hover_color=C_CARD,
            font=ctk.CTkFont(size=16),
            command=self.destroy,
            corner_radius=8,
        ).grid(row=0, column=1, padx=12)

    # ── Tabs ──────────────────────────────────────────────────────────────────

    def _build_tabs(self):
        self._tabs = ctk.CTkTabview(
            self,
            fg_color=C_CARD,
            segmented_button_fg_color=C_HEAD_BG,
            segmented_button_selected_color=C_ACCENT,
            segmented_button_unselected_color=C_HEAD_BG,
            segmented_button_selected_hover_color="#3a5ce7",
            segmented_button_unselected_hover_color=C_CARD,
            text_color=C_LABEL,
            corner_radius=10,
        )
        self._tabs.grid(row=1, column=0, padx=14, pady=(10, 4), sticky="nsew")

        for name in TAB_NAMES:
            self._tabs.add(name)

    # ── Barra de estado ───────────────────────────────────────────────────────

    def _build_statusbar(self):
        bar = ctk.CTkFrame(self, fg_color=C_HEAD_BG, corner_radius=0, height=36)
        bar.grid(row=2, column=0, sticky="ew")
        bar.grid_propagate(False)
        bar.grid_columnconfigure(0, weight=1)

        self._status_lbl = ctk.CTkLabel(
            bar, text="✅ Listo",
            font=ctk.CTkFont(size=11), text_color=C_MUTED,
            anchor="w",
        )
        self._status_lbl.grid(row=0, column=0, sticky="w", padx=16, pady=8)

    def update_status(self, message: str, color: str = "green"):
        """Actualiza la barra de estado (usada por los sub-módulos)."""
        icons = {"green": "✅", "yellow": "⚠️", "red": "❌", "blue": "ℹ️"}
        icon = icons.get(color, "ℹ️")
        self._status_lbl.configure(text=f"{icon}  {message}")

    # ── Carga de módulos ──────────────────────────────────────────────────────

    def _load_tab_modules(self):
        """
        Importa los módulos del configurador e inicializa cada tab.
        Busca los módulos en el path bundled (PyInstaller) o en el directorio
        del proyecto.
        """
        # Añadir el path del configurador al sys.path si es necesario
        if getattr(sys, "frozen", False):
            conf_dir = Path(sys._MEIPASS) / "configurador"
        else:
            conf_dir = Path(__file__).parent.parent / "configurador"

        if str(conf_dir) not in sys.path:
            sys.path.insert(0, str(conf_dir))

        modules = [
            ("💬 Conversaciones", "conversaciones_window", "ConversacionesWindow"),
            ("🔘 Menú A1",       "config_a1_window",      "ConfigA1Window"),
            ("🤖 IA A2",         "config_a2_window",      "ConfigA2Window"),
            ("🎫 Tickets A3",    "config_a3_window",      "ConfigA3Window"),
        ]

        for tab_name, module_name, class_name in modules:
            try:
                mod = __import__(module_name)
                cls = getattr(mod, class_name)
                tab_frame = self._tabs.tab(tab_name)
                cls(tab_frame, self)
            except Exception as e:
                self._show_tab_error(tab_name, module_name, e)

    def _show_tab_error(self, tab_name: str, module_name: str, error: Exception):
        """Muestra un mensaje de error dentro del tab que no se pudo cargar."""
        try:
            tab = self._tabs.tab(tab_name)
            tab.grid_columnconfigure(0, weight=1)
            tab.grid_rowconfigure(0, weight=1)

            frame = ctk.CTkFrame(tab, fg_color="transparent")
            frame.grid(row=0, column=0, sticky="nsew", padx=20, pady=20)
            frame.grid_columnconfigure(0, weight=1)

            ctk.CTkLabel(
                frame,
                text=f"⚠️  No se pudo cargar '{module_name}'",
                font=ctk.CTkFont(size=14, weight="bold"),
                text_color="#ffaa44",
            ).grid(row=0, column=0, pady=(0, 8))

            ctk.CTkLabel(
                frame,
                text=str(error),
                font=ctk.CTkFont(size=11, family="Courier New"),
                text_color="#ff6666",
                wraplength=800,
            ).grid(row=1, column=0)

        except Exception:
            pass
