import requests
import time

TOKEN = "8770802154:AAHFY2AfMv2fILHkMcfwCD6h8YWa6gMDCRM"
URL = f"https://api.telegram.org/bot{TOKEN}/getUpdates"

print(f"Polling {URL}...")
while True:
    try:
        res = requests.get(URL, timeout=10).json()
        print(f"Updates: {res}")
    except Exception as e:
        print(f"Error: {e}")
    time.sleep(5)
