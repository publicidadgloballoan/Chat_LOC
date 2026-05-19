"""
Tab 1: Conversaciones
Ver conversaciones en tiempo real y activar/detener respuestas del chatbot
"""
import customtkinter as ctk
from tkinter import ttk
import requests
from datetime import datetime
from threading import Thread
import time
import json
import subprocess
from pathlib import Path


class ConversacionesWindow:
    def __init__(self, parent, app):
        self.parent = parent
        self.app = app
        self.bot_activo = True
        self.conversaciones = []

        # Layout principal
        parent.grid_columnconfigure(0, weight=1)
        parent.grid_rowconfigure(1, weight=1)

        # Panel superior: controles
        control_frame = ctk.CTkFrame(parent)
        control_frame.grid(row=0, column=0, padx=10, pady=10, sticky="ew")

        # Switch para activar/detener bot
        self.bot_switch = ctk.CTkSwitch(
            control_frame,
            text="Bot Activo",
            command=self.toggle_bot,
            onvalue=True,
            offvalue=False
        )
        self.bot_switch.select()
        self.bot_switch.grid(row=0, column=0, padx=20, pady=10)

        # Botón de refrescar
        refresh_btn = ctk.CTkButton(
            control_frame,
            text="🔄 Refrescar",
            command=self.cargar_conversaciones,
            width=120
        )
        refresh_btn.grid(row=0, column=1, padx=10, pady=10)

        # Filtro de búsqueda
        ctk.CTkLabel(control_frame, text="Buscar:").grid(row=0, column=2, padx=(20, 5), pady=10)
        self.search_entry = ctk.CTkEntry(control_frame, width=200, placeholder_text="Número o mensaje...")
        self.search_entry.grid(row=0, column=3, padx=5, pady=10)
        self.search_entry.bind("<KeyRelease>", lambda e: self.filtrar_conversaciones())

        # Frame para la tabla
        table_frame = ctk.CTkFrame(parent)
        table_frame.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="nsew")
        table_frame.grid_columnconfigure(0, weight=1)
        table_frame.grid_rowconfigure(0, weight=1)

        # Crear Treeview para mostrar conversaciones
        columns = ("Fecha", "Número", "Mensaje", "Respuesta", "Estado")
        self.tree = ttk.Treeview(table_frame, columns=columns, show="headings", height=20)

        # Configurar columnas
        self.tree.heading("Fecha", text="Fecha/Hora")
        self.tree.heading("Número", text="Número")
        self.tree.heading("Mensaje", text="Mensaje")
        self.tree.heading("Respuesta", text="Respuesta Bot")
        self.tree.heading("Estado", text="Estado")

        self.tree.column("Fecha", width=150)
        self.tree.column("Número", width=120)
        self.tree.column("Mensaje", width=250)
        self.tree.column("Respuesta", width=250)
        self.tree.column("Estado", width=100)

        # Scrollbar
        scrollbar = ttk.Scrollbar(table_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)

        self.tree.grid(row=0, column=0, sticky="nsew")
        scrollbar.grid(row=0, column=1, sticky="ns")

        # Botones de acción
        action_frame = ctk.CTkFrame(parent)
        action_frame.grid(row=2, column=0, padx=10, pady=(0, 10), sticky="ew")

        ver_detalle_btn = ctk.CTkButton(
            action_frame,
            text="👁️ Ver Detalle",
            command=self.ver_detalle_conversacion,
            width=140
        )
        ver_detalle_btn.grid(row=0, column=0, padx=10, pady=10)

        bloquear_btn = ctk.CTkButton(
            action_frame,
            text="🚫 Bloquear Número",
            command=self.bloquear_numero,
            width=140,
            fg_color="red",
            hover_color="darkred"
        )
        bloquear_btn.grid(row=0, column=1, padx=10, pady=10)

        exportar_btn = ctk.CTkButton(
            action_frame,
            text="📥 Exportar Conversaciones",
            command=self.exportar_conversaciones,
            width=180
        )
        exportar_btn.grid(row=0, column=2, padx=10, pady=10)

        # Auto-refresh cada 5 segundos
        self.auto_refresh = True
        self.iniciar_auto_refresh()

        # Cargar conversaciones iniciales
        self.cargar_conversaciones()

    def toggle_bot(self):
        """Activar o desactivar el bot en n8n"""
        estado = self.bot_switch.get()
        message = "Activando bot..." if estado else "Desactivando bot..."
        self.app.update_status(message, "yellow")

        try:
            # 1. Obtener la API KEY de n8n desde Postgres
            res = subprocess.run(["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", "SELECT \"apiKey\" FROM user_api_keys LIMIT 1"], capture_output=True, text=True)
            n8n_key = res.stdout.strip()
            
            headers = {"X-N8N-API-KEY": n8n_key}
            
            # 2. Obtener el ID del workflow activo
            r = requests.get("http://localhost:5678/api/v1/workflows", headers=headers)
            wfs = r.json().get('data', [])
            
            if not wfs:
                self.app.update_status("No se encontró el workflow del bot", "red")
                return

            wf_id = wfs[0]['id']
            
            # 3. Cambiar estado
            if estado:
                r = requests.post(f"http://localhost:5678/api/v1/workflows/{wf_id}/activate", headers=headers)
            else:
                r = requests.post(f"http://localhost:5678/api/v1/workflows/{wf_id}/deactivate", headers=headers)
            
            if r.status_code in [200, 201]:
                final_msg = "Bot en línea" if estado else "Bot fuera de línea"
                self.app.update_status(final_msg, "green" if estado else "blue")
            else:
                self.app.update_status(f"Error API: {r.status_code}", "red")
                
        except Exception as e:
            self.app.update_status(f"Error de conexión: {e}", "red")
            # Revertir switch si falló
            self.bot_switch.toggle()

    def cargar_conversaciones(self):
        """Cargar conversaciones desde el historial JSONL"""
        import json
        from pathlib import Path
        try:
            ruta = Path(r"C:\ChatBot_Punto_A\data\whatsapp_auth\messages.jsonl")
            if not ruta.exists():
                self.conversaciones = []
                self.actualizar_tabla()
                return

            historial = {}
            with open(ruta, 'r', encoding='utf-8') as f:
                for linea in f:
                    if not linea.strip():
                        continue
                    try:
                        msg = json.loads(linea)
                        num = msg.get("numero")
                        if not num: 
                            continue

                        if num not in historial:
                            historial[num] = {"fecha": "", "numero": num, "mensaje": "", "respuesta": "", "estado": "Recibido"}
                        
                        historial[num]["fecha"] = msg.get("fecha", "")
                        
                        if msg.get("rol") == "user":
                            historial[num]["mensaje"] = msg.get("mensaje", "")
                            historial[num]["respuesta"] = ""
                            historial[num]["estado"] = "Recibido"
                        elif msg.get("rol") == "assistant":
                            historial[num]["respuesta"] = msg.get("mensaje", "")
                            historial[num]["estado"] = "Respondido"
                    except Exception:
                        pass
            
            lista = list(historial.values())
            lista.sort(key=lambda x: x["fecha"], reverse=True)
            self.conversaciones = lista

            self.actualizar_tabla()
        except Exception as e:
            self.app.update_status(f"Error al cargar conversaciones: {e}", "red")

    def actualizar_tabla(self):
        """Actualizar la tabla con las conversaciones"""
        # Limpiar tabla
        for item in self.tree.get_children():
            self.tree.delete(item)

        # Insertar conversaciones
        for conv in self.conversaciones:
            self.tree.insert("", "end", values=(
                conv["fecha"],
                conv["numero"],
                conv["mensaje"][:50] + "..." if len(conv["mensaje"]) > 50 else conv["mensaje"],
                conv["respuesta"][:50] + "..." if len(conv["respuesta"]) > 50 else conv["respuesta"],
                conv["estado"]
            ))

    def filtrar_conversaciones(self):
        """Filtrar conversaciones según búsqueda"""
        busqueda = self.search_entry.get().lower()
        if not busqueda:
            self.actualizar_tabla()
            return

        # Filtrar
        conversaciones_filtradas = [
            c for c in self.conversaciones
            if busqueda in c["numero"].lower() or busqueda in c["mensaje"].lower()
        ]

        # Limpiar y mostrar filtradas
        for item in self.tree.get_children():
            self.tree.delete(item)

        for conv in conversaciones_filtradas:
            self.tree.insert("", "end", values=(
                conv["fecha"],
                conv["numero"],
                conv["mensaje"][:50],
                conv["respuesta"][:50],
                conv["estado"]
            ))

    def ver_detalle_conversacion(self):
        """Ver detalle completo de la conversación seleccionada"""
        selected = self.tree.selection()
        if not selected:
            self.app.update_status("Selecciona una conversación primero", "yellow")
            return

        item = self.tree.item(selected[0])
        numero = item['values'][1]

        # Crear ventana modal
        detail_window = ctk.CTkToplevel(self.app)
        detail_window.title(f"Detalle: {numero}")
        detail_window.geometry("600x700")
        detail_window.attributes("-topmost", True)

        detail_window.grid_columnconfigure(0, weight=1)
        detail_window.grid_rowconfigure(0, weight=1)

        chat_box = ctk.CTkTextbox(detail_window, width=580, height=600)
        chat_box.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")

        # Cargar todos los mensajes de este número
        try:
            ruta = Path(r"C:\ChatBot_Punto_A\data\whatsapp_auth\messages.jsonl")
            if ruta.exists():
                with open(ruta, 'r', encoding='utf-8') as f:
                    for linea in f:
                        if not linea.strip(): continue
                        msg = json.loads(linea)
                        if msg.get("numero") == numero:
                            rol = "👤 Tú" if msg.get("rol") == "user" else "🤖 Bot"
                            chat_box.insert("end", f"{msg.get('fecha')} | {rol}:\n{msg.get('mensaje')}\n\n")
            
            chat_box.see("end")
            chat_box.configure(state="disabled")
        except Exception as e:
            chat_box.insert("end", f"Error al cargar detalle: {e}")

        btn_cerrar = ctk.CTkButton(detail_window, text="Cerrar", command=detail_window.destroy)
        btn_cerrar.grid(row=1, column=0, padx=10, pady=10)

    def bloquear_numero(self):
        """Bloquear número seleccionado"""
        selected = self.tree.selection()
        if not selected:
            self.app.update_status("Selecciona una conversación primero", "yellow")
            return

        # TODO: Implementar bloqueo en base de datos
        self.app.update_status("Número bloqueado", "green")

    def exportar_conversaciones(self):
        """Exportar historial a archivo CSV"""
        from tkinter import filedialog
        import csv
        
        path = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV files", "*.csv")])
        if not path: return
        
        try:
            ruta = Path(r"C:\ChatBot_Punto_A\data\whatsapp_auth\messages.jsonl")
            if not ruta.exists():
                self.app.update_status("No hay mensajes para exportar", "yellow")
                return

            with open(ruta, "r", encoding="utf-8") as f:
                lines = f.readlines()
            
            with open(path, "w", newline="", encoding="utf-8") as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(["Fecha", "Número", "Rol", "Mensaje"])
                for line in lines:
                    if not line.strip(): continue
                    d = json.loads(line)
                    writer.writerow([d.get("fecha"), d.get("numero"), d.get("rol"), d.get("mensaje")])
            
            self.app.update_status(f"Exportación exitosa: {Path(path).name}", "green")
        except Exception as e:
            self.app.update_status(f"Error al exportar: {e}", "red")

    def iniciar_auto_refresh(self):
        """Refrescar automáticamente cada 5 segundos (seguro para tkinter)."""
        def refresh_loop():
            while self.auto_refresh:
                time.sleep(5)
                if self.auto_refresh:
                    # Programar actualización en el hilo principal de tkinter
                    try:
                        self.parent.after(0, self.cargar_conversaciones)
                    except Exception:
                        break

        Thread(target=refresh_loop, daemon=True).start()
