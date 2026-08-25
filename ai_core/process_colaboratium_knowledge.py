import os
import sys
import shutil
import fitz # PyMuPDF
import json

sys.stdout.reconfigure(encoding='utf-8')

src_dir = r"c:\SaaSIA\colaboratium"
comp2_dir = r"c:\SaaSIA\ai_core\config\company_2"
comp2_media = os.path.join(comp2_dir, "media")
comp2_knowledge_gen = os.path.join(comp2_dir, "knowledge", "general")
comp2_knowledge_dir = os.path.join(comp2_dir, "knowledge")

os.makedirs(comp2_media, exist_ok=True)
os.makedirs(comp2_knowledge_gen, exist_ok=True)

pdf_files = [f for f in os.listdir(src_dir) if f.lower().endswith('.pdf')]
print(f"Encontrados {len(pdf_files)} PDFs en {src_dir}:")

consolidated_text = "# BASE DE CONOCIMIENTO - COLABORATIUM\n\n"
manifest = []

for pdf_name in pdf_files:
    src_path = os.path.join(src_dir, pdf_name)
    dst_media_path = os.path.join(comp2_media, pdf_name)
    dst_gen_path = os.path.join(comp2_knowledge_gen, pdf_name)
    
    # Copiar a media y a knowledge/general
    shutil.copy2(src_path, dst_media_path)
    shutil.copy2(src_path, dst_gen_path)
    print(f"✓ Copiado: {pdf_name}")
    
    # Extraer texto con PyMuPDF
    doc = fitz.open(src_path)
    extracted_text = ""
    for page_num in range(len(doc)):
        extracted_text += f"\n--- Página {page_num+1} ---\n" + doc[page_num].get_text()
    doc.close()
    
    char_count = len(extracted_text)
    preview = extracted_text.strip()[:250].replace('\n', ' ')
    print(f"  Texto extraído: {char_count} caracteres. Preview: {preview[:80]}...")
    
    summary_txt = f"Documento oficial de Colaboratium: {pdf_name}. Contiene información institucional, procesos fintech, normativas KYC y presentaciones comerciales."
    
    manifest.append({
        "name": pdf_name,
        "type": "Documentos",
        "context": f"Base de conocimiento de Colaboratium - {pdf_name}",
        "summary": summary_txt
    })
    
    consolidated_text += f"\n\n==================================================\n"
    consolidated_text += f"DOCUMENTO: {pdf_name}\n"
    consolidated_text += f"==================================================\n"
    consolidated_text += extracted_text + "\n"

# Guardar manifest.json
manifest_path = os.path.join(comp2_media, "manifest.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=4, ensure_ascii=False)
print(f"✓ Guardado: {manifest_path}")

# Guardar consolidated_knowledge.md y knowledge.txt
cons_path = os.path.join(comp2_dir, "consolidated_knowledge.md")
with open(cons_path, "w", encoding="utf-8") as f:
    f.write(consolidated_text)
print(f"✓ Guardado: {cons_path} ({len(consolidated_text)} caracteres)")

know_txt_path = os.path.join(comp2_dir, "knowledge.txt")
with open(know_txt_path, "w", encoding="utf-8") as f:
    f.write(consolidated_text)
print(f"✓ Guardado: {know_txt_path}")

know_txt_path2 = os.path.join(comp2_knowledge_dir, "knowledge.txt")
with open(know_txt_path2, "w", encoding="utf-8") as f:
    f.write(consolidated_text)
print(f"✓ Guardado: {know_txt_path2}")
