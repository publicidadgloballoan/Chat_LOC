import json
f=open(r'C:\SaaSIA\ai_core\config\ventas_nico_meta\config_a1.json', 'rb')
data=json.loads(f.read().decode('utf-8'))
def fix_text(text):
    if not isinstance(text, str): return text
    try:
        return text.encode('cp1252').decode('utf-8')
    except:
        return text
for k, v in data.items():
    if isinstance(v, str): data[k] = fix_text(v)
open(r'C:\SaaSIA\ai_core\config\ventas_nico_meta\config_a1.json', 'w', encoding='utf-8').write(json.dumps(data, indent=4, ensure_ascii=False))

