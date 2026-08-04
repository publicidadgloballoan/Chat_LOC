import json
import codecs
f=open(r'C:\SaaSIA\ai_core\flows\1\AGENTE_VENTA_PERROS.flu', 'rb')
data=json.loads(f.read().decode('utf-8'))
def fix_text(text):
    if not isinstance(text, str): return text
    try:
        return text.encode('cp1252').decode('utf-8')
    except:
        return text
for n in data['nodes']:
    if 'data' in n and 'text' in n['data']:
        n['data']['text'] = fix_text(n['data']['text'])
open(r'C:\SaaSIA\ai_core\flows\1\AGENTE_VENTA_PERROS.flu', 'w', encoding='utf-8').write(json.dumps(data, indent=2, ensure_ascii=False))

