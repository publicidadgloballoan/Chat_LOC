"""
config.py — Configuración central de Punto A.
Define rutas, puertos y la función resource_path() para PyInstaller.
"""

import os
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Resolución de rutas (funciona tanto en dev como en .exe de PyInstaller)
# ---------------------------------------------------------------------------

def resource_path(relative: str) -> Path:
    """
    Retorna la ruta absoluta a un recurso bundled.
    - En desarrollo: relativa a este archivo.
    - En PyInstaller onefile: relativa al directorio temporal _MEIPASS.
    """
    base = getattr(sys, "_MEIPASS", Path(__file__).parent)
    return Path(base) / relative


# ---------------------------------------------------------------------------
# Rutas de instalación
# ---------------------------------------------------------------------------

INSTALL_ROOT = Path(r"C:\ChatBot_Punto_A")
CONFIG_DIR    = INSTALL_ROOT / "config"
DATA_DIR      = INSTALL_ROOT / "data"
LOG_DIR       = INSTALL_ROOT / "logs"
STATE_FILE    = INSTALL_ROOT / "state.json"
DOT_ENV_FILE  = CONFIG_DIR / ".env"

# Rutas de recursos bundled en el .exe
COMPOSE_FILE          = resource_path("config/docker-compose.yml")
WORKFLOW_TEMPLATE     = resource_path("config/workflow_chatbot.json")
INIT_SQL              = resource_path("config/init_db.sql")
WHATSAPP_SERVICE_DIR  = resource_path("whatsapp_service")
LOGO_PNG              = resource_path("assets/logo.png")
LOGO_ICO              = resource_path("assets/logo.ico")

# Directorios de datos Docker (se montan como volúmenes)
PGDATA_DIR       = DATA_DIR / "pgdata"
N8N_DATA_DIR     = DATA_DIR / "n8ndata"
EVOLUTION_DIR    = DATA_DIR / "evolution"

# ---------------------------------------------------------------------------
# Puertos
# ---------------------------------------------------------------------------

PORT_POSTGRES      = 5432
PORT_REDIS         = 6379
PORT_N8N           = 5678
PORT_EVOLUTION     = 8080
PORT_OLLAMA        = 11434
PORT_BRIDGE        = 8765

# ---------------------------------------------------------------------------
# URLs de los servicios
# ---------------------------------------------------------------------------

N8N_URL        = f"http://localhost:{PORT_N8N}"
EVOLUTION_URL  = f"http://localhost:{PORT_EVOLUTION}"
OLLAMA_URL     = f"http://localhost:{PORT_OLLAMA}"
BRIDGE_URL     = f"http://localhost:{PORT_BRIDGE}"

# ---------------------------------------------------------------------------
# Constantes del chatbot
# ---------------------------------------------------------------------------

OLLAMA_MODEL      = "llama3.2:3b-instruct-q4_K_M"
EVOLUTION_INSTANCE = "chatbot_punto_a"
N8N_WEBHOOK_PATH  = "/webhook/whatsapp"

# ---------------------------------------------------------------------------
# Utilidades de estado de instalación
# ---------------------------------------------------------------------------

import json
import secrets
import string


def generar_clave(longitud: int = 32) -> str:
    """Genera una clave aleatoria segura."""
    alfabeto = string.ascii_letters + string.digits
    return "".join(secrets.choice(alfabeto) for _ in range(longitud))


def leer_estado() -> dict:
    """Lee el estado de instalación guardado en disco."""
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def guardar_estado(estado: dict):
    """Guarda el estado de instalación en disco."""
    INSTALL_ROOT.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(estado, indent=2, ensure_ascii=False), encoding="utf-8")


def marcar_paso_completo(paso: str):
    """Marca un paso como completado para no repetirlo en re-ejecuciones."""
    estado = leer_estado()
    estado.setdefault("pasos_completados", [])
    if paso not in estado["pasos_completados"]:
        estado["pasos_completados"].append(paso)
    guardar_estado(estado)


def paso_completo(paso: str) -> bool:
    """Verifica si un paso ya fue completado."""
    return paso in leer_estado().get("pasos_completados", [])


def preparar_directorios():
    """Crea todos los directorios de instalación necesarios."""
    for d in [INSTALL_ROOT, CONFIG_DIR, DATA_DIR, LOG_DIR,
              PGDATA_DIR, N8N_DATA_DIR, EVOLUTION_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def copiar_archivos_config():
    """Copia los archivos de config del bundle al directorio de instalación."""
    import shutil
    for nombre in ["docker-compose.yml", "workflow_chatbot.json", "init_db.sql"]:
        origen = resource_path(f"config/{nombre}")
        destino = CONFIG_DIR / nombre
        # SIEMPRE sobrescribir para actualizar configuración en nuevas versiones
        if origen.exists():
            shutil.copy2(str(origen), str(destino))
