import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\SaaSIA\IABOX\web_bundle.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Buscar bloques de texto o arrays de objetos
# Buscar patrones como {id:..., title:..., label:..., description:...}
items = []
for m in re.finditer(r'\{[^{}]*(?:label|title|name|description|desc|subtitle|text|question|answer|faq|price|superficie)[^{}]*\}', js):
    snippet = m.group(0)
    if len(snippet) > 20:
        items.append(snippet)

print(f"Total snippets encontrados: {len(items)}")
for it in items[:30]:
    print("--- SNIPPET ---")
    print(it)
