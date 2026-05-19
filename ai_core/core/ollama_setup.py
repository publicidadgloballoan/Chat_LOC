"""
ollama_setup.py — Instalación y configuración de Ollama en Windows
"""

import os
import subprocess
import sys
import tempfile
import time
import winreg
from pathlib import Path
from typing import Callable, Optional

import requests


OLLAMA_VERSION = "v0.5.7"
OLLAMA_WINDOWS_URL = f"https://github.com/ollama/ollama/releases/download/{OLLAMA_VERSION}/OllamaSetup.exe"
OLLAMA_API = "http://localhost:11434"
MODELO_DEFAULT = "llama3.2:3b-instruct-q4_K_M"


class OllamaError(Exception):
    pass


def is_installed() -> bool:
    """Verifica si Ollama está instalado en el sistema."""
    try:
        resultado = subprocess.run(
            ["ollama", "--version"],
            capture_output=True, text=True, timeout=5
        )
        return resultado.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def is_running() -> bool:
    """Verifica si el servidor de Ollama está activo."""
    try:
        r = requests.get(f"{OLLAMA_API}/api/tags", timeout=5)
        return r.status_code == 200
    except Exception:
        return False


def start_server(log: Callable[[str], None] = print):
    """Inicia el servidor de Ollama en segundo plano."""
    if is_running():
        return

    log("Iniciando servidor Ollama...")
    subprocess.Popen(
        ["ollama", "serve"],
        creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    for _ in range(20):
        time.sleep(2)
        if is_running():
            log("Servidor Ollama: activo.")
            return

    raise OllamaError("El servidor Ollama no arrancó. Intentá iniciarlo manualmente con 'ollama serve'.")


def download_ollama(log: Callable[[str], None] = print):
    """Descarga e instala Ollama para Windows silenciosamente."""
    log(f"Descargando Ollama {OLLAMA_VERSION}...")

    with tempfile.NamedTemporaryFile(suffix=".exe", delete=False) as f:
        installer_path = f.name

    try:
        respuesta = requests.get(OLLAMA_WINDOWS_URL, stream=True, timeout=30)
        respuesta.raise_for_status()

        total = int(respuesta.headers.get("content-length", 0))
        descargado = 0

        with open(installer_path, "wb") as f:
            for chunk in respuesta.iter_content(chunk_size=8192):
                f.write(chunk)
                descargado += len(chunk)
                if total > 0:
                    pct = int(descargado / total * 100)
                    log(f"  Descargando Ollama... {pct}% ({descargado // 1024 // 1024} MB)")

        log("Instalando Ollama (esto puede tardar varios minutos)...")
        resultado = subprocess.run(
            [installer_path, "/S"],  # /S = silencioso
            capture_output=True, text=True, timeout=600
        )

        if resultado.returncode != 0:
            raise OllamaError(f"El instalador de Ollama falló: {resultado.stderr}")

        log("Ollama instalado correctamente.")

    finally:
        try:
            os.unlink(installer_path)
        except Exception:
            pass


def set_env_variable(nombre: str, valor: str):
    """Establece una variable de entorno del sistema (persistente, requiere admin)."""
    try:
        with winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment",
            0,
            winreg.KEY_SET_VALUE,
        ) as key:
            winreg.SetValueEx(key, nombre, 0, winreg.REG_EXPAND_SZ, valor)
    except PermissionError:
        # Fallback: variable de usuario
        with winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            "Environment",
            0,
            winreg.KEY_SET_VALUE,
        ) as key:
            winreg.SetValueEx(key, nombre, 0, winreg.REG_EXPAND_SZ, valor)

    # También para el proceso actual
    os.environ[nombre] = valor


