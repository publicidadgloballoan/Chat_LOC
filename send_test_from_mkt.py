import urllib.request
import json
import time

url_state = 'http://127.0.0.1:8080/instance/connectionState/mkt_colab'
headers = {'apikey': 'PICE-SAAS-DEFAULT-KEY-2026'}

print("Esperando conexión de WhatsApp mkt_colab (1178255239)...")
while True:
    try:
        req = urllib.request.Request(url_state, headers=headers)
        res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
        state = res.get('instance', {}).get('state')
        phone = res.get('instance', {}).get('phone')
        
        if state == 'open':
            print(f"✅ ¡WhatsApp MKT ({phone}) CONECTADO!")
            time.sleep(1)
            
            # Enviar mensaje de prueba
            payload = {
                'number': '5491136822400',
                'text': 'Hola, ¿cómo estás? Te escribo porque estoy armando la red de Asesores Comerciales de Colaboratium, la primera plataforma P2P registrada ante el BCRA (Nº 40.015).\n\nEstamos sumando profesionales del sector financiero para comercializar inversiones atomizadas por IA con retornos muy superiores a la banca tradicional.\n\nOfrecemos hasta un 6% de comisión por colocación con acreditación directa en tu CVU.\n\n¿Tenés 10 minutos esta semana para mostrarte la propuesta y el esquema de comisiones?'
            }
            req_send = urllib.request.Request('http://127.0.0.1:8080/message/sendText/mkt_colab', 
                                             data=json.dumps(payload).encode('utf-8'), 
                                             headers={'Content-Type': 'application/json', 'apikey': 'PICE-SAAS-DEFAULT-KEY-2026'})
            res_send = urllib.request.urlopen(req_send).read().decode('utf-8')
            print("🚀 Mensaje despachado desde 1178255239 hacia 5491136822400:", res_send)
            break
    except Exception as e:
        pass
    time.sleep(3)
