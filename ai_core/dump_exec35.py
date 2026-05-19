import subprocess, re

cmd = [
    "docker", "exec", "chatbot_punto_a_postgres",
    "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a",
    "-A", "-t", "-c",
    'SELECT data FROM execution_data WHERE "executionId"=35'
]
r = subprocess.run(cmd, capture_output=True)
raw = r.stdout.decode("utf-8", errors="replace").strip()

with open("exec35.txt", "w", encoding="utf-8") as f:
    f.write(raw)

# Find all nodes that ran (have startTime)
nodes = re.findall(r'"([^"]{2,50})":\s*\[\{', raw)
nodes = list(dict.fromkeys(nodes))
print("NODES DETECTED:", nodes)

# Find errors
errors = re.findall(r'"message":"([^"]{5,200})"', raw)
print("\nMESSAGES FOUND:")
for e in errors[:10]:
    print(" -", e)
    
# Find lastNodeExecuted
last = re.findall(r'"lastNodeExecuted":"([^"]+)"', raw)
print("\nLAST NODE:", last)
