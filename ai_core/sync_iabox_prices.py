import os
import sys
import re
import csv
import json
import io
import logging
import requests

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

SHEET_ID = "10Fa9i7HEM04gxANVwXpxNsTNaw3EJ8cK"
GID = "1020925180"
EXPORT_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}"
PRICING_FILE = r"c:\SaaSIA\ai_core\config\company_3\configs\pricing.json"

def sync_prices():
    logging.info(f"Intentando descargar planilla de Google Sheets: {EXPORT_URL}")
    try:
        res = requests.get(EXPORT_URL, timeout=15)
        if res.status_code == 401 or "html" in res.headers.get("Content-Type", "").lower():
            logging.error("Acceso denegado (HTTP 401). La planilla no está pública.")
            return False, "401_UNAUTHORIZED"
        
        res.raise_for_status()
        
        # Read CSV
        csv_text = res.content.decode('utf-8', errors='ignore')
        reader = csv.reader(io.StringIO(csv_text))
        rows = list(reader)
        
        if not rows:
            logging.error("Planilla vacía.")
            return False, "EMPTY_SHEET"
        
        items = []
        for row in rows[1:]:
            if not row or not any(row):
                continue
            box_name = row[0].strip() if len(row) > 0 else ''
            sector = row[1].strip() if len(row) > 1 else ''
            measures = row[2].strip() if len(row) > 2 else ''
            surface = row[3].strip() if len(row) > 3 else ''
            price_usd = row[4].strip() if len(row) > 4 else ''
            price_net = row[5].strip() if len(row) > 5 else ''
            iva = row[6].strip() if len(row) > 6 else ''
            price_promo = row[7].strip() if len(row) > 7 else ''
            price_per_m2 = row[8].strip() if len(row) > 8 else ''
            usd_m2 = row[9].strip() if len(row) > 9 else ''
            
            full_name = f"{box_name} - {sector}" if sector and box_name.lower() not in sector.lower() else box_name
            
            items.append({
                "box": box_name,
                "name": full_name,
                "sector": sector,
                "measures": measures,
                "surface": f"{surface} m²" if surface and surface not in ["X", "-"] else surface,
                "price_usd": price_usd,
                "price_net": price_net,
                "price": price_net if price_net and price_net not in ["Uso Interno", "-"] else price_usd,
                "iva": iva,
                "price_promo_3m": price_promo,
                "price_per_m2": price_per_m2,
                "usd_m2": usd_m2
            })
            
        logging.info(f"Procesados {len(items)} ítems de precios desde la planilla de Google Sheets.")
        
        pricing_data = {
            "type": "pricing",
            "data": {
                "currency": "ARS / USD",
                "last_updated": requests.get('http://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires').json().get('datetime', '') if False else None,
                "sheet_source": EXPORT_URL,
                "items": items
            }
        }
        
        os.makedirs(os.path.dirname(PRICING_FILE), exist_ok=True)
        with open(PRICING_FILE, "w", encoding="utf-8") as f:
            json.dump(pricing_data, f, ensure_ascii=False, indent=2)
            
        logging.info(f"Archivo {PRICING_FILE} actualizado exitosamente!")
        return True, items
        
    except Exception as e:
        logging.error(f"Error al sincronizar planilla: {e}")
        return False, str(e)

if __name__ == "__main__":
    success, result = sync_prices()
    if not success:
        sys.exit(1)
