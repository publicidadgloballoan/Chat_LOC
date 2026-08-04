import re
import json

with open(r'c:\SaaSIA\ai_core\config\company_1\knowledge_archive\system\training_base.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

catalog = {}
current_breed = None
media_list = []

breed_regex = re.compile(r'tenemos cachorros ([A-Za-z0-9 ]+?) de \d+ días', re.IGNORECASE)

for line in lines:
    # Match media
    media_match = re.search(r'‎((?:IMG|VID)-[A-Z0-9-]+\.(?:jpg|mp4)|[a-zA-Z0-9-]+\.pdf) \(archivo adjunto\)', line)
    if media_match:
        media_list.append(media_match.group(1))

    # Match breed
    match = breed_regex.search(line)
    if match:
        if current_breed and media_list:
            catalog[current_breed] = {"media": list(set(media_list))}
        
        raw_breed = match.group(1).strip()
        current_breed = raw_breed
        media_list = []

# Add last breed
if current_breed and media_list:
    catalog[current_breed] = {"media": list(set(media_list))}

with open(r'c:\SaaSIA\ai_core\config\company_1\configs\media_catalog.json', 'w', encoding='utf-8') as f:
    json.dump({"type": "media_catalog", "data": catalog}, f, indent=2, ensure_ascii=False)

print("Catalog built with", len(catalog), "breeds.")
