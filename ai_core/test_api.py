import requests
import json

def test_api():
    try:
        r = requests.get("http://localhost:4000/api/data?instance=ALL", timeout=5)
        print("Status Code:", r.status_code)
        data = r.json()
        print("Success:", data.get('success'))
        print("Conversations Count:", len(data.get('conversations', [])))
        if data.get('conversations'):
            print("First Conversation:", data['conversations'][0])
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_api()
