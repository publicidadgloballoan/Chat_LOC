import requests
import sys

url = sys.argv[1]
try:
    print(f"Testing connectivity to {url}")
    r = requests.post(url, json={"test": "data"}, timeout=5)
    print(f"Status: {r.status_code}")
except Exception as e:
    print(f"Error: {e}")
