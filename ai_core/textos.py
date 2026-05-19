"""
textos.py — Sistema centralizado de textos UI configurables desde .env
Todos los textos de la aplicación se definen aquí y pueden ser sobrescritos por variables de entorno.
"""

import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Textos por defecto (pueden ser overrideados por .env)
TEXTOS = {
    # Titulos principales
    "APP_TITLE": os.getenv("APP_TITLE", "ChatBot Punto A"),
    "APP_SUBTITLE": os.getenv("APP_SUBTITLE", "Chatbot WhatsApp con IA Local"),
    "APP_DESCRIPTION": os.getenv("APP_DESCRIPTION", "Todo corre en tu servidor. Sin nube. Tus Chats y tu negocio Seguros."),

    # Ventana del instalador
    "INSTALLER_TITLE": os.getenv("INSTALLER_TITLE", "ChatBot Punto A — Instalador de Chatbot IA Local"),
    "HARDWARE_TITLE": os.getenv("HARDWARE_TITLE", "Hardware detectado"),
    "CONFIG_TITLE": os.getenv("CONFIG_TITLE", "Configuración del chatbot"),
    "EMPRESA_LABEL": os.getenv("EMPRESA_LABEL", "Nombre de la empresa:"),
    "EMPRESA_PLACEHOLDER": os.getenv("EMPRESA_PLACEHOLDER", "Ej: Mi Empresa SRL"),
    "TRAFICO_LABEL": os.getenv("TRAFICO_LABEL", "Tráfico diario estimado (chats/día):"),
    "TRAFICO_PLACEHOLDER": os.getenv("TRAFICO_PLACEHOLDER", "Ej: 50"),
    "TRAFICO_HELP": os.getenv("TRAFICO_HELP", "← Se usa para calcular los tiempos de respuesta que ve el cliente"),
    "WHATSAPP_LABEL": os.getenv("WHATSAPP_LABEL", "WhatsApp:"),
    "WHATSAPP_BTN": os.getenv("WHATSAPP_BTN", "Vincular WhatsApp (QR)"),
    "WHATSAPP_LINKED": os.getenv("WHATSAPP_LINKED", "[OK] Vinculado"),
    "WHATSAPP_NOT_LINKED": os.getenv("WHATSAPP_NOT_LINKED", "[OFFLINE] Sin vincular"),

    # Botones de configuración (sin emojis para evitar problemas de encoding)
    "CONFIG_TITLE_BUTTONS": os.getenv("CONFIG_TITLE_BUTTONS", "Configuración del chatbot:"),
    "BTN_CONVERSACIONES": os.getenv("BTN_CONVERSACIONES", "Conversaciones"),
    "BTN_CONFIG_A1": os.getenv("BTN_CONFIG_A1", "Menú A1"),
    "BTN_CONFIG_A2": os.getenv("BTN_CONFIG_A2", "IA A2"),
    "BTN_CONFIG_A3": os.getenv("BTN_CONFIG_A3", "Tickets A3"),

    # Botón instalar
    "INSTALL_BTN": os.getenv("INSTALL_BTN", "Instalar ChatBot Punto A"),
    "INSTALLING": os.getenv("INSTALLING", "Instalando..."),

    # Ventana QR
    "QR_WINDOW_TITLE": os.getenv("QR_WINDOW_TITLE", "Vincular WhatsApp — Escaneá el QR"),
    "QR_WINDOW_TITLE2": os.getenv("QR_WINDOW_TITLE2", "Vinculá tu WhatsApp"),
    "QR_INSTRUCTIONS": os.getenv("QR_INSTRUCTIONS", "Abrí WhatsApp en tu celular → Dispositivos vinculados → Vincular dispositivo"),
    "QR_LOADING": os.getenv("QR_LOADING", "Cargando QR..."),
    "QR_WAITING": os.getenv("QR_WAITING", "Esperando QR de WhatsApp..."),
    "QR_READY": os.getenv("QR_READY", "Escaneá el código QR con tu celular"),
    "QR_CONNECTED": os.getenv("QR_CONNECTED", "WhatsApp vinculado correctamente"),
    "QR_ERROR_CONNECTION": os.getenv("QR_ERROR_CONNECTION", "Evolution API no disponible. Verificá que la instalación esté completa."),
    "QR_REFRESH": os.getenv("QR_REFRESH", "Refrescar QR"),
    "QR_CLOSE": os.getenv("QR_CLOSE", "Cerrar"),
}

def get_texto(clave, default=None):
    """Obtener un texto por clave."""
    return TEXTOS.get(clave, default or clave)

def get_all_textos():
    """Obtener todos los textos."""
    return TEXTOS.copy()
