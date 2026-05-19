import requests

url = "http://localhost:5000/api/data"
data = {"action": "sync"}
try:
    res = requests.post(url, json=data, timeout=10)
    print(f"Sync trigger: {res.status_code} - {res.text}")
except Exception as e:
    print(f"Error: {e}")
