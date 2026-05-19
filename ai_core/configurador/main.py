#!/usr/bin/env python3
"""
Configurador del Chatbot Punto A
Aplicación GUI para configurar respuestas, entrenar el LLM y gestionar tickets
"""
import customtkinter as ctk
import sys
from pathlib import Path

# Configuración de CustomTkinter
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")


class ConfiguradorApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Configurar ventana principal
        self.title("Configurador ChatBot Punto A")
        self.geometry("1200x800")

        # Grid layout
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Barra de estado (crear primero para que los tabs puedan usarla)
        self.status_label = ctk.CTkLabel(self, text="✅ Inicializando...", anchor="w")
        self.status_label.grid(row=1, column=0, padx=20, pady=(0, 10), sticky="ew")

        # Crear TabView principal
        self.tabview = ctk.CTkTabview(self, width=1150, height=750)
        self.tabview.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")

        # Crear tabs
        self.tab_conversaciones = self.tabview.add("💬 Conversaciones")
        self.tab_config_a1 = self.tabview.add("🔘 Menú A1")
        self.tab_config_a2 = self.tabview.add("🤖 IA A2")
        self.tab_config_a3 = self.tabview.add("🎫 Tickets A3")

        # Inicializar cada tab
        self._setup_tab_conversaciones()
        self._setup_tab_config_a1()
        self._setup_tab_config_a2()
        self._setup_tab_config_a3()

        # Actualizar estado final
        self.status_label.configure(text="✅ Listo")

    def _setup_tab_conversaciones(self):
        """Tab 1: Ver conversaciones y activar/detener respuestas del bot"""
        from conversaciones_window import ConversacionesWindow
        ConversacionesWindow(self.tab_conversaciones, self)

    def _setup_tab_config_a1(self):
        """Tab 2: Configurar botonera, saludo, nombre agente, tono"""
        from config_a1_window import ConfigA1Window
        ConfigA1Window(self.tab_config_a1, self)

    def _setup_tab_config_a2(self):
        """Tab 3: Cargar conversaciones de entrenamiento"""
        from config_a2_window import ConfigA2Window
        ConfigA2Window(self.tab_config_a2, self)

    def _setup_tab_config_a3(self):
        """Tab 4: Templates de tickets personalizados"""
        from config_a3_window import ConfigA3Window
        ConfigA3Window(self.tab_config_a3, self)

    def update_status(self, message: str, color: str = "green"):
        """Actualizar barra de estado"""
        icons = {"green": "✅", "yellow": "⚠️", "red": "❌", "blue": "ℹ️"}
        icon = icons.get(color, "ℹ️")
        self.status_label.configure(text=f"{icon} {message}")


if __name__ == "__main__":
    app = ConfiguradorApp()
    app.mainloop()
