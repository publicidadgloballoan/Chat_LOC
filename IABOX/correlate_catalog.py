import re
import json
import sys
import openpyxl

sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\SaaSIA\IABOX\web_bundle.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Extraer todos los objetos de producto
# Buscar objetos con {key:"...", label:"...", category:"...", measures:"...", surface:"...", image:"...", caption:"...", specs:[...], reading:"..."}
pattern = r'\{key:"([^"]+)",label:"([^"]+)",category:"([^"]+)",measures:"([^"]+)",surface:"([^"]+)",image:"([^"]+)",caption:"([^"]+)",specs:(\[[^\]]+\]),reading:"([^"]+)"\}'
products_web = []
for m in re.finditer(pattern, js):
    key, label, cat, meas, surf, img, caption, specs_raw, reading = m.groups()
    specs = json.loads(specs_raw.replace("'", '"'))
    products_web.append({
        "key": key,
        "label": label,
        "category": cat,
        "measures": meas,
        "surface": surf,
        "image": img,
        "caption": caption,
        "specs": specs,
        "reading": reading
    })

print(f"Total productos en web: {len(products_web)}")
for p in products_web:
    print(f"- {p['label']} ({p['key']}): {p['category']} | {p['measures']} | {p['surface']}")

# Cargar Excel de Precios
wb = openpyxl.load_workbook(r'c:\SaaSIA\IABOX\ia-box_precios_2026_julio.xlsx', data_only=True)
sheet = wb['Hoja 1']
excel_rows = []
for r in range(2, 20):
    row_vals = [sheet.cell(r, c).value for c in range(1, 9)]
    if any(row_vals):
        n_box, sector, medidas, sup, neto, iva, oferta_3m, neto_m2 = row_vals
        excel_rows.append({
            "n_box": str(n_box or '').strip(),
            "sector": str(sector or '').strip(),
            "medidas": str(medidas or '').strip(),
            "superficie": sup,
            "precio_neto": neto,
            "iva": iva,
            "precio_oferta_3m": oferta_3m,
            "precio_neto_m2": neto_m2
        })

print(f"\nTotal filas de precios en Excel: {len(excel_rows)}")
for e in excel_rows:
    print(f"- {e['n_box']} ({e['sector']}): Medidas {e['medidas']}, Sup {e['superficie']}m2 -> Neto: ${e['precio_neto']}, Oferta 3m: ${e['precio_oferta_3m']}")
