import os

def pdf_to_text(pdf_path):
    try:
        import PyPDF2
        text = ""
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    except ImportError:
        return "[Aviso: No se pudo leer el PDF porque PyPDF2 no está instalado, pero el documento es: " + os.path.basename(pdf_path) + "]"
    except Exception as e:
        return f"[Error leyendo PDF: {e}]"

# Archivos origen
pdf_comercial = r"c:\RouthLocal\punto_a\assets\Presentación - Plan Comercial final.pdf"
pdf_marca = r"c:\RouthLocal\punto_a\assets\Chats\Colaboratium Manual de Marca.pdf"

# Extrayendo conocimiento
print("1. Extrayendo conocimiento de PDFs...")
con_comercial = pdf_to_text(pdf_comercial)
con_marca = pdf_to_text(pdf_marca)

knowledge_content = f"""
===== IDENTIDAD VISUAL Y MARCA (COLABORATIUM) =====
{con_marca}

===== PLAN COMERCIAL Y OFERTA =====
{con_comercial}
"""

# Destinos
rutas = [
    r"c:\RouthLocal\punto_a\config\colab_global_sa\knowledge.txt",
    r"c:\RouthLocal\punto_a\config\colab_pro_asesores\knowledge.txt"
]

print("2. Inyectando materia gris en las inteligencias...")
for path in rutas:
    with open(path, "w", encoding="utf-8") as f:
        f.write(knowledge_content)
    print(f" [+] Cerebro actualizado en: {path}")

print("¡IA lista y educada!")
