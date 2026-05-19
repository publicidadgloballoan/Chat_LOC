"""
installer_window.py — Ventana principal del instalador Punto A.
Diseño estilo app móvil con menú hamburguesa, tarjetas y botones prominentes.
"""

import sys
import threading
from pathlib import Path
from typing import Callable, Optional

import customtkinter as ctk

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ── Paleta de colores ─────────────────────────────────────────────────────────
C_BG         = "#0f0f1a"
C_CARD       = "#1a1a2e"
C_CARD_DARK  = "#12122a"
C_BORDER     = "#2a2a4a"
C_ACCENT     = "#4a6cf7"
C_ACCENT_H   = "#3a5ce7"
C_GREEN      = "#25d366"
C_GREEN_H    = "#1aba55"
C_GREEN_DIM  = "#1a5c35"
C_MUTED      = "#888899"
C_LABEL      = "#c8c8e0"
C_HEAD_BG    = "#0d0d1e"
C_DRAWER_BG  = "#0b0b18"
C_DRAWER_ITM = "#1a1a2e"

TEXTOS = {
    "APP_TITLE":            "ChatBot Punto A",
    "APP_SUBTITLE":         "WhatsApp · IA Local · Sin nube",
    "EMPRESA_LABEL":        "Nombre de la empresa",
    "EMPRESA_PLACEHOLDER":  "Ej: Mi Empresa SRL",
    "TRAFICO_LABEL":        "Tráfico diario estimado",
    "TRAFICO_PLACEHOLDER":  "0",
    "WHATSAPP_BTN":         "📱   Vincular WhatsApp con QR",
    "WHATSAPP_LINKED":      "✓   WhatsApp vinculado",
    "WHATSAPP_NOT_LINKED":  "Sin vincular",
    "INSTALL_BTN":          "⚡   Instalar ChatBot Punto A",
    "INSTALLING":           "Instalando...",
}

def t(k): return TEXTOS.get(k, k)


