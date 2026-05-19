"""
build.py — Genera ChatBot_Punto_A-Installer.exe con PyInstaller.

Uso: python scripts/build.py
     python scripts/build.py --clean   (borra build/ y dist/ antes)

Pre-requisitos:
    pip install pyinstaller==6.12.0
    pip install -r requirements.txt

Salida: dist/ChatBot_Punto_A-Installer.exe (~40-50 MB)
"""

import os
import shutil
import subprocess
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC_FILE = os.path.join(PROJECT_ROOT, "chatbot_chatbot_punto_a.spec")
BUILD_DIR = os.path.join(PROJECT_ROOT, "build")
DIST_DIR = os.path.join(PROJECT_ROOT, "dist")


def check_assets():
    """Verifica que los assets necesarios existan antes de buildear."""
    assets = [
        "assets/nssm.exe",
        "assets/logo.ico",
        "assets/logo.png",
    ]
    faltantes = []
    for asset in assets:
        if not os.path.exists(os.path.join(PROJECT_ROOT, asset)):
            faltantes.append(asset)

    if faltantes:
        print("ADVERTENCIA: Los siguientes assets no existen:")
        for f in faltantes:
            print(f"  - {f}")
        print()
        print("Podés descargar NSSM desde: https://nssm.cc/release/nssm-2.24.zip")
        print("Y colocar logo.ico / logo.png en la carpeta assets/")
        print()
        respuesta = input("Continuar sin los assets faltantes? (s/N): ").strip().lower()
        if respuesta != "s":
            sys.exit(1)


def main():
    os.chdir(PROJECT_ROOT)

    limpio = "--clean" in sys.argv
    if limpio:
        for d in [BUILD_DIR, DIST_DIR]:
            if os.path.exists(d):
                shutil.rmtree(d)
                print(f"Borrado: {d}")

    check_assets()

    print("Construyendo ChatBot_Punto_A-Installer.exe...")
    print(f"Spec: {SPEC_FILE}")
    print()

    result = subprocess.run(
        [sys.executable, "-m", "PyInstaller", SPEC_FILE, "--noconfirm"],
        cwd=PROJECT_ROOT,
    )

    if result.returncode == 0:
        exe_path = os.path.join(DIST_DIR, "ChatBot_Punto_A-Installer.exe")
        if os.path.exists(exe_path):
            size_mb = os.path.getsize(exe_path) / 1024 / 1024
            print()
            print(f"✅ Build exitoso: {exe_path}")
            print(f"   Tamaño: {size_mb:.1f} MB")
        else:
            print("✅ Build completado.")
    else:
        print(f"❌ Build fallido con código {result.returncode}")
        sys.exit(result.returncode)


if __name__ == "__main__":
    main()
