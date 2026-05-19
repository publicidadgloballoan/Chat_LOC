import requests
import json

def test():
    try:
        r = requests.get('http://127.0.0.1:5000/api/data?instance=ALL&companyId=1', timeout=5)
        data = r.json()
        print(f"Status: {r.status_code}")
        print(f"Total Conversations: {len(data.get('conversations', []))}")
        for c in data.get('conversations', []):
            print(f" - {c.get('nombre') or c.get('numero')} ({c.get('instance')})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
