import fitz
import os

KNOWLEDGE_DIR = r"C:\RouthLocal\Plataforma_SaaS_IA\ai_core\config\colab_pro\knowledge"
OUT_FILE = r"C:\RouthLocal\Plataforma_SaaS_IA\ai_core\config\colab_pro\consolidated_knowledge.md"

def pdf_to_md():
    full_text = "# CONOCIMIENTO CORPORATIVO CONSOLIDADO\n\n"
    for file in os.listdir(KNOWLEDGE_DIR):
        if file.endswith(".pdf"):
            print(f"Procesando {file}...")
            full_text += f"## Archivo: {file}\n\n"
            doc = fitz.open(os.path.join(KNOWLEDGE_DIR, file))
            for page in doc:
                full_text += page.get_text() + "\n"
            doc.close()
            full_text += "\n---\n\n"
    
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write(full_text)
    print(f"OK! Guardado en {OUT_FILE}")

if __name__ == "__main__":
    pdf_to_md()
