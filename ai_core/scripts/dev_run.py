"""
dev_run.py — Corre el instalador directamente sin PyInstaller.
Útil para desarrollo y testing de la GUI.

Uso:
    python scripts/dev_run.py            # Ejecuta la GUI completa
    python scripts/dev_run.py --hardware  # Solo escanea hardware y muestra resultado
    python scripts/dev_run.py --bridge   # Solo lanza el bridge FastAPI
    python scripts/dev_run.py --workflow  # Valida el JSON del workflow
"""

import sys
import os

# Agregar raíz del proyecto al path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)


def cmd_hardware():
    """Escanea el hardware y muestra el resultado."""
    from core.hardware import escanear_hardware, resumen_hardware
    from core.capacity import construir_config, resumen_sla

    print("Escaneando hardware (tarda ~1 segundo)...")
    perfil = escanear_hardware(con_benchmark=True)
    print("\n" + resumen_hardware(perfil))

    config = construir_config(perfil, trafico_diario=100)
    print("\nSLA con 100 chats/día:")
    print(resumen_sla(config))


def cmd_bridge():
    """Lanza el bridge FastAPI de forma interactiva."""
    from core.bridge import iniciar_en_background
    import time

    print("Iniciando bridge en localhost:8765...")
    iniciar_en_background(tps=10.0, chats_max=2, tokens_promedio=50, modo_conservador=False)
    print("Bridge activo. Presioná Ctrl+C para detener.")
    print("  GET  http://localhost:8765/health")
    print("  GET  http://localhost:8765/api/resources")
    print("  POST http://localhost:8765/api/queue/add     body: {\"phone\": \"123\"}")
    print("  DEL  http://localhost:8765/api/queue/complete/123")

    # Mantener vivo el proceso principal
    import uvicorn
    from core.bridge import app
    uvicorn.run(app, host="0.0.0.0", port=8765, log_level="info")


def cmd_workflow():
    """Valida que el JSON del workflow sea parseable."""
    import json
    from config import WORKFLOW_TEMPLATE

    print(f"Validando workflow: {WORKFLOW_TEMPLATE}")
    try:
        contenido = WORKFLOW_TEMPLATE.read_text(encoding="utf-8")
        workflow = json.loads(contenido)
        nodos = workflow.get("nodes", [])
        conexiones = list(workflow.get("connections", {}).keys())
        print(f"  OK — {len(nodos)} nodos, {len(conexiones)} nodos con conexiones.")
        print("  Nodos:")
        for n in nodos:
            print(f"    - {n['name']} ({n['type']})")
    except json.JSONDecodeError as e:
        print(f"  ERROR: JSON inválido: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"  ERROR: {e}")
        sys.exit(1)


def cmd_gui():
    """Lanza la GUI completa del instalador."""
    import main
    main.main()


if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else ""

    if arg == "--hardware":
        cmd_hardware()
    elif arg == "--bridge":
        cmd_bridge()
    elif arg == "--workflow":
        cmd_workflow()
    else:
        cmd_gui()
