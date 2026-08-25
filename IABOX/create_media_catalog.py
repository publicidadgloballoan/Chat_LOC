import json
import os

comp3_configs = r"c:\SaaSIA\ai_core\config\company_3\configs"
os.makedirs(comp3_configs, exist_ok=True)

media_cat = {
    "data": {
        "Oficina Virtual": {
            "media": [
                "promo-domicilio-fiscal-recepcion-correspondencia-precios.png",
                "oficina-virtual.png"
            ]
        },
        "Domicilio Fiscal": {
            "media": [
                "promo-domicilio-fiscal-recepcion-correspondencia-precios.png"
            ]
        },
        "Bici-Box": {
            "media": ["bici-box.png"]
        },
        "Baulera Mini": {
            "media": ["baulera-mini.png"]
        },
        "Baulera Mediana": {
            "media": ["baulera-mediana.png"]
        },
        "Box Estándar": {
            "media": ["box-estandar.png"]
        },
        "Box Estándar Plus": {
            "media": ["box-estandar-plus.png"]
        },
        "Box Intermedio": {
            "media": ["box-intermedio.png"]
        },
        "Box Plus": {
            "media": ["box-plus.png"]
        },
        "Box Grande": {
            "media": ["box-grande.png"]
        },
        "Depósito Paletizable": {
            "media": ["deposito-paletizable.png"]
        },
        "Oficina + Box Combo Premium": {
            "media": ["oficina-box-combo-premium.png"]
        }
    }
}

p = os.path.join(comp3_configs, "media_catalog.json")
with open(p, "w", encoding="utf-8") as f:
    json.dump(media_cat, f, indent=4, ensure_ascii=False)

print(f"✓ media_catalog.json creado en: {p}")
