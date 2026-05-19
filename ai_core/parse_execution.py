import json, subprocess
cmd = ['docker', 'exec', 'chatbot_punto_a_postgres', 'psql', '-U', 'chatbot_punto_a', '-d', 'chatbot_punto_a', '-t', '-c', 'SELECT data FROM execution_data ORDER BY "executionId" DESC LIMIT 1']
r = subprocess.run(cmd, stdout=subprocess.PIPE, text=True)
try:
    arr = json.loads(r.stdout.strip())
    # In n8n 1.68+, execution data can be strange. Try parsing anything that looks like runData.
    s = str(r.stdout.strip())
    import re
    # Just extract all node names that executed!
    # N8N stores it as "nodeName": [{"startTime": ...}]
    # We can match `"([^"]+)":\s*\[\s*\{\s*"startTime"`
    matches = re.findall(r'"([^"]+)":\s*\[\s*\{\s*"startTime"', s)
    print("Nodos Ejecutados (Regex):")
    for m in set(matches): print(f"- {m}")
    
except Exception as e: print(e)
