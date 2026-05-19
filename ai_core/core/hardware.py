"""
hardware.py — Detección de CPU/RAM/GPU y estimación de TPS
"""

import platform
import subprocess
import time
from dataclasses import dataclass, field
from typing import Optional

try:
    import psutil
except ImportError:
    psutil = None

try:
    import GPUtil
except ImportError:
    GPUtil = None


@dataclass
class HardwareProfile:
    cpu_brand: str = ""
    cpu_cores_fisicos: int = 0
    cpu_cores_logicos: int = 0
    cpu_freq_mhz: float = 0.0
    avx2: bool = False
    avx512: bool = False
    ram_total_gb: float = 0.0
    ram_libre_gb: float = 0.0
    gpu_nombre: str = "Sin GPU dedicada"
    gpu_vram_gb: float = 0.0
    tps_estimado: float = 0.0
    chats_simultaneos: int = 1
    tier: str = "i3"  # i3, i5, i7
    modo_conservador: bool = False


def detectar_avx(cpu_brand: str) -> tuple[bool, bool]:
    """Detecta soporte AVX2 y AVX-512 según la marca del CPU."""
    cpu_lower = cpu_brand.lower()
    avx2 = False
    avx512 = False

    try:
        resultado = subprocess.run(
            ["wmic", "cpu", "get", "Caption"],
            capture_output=True, text=True, timeout=5
        )
        output = resultado.stdout.lower()
    except Exception:
        output = cpu_lower

    # AVX2: disponible desde Intel Haswell (4ta gen) en adelante
    for gen in ["4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th",
                "12th", "13th", "14th", "i5-4", "i5-5", "i5-6", "i5-7", "i5-8",
                "i5-9", "i7-4", "i7-5", "i7-6", "i7-7", "i7-8", "i7-9",
                "i7-10", "i7-11", "i7-12", "i7-13", "i7-14"]:
        if gen in output or gen in cpu_lower:
            avx2 = True
            break

    # Heurística simple: si el procesador tiene 8+ núcleos lógicos, asumimos AVX2
    if not avx2 and psutil:
        if psutil.cpu_count(logical=True) >= 8:
            avx2 = True

    # AVX-512: disponible desde Intel Ice Lake (10ma gen) en adelante
    for gen in ["10th", "11th", "12th", "13th", "14th", "i7-10", "i7-11",
                "i7-12", "i7-13", "i7-14", "i9"]:
        if gen in output or gen in cpu_lower:
            avx512 = True
            break

    return avx2, avx512


def benchmark_cpu_tps() -> float:
    """
    Micro-benchmark de CPU para estimar tokens/seg aproximados.
    Simula la carga de inferencia con operaciones matemáticas intensivas.
    """
    import math

    iteraciones = 500_000
    inicio = time.perf_counter()
    acc = 0.0
    for i in range(1, iteraciones + 1):
        acc += math.sqrt(i) * math.log(i)
    duracion = time.perf_counter() - inicio

    # Escalar resultado a TPS estimado
    # Los valores son empíricos basados en benchmarks reales de llama3.2:3b
    # en hardware Intel sin GPU dedicada
    ops_por_seg = iteraciones / duracion

    if ops_por_seg >= 3_000_000:
        return 25.0   # i7 de gama alta
    elif ops_por_seg >= 2_000_000:
        return 15.0   # i7 o i5 moderno
    elif ops_por_seg >= 1_200_000:
        return 10.0   # i5 estándar
    elif ops_por_seg >= 700_000:
        return 5.0    # i3 o i5 antiguo
    else:
        return 3.0    # i3 o hardware muy limitado


def detectar_gpu() -> tuple[str, float]:
    """Detecta GPU dedicada y VRAM disponible."""
    if GPUtil:
        try:
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu = gpus[0]
                return gpu.name, round(gpu.memoryTotal / 1024, 1)
        except Exception:
            pass

    # Fallback: intentar con WMIC en Windows
    try:
        resultado = subprocess.run(
            ["wmic", "path", "win32_VideoController", "get", "Name,AdapterRAM"],
            capture_output=True, text=True, timeout=5
        )
        lineas = [l.strip() for l in resultado.stdout.splitlines() if l.strip() and "Name" not in l]
        for linea in lineas:
            partes = linea.rsplit(None, 1)
            if len(partes) == 2:
                nombre = partes[0].strip()
                try:
                    vram_bytes = int(partes[1])
                    vram_gb = round(vram_bytes / (1024 ** 3), 1)
                    if vram_gb > 0:
                        return nombre, vram_gb
                except ValueError:
                    pass
            elif linea:
                return linea, 0.0
    except Exception:
        pass

    return "Sin GPU dedicada", 0.0


