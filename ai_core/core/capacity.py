"""
capacity.py — Cálculo de capacidad, SLA y configuración de Ollama
"""

from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .hardware import HardwareProfile


@dataclass
class CapacityConfig:
    tps: float
    chats_simultaneos: int
    ollama_num_parallel: int
    tokens_promedio_mensaje: int = 50
    trafico_diario: int = 0
    modo_conservador: bool = False

    def tiempo_espera_seg(self, mensajes_en_cola: int) -> float:
        """
        Calcula el tiempo de espera en segundos para el último mensaje en cola.
        Fórmula: (mensajes_en_cola × tokens_promedio) / TPS
        """
        if self.tps <= 0:
            return 999.9
        return (mensajes_en_cola * self.tokens_promedio_mensaje) / self.tps

    def tiempo_espera_str(self, mensajes_en_cola: int) -> str:
        """Retorna el tiempo de espera como string legible para el cliente."""
        segs = self.tiempo_espera_seg(mensajes_en_cola)
        if segs < 60:
            return f"{int(segs)} segundos"
        elif segs < 3600:
            mins = int(segs / 60)
            return f"{mins} minuto{'s' if mins > 1 else ''}"
        else:
            return "más de 1 hora"

    def mensaje_espera_whatsapp(self, mensajes_en_cola: int) -> str:
        """Genera el mensaje que A1 envía al usuario cuando el sistema está ocupado."""
        tiempo = self.tiempo_espera_str(mensajes_en_cola)
        return (
            f"Aguarde un instante, estamos procesando su consulta. "
            f"Tiempo estimado de respuesta: {tiempo}. "
            f"Gracias por su paciencia."
        )

    @property
    def descripcion_capacidad(self) -> str:
        """Descripción legible de la capacidad del sistema."""
        if self.modo_conservador:
            return (
                f"Hardware limitado: hasta {self.chats_simultaneos} chat simultáneo. "
                f"El módulo conversacional (IA) se usa solo para consultas críticas."
            )
        return (
            f"Hasta {self.chats_simultaneos} chats simultáneos fluidos. "
            f"Velocidad de respuesta: ~{self.tps:.0f} tokens/seg."
        )


def calcular_ollama_num_parallel(ram_libre_gb: float) -> int:
    """
    Calcula el valor óptimo de OLLAMA_NUM_PARALLEL según la RAM libre.
    Fórmula: RAM libre / 2.5 GB por instancia de modelo.
    Mínimo 1, máximo 8.
    """
    return max(1, min(8, int(ram_libre_gb / 2.5)))


def get_recomendacion_modelo(tps: float) -> dict:
    """
    Retorna la configuración recomendada del modelo según el TPS del hardware.
    """
    if tps >= 20:
        return {
            "modelo": "llama3.2:3b-instruct-q4_K_M",
            "prioridad_a1": False,
            "contexto_ventana": 4096,
            "descripcion": "Hardware potente: modelo completo activo."
        }
    elif tps >= 10:
        return {
            "modelo": "llama3.2:3b-instruct-q4_K_M",
            "prioridad_a1": False,
            "contexto_ventana": 2048,
            "descripcion": "Hardware estándar: modelo activo con contexto reducido."
        }
    elif tps >= 5:
        return {
            "modelo": "llama3.2:3b-instruct-q4_K_M",
            "prioridad_a1": False,
            "contexto_ventana": 1024,
            "descripcion": "Hardware básico: modelo activo, respuestas más lentas."
        }
    else:
        return {
            "modelo": "llama3.2:1b-instruct-q4_K_M",
            "prioridad_a1": True,
            "contexto_ventana": 512,
            "descripcion": (
                f"Hardware limitado (TPS: {tps:.1f}). "
                "Se prioriza el módulo A1 (Botonera). "
                "La IA conversacional solo se activa para consultas críticas."
            )
        }


def calcular_pico_diario(trafico_diario: int, horas_operacion: int = 12) -> int:
    """
    Estimación del pico de mensajes simultáneos en hora punta.
    Asume que el 20% del tráfico llega en la hora de mayor actividad.
    """
    mensajes_hora_punta = int(trafico_diario * 0.20)
    mensajes_por_minuto = mensajes_hora_punta / 60
    return max(1, int(mensajes_por_minuto))


def construir_config(perfil: "HardwareProfile", trafico_diario: int = 0) -> CapacityConfig:
    """
    Construye un CapacityConfig completo a partir de un HardwareProfile.
    """
    ollama_parallel = calcular_ollama_num_parallel(perfil.ram_libre_gb)

    return CapacityConfig(
        tps=perfil.tps_estimado,
        chats_simultaneos=perfil.chats_simultaneos,
        ollama_num_parallel=ollama_parallel,
        tokens_promedio_mensaje=50,
        trafico_diario=trafico_diario,
        modo_conservador=perfil.modo_conservador,
    )


def resumen_sla(config: CapacityConfig) -> str:
    """Genera un resumen legible del SLA para mostrar en la GUI."""
    pico = calcular_pico_diario(config.trafico_diario)
    espera_pico = config.tiempo_espera_str(pico)

    return (
        f"{config.descripcion_capacidad}\n"
        f"Tráfico diario: {config.trafico_diario} chats/día\n"
        f"Pico estimado: {pico} mensajes/min\n"
        f"Espera en pico: ~{espera_pico} por cliente"
    )