def configure(num_parallel: int, modo_conservador: bool, log: Callable[[str], None] = print):
    """
    Configura las variables de entorno de Ollama según el hardware detectado.
    """
    log(f"Configurando Ollama (OLLAMA_NUM_PARALLEL={num_parallel})...")

    # Permitir que Ollama reciba conexiones desde la red de Docker
    set_env_variable("OLLAMA_HOST", "0.0.0.0")
    set_env_variable("OLLAMA_NUM_PARALLEL", str(num_parallel))

    # Activar NUMA para mejores resultados en Intel
    set_env_variable("OLLAMA_NUMA", "1")

    # En modo conservador, limitar el contexto para ahorrar RAM
    if modo_conservador:
        set_env_variable("OLLAMA_MAX_LOADED_MODELS", "1")
        log("Modo conservador: máximo 1 modelo cargado simultáneamente.")
    else:
        set_env_variable("OLLAMA_MAX_LOADED_MODELS", str(min(num_parallel, 3)))

    log("Variables de entorno de Ollama configuradas.")


def pull_model(
    modelo: str = MODELO_DEFAULT,
    log: Callable[[str], None] = print,
    progress_callback: Optional[Callable[[int], None]] = None,
):
    """
    Descarga el modelo LLM via Ollama con reporte de progreso.
    Usa la API HTTP de Ollama para obtener el progreso en tiempo real.
    """
    log(f"Verificando modelo {modelo}...")

    # Verificar si ya está descargado
    try:
        r = requests.get(f"{OLLAMA_API}/api/tags", timeout=5)
        if r.status_code == 200:
            modelos = [m["name"] for m in r.json().get("models", [])]
            # Normalizar nombre para comparar
            nombre_base = modelo.split(":")[0]
            for m in modelos:
                if nombre_base in m and ("q4" in m.lower() or "3b" in m.lower()):
                    log(f"Modelo {m} ya disponible. Omitiendo descarga.")
                    if progress_callback:
                        progress_callback(100)
                    return
    except Exception:
        pass

    log(f"Descargando {modelo} (~2.2 GB)...")

    try:
        with requests.post(
            f"{OLLAMA_API}/api/pull",
            json={"name": modelo, "stream": True},
            stream=True,
            timeout=1800,  # 30 minutos máximo
        ) as respuesta:
            respuesta.raise_for_status()

            for linea in respuesta.iter_lines():
                if not linea:
                    continue
                try:
                    import json
                    data = json.loads(linea)
                    status = data.get("status", "")
                    total = data.get("total", 0)
                    completado = data.get("completed", 0)

                    if total > 0 and completado > 0:
                        pct = int(completado / total * 100)
                        mb_total = total // 1024 // 1024
                        mb_desc = completado // 1024 // 1024
                        log(f"  {status}: {mb_desc}/{mb_total} MB ({pct}%)")
                        if progress_callback:
                            progress_callback(pct)
                    elif status:
                        log(f"  {status}")

                    if data.get("status") == "success":
                        log(f"Modelo {modelo} descargado correctamente.")
                        if progress_callback:
                            progress_callback(100)
                        return

                except (ValueError, KeyError):
                    pass

    except requests.exceptions.ConnectionError:
        raise OllamaError("No se puede conectar a Ollama. Asegurate de que esté corriendo con 'ollama serve'.")
    except requests.exceptions.Timeout:
        raise OllamaError("La descarga del modelo tardó demasiado. Verificá la conexión a Internet.")


def is_model_available(modelo: str = MODELO_DEFAULT) -> bool:
    """Verifica si un modelo está disponible localmente."""
    try:
        r = requests.get(f"{OLLAMA_API}/api/tags", timeout=5)
        if r.status_code == 200:
            modelos = [m["name"] for m in r.json().get("models", [])]
            nombre_base = modelo.split(":")[0]
            return any(nombre_base in m for m in modelos)
    except Exception:
        pass
    return False


def instalar_y_configurar(
    num_parallel: int,
    modo_conservador: bool,
    modelo: str = MODELO_DEFAULT,
    log: Callable[[str], None] = print,
    progress_callback: Optional[Callable[[int], None]] = None,
):
    """
    Flujo completo: instalar Ollama si no está, configurar, iniciar servidor, descargar modelo.
    """
    if not is_installed():
        download_ollama(log=log)
    else:
        log("Ollama ya está instalado.")

    configure(num_parallel=num_parallel, modo_conservador=modo_conservador, log=log)
    start_server(log=log)
    pull_model(modelo=modelo, log=log, progress_callback=progress_callback)