def detectar_tier(cpu_brand: str, cores_logicos: int, ram_total_gb: float) -> str:
    """Determina el tier de hardware: i3, i5 o i7."""
    brand_lower = cpu_brand.lower()

    if "i9" in brand_lower or "i7" in brand_lower or "ryzen 7" in brand_lower or "ryzen 9" in brand_lower:
        return "i7"
    elif "i5" in brand_lower or "ryzen 5" in brand_lower:
        return "i5"
    elif cores_logicos >= 12:
        return "i7"
    elif cores_logicos >= 8:
        return "i5"

    return "i3"


def calcular_chats(tps: float, tier: str) -> int:
    """Calcula cuántos chats simultáneos fluidos puede manejar el hardware."""
    if tier == "i7" or tps >= 20:
        return 5
    elif tier == "i5" or tps >= 10:
        return 2
    else:
        return 1


def escanear_hardware(con_benchmark: bool = True) -> HardwareProfile:
    """
    Escanea el hardware del sistema y retorna un HardwareProfile completo.

    Args:
        con_benchmark: Si True, ejecuta el benchmark de CPU (tarda ~1 seg).
    """
    perfil = HardwareProfile()

    if not psutil:
        raise RuntimeError("La librería 'psutil' no está instalada. Ejecutá: pip install psutil")

    # CPU
    try:
        info = psutil.cpu_freq()
        perfil.cpu_freq_mhz = round(info.current, 0) if info else 0.0
    except Exception:
        perfil.cpu_freq_mhz = 0.0

    perfil.cpu_cores_fisicos = psutil.cpu_count(logical=False) or 1
    perfil.cpu_cores_logicos = psutil.cpu_count(logical=True) or 1

    # Marca del CPU
    try:
        resultado = subprocess.run(
            ["wmic", "cpu", "get", "Name"],
            capture_output=True, text=True, timeout=5
        )
        lineas = [l.strip() for l in resultado.stdout.splitlines() if l.strip() and l.strip() != "Name"]
        perfil.cpu_brand = lineas[0] if lineas else platform.processor()
    except Exception:
        perfil.cpu_brand = platform.processor()

    # AVX
    perfil.avx2, perfil.avx512 = detectar_avx(perfil.cpu_brand)

    # RAM
    mem = psutil.virtual_memory()
    perfil.ram_total_gb = round(mem.total / (1024 ** 3), 1)
    perfil.ram_libre_gb = round(mem.available / (1024 ** 3), 1)

    # GPU
    perfil.gpu_nombre, perfil.gpu_vram_gb = detectar_gpu()

    # Tier
    perfil.tier = detectar_tier(perfil.cpu_brand, perfil.cpu_cores_logicos, perfil.ram_total_gb)

    # TPS
    if con_benchmark:
        perfil.tps_estimado = benchmark_cpu_tps()
        # Si hay GPU NVIDIA o AMD dedicada con VRAM suficiente, subir TPS
        if perfil.gpu_vram_gb >= 6:
            perfil.tps_estimado = min(perfil.tps_estimado * 3, 60.0)
        elif perfil.gpu_vram_gb >= 4:
            perfil.tps_estimado = min(perfil.tps_estimado * 1.8, 40.0)
    else:
        # Estimación sin benchmark basada en tier
        tps_por_tier = {"i3": 3.5, "i5": 12.0, "i7": 22.0}
        perfil.tps_estimado = tps_por_tier[perfil.tier]

    # Chats simultáneos
    perfil.chats_simultaneos = calcular_chats(perfil.tps_estimado, perfil.tier)

    # Modo conservador si TPS < 5
    perfil.modo_conservador = perfil.tps_estimado < 5.0

    return perfil


def resumen_hardware(perfil: HardwareProfile) -> str:
    """Retorna un resumen legible del perfil de hardware."""
    lineas = [
        f"CPU: {perfil.cpu_brand}",
        f"Núcleos: {perfil.cpu_cores_fisicos} físicos / {perfil.cpu_cores_logicos} lógicos",
        f"AVX2: {'Sí' if perfil.avx2 else 'No'} | AVX-512: {'Sí' if perfil.avx512 else 'No'}",
        f"RAM: {perfil.ram_total_gb} GB total / {perfil.ram_libre_gb} GB libre",
        f"GPU: {perfil.gpu_nombre}" + (f" ({perfil.gpu_vram_gb} GB VRAM)" if perfil.gpu_vram_gb > 0 else ""),
        f"TPS estimado: {perfil.tps_estimado:.1f} tokens/seg",
        f"Chats simultáneos: {perfil.chats_simultaneos}",
        f"Modo: {'CONSERVADOR (prioriza A1)' if perfil.modo_conservador else 'NORMAL (A1 + A2 activos)'}",
    ]
    return "\n".join(lineas)


if __name__ == "__main__":
    print("Escaneando hardware...")
    perfil = escanear_hardware()
    print(resumen_hardware(perfil))
