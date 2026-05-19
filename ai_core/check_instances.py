import requests
headers={'apikey': '03d27a0c34fa708178148142d6f5eedc86cd5e3a'}
r=requests.get('http://127.0.0.1:8080/instance/fetchInstances', headers=headers)
instances=r.json()
print(f"Total instances: {len(instances)}")
for i in instances:
    name=i['instance']['instanceName']
    status=i['instance'].get('status', 'unknown')
    try:
        res=requests.get(f'http://127.0.0.1:8080/instance/connect/{name}', headers=headers)
        data=res.json()
        owner = data.get('instance', {}).get('ownerJid', 'None')
        print(f'{name} [{status}]: {owner}')
    except:
        print(f'{name} [{status}]: Error')
