"""
docker_setup.py — Gestión de Docker Desktop y Docker Compose para ChatBot Punto A
"""

import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Callable, Optional

import requests


class DockerError(Exception):
    pass


# URL oficial del instalador de Docker Desktop para Windows x64
DOCKER_INSTALLER_URL = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"

# Rutas de instalación conocidas de Docker Desktop en Windows
DOCKER_EXE_PATHS = [
    r"C:\Program Files\Docker\Docker\Docker Desktop.exe",
    r"C:\Program Files\Docker\Docker\resources\bin\docker.exe",
]


def _docker_cmd() -> Optional[str]:
    """Retorna la ruta al ejecutable docker, o None si no está en PATH."""
    return shutil.which("docker")


def is_docker_installed() -> bool:
    """Verifica si Docker Desktop está instalado en el sistema."""
    if _docker_cmd():
        return True
    for ruta in DOCKER_EXE_PATHS:
        if Path(ruta).exists():
            return True
    return False


def is_docker_running() -> bool:
    """Verifica si el daemon de Docker está activo y respondiendo."""
    try:
        resultado = subprocess.run(
            ["docker", "info"],
            capture_output=True, text=True, timeout=10
        )
        return resultado.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def _verificar_virtualizacion(log: Callable[[str], None] = print) -> bool:
    """
    Verifica si la virtualización de hardware (VT-x/AMD-V) está habilitada.
    Retorna True si está habilitada, False si no.
    """
    try:
        # Usar systeminfo para verificar virtualización
        r = subprocess.run(
            ["systeminfo"],
            capture_output=True,
            text=True,
            timeout=30,
            encoding="utf-8",
            errors="replace"
        )

        if r.returncode == 0:
            output = r.stdout.lower()
            # Buscar la línea de virtualización en systeminfo
            for linea in output.split("\n"):
                if "virtualization enabled in firmware" in linea or "virtualización habilitada en el firmware" in linea:
                    if ": yes" in linea or ": sí" in linea or ": si" in linea:
                        return True
                    elif ": no" in linea:
                        return False

        # Método alternativo: verificar usando PowerShell y hyper-v
        r2 = subprocess.run(
            ["powershell", "-Command",
             "(Get-CimInstance -ClassName Win32_ComputerSystem).HypervisorPresent"],
            capture_output=True,
            text=True,
            timeout=15
        )
        if r2.returncode == 0 and "true" in r2.stdout.lower():
            return True

    except Exception:
        pass

    # Si no pudimos detectar, asumir que está habilitada (no bloqueamos la instalación)
    return True


def _habilitar_wsl2(log: Callable[[str], None] = print):
    """
    Habilita WSL2 y la plataforma de máquinas virtuales si no están activos.
    Necesario como requisito previo de Docker Desktop en Windows 10/11.
    """
    try:
        log("Verificando WSL2...")
        r = subprocess.run(
            ["wsl", "--status"],
            capture_output=True, text=True, timeout=15
        )
        if r.returncode == 0:
            log("WSL2: OK")
            return
    except FileNotFoundError:
        pass

    log("Habilitando WSL2 y máquinas virtuales (requiere reinicio si es la primera vez)...")
    try:
        subprocess.run(
            ["powershell", "-Command",
             "Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart; "
             "Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart"],
            capture_output=True, timeout=60
        )
        subprocess.run(["wsl", "--set-default-version", "2"], capture_output=True, timeout=30)
    except Exception as e:
        log(f"  Advertencia WSL2: {e}")


