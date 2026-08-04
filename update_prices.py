import pandas as pd
import json
import os

excel_path = r'c:\SaaSIA\ai_core\config\company_1\knowledge\general\precios actuales 21-5.xlsx'
df = pd.read_excel(excel_path)

md_content = """# Catálogo de Razas y Precios Disponibles

Este documento contiene la lista exacta y actualizada de los perros disponibles, sus razas y su precio exacto. Cuando el cliente pregunte "cuánto cuesta", "qué precio tiene", "qué razas tienen" o "listado de razas", SIEMPRE usa esta información como base.

"""

json_data = {
    "type": "pricing",
    "data": {
        "currency": "ARS",
        "breeds": []
    }
}

for index, row in df.iterrows():
    raza = str(row['RAZA']).strip()
    precio = int(row['PRECIO'])
    
    md_content += f"- **{raza}**: ${precio:,} ARS\n".replace(',', '.')
    
    json_data["data"]["breeds"].append({
        "name": raza,
        "price": precio
    })

md_content += """
---
*Nota interna para la IA*: Si el cliente pregunta "¿Cuánto cuesta?", pregúntale de qué raza y sexo está interesado si aún no lo dijo, o dale el precio directo si ya lo mencionó. No digas "No tengo precio exacto".
"""

md_path = r'c:\SaaSIA\ai_core\config\company_1\knowledge\general\razas_y_precios.md'
json_path = r'c:\SaaSIA\ai_core\config\company_1\configs\pricing.json'

with open(md_path, 'w', encoding='utf-8') as f:
    f.write(md_content)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=2)

print("Archivos de precios actualizados correctamente.")
