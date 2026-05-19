import json
with open('config/workflow_chatbot.json', encoding='utf-8') as f:
    wf = json.load(f)

conn = wf['connections']
router_conn = conn.get('Router A1', {}).get('main', [])
print(f"Router A1 tiene {len(router_conn)} outputs:")
for i, output in enumerate(router_conn):
    if output:
        for edge in output:
            print(f"  Output {i} -> {edge['node']}")
    else:
        print(f"  Output {i} -> (vacío / sin conexion)")
