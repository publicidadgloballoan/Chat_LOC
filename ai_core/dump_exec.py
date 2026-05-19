import subprocess, json, sys

cmd = [
    "docker", "exec", "chatbot_punto_a_postgres",
    "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a",
    "-A", "-t", "-c",
    'SELECT data FROM execution_data WHERE "executionId"=25'
]
r = subprocess.run(cmd, capture_output=True, text=True)
raw = r.stdout.strip()

# Save raw to file
with open("exec25_raw.txt", "w", encoding="utf-8") as f:
    f.write(raw)

print("Raw length:", len(raw))
print("First 1000 chars:")
print(raw[:1000])
