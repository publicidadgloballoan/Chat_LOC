import os
import sys
import json
import shutil
import sqlite3
import openpyxl

sys.stdout.reconfigure(encoding='utf-8')

print("=== INICIANDO CONFIGURACIÓN DE ARCHIVOS Y KNOWLEDGE IABOX ===")

company_id = 3
company_name = "IABOX"
email = "iaboxeeuu@gmail.com"
tax_id = "30718889991"

# 1. Crear carpetas de configuración
comp3_dir = rf"c:\SaaSIA\ai_core\config\company_{company_id}"
comp3_media = os.path.join(comp3_dir, "media")
comp3_knowledge_gen = os.path.join(comp3_dir, "knowledge", "general")
comp3_knowledge_dir = os.path.join(comp3_dir, "knowledge")
comp3_configs = os.path.join(comp3_dir, "configs")
flows3_dir = rf"c:\SaaSIA\ai_core\flows\{company_id}"

os.makedirs(comp3_media, exist_ok=True)
os.makedirs(comp3_knowledge_gen, exist_ok=True)
os.makedirs(comp3_knowledge_dir, exist_ok=True)
os.makedirs(comp3_configs, exist_ok=True)
os.makedirs(flows3_dir, exist_ok=True)

# 2. Copiar todos los assets de IABOX a la librería de medios
src_iabox = r"c:\SaaSIA\IABOX"
manifest_items = []

for root, dirs, files in os.walk(src_iabox):
    for f in files:
        if f.endswith(('.py', '.js', '.xlsx', '.txt', '.md')): continue
        src_f = os.path.join(root, f)
        dst_f = os.path.join(comp3_media, f)
        shutil.copy2(src_f, dst_f)
        
        item_type = "Imágenes"
        if "logo" in f.lower() or "isotipo" in f.lower(): item_type = "Logos"
        elif "promo" in f.lower(): item_type = "Promociones"
        elif "sticker" in f.lower(): item_type = "Stickers"
        elif "favorito" in f.lower(): item_type = "Iconos"
        elif "post" in f.lower() or "ejemplo" in f.lower(): item_type = "Plantillas Social"
        
        manifest_items.append({
            "name": f,
            "type": item_type,
            "context": f"Asset visual IA Box - {f.replace('-', ' ').replace('.png', '').replace('.jpg', '').replace('.webp', '').replace('.svg', '')}",
            "summary": f"Archivo de imagen oficial de IA Box: {f}"
        })

print(f"✓ Copiados {len(manifest_items)} archivos de medios a {comp3_media}")