def _descargar_docker_installer(log: Callable[[str], None] = print) -> Path:
    """
    Descarga el instalador de Docker Desktop al directorio temporal.
    Muestra progreso de descarga.
    """
    installer_path = Path(tempfile.gettempdir()) / "DockerDesktopInstaller.exe"

    if installer_path.exists() and installer_path.stat().st_size > 100_000_000:
        log("Instalador de Docker Desktop ya descargado.")
        return installer_path

    log("Descargando Docker Desktop (~500 MB)...")
    try:
        with requests.get(DOCKER_INSTALLER_URL, stream=True, timeout=30) as r:
            r.raise_for_status()
            total = int(r.headers.get("Content-Length", 0))
            descargado = 0
            ultimo_pct = -1

            with open(installer_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=1024 * 1024):  # 1 MB chunks
                    f.write(chunk)
                    descargado += len(chunk)
                    if total:
                        pct = int(descargado / total * 100)
                        if pct != ultimo_pct and pct % 10 == 0:
                            log(f"  Descargando Docker Desktop... {pct}%")
                            ultimo_pct = pct

        log("Docker Desktop descargado.")
        return installer_path

    except Exception as e:
        if installer_path.exists():
            installer_path.unlink(missing_ok=True)
        raise DockerError(f"Error descargando Docker Desktop: {e}")


def _instalar_docker(installer_path: Path, log: Callable[[str], None] = print):
    """
    Ejecuta el instalador de Docker Desktop en modo silencioso.
    Instalación típica: 2-5 minutos.
    """
    log("Instalando Docker Desktop (esto puede tardar varios minutos)...")

    try:
        resultado = subprocess.run(
            [str(installer_path), "install",
             "--quiet",
             "--accept-license",
             "--backend=wsl-2"],
            timeout=600,   # 10 minutos máximo
            capture_output=True,
            text=True,
        )

        if resultado.returncode != 0:
            # Código 1641 = reinicio pendiente, es aceptable
            if resultado.returncode == 1641:
                log("Docker Desktop instalado. Se requiere reiniciar Windows para continuar.")
                log("Reiniciá y volvé a ejecutar el instalador.")
                sys.exit(0)
            raise DockerError(
                f"El instalador de Docker Desktop falló (código {resultado.returncode}).\n"
                f"{resultado.stderr or resultado.stdout or 'Sin detalle.'}"
            )

        log("Docker Desktop instalado correctamente.")

    except subprocess.TimeoutExpired:
        raise DockerError("El instalador de Docker Desktop tardó demasiado. Instalalo manualmente.")


def _iniciar_docker_desktop(log: Callable[[str], None] = print):
    """Inicia Docker Desktop y espera a que el daemon esté disponible."""
    docker_desktop_exe = r"C:\Program Files\Docker\Docker\Docker Desktop.exe"

    if not Path(docker_desktop_exe).exists():
        # Buscar en Program Files (x86) también
        alt = r"C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe"
        if Path(alt).exists():
            docker_desktop_exe = alt

    if Path(docker_desktop_exe).exists():
        log("Iniciando Docker Desktop...")
        subprocess.Popen(
            [docker_desktop_exe],
            creationflags=subprocess.DETACHED_PROCESS,
        )

    # Esperar hasta 3 minutos a que el daemon responda
    log("Esperando que Docker esté listo (hasta 3 minutos)...")
    for i in range(36):
        time.sleep(5)
        if is_docker_running():
            log("Docker Desktop: listo.")
            return
        if i % 6 == 5:
            log(f"  Esperando Docker... ({(i+1)*5}s)")

    # Si llegamos acá, Docker no arrancó. Verificar si es por virtualización
    if not _verificar_virtualizacion(log):
        raise DockerError(
            "⚠️ Docker Desktop no puede iniciar: Virtualización de hardware no habilitada\n\n"
            "Para habilitar la virtualización:\n"
            "1. Reiniciá la PC y entrá al BIOS/UEFI (F2, F10, Del o Esc al iniciar)\n"
            "2. Buscá 'Virtualization Technology', 'Intel VT-x', 'AMD-V' o 'SVM Mode'\n"
            "3. Cambiala a 'Enabled'\n"
            "4. Guardá (F10) y reiniciá\n"
            "5. Volvé a ejecutar el instalador\n\n"
            "Consultá el manual de tu PC si no encontrás la opción."
        )

    raise DockerError(
        "Docker Desktop no terminó de iniciar.\n"
        "Abrilo manualmente desde el menú inicio y volvé a ejecutar el instalador."
    )


