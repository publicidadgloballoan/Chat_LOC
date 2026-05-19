"""
test_capacity.py — Tests para core/capacity.py
Verifica la fórmula de SLA, ollama_num_parallel y CapacityConfig.
"""

import sys
import os

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ---------------------------------------------------------------------------
# Tests de calcular_ollama_num_parallel
# ---------------------------------------------------------------------------

def test_parallel_minimo_1():
    from core.capacity import calcular_ollama_num_parallel
    # Con solo 2.5 GB libres: int(2.5/2.5) = 1
    assert calcular_ollama_num_parallel(2.5) == 1


def test_parallel_cero_gb_da_1():
    from core.capacity import calcular_ollama_num_parallel
    # Con 0 GB libres no puede ser 0 (mínimo es 1)
    assert calcular_ollama_num_parallel(0.0) == 1


def test_parallel_16gb_da_6():
    from core.capacity import calcular_ollama_num_parallel
    # int(16/2.5) = 6
    assert calcular_ollama_num_parallel(16.0) == 6


def test_parallel_maximo_8():
    from core.capacity import calcular_ollama_num_parallel
    # Con 100 GB, sin importar el free, el máximo es 8
    assert calcular_ollama_num_parallel(100.0) == 8


# ---------------------------------------------------------------------------
# Tests de CapacityConfig.tiempo_espera_seg
# ---------------------------------------------------------------------------

def test_formula_espera_documentada():
    """
    Ejemplo del spec: 10 mensajes en cola, 50 tokens, i5 a 10 TPS = 50 seg.
    """
    from core.capacity import CapacityConfig
    config = CapacityConfig(tps=10.0, chats_simultaneos=2, ollama_num_parallel=2)
    config.tokens_promedio_mensaje = 50
    assert config.tiempo_espera_seg(mensajes_en_cola=10) == pytest.approx(50.0)


def test_formula_espera_cero_cola():
    from core.capacity import CapacityConfig
    config = CapacityConfig(tps=5.0, chats_simultaneos=1, ollama_num_parallel=1)
    assert config.tiempo_espera_seg(0) == 0.0


def test_formula_espera_tps_cero_retorna_999():
    from core.capacity import CapacityConfig
    config = CapacityConfig(tps=0.0, chats_simultaneos=1, ollama_num_parallel=1)
    assert config.tiempo_espera_seg(5) == 999.9


def test_tiempo_espera_str_segundos():
    from core.capacity import CapacityConfig
    config = CapacityConfig(tps=10.0, chats_simultaneos=2, ollama_num_parallel=2)
    result = config.tiempo_espera_str(10)  # 50 seg
    assert "segundo" in result


def test_tiempo_espera_str_minutos():
    from core.capacity import CapacityConfig
    config = CapacityConfig(tps=3.0, chats_simultaneos=1, ollama_num_parallel=1)
    # 1 mensaje * 50 tokens / 3 TPS = 16.7 seg → segundos
    # 100 mensajes * 50 tokens / 3 TPS = 1666 seg → 27 minutos
    result = config.tiempo_espera_str(100)
    assert "minuto" in result


# ---------------------------------------------------------------------------
# Tests de calcular_pico_diario
# ---------------------------------------------------------------------------

def test_pico_diario_100_chats():
    from core.capacity import calcular_pico_diario
    # 100 chats/día × 20% en hora punta = 20 mensajes/hora = 0.33/min → pico = 1
    pico = calcular_pico_diario(100)
    assert pico >= 1


def test_pico_diario_1000_chats():
    from core.capacity import calcular_pico_diario
    # 1000 × 20% = 200 mensajes/hora = 3.3/min → pico = 3
    pico = calcular_pico_diario(1000)
    assert pico == 3


def test_pico_minimo_1():
    from core.capacity import calcular_pico_diario
    pico = calcular_pico_diario(0)
    assert pico == 1


# ---------------------------------------------------------------------------
# Tests de get_recomendacion_modelo
# ---------------------------------------------------------------------------

def test_modelo_recomendado_tps_bajo_prioriza_a1():
    from core.capacity import get_recomendacion_modelo
    rec = get_recomendacion_modelo(3.0)
    assert rec["prioridad_a1"] is True


def test_modelo_recomendado_tps_alto_no_conservador():
    from core.capacity import get_recomendacion_modelo
    rec = get_recomendacion_modelo(25.0)
    assert rec["prioridad_a1"] is False
    assert rec["contexto_ventana"] == 4096


def test_modelo_recomendado_tps_medio():
    from core.capacity import get_recomendacion_modelo
    rec = get_recomendacion_modelo(10.0)
    assert rec["prioridad_a1"] is False
    assert rec["contexto_ventana"] == 2048


# ---------------------------------------------------------------------------
# Tests de construir_config
# ---------------------------------------------------------------------------

def test_construir_config_desde_perfil():
    from core.capacity import construir_config, CapacityConfig

    class FakePerfil:
        tps_estimado = 12.0
        chats_simultaneos = 2
        ram_libre_gb = 8.0
        modo_conservador = False

    config = construir_config(FakePerfil(), trafico_diario=200)
    assert isinstance(config, CapacityConfig)
    assert config.tps == 12.0
    assert config.chats_simultaneos == 2
    assert config.trafico_diario == 200
    assert config.ollama_num_parallel == calcular_esperado(8.0)


def calcular_esperado(ram: float) -> int:
    return max(1, min(8, int(ram / 2.5)))