# Guardar manifest.json
manifest_path = os.path.join(comp3_media, "manifest.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest_items, f, indent=4, ensure_ascii=False)
print("✓ manifest.json generado")

# 3. Parsear catálogo de precios desde Excel y armar pricing.json estructurado
wb = openpyxl.load_workbook(r"c:\SaaSIA\IABOX\ia-box_precios_2026_julio.xlsx", data_only=True)
sheet = wb['Hoja 1']
pricing_data = {
    "data": {
        "items": [],
        "currency": "ARS",
        "iva_rate": 0.21,
        "location": "Estados Unidos 2339, CABA",
        "payment_methods": ["Transferencia Bancaria", "MercadoPago", "Efectivo", "Factura A y B"]
    }
}

for r in range(2, 20):
    row_vals = [sheet.cell(r, c).value for c in range(1, 9)]
    if any(row_vals):
        n_box, sector, medidas, sup, neto, iva, oferta_3m, neto_m2 = row_vals
        if not n_box: continue
        pricing_data["data"]["items"].append({
            "name": str(sector or n_box).strip(),
            "code": str(n_box).strip(),
            "sector": str(sector or '').strip(),
            "measures": str(medidas or '').strip(),
            "surface_m2": sup if isinstance(sup, (int, float)) else str(sup or ''),
            "price": int(neto) if isinstance(neto, (int, float)) else str(neto),
            "price_net": int(neto) if isinstance(neto, (int, float)) else str(neto),
            "iva_amount": int(iva) if isinstance(iva, (int, float)) else str(iva),
            "price_promo_3m": int(oferta_3m) if isinstance(oferta_3m, (int, float)) else str(oferta_3m),
            "price_per_m2": int(neto_m2) if isinstance(neto_m2, (int, float)) else str(neto_m2)
        })

pricing_json_path = os.path.join(comp3_configs, "pricing.json")
with open(pricing_json_path, "w", encoding="utf-8") as f:
    json.dump(pricing_data, f, indent=4, ensure_ascii=False)
print(f"✓ pricing.json generado ({len(pricing_data['data']['items'])} items)")

# 4. Redactar Base de Conocimiento Completa en Markdown (.md)
md_content = """# BASE DE CONOCIMIENTO OFICIAL - IA BOX
**Boxes, Bauleras y Espacios de Guardado Inteligentes**

---

## 1. INFORMACIÓN INSTITUCIONAL
- **Empresa**: IA Box
- **Concepto**: Boxes, bauleras y espacios de guardado inteligentes, con acceso 24/7, monitoreo constante y soluciones integradas de oficina virtual.
- **Ubicación del Predio**: Estados Unidos 2339, Ciudad Autónoma de Buenos Aires (CABA), Argentina.
- **Canales Oficiales**:
  - **WhatsApp / Teléfono**: +54 9 11 2401-3981
  - **Email de Contacto**: iaboxeeuu@gmail.com
  - **Sitio Web Principal**: https://iabox.ar/
  - **Página de Oficina Virtual**: https://iabox.ar/oficinavirtual
  - **Instagram Oficial**: https://www.instagram.com/iaboxestadosunidos/

---

## 2. CARACTERÍSTICAS Y BENEFICIOS DEL SERVICIO
1. **Acceso Total 24/7**: Ingreso flexible todos los días a cualquier hora mediante portón automatizado y sistema de acceso seguro.
2. **Seguridad Integral**:
   - Cámaras de seguridad y circuito cerrado CCTV en todo el predio.
   - Iluminación inteligente y sensores de presencia.
   - Sistema de alarma y monitoreo permanente.
3. **Ubicación Estratégica**: Situado en pleno CABA (Estados Unidos 2339), facilitando el acceso rápido desde autopistas y avenidas principales.
4. **Variedad de Tamaños y Usos**:
   - Guardado chico (bicicletas, cajas, valijas, documentación, ropa de temporada).
   - Boxes estándar y plus (mudanzas, muebles, electrodomésticos, mercadería).
   - Espacios profesionales (depósitos paletizables para racks y pallets, combos oficina + box).

---

## 3. CATÁLOGO DE PRODUCTOS, MEDIDAS Y PRECIOS OFICIALES

### A. Guardado Chico & Bauleras
- **Bici-Box**: Anclaje mural en pasillo · Guardado vertical. Ideal para bicicleta, casco y cadena.
- **Baulera Mini** (Pasillo · 1,5 m²):
  - *Medidas*: Formato pasillo compacto (1,5 m²).
  - *Precio Neto (+ IVA)*: $78.900 ARS.
  - *IVA (21%)*: $13.650 ARS.
  - *Precio Oferta Promoción (3 meses)*: $60.692 ARS.
  - *Ideal para*: Archivos, documentación contable, cajas chicas y objetos personales.
- **Baulera Mediana** (Pasillo · 3,0 m²):
  - *Medidas*: Formato pasillo mediano (3,0 m²).
  - *Precio Neto (+ IVA)*: $144.000 ARS.
  - *IVA (21%)*: $23.100 ARS.
  - *Precio Oferta Promoción (3 meses)*: $110.769 ARS.
  - *Ideal para*: Valijas, textiles, ropa de temporada, cajas medianas y archivo.

---

### B. Boxes de Guardado
- **Box 2 y Box 3 - Box Estándar** (4,00 × 3,00 m · 12,0 m²):
  - *Superficie*: 12 m².
  - *Precio Neto (+ IVA)*: $650.000 ARS.
  - *IVA (21%)*: $88.200 ARS.
  - *Precio Oferta Promoción (3 meses)*: $500.000 ARS.
  - *Ideal para*: Departamentos de 1 a 2 ambientes, muebles, electrodomésticos y cajas.
- **Box 4 - Box Estándar Plus** (4,00 × 3,50 m · 14,0 m²):
  - *Superficie*: 14 m².
  - *Precio Neto (+ IVA)*: $720.000 ARS.
  - *IVA (21%)*: $98.700 ARS.
  - *Precio Oferta Promoción (3 meses)*: $553.846 ARS.
- **Box 7 y Box 8 - Box Intermedio** (4,00 × 4,00 m · 16,0 m²):
  - *Superficie*: 16 m².
  - *Precio Neto (+ IVA)*: $790.000 ARS.
  - *IVA (21%)*: $109.200 ARS.
  - *Precio Oferta Promoción (3 meses)*: $607.692 ARS.
- **Box 5 - Box Plus** (4,00 × 6,00 m · 24,0 m²):
  - *Superficie*: 24 m².
  - *Precio Neto (+ IVA)*: $1.200.000 ARS.
  - *IVA (21%)*: $153.300 ARS.
  - *Precio Oferta Promoción (3 meses)*: $923.076 ARS.
- **Box 6 - Box Grande / Habitación** (4,00 × 7,00 m · 28,0 m²):
  - *Superficie*: 28 m².
  - *Precio Neto (+ IVA)*: $1.350.000 ARS.
  - *IVA (21%)*: $176.400 ARS.
  - *Precio Oferta Promoción (3 meses)*: $1.038.461 ARS.

---

### C. Espacios Profesionales y Depósitos
- **Box 1 - Depósito Frontal Paletizable** (4,00 × 10,00 m · 40,0 m²):
  - *Superficie*: 40 m².
  - *Precio Neto (+ IVA)*: $1.850.000 ARS.
  - *IVA (21%)*: $241.500 ARS.
  - *Precio Oferta Promoción (3 meses)*: $1.423.076 ARS.
  - *Preparación*: Preparado para racks, pallets y logística de mayor exigencia.
- **Box 9 - Oficina + Box Combo Premium** (6,00 × 8,00 m · 48,0 m²):
  - *Superficie*: 48 m².
  - *Precio Neto (+ IVA)*: $2.100.000 ARS.
  - *IVA (21%)*: $346.500 ARS.
  - *Precio Oferta Promoción (3 meses)*: $1.615.384 ARS.
  - *Uso*: Puesto de trabajo + stock de guardado combinado con presencia corporativa.

---

### D. Oficina Virtual (Domicilio Fiscal y Comercial)
- **Plan Oficina Virtual E1**:
  - *Precio Neto (+ IVA)*: $99.000 ARS / mes.
  - *IVA (21%)*: $21.000 ARS.
  - *Servicios incluidos*:
    1. **Domicilio Fiscal Legal**: Habilitación para registro ante AFIP/ARCA, bancos, personería jurídica y organismos oficiales.
    2. **Domicilio Comercial**: Imagen y presencia profesional en CABA (Estados Unidos 2339).
    3. **Recepción y Aviso de Correspondencia**: Notificación instantánea vía WhatsApp/Email al recibir cartas, encomiendas y notificaciones.
    4. **Seguimiento Digital**: Consultas y trámites gestionados 100% online.

---

## 4. PREGUNTAS FRECUENTES (FAQS) Y CONDICIONES DE CONTRATACIÓN

1. **¿Tengo que saber exactamente qué tamaño necesito?**
   - *No*. Te asesoramos según lo que necesites guardar (cantidad de ambientes, muebles, cajas, vehículos o pallets) para orientarte a la opción más económica y conveniente.

2. **¿Qué se puede guardar en un box?**
   - Objetos personales, cajas, ropa, valijas, muebles, herramientas, archivo documental, mercadería, insumos y guardado de temporada.
   - *Prohibido*: Sustancias inflamables, peligrosas, seres vivos o artículos ilegales.

3. **¿Cómo es el acceso al predio?**
   - El acceso es 24 horas al día, 7 días a la semana (24/7). Se ingresa con credencial/código personal y portón automático.

4. **¿Cuáles son los requisitos de ingreso y contratación?**
   - DNI o CUIT/CUIL del titular o empresa.
   - Constancia de inscripción (si es persona jurídica o monotributista).
   - Abono del primer mes de alquiler y firma digital o presencial del contrato de locación temporal.

5. **¿Hacen factura A y B?**
   - *Sí*. Emitimos Factura A para empresas y responsables inscriptos, y Factura B para consumidores finales o monotributistas.

---

## 5. GUÍA DE ATENCIÓN PARA EL ASESOR IA
- Saluda siempre con amabilidad, profesionalismo y rapidez.
- Identifica si el cliente busca **Guardado de Objetos/Mudanzas**, **Espacio de Trabajo/Depósito Comercial**, o **Oficina Virtual (Domicilio Fiscal)**.
- Cuando pregunten por precios, proporciona los valores claros en pesos argentinos (ARS) e informa sobre el **30% de descuento en la promo de 3 meses**.
- Invita al cliente a coordinar una visita a **Estados Unidos 2339, CABA** o a reservar su box directamente por WhatsApp.
"""

# Guardar en c:\SaaSIA\IABOX\BASE_DE_CONOCIMIENTO_IABOX.md
doc_md_path = os.path.join(src_iabox, "BASE_DE_CONOCIMIENTO_IABOX.md")
with open(doc_md_path, "w", encoding="utf-8") as f:
    f.write(md_content)
print(f"✓ Guardado: {doc_md_path}")

# Guardar en company_3
with open(os.path.join(comp3_dir, "consolidated_knowledge.md"), "w", encoding="utf-8") as f:
    f.write(md_content)

with open(os.path.join(comp3_dir, "knowledge.txt"), "w", encoding="utf-8") as f:
    f.write(md_content)

with open(os.path.join(comp3_knowledge_dir, "knowledge.txt"), "w", encoding="utf-8") as f:
    f.write(md_content)

with open(os.path.join(comp3_knowledge_gen, "BASE_DE_CONOCIMIENTO_IABOX.md"), "w", encoding="utf-8") as f:
    f.write(md_content)

print(f"✓ Base de conocimiento propagada a company_3")

# 5. Generar flujo RAG default para IABOX en flows/3/default.flu
flow_iabox = {
  "name": "default",
  "nodes": [
    {
      "id": "node_trigger",
      "type": "webhook",
      "name": "Trigger Webhook",
      "description": "Punto de inicio WA/IG/TG",
      "position": {"x": 50, "y": 200}
    },
    {
      "id": "node_brain",
      "type": "rag",
      "name": "Asesor IA IA Box",
      "description": "Atención comercial, Boxes y Oficina Virtual",
      "position": {"x": 300, "y": 200}
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "node_trigger",
      "target": "node_brain"
    }
  ]
}

flow_path = os.path.join(flows3_dir, "default.flu")
with open(flow_path, "w", encoding="utf-8") as f:
    json.dump(flow_iabox, f, indent=2, ensure_ascii=False)
print(f"✓ Flujo RAG guardado en: {flow_path}")

# 6. Actualizar debug_mode.json para incluir números de prueba
debug_data = {
    "enabled": True,
    "phones": [
        "1136822400", "5491136822400", "+5491136822400", "541136822400",
        "1133162873", "5491133162873", "+5491133162873", "541133162873",
        "1124013981", "5491124013981", "+5491124013981", "541124013981"
    ]
}

for dp in [
    os.path.join(comp3_dir, "debug_mode.json"),
    os.path.join(comp3_configs, "debug_mode.json"),
    r"c:\SaaSIA\ai_core\config\debug_mode.json"
]:
    with open(dp, "w", encoding="utf-8") as f:
        json.dump(debug_data, f, indent=4)

print("✓ debug_mode.json actualizado con lista blanca de teléfonos")
print("=== CONFIGURACIÓN DE IABOX COMPLETADA CON ÉXITO ===")
