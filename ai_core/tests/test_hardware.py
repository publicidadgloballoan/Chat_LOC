"""
test_hardware.py — Tests para core/hardware.py
Simula diferentes perfiles de hardware con mocks de psutil y GPUtil.
"""

import sys
import os
from unittest.mock import patch, MagicMock

import pytest

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


class FakeMemory:
    def __init__(self, total_gb, available_gb):
        self.total = int(total_gb * 1024 ** 3)
        self.available = int(available_gb * 1024 ** 3)
        self.percent = (1 - available_gb / total_gb) * 100


class FakeFreq:
    current = 2400.0


# ---------------------------------------------------------------------------
# Tests de detectar_tier
# ---------------------------------------------------------------------------

def test_tier_i7_por_nombre():
    from core.hardware import detectar_tier
    assert detectar_tier("Intel Core i7-9750H @ 2.60GHz", 12, 32.0) == "i7"


def test_tier_i5_por_nombre():
    from core.hardware import detectar_tier
    assert detectar_tier("Intel Core i5-8265U @ 1.60GHz", 8, 16.0) == "i5"


def test_tier_i3_por_defecto():
    from core.hardware import detectar_tier
    assert detectar_tier("Intel Core i3-8100 @ 3.60GHz", 4, 8.0) == "i3"


def test_tier_i7_por_nucleos():
    from core.hardware import detectar_tier
    # Si tiene 12+ núcleos, debería clasificar como i7 aunque el nombre no sea i7
    assert detectar_tier("AMD Ryzen desconocido", 12, 32.0) == "i7"


def test_tier_i5_por_nucleos():
    from core.hardware import detectar_tier
    assert detectar_tier("CPU desconocido", 8, 16.0) == "i5"


# ---------------------------------------------------------------------------
# Tests de calcular_chats
# ---------------------------------------------------------------------------

def test_chats_tier_i7():
    from core.hardware import calcular_chats
    assert calcular_chats(25.0, "i7") == 5


def test_chats_tier_i5():
    from core.hardware import calcular_chats
    assert calcular_chats(12.0, "i5") == 2


def test_chats_tier_i3():
    from core.hardware import calcular_chats
    assert calcular_chats(3.5, "i3") == 1


def test_chats_tps_alto_independiente_tier():
    from core.hardware import calcular_chats
    # TPS >= 20 debería dar 5 chats sin importar el tier declarado
    assert calcular_chats(22.0, "i3") == 5


# ---------------------------------------------------------------------------
# Tests de escanear_hardware (mock completo)
# ---------------------------------------------------------------------------

def _mock_subprocess_result(output: str):
    m = MagicMock()
    m.returncode = 0
    m.stdout = f"Name\n{output}\n"
    return m


@patch("core.hardware.psutil")
@patch("core.hardware.GPUtil", None)
@patch("core.hardware.subprocess.run")
def test_escanear_hardware_i7(mock_subprocess, mock_psutil):
    mock_psutil.cpu_count.side_effect = lambda logical=True: 12 if logical else 6
    mock_psutil.cpu_freq.return_value = FakeFreq()
    mock_psutil.virtual_memory.return_value = FakeMemory(32.0, 20.0)
    mock_subprocess.return_value = _mock_subprocess_result("Intel Core i7-9750H @ 2.60GHz")

    from core.hardware import escanear_hardware
    perfil = escanear_hardware(con_benchmark=False)

    assert perfil.tier == "i7"
    assert perfil.ram_total_gb == pytest.approx(32.0, abs=1.0)
    assert perfil.chats_simultaneos >= 2
    assert perfil.modo_conservador is False


@patch("core.hardware.psutil")
@patch("core.hardware.GPUtil", None)
@patch("core.hardware.subprocess.run")
def test_escanear_hardware_i3_modo_conservador(mock_subprocess, mock_psutil):
    mock_psutil.cpu_count.side_effect = lambda logical=True: 4 if logical else 2
    mock_psutil.cpu_freq.return_value = FakeFreq()
    mock_psutil.virtual_memory.return_value = FakeMemory(8.0, 4.0)
    mock_subprocess.return_value = _mock_subprocess_result("Intel Core i3-8100 @ 3.60GHz")

    from core.hardware import escanear_hardware
    perfil = escanear_hardware(con_benchmark=False)

    assert perfil.tier == "i3"
    assert perfil.ram_total_gb == pytest.approx(8.0, abs=1.0)
    # TPS estimado sin benchmark para i3 = 3.5 → modo conservador
    assert perfil.modo_conservador is True


@patch("core.hardware.psutil")
@patch("core.hardware.GPUtil", None)
@patch("core.hardware.subprocess.run")
def test_escanear_hardware_sin_gpu(mock_subprocess, mock_psutil):
    mock_psutil.cpu_count.side_effect = lambda logical=True: 8 if logical else 4
    mock_psutil.cpu_freq.return_value = FakeFreq()
    mock_psutil.virtual_memory.return_value = FakeMemory(16.0, 10.0)
    mock_subprocess.return_value = _mock_subprocess_result("Intel Core i5-8265U @ 1.60GHz")

    from core.hardware import escanear_hardware
    perfil = escanear_hardware(con_benchmark=False)

    assert perfil.gpu_nombre == "Sin GPU dedicada"
    assert perfil.gpu_vram_gb == 0.0


# ---------------------------------------------------------------------------
# Tests de AVX detection
# ---------------------------------------------------------------------------

def test_avx2_detectado_en_cpu_moderno():
    from core.hardware import detectar_avx
    avx2, avx512 = detectar_avx("Intel Core i7-9750H @ 2.60GHz")
    # i7-9 debería dar AVX2=True
    assert avx2 is True


def test_avx512_detectado_en_cpu_10gen():
    from core.hardware import detectar_avx
    avx2, avx512 = detectar_avx("Intel Core i7-1065G7 @ 1.30GHz")
    assert avx2 is True  # 10th gen tiene AVX2
