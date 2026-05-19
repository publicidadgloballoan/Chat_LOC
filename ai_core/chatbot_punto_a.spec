# chatbot_punto_a.spec — PyInstaller spec para generar ChatBot_Punto_A-Installer.exe
#
# Uso: python scripts/build.py
#   o directamente: pyinstaller chatbot_punto_a.spec
#
# Produce: dist/ChatBot_Punto_A-Installer.exe (~40-50 MB)
# - Incluye: Python runtime, todas las deps, NSSM, workflow JSON, assets
# - NO incluye: Ollama, Node.js, n8n, Evolution API, modelo LLM (se descargan en install)

import sys
from pathlib import Path

block_cipher = None

# Raíz del proyecto
ROOT = Path(SPEC).parent  # noqa: F821 — SPEC es variable de PyInstaller


a = Analysis(
    [str(ROOT / 'main.py')],
    pathex=[str(ROOT)],
    binaries=[],
    datas=[
        # Archivos bundled en el .exe
        (str(ROOT / 'config' / 'docker-compose.yml'),  'config'),
        (str(ROOT / 'config' / 'workflow_chatbot.json'), 'config'),
        (str(ROOT / 'config' / 'init_db.sql'),          'config'),
        (str(ROOT / 'whatsapp_service'),                'whatsapp_service'),
        (str(ROOT / 'configurador'),                    'configurador'),
        (str(ROOT / 'assets' / 'logo.png'),              'assets'),
        (str(ROOT / 'assets' / 'logo2.jpg'),             'assets'),
        (str(ROOT / 'assets' / 'logo.ico'),              'assets'),
        # Archivos de configuración de textos
        (str(ROOT / 'textos.py'),                        '.'),
        (str(ROOT / '.env.ejemplo'),                     '.'),
        (str(ROOT / 'CONFIGURACION_TEXTOS.md'),         '.'),
        # CustomTkinter requiere sus assets temáticos
        (
            r'C:\Users\Administrador\AppData\Roaming\Python\Python314\site-packages\customtkinter',
            'customtkinter'
        ),
    ],
    hiddenimports=[
        # psutil y GPUtil
        'psutil',
        'psutil._pswindows',
        'GPUtil',
        # GUI / Tkinter
        'customtkinter',
        '_tkinter',
        'PIL._tkinter_finder',
        'PIL.Image',
        'PIL.ImageTk',
        # FastAPI / uvicorn
        'fastapi',
        'uvicorn',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.asyncio',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.h11_impl',
        'anyio._backends._asyncio',
        'starlette',
        'starlette.routing',
        # pydantic
        'pydantic',
        'pydantic.deprecated.class_validators',
        # requests / httpx
        'requests',
        'httpx',
        'charset_normalizer',
        # dotenv
        'dotenv',
        # winreg (Ollama env vars)
        'winreg',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',
        'numpy',
        'pandas',
        'scipy',
        'tkinter.test',
        'unittest',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)  # noqa: F821

exe = EXE(  # noqa: F821
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='ChatBot_Punto_A-Installer',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,           # UPX desactivado: evita falsos positivos de antivirus
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,       # Sin ventana de consola (modo windowed)
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=str(ROOT / 'assets' / 'logo.ico'),
    uac_admin=True,      # Solicita privilegios de administrador (para instalar servicios)
    manifest=None,
    version=None,
    onefile=True,
)
