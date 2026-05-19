"""
bridge.py — FastAPI bridge interno para monitoreo de recursos en tiempo real.
n8n consulta este endpoint para decidir si activar A2 (LLM) o A1 (Botonera).
"""

import threading
import time
from collections import deque
from datetime import datetime
from typing import Optional

import psutil
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="ChatBot Punto A Bridge", version="1.0.0", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cola de conversaciones activas: {phone: timestamp_inicio}
_queue: dict[str, float] = {}
_queue_lock = threading.Lock()

# Configuración de capacidad (se inyecta al iniciar el bridge)
_config = {
    "tps": 10.0,
    "chats_max": 2,
    "tokens_promedio": 50,
    "modo_conservador": False,
}


class QueueEntry(BaseModel):
    phone: str


class ResourcesResponse(BaseModel):
    cpu_pct: float
    ram_free_gb: float
    chats_activos: int
    chats_max: int
    can_accept: bool
    modo_conservador: bool
    wait_seconds: float
    wait_str: str


@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/resources", response_model=ResourcesResponse)
def get_resources():
    """
    Retorna el estado actual de los recursos del sistema.
    n8n llama a este endpoint para decidir si enrutar a A2 o A1.
    """
    cpu_pct = psutil.cpu_percent(interval=0.5)
    ram = psutil.virtual_memory()
    ram_free_gb = round(ram.available / (1024 ** 3), 2)

    with _queue_lock:
        activos = len(_queue)

    chats_max = _config["chats_max"]

    # Acepta si: CPU < 85%, RAM libre > 1.5 GB y no supera máximo de chats
    can_accept = (
        not _config["modo_conservador"]
        and cpu_pct < 85.0
        and ram_free_gb > 1.5
        and activos < chats_max
    )

    # Tiempo de espera estimado
    tps = _config["tps"]
    tokens = _config["tokens_promedio"]
    mensajes_cola = max(0, activos - chats_max + 1) if not can_accept else 0
    wait_sec = (mensajes_cola * tokens) / tps if tps > 0 else 0.0

    if wait_sec < 60:
        wait_str = f"{int(wait_sec)} segundos"
    elif wait_sec < 3600:
        wait_str = f"{int(wait_sec / 60)} minutos"
    else:
        wait_str = "más de 1 hora"

    return ResourcesResponse(
        cpu_pct=round(cpu_pct, 1),
        ram_free_gb=ram_free_gb,
        chats_activos=activos,
        chats_max=chats_max,
        can_accept=can_accept,
        modo_conservador=_config["modo_conservador"],
        wait_seconds=round(wait_sec, 1),
        wait_str=wait_str,
    )


@app.post("/api/queue/add")
def queue_add(entry: QueueEntry):
    """Registra una conversación activa en la cola."""
    with _queue_lock:
        _queue[entry.phone] = time.time()
        posicion = len(_queue)

    tps = _config["tps"]
    tokens = _config["tokens_promedio"]
    wait_sec = (posicion * tokens) / tps if tps > 0 else 0.0

    return {
        "phone": entry.phone,
        "position": posicion,
        "wait_seconds": round(wait_sec, 1),
    }


@app.delete("/api/queue/complete/{phone}")
def queue_complete(phone: str):
    """Elimina una conversación de la cola al completarse."""
    with _queue_lock:
        _queue.pop(phone, None)
    return {"status": "ok"}


@app.get("/api/queue")
def queue_status():
    """Estado actual de la cola."""
    with _queue_lock:
        return {
            "activos": len(_queue),
            "max": _config["chats_max"],
            "phones": list(_queue.keys()),
        }


class TicketEntry(BaseModel):
    phone: str
    descripcion: str
    prioridad: str = "media"


@app.post("/api/ticket")
def crear_ticket(ticket: TicketEntry):
    """
    Persiste un ticket de soporte en C:\\ChatBot_Punto_A\\tickets.jsonl.
    Una línea JSON por ticket para facilitar consultas sin necesidad de DB.
    """
    import json as _json
    from datetime import datetime
    from pathlib import Path

    tickets_file = Path(r"C:\ChatBot_Punto_A\tickets.jsonl")
    tickets_file.parent.mkdir(parents=True, exist_ok=True)

    registro = {
        "id": f"{int(time.time() * 1000)}",
        "phone": ticket.phone,
        "descripcion": ticket.descripcion,
        "prioridad": ticket.prioridad,
        "estado": "abierto",
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

    with open(tickets_file, "a", encoding="utf-8") as f:
        f.write(_json.dumps(registro, ensure_ascii=False) + "\n")

    return {"status": "ok", "ticket_id": registro["id"]}


def configurar(tps: float, chats_max: int, tokens_promedio: int, modo_conservador: bool):
    """Inyecta la configuración de capacidad al bridge."""
    _config.update({
        "tps": tps,
        "chats_max": chats_max,
        "tokens_promedio": tokens_promedio,
        "modo_conservador": modo_conservador,
    })


def iniciar_en_background(
    tps: float = 10.0,
    chats_max: int = 2,
    tokens_promedio: int = 50,
    modo_conservador: bool = False,
    puerto: int = 8765,
) -> threading.Thread:
    """
    Inicia el bridge FastAPI en un hilo daemon.
    """
    configurar(tps, chats_max, tokens_promedio, modo_conservador)

    def run():
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=puerto,
            log_level="error",
            access_log=False,
        )

    hilo = threading.Thread(target=run, daemon=True, name="ChatBotPuntoA-Bridge")
    hilo.start()
    return hilo


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8765, log_level="info")