def verify_docker(log: Callable[[str], None] = print):
    """
    Verifica que Docker Desktop esté disponible y corriendo.
    Si no está instalado, lo descarga e instala automáticamente.
    Si está instalado pero no corriendo, lo inicia automáticamente.
    """
    log("Verificando Docker Desktop...")

    if not is_docker_installed():
        # Verificar virtualización ANTES de descargar Docker
        log("Verificando virtualización de hardware...")
        if not _verificar_virtualizacion(log):
            raise DockerError(
                "⚠️ Virtualización de hardware no habilitada\n\n"
                "Docker Desktop requiere que la virtualización (VT-x/AMD-V) esté habilitada en el BIOS.\n\n"
                "Para habilitarla:\n"
                "1. Reiniciá la PC y entrá al BIOS/UEFI (presioná F2, F10, Del o Esc al iniciar)\n"
                "2. Buscá la opción 'Virtualization Technology', 'Intel VT-x', 'AMD-V' o 'SVM Mode'\n"
                "3. Cambiala a 'Enabled' / 'Habilitado'\n"
                "4. Guardá cambios (F10) y reiniciá\n"
                "5. Volvé a ejecutar este instalador\n\n"
                "Si no encontrás la opción, consultá el manual de tu placa madre o fabricante de PC."
            )

        log("Virtualización: OK")
        log("Docker Desktop no detectado. Iniciando instalación automática...")
        _habilitar_wsl2(log)
        installer = _descargar_docker_installer(log)
        _instalar_docker(installer, log)
        # Limpiar el instalador descargado
        try:
            installer.unlink(missing_ok=True)
        except Exception:
            pass
        _iniciar_docker_desktop(log)
        return

    if not is_docker_running():
        log("Docker Desktop instalado pero no está corriendo. Iniciando...")
        _iniciar_docker_desktop(log)
        return

    log("Docker Desktop: OK")


def verificar_puerto_libre(puerto: int) -> bool:
    """Verifica si un puerto está libre en localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", puerto)) != 0


def _puerto_es_nuestro(puerto: int) -> bool:
    """Retorna True si el puerto está ocupado por uno de nuestros contenedores."""
    try:
        r = subprocess.run(
            ["docker", "ps", "--filter", f"publish={puerto}", "--format", "{{.Names}}"],
            capture_output=True, text=True, timeout=5,
        )
        return r.returncode == 0 and "chatbot_punto_a" in r.stdout
    except Exception:
        return False


def verificar_puertos_disponibles(log: Callable[[str], None] = print):
    """Verifica que los puertos necesarios estén libres.
    Ignora puertos ocupados por nuestros propios contenedores (serán reiniciados)."""
    puertos = {
        5432: "PostgreSQL",
        6379: "Redis",
        5678: "n8n",
        8080: "Evolution API",
    }
    conflictos = []
    for puerto, nombre in puertos.items():
        if not verificar_puerto_libre(puerto) and not _puerto_es_nuestro(puerto):
            conflictos.append(f"  Puerto {puerto} ({nombre}) ya está en uso.")

    if conflictos:
        raise DockerError(
            "Conflicto de puertos:\n" + "\n".join(conflictos) +
            "\n\nCerrá los servicios que usan esos puertos y volvé a intentar."
        )
    log("Puertos disponibles: OK")


def compose_down_silencioso(compose_dir: Path, log: Callable[[str], None] = print):
    """Detiene contenedores existentes antes de reiniciar. No falla si no hay nada corriendo."""
    try:
        r = subprocess.run(
            ["docker", "compose", "down", "--remove-orphans"],
            cwd=str(compose_dir),
            capture_output=True, text=True, timeout=60,
        )
        if r.returncode == 0 and r.stdout.strip():
            log("Contenedores anteriores detenidos.")
    except Exception:
        pass


def generar_env_file(
    compose_dir: Path,
    empresa: str,
    db_password: str,
    n8n_key: str,
    evolution_key: str,
    data_dir: str,
):
    """Genera el archivo .env en el directorio de docker-compose."""
    env_content = f"""EMPRESA={empresa}
