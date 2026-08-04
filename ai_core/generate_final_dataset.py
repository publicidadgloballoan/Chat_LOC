import json
import random
import os
import sys

# Asegurar path
sys.path.append(r"C:\SaaSIA\ai_core")
from nucleo_ia import query_ollama, get_session, update_session, DB_PATH
from services.ia_kernel import IAKernel

import sqlite3

def clear_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM sessions")
    pass
    conn.commit()
    conn.close()

def generate():
    clear_db()
    
    inst = "ventas_nico_meta"
    
    breeds = [
        'Caniche Toy Blanco Macho', 'Caniche Toy Blanco Hembra', 
        'Caniche Toy Apricot Macho', 'Caniche Toy Apricot Hembra', 
        'Caniche Toy Negro Macho', 'Caniche Toy Negro Hembra', 
        'Bulldog Frances Macho', 'Bulldog Frances Hembra', 
        'Pug Carlino Macho', 'Pug Carlino Hembra', 
        'Golden Retriever Macho', 'Golden Retriever Hembra'
    ]
    
    cities = ["Buenos Aires", "CABA", "Cordoba", "Rosario", "Mendoza", "San Miguel", "Palermo"]
    
    dataset = []
    
    kernel = IAKernel()
    
    ollama_calls = 0
    nex_calls = 0
    success = 0
    demoras = 0
    
    print("Simulando 100 conversaciones para generar el Dataset...")
    for i in range(100):
        phone = f"549110000{i:04d}"
        history = []
        
        name = f"Cliente_{i}"
        breed = random.choice(breeds)
        city = random.choice(cities)
        
        # Secuencia de mensajes del usuario
        user_msgs = [
            ("Hola", "MENU"),
            (name, "node_2"),
            ("Si es correcto", "node_2"),
            (breed, "node_4"),
            ("Si dale, mandame fotos", "node_4"),
            ("Si quiero avanzar", "node_4"),
            (city, "node_8"),
            ("Confirmar", "node_8")
        ]
        
        # Simular sesión a nivel DB
        update_session(phone, inst, state="MENU", name=name)
        
        current_state = "MENU"
        context = ""
        
        print(f"--- Iniciando cliente {i} ({breed}) ---")
        
        client_success = True
        
        for msg, expected_state in user_msgs:
            if msg == breed:
                b_match = kernel.find_breed_by_query(msg)
                if b_match:
                    precio = b_match.get("price", 0)
                    context = f"|RAZA:{msg}|PRECIO:{precio}"
                    update_session(phone, inst, summary=context)
                    history.append({"role": "user", "content": msg})
                    # Llamada LLM simulada
                    resp = query_ollama(msg, "REGLA ESTRICTA DE VENTAS", inst, history)
                    if resp: nex_calls += 1
                    else: demoras += 1; client_success = False; break
                    history.append({"role": "assistant", "content": resp})
            
            elif msg == "Si dale, mandame fotos":
                context += "|FOTOS_OFRECIDAS:SI"
                update_session(phone, inst, summary=context)
                history.append({"role": "user", "content": msg})
                resp = query_ollama(msg, "FOTOS Y PAGOS", inst, history)
                if resp: nex_calls += 1
                else: demoras += 1; client_success = False; break
                history.append({"role": "assistant", "content": resp})
                
            elif msg == "Si quiero avanzar":
                context += "|PAGO_OFRECIDO:SI|CALC_WAITING"
                update_session(phone, inst, state="node_8", summary=context)
                current_state = "node_8"
                history.append({"role": "user", "content": msg})
                
            elif msg == city:
                history.append({"role": "user", "content": msg})
                resp = query_ollama(msg, "Calculando envio", inst, history)
                if resp: nex_calls += 1
                else: demoras += 1; client_success = False; break
                history.append({"role": "assistant", "content": resp})
                
            elif msg == "Confirmar":
                history.append({"role": "user", "content": msg})
                
        if client_success:
            success += 1
            # Add to dataset
            for turn in history:
                dataset.append(json.dumps(turn))
                
    with open("c:/SaaSIA/ai_core/dataset_ventas.jsonl", "w", encoding="utf-8") as f:
        f.write("\n".join(dataset))
        
    print(f"\n--- ESTADISTICAS DE LA SIMULACION (N=100) ---")
    print(f"Exitosos (Llegaron al final): {success}")
    print(f"Llamadas LLM Exitosa (Nex-N2 Pro + Ollama): {nex_calls}")
    print(f"Demoras Tecnicas simuladas: {demoras}")
    print("Dataset guardado en c:/SaaSIA/ai_core/dataset_ventas.jsonl")

if __name__ == "__main__":
    generate()