class InstallerWindow(ctk.CTk):
    """
    Ventana principal del instalador — estilo app móvil.
    Header con menú hamburguesa que abre un drawer lateral.
    """

    def __init__(
        self,
        on_install: Callable,
        on_link_whatsapp: Callable,
        on_open_config: Optional[Callable] = None,
    ):
        super().__init__()

        self._on_install       = on_install
        self._on_link_whatsapp = on_link_whatsapp
        self._on_open_config   = on_open_config
        self._hardware_profile = None
        self._drawer_open      = False

        self.configure(fg_color=C_BG)
        self.title("ChatBot Punto A — Instalador")
        self.geometry("800x720")
        self.resizable(True, True)
        self.state("zoomed")

        self._build_ui()
        self._start_hardware_scan()

    # ── Construcción principal ────────────────────────────────────────────────

    def _build_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        self._build_header()

        # Contenido scrollable
        self._scroll = ctk.CTkScrollableFrame(self, fg_color=C_BG, corner_radius=0)
        self._scroll.grid(row=1, column=0, sticky="nsew")
        self._scroll.grid_columnconfigure(0, weight=1)

        self._build_hardware_card()
        self._build_config_card()
        self._build_whatsapp_card()

        # Barra inferior con botón instalar
        bottom = ctk.CTkFrame(self, fg_color=C_HEAD_BG, corner_radius=0)
        bottom.grid(row=2, column=0, sticky="ew")
        bottom.grid_columnconfigure(0, weight=1)

        self._btn_instalar = ctk.CTkButton(
            bottom,
            text=t("INSTALL_BTN"),
            command=self._on_click_instalar,
            height=52,
            font=ctk.CTkFont(size=15, weight="bold"),
            fg_color=C_ACCENT,
            hover_color=C_ACCENT_H,
            corner_radius=12,
        )
        self._btn_instalar.grid(row=0, column=0, padx=20, pady=(12, 6), sticky="ew")

        self._lbl_error = ctk.CTkLabel(
            bottom, text="", text_color="#ff6666", font=ctk.CTkFont(size=11)
        )
        self._lbl_error.grid(row=1, column=0, pady=(0, 10))

        # Drawer lateral (overlay)
        self._build_drawer()

    # ── Header ────────────────────────────────────────────────────────────────

    def _build_header(self):
        hdr = ctk.CTkFrame(self, fg_color=C_HEAD_BG, corner_radius=0, height=64)
        hdr.grid(row=0, column=0, sticky="ew")
        hdr.grid_propagate(False)
        hdr.grid_columnconfigure(2, weight=1)

        # Botón hamburguesa
        self._btn_hamburger = ctk.CTkButton(
            hdr,
            text="☰",
            width=46, height=46,
            fg_color="transparent",
            hover_color=C_DRAWER_ITM,
            font=ctk.CTkFont(size=22),
            command=self._toggle_drawer,
            corner_radius=8,
        )
        self._btn_hamburger.grid(row=0, column=0, rowspan=2, padx=(10, 4), pady=9)

        # Logo (si existe)
        logo_col = 1
        try:
            from config import LOGO_PNG
            from PIL import Image
            img = ctk.CTkImage(Image.open(str(LOGO_PNG)), size=(36, 36))
            ctk.CTkLabel(hdr, image=img, text="").grid(
                row=0, column=1, rowspan=2, padx=(4, 6), pady=10
            )
            logo_col = 1
        except Exception:
            logo_col = 0

        # Título y subtítulo
        txt_col = logo_col + 1
        hdr.grid_columnconfigure(txt_col, weight=1)
        ctk.CTkLabel(
            hdr, text=t("APP_TITLE"),
            font=ctk.CTkFont(size=17, weight="bold"),
            text_color="#dde0ff",
        ).grid(row=0, column=txt_col, sticky="sw", padx=4, pady=(12, 1))

        ctk.CTkLabel(
            hdr, text=t("APP_SUBTITLE"),
            font=ctk.CTkFont(size=10),
            text_color=C_MUTED,
        ).grid(row=1, column=txt_col, sticky="nw", padx=4, pady=(1, 12))

    # ── Tarjeta hardware ──────────────────────────────────────────────────────

    def _build_hardware_card(self):
        card = self._make_card(self._scroll, "⚡ Hardware detectado", row=0)

        badges = ctk.CTkFrame(card, fg_color="transparent")
        badges.grid(row=1, column=0, sticky="ew", padx=14, pady=(0, 8))
        badges.grid_columnconfigure((0, 1, 2, 3), weight=1)

        self._lbl_cpu   = self._badge(badges, "CPU",               "Escaneando...", 0)
        self._lbl_ram   = self._badge(badges, "RAM",               "...",           1)
        self._lbl_tps   = self._badge(badges, "TPS estimado",      "...",           2)
        self._lbl_chats = self._badge(badges, "Chats simultáneos", "...",           3)

        self._lbl_hw_detail = ctk.CTkLabel(
            card, text="Escaneando hardware del equipo...",
            font=ctk.CTkFont(size=11), text_color=C_MUTED,
            wraplength=700, anchor="w",
        )
        self._lbl_hw_detail.grid(row=2, column=0, sticky="ew", padx=14, pady=(0, 14))

    # ── Tarjeta configuración ─────────────────────────────────────────────────

    def _build_config_card(self):
        card = self._make_card(self._scroll, "⚙️ Configuración", row=1)

        form = ctk.CTkFrame(card, fg_color="transparent")
        form.grid(row=1, column=0, sticky="ew", padx=14, pady=(0, 4))
        form.grid_columnconfigure(1, weight=1)

        # Empresa
        ctk.CTkLabel(
            form, text=t("EMPRESA_LABEL"),
            font=ctk.CTkFont(size=12), text_color=C_LABEL,
        ).grid(row=0, column=0, sticky="w", padx=(0, 14), pady=10)

        self._entry_empresa = ctk.CTkEntry(
            form,
            placeholder_text=t("EMPRESA_PLACEHOLDER"),
            height=42, corner_radius=10, border_color=C_BORDER,
            font=ctk.CTkFont(size=13),
        )
        self._entry_empresa.grid(row=0, column=1, sticky="ew", pady=10)

        # Tráfico
        ctk.CTkLabel(
            form, text=t("TRAFICO_LABEL"),
            font=ctk.CTkFont(size=12), text_color=C_LABEL,
        ).grid(row=1, column=0, sticky="w", padx=(0, 14), pady=10)

        tr_row = ctk.CTkFrame(form, fg_color="transparent")
        tr_row.grid(row=1, column=1, sticky="w", pady=10)

        self._entry_trafico = ctk.CTkEntry(
            tr_row,
            placeholder_text=t("TRAFICO_PLACEHOLDER"),
            height=42, width=110, corner_radius=10, border_color=C_BORDER,
            font=ctk.CTkFont(size=13),
        )
        self._entry_trafico.pack(side="left")
        ctk.CTkLabel(
            tr_row, text=" chats / día",
            font=ctk.CTkFont(size=12), text_color=C_MUTED,
        ).pack(side="left", padx=10)

        self._lbl_sla = ctk.CTkLabel(
            card, text="",
            font=ctk.CTkFont(size=11), text_color="#66aadd",
            wraplength=700, anchor="w",
        )
        self._lbl_sla.grid(row=2, column=0, sticky="ew", padx=14, pady=(0, 14))

        self._entry_trafico.bind("<KeyRelease>", self._on_trafico_change)

    # ── Tarjeta WhatsApp ──────────────────────────────────────────────────────

    def _build_whatsapp_card(self):
        card = self._make_card(self._scroll, "📱 WhatsApp Business", row=2)

        # Fila de estado
        status_row = ctk.CTkFrame(card, fg_color="transparent")
        status_row.grid(row=1, column=0, sticky="w", padx=14, pady=(0, 10))

        self._wa_dot = ctk.CTkLabel(
            status_row, text="●",
            font=ctk.CTkFont(size=13), text_color="#444466",
        )
        self._wa_dot.pack(side="left")

        self._lbl_wa_status = ctk.CTkLabel(
            status_row,
            text="  " + t("WHATSAPP_NOT_LINKED"),
            font=ctk.CTkFont(size=12), text_color=C_MUTED,
        )
        self._lbl_wa_status.pack(side="left")

        # Botón vincular
        self._btn_qr = ctk.CTkButton(
            card,
            text=t("WHATSAPP_BTN"),
            command=self._on_link_whatsapp,
            height=50,
            font=ctk.CTkFont(size=14, weight="bold"),
            fg_color=C_GREEN,
            hover_color=C_GREEN_H,
            text_color="#000000",
            corner_radius=12,
        )
        self._btn_qr.grid(row=2, column=0, sticky="ew", padx=14, pady=(0, 16))

    # ── Drawer lateral ────────────────────────────────────────────────────────

    def _build_drawer(self):
        """Panel lateral hamburguesa (overlay sobre el contenido)."""
        self._drawer = ctk.CTkFrame(
            self, fg_color=C_DRAWER_BG, corner_radius=0, width=290
        )

        self._drawer.grid_columnconfigure(0, weight=1)

        # ── Header del drawer ──
        drw_hdr = ctk.CTkFrame(
            self._drawer, fg_color="#08080f", corner_radius=0, height=64
        )
        drw_hdr.grid(row=0, column=0, sticky="ew")
        drw_hdr.grid_propagate(False)
        drw_hdr.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            drw_hdr, text="Menú",
            font=ctk.CTkFont(size=15, weight="bold"), text_color="#dde0ff",
        ).grid(row=0, column=0, sticky="w", padx=18, pady=20)

        ctk.CTkButton(
            drw_hdr, text="✕", width=36, height=36,
            fg_color="transparent", hover_color=C_DRAWER_ITM,
            font=ctk.CTkFont(size=16), command=self._hide_drawer,
            corner_radius=8,
        ).grid(row=0, column=1, padx=10)

        # ── Separador ──
        ctk.CTkFrame(self._drawer, height=1, fg_color=C_BORDER).grid(
            row=1, column=0, sticky="ew"
        )

        # ── Items ──
        items = ctk.CTkFrame(self._drawer, fg_color="transparent")
        items.grid(row=2, column=0, sticky="nsew", pady=10)
        items.grid_columnconfigure(0, weight=1)
        self._drawer.grid_rowconfigure(2, weight=1)

        menu_items = [
            ("⚙️", "Configurar Chatbot",   0),
            ("💬", "Conversaciones",        0),
            ("🔘", "Menú A1",              1),
            ("🤖", "IA A2",                2),
            ("🎫", "Tickets A3",           3),
        ]

        for i, (icon, label, tab_idx) in enumerate(menu_items):
            self._drawer_btn(items, icon, label, tab_idx, row=i)

        # Separador inferior
        ctk.CTkFrame(items, height=1, fg_color=C_BORDER).grid(
            row=len(menu_items), column=0, sticky="ew", padx=16, pady=8
        )

    def _drawer_btn(self, parent, icon: str, label: str, tab_idx: int, row: int):
        def cmd():
            self._hide_drawer()
            self._open_config(tab_idx)

        ctk.CTkButton(
            parent,
            text=f"  {icon}   {label}",
            font=ctk.CTkFont(size=13),
            text_color=C_LABEL,
            fg_color="transparent",
            hover_color=C_DRAWER_ITM,
            anchor="w",
            height=50,
            corner_radius=8,
            command=cmd,
        ).grid(row=row, column=0, sticky="ew", padx=8, pady=1)

    def _toggle_drawer(self):
        try:
            if self._drawer_open:
                self._hide_drawer()
            else:
                self._show_drawer()
        except Exception as e:
            import traceback
            # Log error to file
            with open("installer_error.log", "a", encoding="utf-8") as f:
                f.write(f"Error en _toggle_drawer: {e}\n{traceback.format_exc()}\n")
            # Also show in UI
            self._show_error(f"Error en menu: {str(e)}")

    def _show_drawer(self):
        """Muestra el drawer overlay."""
        # width se pasa al constructor del CTkFrame, no al place()
        self._drawer.place(x=0, y=64, relheight=1.0, rely=0)
        self._drawer.lift()
        self._drawer_open = True

    def _hide_drawer(self):
        self._drawer.place_forget()
        self._drawer_open = False

    def _on_click_outside(self, event):
        """Cierra el drawer si está abierto y hace clic fuera de él."""
        if not self._drawer_open:
            return
        # Solo procesar si el drawer está visible
        try:
            drawer_x = self._drawer.winfo_x()
            drawer_w = self._drawer.winfo_width()
            abs_x = event.x_root - self.winfo_rootx()

            # Cerrar si hace clic fuera del drawer (más allá del ancho del drawer)
            if abs_x > (drawer_x + drawer_w):
                self._hide_drawer()
        except Exception:
            pass

    # ── Helpers de layout ────────────────────────────────────────────────────

    def _make_card(self, parent, title: str, row: int) -> ctk.CTkFrame:
        card = ctk.CTkFrame(parent, fg_color=C_CARD, corner_radius=14)
        card.grid(row=row, column=0, sticky="ew", padx=18, pady=9)
        card.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            card, text=title,
            font=ctk.CTkFont(size=13, weight="bold"), text_color="#9999cc",
        ).grid(row=0, column=0, sticky="w", padx=14, pady=(12, 4))

        ctk.CTkFrame(card, height=1, fg_color=C_BORDER).grid(
            row=0, column=0, sticky="ew", padx=14, pady=(42, 0)
        )

        return card

    def _badge(self, parent, title: str, value: str, col: int) -> ctk.CTkLabel:
        f = ctk.CTkFrame(parent, fg_color=C_CARD_DARK, corner_radius=10)
        f.grid(row=0, column=col, sticky="nsew", padx=5, pady=5)
        ctk.CTkLabel(
            f, text=title,
            font=ctk.CTkFont(size=9), text_color="#555577",
        ).pack(padx=10, pady=(9, 2))
        lbl = ctk.CTkLabel(
            f, text=value,
            font=ctk.CTkFont(size=12, weight="bold"), text_color=C_LABEL,
        )
        lbl.pack(padx=10, pady=(0, 9))
        return lbl

    # ── Escaneo de hardware ───────────────────────────────────────────────────

    def _start_hardware_scan(self):
        def scan():
            try:
                from core.hardware import escanear_hardware
                from core.capacity import construir_config
                perfil = escanear_hardware(con_benchmark=True)
                config  = construir_config(perfil, trafico_diario=0)
                self.after(0, lambda: self._update_hardware_ui(perfil, config))
            except Exception as e:
                self.after(0, lambda: self._lbl_hw_detail.configure(
                    text=f"No se pudo detectar el hardware: {e}"
                ))

        threading.Thread(target=scan, daemon=True).start()

    def _update_hardware_ui(self, perfil, config):
        tier_colors = {"i3": "#cc6600", "i5": "#4a6cf7", "i7": "#22aa55"}
        color = tier_colors.get(perfil.tier, "#555577")
        self._hardware_profile = perfil

        self._lbl_cpu.configure(text=f"Tier {perfil.tier.upper()}", text_color=color)
        self._lbl_ram.configure(text=f"{perfil.ram_total_gb:.0f} GB")
        self._lbl_tps.configure(text=f"{perfil.tps_estimado:.0f} tok/s")

        chats_color = "#22aa55" if perfil.chats_simultaneos >= 3 else "#cc6600"
        self._lbl_chats.configure(text=str(perfil.chats_simultaneos), text_color=chats_color)

        if perfil.modo_conservador:
            detalle = (
                f"CPU: {perfil.cpu_brand}  |  "
                "⚠️ Hardware limitado — se priorizará el menú automático (A1). "
                "La IA conversacional solo se activará en casos críticos."
            )
        else:
            avx = "✓" if perfil.avx2 else "✗"
            detalle = (
                f"CPU: {perfil.cpu_brand}  |  AVX2: {avx}  |  "
                "Listo para IA conversacional completa."
            )
        self._lbl_hw_detail.configure(text=detalle)
        self._on_trafico_change()

    def _on_trafico_change(self, event=None):
        if not self._hardware_profile:
            return
        try:
            trafico = int(self._entry_trafico.get() or "0")
        except ValueError:
            trafico = 0
        from core.capacity import construir_config, resumen_sla
        config = construir_config(self._hardware_profile, trafico_diario=trafico)
        self._lbl_sla.configure(text=resumen_sla(config))

    # ── Acciones ──────────────────────────────────────────────────────────────

    def _on_click_instalar(self):
        empresa = self._entry_empresa.get().strip()
        trafico_str = self._entry_trafico.get().strip()

        if not empresa:
            self._show_error("Por favor ingresá el nombre de la empresa.")
            return
        try:
            trafico = int(trafico_str) if trafico_str else 0
            if trafico < 0:
                raise ValueError
        except ValueError:
            self._show_error("El tráfico diario debe ser un número positivo.")
            return

        self._lbl_error.configure(text="")
        self._btn_instalar.configure(state="disabled", text=t("INSTALLING"))
        self._on_install(empresa=empresa, trafico=trafico)

    def _show_error(self, msg: str):
        self._lbl_error.configure(text=f"❌  {msg}")

    def _open_config(self, tab: int = 0):
        if self._on_open_config:
            self._on_open_config(tab)

    def set_whatsapp_connected(self, connected: bool):
        """Actualiza el estado de WhatsApp en la UI."""
        if connected:
            self._wa_dot.configure(text_color=C_GREEN)
            self._lbl_wa_status.configure(
                text="  " + t("WHATSAPP_LINKED"), text_color=C_GREEN
            )
            self._btn_qr.configure(
                state="disabled",
                fg_color=C_GREEN_DIM,
                text_color="#88ccaa",
                text="✓   WhatsApp vinculado",
            )
        else:
            self._wa_dot.configure(text_color="#444466")
            self._lbl_wa_status.configure(
                text="  " + t("WHATSAPP_NOT_LINKED"), text_color=C_MUTED
            )
            self._btn_qr.configure(
                state="normal",
                fg_color=C_GREEN,
                text_color="#000000",
                text=t("WHATSAPP_BTN"),
            )

    def enable_install_button(self):
        """Reactiva el botón instalar (en caso de error)."""
        self._btn_instalar.configure(state="normal", text=t("INSTALL_BTN"))