DB_NAME=chatbot_punto_a
DB_USER=chatbot_punto_a
DB_PASSWORD={db_password}
N8N_ENCRYPTION_KEY={n8n_key}
EVOLUTION_API_KEY={evolution_key}
DATA_DIR={data_dir.replace(chr(92), '/')}
"""
    env_file = compose_dir / ".env"
    env_file.write_text(env_content, encoding="utf-8")


def crear_directorios_datos(data_dir: str, log: Callable[[str], None] = print):
    """Crea los directorios de datos para los volúmenes Docker."""
    directorios = ["pgdata", "n8ndata", "evolution", "whatsapp_auth"]
    for d in directorios:
        ruta = Path(data_dir) / d
        ruta.mkdir(parents=True, exist_ok=True)
        log(f"Directorio creado: {ruta}")


def compose_up(compose_dir: Path, log: Callable[[str], None] = print):
    """Levanta todos los servicios con Docker Compose."""
    log("Iniciando servicios Docker (PostgreSQL, Redis, n8n, Evolution API)...")

    proceso = subprocess.Popen(
        ["docker", "compose", "up", "-d", "--remove-orphans"],
        cwd=str(compose_dir),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )

    for linea in proceso.stdout:
        linea = linea.strip()
        if linea:
            log(f"  {linea}")

    proceso.wait()
    if proceso.returncode != 0:
        raise DockerError(f"Docker Compose falló con código {proceso.returncode}")

    log("Servicios Docker iniciados.")


def wait_for_service(url: str, nombre: str, timeout: int = 120, log: Callable[[str], None] = print) -> bool:
    """
    Espera hasta que un servicio HTTP responda con 200.
    Retorna True si el servicio está listo, False si venció el timeout.
    """
    log(f"Esperando {nombre}...")
    inicio = time.time()
    while time.time() - inicio < timeout:
        try:
            r = requests.get(url, timeout=5)
            if r.status_code < 500:
                log(f"{nombre}: listo.")
                return True
        except requests.exceptions.ConnectionError:
            pass
        except Exception:
            pass
        time.sleep(3)

    log(f"ADVERTENCIA: {nombre} no respondió a tiempo.")
    return False


def esperar_servicios(log: Callable[[str], None] = print):
    """Espera que todos los servicios estén operativos."""
    wait_for_service("http://localhost:5678/healthz", "n8n", timeout=120, log=log)
    wait_for_service("http://localhost:8080/", "Evolution API", timeout=60, log=log)


def obtener_n8n_api_key(n8n_url: str = "http://localhost:5678") -> Optional[str]:
    """
    Obtiene o crea una API key de n8n para importar workflows.
    n8n en versión self-hosted sin auth devuelve la key del owner.
    """
    try:
        # Intentar generar una API key via endpoint de n8n
        r = requests.post(
            f"{n8n_url}/api/v1/auth/login",
            json={"email": "owner@chatbot_punto_a.local", "password": "chatbot_punto_a_admin"},
            timeout=10,
        )
        if r.status_code == 200:
            data = r.json()
            return data.get("data", {}).get("token") or data.get("token")
    except Exception:
        pass
    return None


def import_workflow(
    n8n_url: str,
    workflow_json_path: Path,
    empresa: str,
    db_user: str,
    db_password: str,
    evolution_key: str,
    ollama_model: str = "llama3.2:3b-instruct-q4_K_M",
    log: Callable[[str], None] = print,
):
    """
    Importa el workflow pre-configurado a n8n usando la REST API.
    """
    log("Importando workflow de chatbot a n8n...")

    try:
        # Leer y procesar workflow template
        contenido = workflow_json_path.read_text(encoding="utf-8-sig")

        # Sustituir variables de plantilla
        sustituciones = {
            "{{EMPRESA}}": empresa,
            "{{DB_USER}}": db_user,
            "{{DB_PASSWORD}}": db_password,
            "{{EVOLUTION_API_KEY}}": evolution_key,
            "{{OLLAMA_MODEL}}": ollama_model,
        }
        for clave, valor in sustituciones.items():
            contenido = contenido.replace(clave, valor)

        workflow = json.loads(contenido)

        # n8n con N8N_USER_MANAGEMENT_DISABLED=true y N8N_BASIC_AUTH_ACTIVE=false
        # no requiere autenticación en la REST API.
        headers = {"Content-Type": "application/json"}

        # Preparar workflow para importar (solo campos permitidos)
        workflow_import = {
            "name": workflow.get("name"),
            "nodes": workflow.get("nodes", []),
            "connections": workflow.get("connections", {}),
            "settings": {
                "executionOrder": "v1"
            },
            "staticData": workflow.get("staticData", {})
        }

        # Importar via REST API
        log("Importando workflow via API REST...")
        response = requests.post(
            f"{n8n_url}/api/v1/workflows",
            headers=headers,
            json=workflow_import,
            timeout=30
        )

        if response.status_code not in [200, 201]:
            raise Exception(f"Error al importar workflow: {response.status_code} - {response.text}")

        result = response.json()
        workflow_id = result.get('id')
        log(f"Workflow importado correctamente (ID: {workflow_id})")

        # Activar workflow si no está activo
        if not result.get('active'):
            log("Activando workflow...")
            activate_response = requests.post(
                f"{n8n_url}/api/v1/workflows/{workflow_id}/activate",
                headers=headers,
                timeout=10
            )

            if activate_response.status_code != 200:
                raise Exception(f"Error al activar workflow: {activate_response.status_code}")

            log("Workflow activado correctamente")

        # Esperar a que n8n registre los webhooks
        time.sleep(3)

        return True

    except Exception as e:
        log(f"ERROR al importar workflow: {str(e)}")
        log("El workflow deberá importarse manualmente desde http://localhost:5678")
        return False


def configurar_webhook_evolution(
    evolution_url: str,
    api_key: str,
    instance: str,
    n8n_webhook_url: str = None,
    workflow_id: str = None,
    log: Callable[[str], None] = print,
):
    """Configura el webhook del servicio WhatsApp (Baileys) apuntando al workflow de n8n."""

    # Usar siempre el nombre del servicio interno de docker para n8n
    if not n8n_webhook_url:
        n8n_webhook_url = "http://n8n:5678/webhook/whatsapp"

    log("Configurando webhook de WhatsApp → n8n...")
    log(f"URL del webhook: {n8n_webhook_url}")
    try:
        r = requests.put(
            f"{evolution_url}/webhook/set/{instance}",
            headers={"apikey": api_key, "Content-Type": "application/json"},
            json={"url": n8n_webhook_url},
            timeout=10,
        )
        if r.status_code in (200, 201):
            log("Webhook WhatsApp configurado correctamente.")
        else:
            log(f"ADVERTENCIA: Webhook no configurado ({r.status_code}). Configúralo manualmente en {evolution_url}")
    except Exception as e:
        log(f"ADVERTENCIA: Error configurando webhook: {e}")


def detener_servicios(compose_dir: Path, log: Callable[[str], None] = print):
    """Detiene todos los servicios Docker."""
    log("Deteniendo servicios...")
    subprocess.run(
        ["docker", "compose", "down"],
        cwd=str(compose_dir),
        capture_output=True,
    )
    log("Servicios detenidos.")
