"""
main.py — Entry point del instalador Punto A.
Orquesta el flujo completo: GUI → hardware scan → instalación → QR WhatsApp.
"""

import json
import os
import secrets
import shutil
import sys
import threading
from pathlib import Path


def _ensure_install_root():
    """Crea C:\\ChatBot_Punto_A y sus subdirectorios si no existen."""
    from config import INSTALL_ROOT, CONFIG_DIR, DATA_DIR, LOG_DIR
    for d in [INSTALL_ROOT, CONFIG_DIR, DATA_DIR, LOG_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def _leer_state() -> dict:
    """Lee el archivo de estado de instalación para reanudar si fue interrumpida."""
    from config import STATE_FILE
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def _guardar_state(state: dict):
    """Persiste el estado de instalación."""
    from config import STATE_FILE
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")


def _generar_credenciales(state: dict) -> dict:
    """Genera credenciales únicas (una sola vez, se persisten en state.json)."""
    if "db_password" not in state:
        state["db_password"] = secrets.token_hex(16)
    if "n8n_key" not in state:
        state["n8n_key"] = secrets.token_hex(32)
    if "evolution_key" not in state:
        state["evolution_key"] = secrets.token_hex(20)
    return state


def _copiar_config_files(empresa: str, state: dict, log):
    """
    Copia docker-compose.yml, init_db.sql y whatsapp_service al directorio de instalación,
    y genera el archivo .env con las credenciales.
    """
    from config import (
        COMPOSE_FILE, INIT_SQL, WHATSAPP_SERVICE_DIR, CONFIG_DIR, DOT_ENV_FILE,
        DATA_DIR, INSTALL_ROOT,
    )
    from core.docker_setup import generar_env_file

    # Copiar docker-compose.yml — siempre sobrescribir
    dest_compose = CONFIG_DIR / "docker-compose.yml"
    if COMPOSE_FILE.exists():
        shutil.copy2(str(COMPOSE_FILE), str(dest_compose))
        log(f"docker-compose.yml copiado a {dest_compose}")

    # Copiar init_db.sql — siempre sobrescribir
    dest_sql = CONFIG_DIR / "init_db.sql"
    if INIT_SQL.exists():
        shutil.copy2(str(INIT_SQL), str(dest_sql))
        log(f"init_db.sql copiado a {dest_sql}")

    # Copiar whatsapp_service directory — siempre sobrescribir
    dest_whatsapp = INSTALL_ROOT / "whatsapp_service"
    if WHATSAPP_SERVICE_DIR.exists() and WHATSAPP_SERVICE_DIR.is_dir():
        if dest_whatsapp.exists():
            shutil.rmtree(str(dest_whatsapp))
        shutil.copytree(str(WHATSAPP_SERVICE_DIR), str(dest_whatsapp))
        log(f"whatsapp_service copiado a {dest_whatsapp}")

    # Generar .env
    generar_env_file(
        compose_dir=CONFIG_DIR,
        empresa=empresa,
        db_password=state["db_password"],
        n8n_key=state["n8n_key"],
        evolution_key=state["evolution_key"],
        data_dir=str(DATA_DIR),
    )
    log(f"Archivo .env generado en {DOT_ENV_FILE}")


# ---------------------------------------------------------------------------
# Flujo de instalación
# ---------------------------------------------------------------------------

def run_installation(empresa: str, trafico: int, progress_window, on_done, on_error):
    """
    Ejecuta todos los pasos de instalación en un hilo aparte.
    Llama a on_done() al terminar o on_error(msg) si hay un fallo.
    """

    def work():
        from config import (
            CONFIG_DIR, DATA_DIR, N8N_URL, EVOLUTION_URL,
            OLLAMA_URL, WORKFLOW_TEMPLATE, OLLAMA_MODEL,
            EVOLUTION_INSTANCE,
        )
        from core import docker_setup, ollama_setup, bridge
        from core.capacity import calcular_ollama_num_parallel
        from core.hardware import escanear_hardware

        log = progress_window.log
        state = _leer_state()
        state = _generar_credenciales(state)
        _guardar_state(state)

        try:
            # Paso 1: verificar Docker
            progress_window.set_step(1, "Verificando Docker Desktop")
            docker_setup.verify_docker(log=log)
            _guardar_state({**state, "step_docker": True})

            # Paso 2: directorios de datos
            progress_window.set_step(2, "Creando directorios de datos")
            _ensure_install_root()
            docker_setup.crear_directorios_datos(str(DATA_DIR), log=log)
            _copiar_config_files(empresa, state, log)
            docker_setup.verificar_puertos_disponibles(log=log)
            _guardar_state({**state, "step_dirs": True})

            # Paso 3: levantar Docker Compose
            progress_window.set_step(3, "Iniciando servicios Docker")
            docker_setup.compose_down_silencioso(CONFIG_DIR, log=log)
            docker_setup.compose_up(CONFIG_DIR, log=log)
            _guardar_state({**state, "step_compose": True})

            # Paso 4: esperar servicios
            progress_window.set_step(4, "Esperando que los servicios estén listos")
            docker_setup.esperar_servicios(log=log)
            _guardar_state({**state, "step_services": True})

            # Paso 5: Ollama
            progress_window.set_step(5, "Instalando Ollama")
            perfil = escanear_hardware(con_benchmark=False)
            num_parallel = calcular_ollama_num_parallel(perfil.ram_libre_gb)

            ollama_setup.instalar_y_configurar(
                num_parallel=num_parallel,
                modo_conservador=perfil.modo_conservador,
                modelo=OLLAMA_MODEL,
                log=log,
                progress_callback=None,
            )
            _guardar_state({**state, "step_ollama": True})

            # Paso 6: descargar modelo
            progress_window.set_step(6, "Descargando modelo LLM (~2.2 GB)")
            ollama_setup.pull_model(
                modelo=OLLAMA_MODEL,
                log=log,
                progress_callback=progress_window.set_model_progress,
            )
            _guardar_state({**state, "step_model": True})

            # Paso 7: importar workflow n8n
            progress_window.set_step(7, "Importando workflow de chatbot a n8n")
            docker_setup.import_workflow(
                n8n_url=N8N_URL,
                workflow_json_path=WORKFLOW_TEMPLATE,
                empresa=empresa,
                db_user="chatbot_punto_a",
                db_password=state["db_password"],
                evolution_key=state["evolution_key"],
                ollama_model=OLLAMA_MODEL,
                log=log,
            )
            _guardar_state({**state, "step_workflow": True})

            # Paso 7b: configurar webhook Evolution API → n8n
            docker_setup.configurar_webhook_evolution(
                evolution_url=EVOLUTION_URL,
                api_key=state["evolution_key"],
                instance=EVOLUTION_INSTANCE,
                log=log,
            )
            progress_window.set_step(8, "Iniciando bridge de recursos (puerto 8765)")
            from core.capacity import construir_config
            config = construir_config(perfil, trafico_diario=trafico)
            bridge.iniciar_en_background(
                tps=config.tps,
                chats_max=config.chats_simultaneos,
                tokens_promedio=config.tokens_promedio_mensaje,
                modo_conservador=config.modo_conservador,
            )
            log("Bridge iniciado en localhost:8765")

            _guardar_state({**state, "step_bridge": True, "empresa": empresa, "trafico": trafico})

            # Paso 9: completado
            progress_window.set_step(9, "Instalación completada")
            progress_window.after(0, progress_window.completado)
            progress_window.after(0, on_done)

        except Exception as exc:
            progress_window.after(0, lambda e=str(exc): progress_window.error(e))
            progress_window.after(0, lambda e=str(exc): on_error(e))

    threading.Thread(target=work, daemon=True).start()


# ---------------------------------------------------------------------------
# Entry point principal
# ---------------------------------------------------------------------------

def start_web_dashboard():
    """Inicia el dashboard de Next.js y abre el navegador automáticamente."""
    import webbrowser
    import subprocess
    import time
    def _start():
        try:
            # Iniciamos el servidor de forma silenciosa
            subprocess.Popen(["npm", "run", "dev"], cwd=r"c:\RouthLocal\punto_a\web_dashboard", shell=True)
            time.sleep(3)
            webbrowser.open("http://localhost:3000")
        except Exception as e:
            print(f"Error iniciando dashboard: {e}")
    
    import threading
    threading.Thread(target=_start, daemon=True).start()

def main():
    _ensure_install_root()
    start_web_dashboard()

    import customtkinter as ctk
    from config import EVOLUTION_URL, EVOLUTION_INSTANCE
    from gui.installer_window import InstallerWindow
    from gui.progress_window import ProgressWindow
    from gui.qr_window import QRWindow

    _progress_win  = None
    _config_win    = None
    _state         = _leer_state()
    _evolution_key = _state.get("evolution_key", "")

    def on_install(empresa: str, trafico: int):
        nonlocal _progress_win
        try:
            _progress_win = ProgressWindow(main_win)

            def on_done():
                main_win.enable_install_button()

            def on_error(msg: str):
                main_win.enable_install_button()

            run_installation(
                empresa=empresa,
                trafico=trafico,
                progress_window=_progress_win,
                on_done=on_done,
                on_error=on_error,
            )
        except Exception as e:
            import tkinter.messagebox as mb
            import traceback
            mb.showerror("Error en Instalador", f"Error iniciando instalación:\n\n{str(e)}\n\n{traceback.format_exc()}")
            main_win.enable_install_button()

    def on_link_whatsapp():
        nonlocal _evolution_key
        try:
            state_now = _leer_state()
            key = state_now.get("evolution_key", _evolution_key)

            QRWindow(
                parent=main_win,
                evolution_url=EVOLUTION_URL,
                api_key=key,
                instance=EVOLUTION_INSTANCE,
                on_connected=lambda: main_win.set_whatsapp_connected(True),
            )
        except Exception as e:
            import tkinter.messagebox as mb
            import traceback
            mb.showerror("Error WhatsApp", f"Error abriendo QR:\n\n{str(e)}\n\n{traceback.format_exc()}")

    def on_open_config(tab: int = 0):
        nonlocal _config_win
        from gui.config_window import ConfigWindow, TAB_NAMES
        import tkinter.messagebox as mb
        try:
            if _config_win is None or not _config_win.winfo_exists():
                _config_win = ConfigWindow(main_win, initial_tab=tab)
            else:
                # Cambiar al tab solicitado y traer al frente
                if 0 <= tab < len(TAB_NAMES):
                    _config_win._tabs.set(TAB_NAMES[tab])
                _config_win.deiconify()
                _config_win.lift()
                _config_win.focus_force()
        except Exception as e:
            import traceback
            mb.showerror(
                "Error al abrir Configuración",
                f"No se pudo abrir la ventana de configuración:\n\n{e}\n\n{traceback.format_exc()}"
            )

    try:
        main_win = InstallerWindow(
            on_install=on_install,
            on_link_whatsapp=on_link_whatsapp,
            on_open_config=on_open_config,
        )

        main_win.mainloop()
    except Exception as e:
        import tkinter.messagebox as mb
        import traceback
        mb.showerror("Error Fatal", f"Error crítico en la aplicación:\n\n{str(e)}\n\n{traceback.format_exc()}")
        raise


if __name__ == "__main__":
    main()
