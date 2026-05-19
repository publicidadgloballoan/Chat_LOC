import subprocess, json, re

def run_psql(query):
    result = subprocess.run(
        ["docker", "exec", "chatbot_punto_a_postgres", "psql",
         "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-t", "-c", query],
        capture_output=True, text=True
    )
    return result.stdout.strip()

# Get last 5 executions
print("=== ULTIMAS 5 EJECUCIONES N8N ===")
out = run_psql("SELECT id, status, \\\"stoppedAt\\\" FROM execution_entity ORDER BY id DESC LIMIT 5")
print(out)

# Get last execution data via execution_data table
print("\n=== NODOS EJECUTADOS (ultima ejecucion) ===")
exec_ids = run_psql("SELECT id FROM execution_entity ORDER BY id DESC LIMIT 1")
exec_id = exec_ids.strip().replace('|','').strip()
print(f"ID ejecucion: {exec_id}")

out2 = run_psql(f"SELECT data FROM execution_data WHERE \\\"executionId\\\" = {exec_id}")
# Extract all node names using regex pattern
nodes = re.findall(r'"([^"]+)":\s*\[\s*\{', out2)
unique_nodes = list(dict.fromkeys(nodes))  # preserve order, dedupe
print("Nodos con datos:")
for n in unique_nodes:
    print(f"  - {n}")

# Look for errors
errors = re.findall(r'"error[^"]*":\s*"([^"]{10,})"', out2[:5000])
if errors:
    print("\n=== ERRORES DETECTADOS ===")
    for e in errors[:5]:
        print(f"  {e}")
