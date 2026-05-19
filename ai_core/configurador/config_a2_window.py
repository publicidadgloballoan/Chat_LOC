"""
Tab 3: Configuración A2 - IA Conversacional
Cargar conversaciones de entrenamiento, documentos PDF, imágenes y audios para entrenar el LLM
"""
import customtkinter as ctk
from tkinter import filedialog
from pathlib import Path
import json


class ConfigA2Window:
    def __init__(self, parent, app):
        self.parent = parent
        self.app = app
        self.config_file = Path("../config/config_a2.json")
        self.documentos_cargados = []

        # Layout
        parent.grid_columnconfigure(0, weight=1)
        parent.grid_rowconfigure(1, weight=1)

        # Panel superior: Instrucciones
        info_frame = ctk.CTkFrame(parent)
        info_frame.grid(row=0, column=0, padx=10, pady=10, sticky="ew")

        ctk.CTkLabel(
            info_frame,
            text="🤖 Entrenamiento del Asistente IA",
            font=("Arial", 18, "bold")
        ).grid(row=0, column=0, padx=10, pady=10, sticky="w")

        ctk.CTkLabel(
            info_frame,
            text="Carga documentos, conversaciones ejemplo y archivos multimedia para entrenar al asistente",
            text_color="gray"
        ).grid(row=1, column=0, padx=10, pady=(0, 10), sticky="w")

        # Panel central: Documentos
        docs_frame = ctk.CTkFrame(parent)
        docs_frame.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="nsew")
        docs_frame.grid_columnconfigure(0, weight=1)
        docs_frame.grid_rowconfigure(1, weight=1)

        # Botones de carga
        btn_frame = ctk.CTkFrame(docs_frame)
        btn_frame.grid(row=0, column=0, padx=10, pady=10, sticky="ew")

        pdf_btn = ctk.CTkButton(
            btn_frame,
            text="📄 Cargar PDFs",
            command=lambda: self.cargar_archivo("pdf"),
            width=140
        )
        pdf_btn.grid(row=0, column=0, padx=5, pady=5)

        img_btn = ctk.CTkButton(
            btn_frame,
            text="🖼️ Cargar Imágenes",
            command=lambda: self.cargar_archivo("imagen"),
            width=140
        )
        img_btn.grid(row=0, column=1, padx=5, pady=5)

        audio_btn = ctk.CTkButton(
            btn_frame,
            text="🎵 Cargar Audios",
            command=lambda: self.cargar_archivo("audio"),
            width=140
        )
        audio_btn.grid(row=0, column=2, padx=5, pady=5)

        conv_btn = ctk.CTkButton(
            btn_frame,
            text="💬 Cargar Conversaciones",
            command=self.cargar_conversaciones,
            width=160
        )
        conv_btn.grid(row=0, column=3, padx=5, pady=5)

        # Lista de documentos cargados
        self.docs_listbox = ctk.CTkTextbox(docs_frame, width=1050, height=400)
        self.docs_listbox.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="nsew")

        # Panel inferior: Configuración del modelo
        config_frame = ctk.CTkFrame(parent)
        config_frame.grid(row=2, column=0, padx=10, pady=(0, 10), sticky="ew")
        config_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(config_frame, text="⚙️ Configuración del Modelo", font=("Arial", 14, "bold")).grid(
            row=0, column=0, columnspan=3, padx=10, pady=10, sticky="w"
        )

        # Temperatura
        ctk.CTkLabel(config_frame, text="Temperatura (creatividad):").grid(row=1, column=0, padx=10, pady=5, sticky="w")
        self.temp_slider = ctk.CTkSlider(config_frame, from_=0.0, to=1.0, number_of_steps=10, width=200)
        self.temp_slider.set(0.7)
        self.temp_slider.grid(row=1, column=1, padx=10, pady=5, sticky="w")
        self.temp_label = ctk.CTkLabel(config_frame, text="0.7")
        self.temp_label.grid(row=1, column=2, padx=5, pady=5)
        self.temp_slider.configure(command=lambda v: self.temp_label.configure(text=f"{v:.1f}"))

        # Max tokens
        ctk.CTkLabel(config_frame, text="Longitud máxima respuesta:").grid(row=2, column=0, padx=10, pady=5, sticky="w")
        self.tokens_entry = ctk.CTkEntry(config_frame, width=100)
        self.tokens_entry.insert(0, "500")
        self.tokens_entry.grid(row=2, column=1, padx=10, pady=5, sticky="w")

        # Context window
        ctk.CTkLabel(config_frame, text="Mensajes de contexto:").grid(row=3, column=0, padx=10, pady=5, sticky="w")
        self.context_entry = ctk.CTkEntry(config_frame, width=100)
        self.context_entry.insert(0, "15")
        self.context_entry.grid(row=3, column=1, padx=10, pady=5, sticky="w")

        # Botones finales
        final_btn_frame = ctk.CTkFrame(parent)
        final_btn_frame.grid(row=3, column=0, padx=10, pady=(0, 10), sticky="ew")

        entrenar_btn = ctk.CTkButton(
            final_btn_frame,
            text="🚀 Entrenar Modelo",
            command=self.entrenar_modelo,
            width=160,
            height=40,
            font=("Arial", 14, "bold"),
            fg_color="green",
            hover_color="darkgreen"
        )
        entrenar_btn.grid(row=0, column=0, padx=10, pady=10)

        probar_btn = ctk.CTkButton(
            final_btn_frame,
            text="🧪 Probar IA",
            command=self.probar_ia,
            width=140,
            height=40
        )
        probar_btn.grid(row=0, column=1, padx=10, pady=10)

        guardar_btn = ctk.CTkButton(
            final_btn_frame,
            text="💾 Guardar Config",
            command=self.guardar_config,
            width=140,
            height=40
        )
        guardar_btn.grid(row=0, column=2, padx=10, pady=10)

        # Cargar documentos existentes
        self.cargar_lista_documentos()

    def cargar_archivo(self, tipo):
        """Cargar archivo PDF, imagen o audio"""
        extensiones = {
            "pdf": [("PDF files", "*.pdf")],
            "imagen": [("Image files", "*.png *.jpg *.jpeg *.gif *.bmp")],
            "audio": [("Audio files", "*.mp3 *.wav *.ogg *.m4a")]
        }

        archivos = filedialog.askopenfilenames(
            title=f"Seleccionar archivos {tipo}",
            filetypes=extensiones.get(tipo, [])
        )

        if archivos:
            for archivo in archivos:
                self.documentos_cargados.append({
                    "tipo": tipo,
                    "path": archivo,
                    "nombre": Path(archivo).name,
                    "procesado": False
                })

            self.actualizar_lista_documentos()
            self.app.update_status(f"{len(archivos)} archivo(s) {tipo} agregado(s)", "green")

    def cargar_conversaciones(self):
        """Cargar archivo de conversaciones de entrenamiento (JSON o TXT)"""
        archivo = filedialog.askopenfilename(
            title="Seleccionar archivo de conversaciones",
            filetypes=[("JSON files", "*.json"), ("Text files", "*.txt"), ("All files", "*.*")]
        )

        if archivo:
            self.documentos_cargados.append({
                "tipo": "conversacion",
                "path": archivo,
                "nombre": Path(archivo).name,
                "procesado": False
            })
            self.actualizar_lista_documentos()
            self.app.update_status("Conversaciones cargadas", "green")

    def actualizar_lista_documentos(self):
        """Actualizar la lista visual de documentos"""
        self.docs_listbox.delete("1.0", "end")

        if not self.documentos_cargados:
            self.docs_listbox.insert("1.0", "No hay documentos cargados aún.\n\nUsa los botones arriba para cargar PDFs, imágenes, audios o conversaciones de ejemplo.")
            return

        self.docs_listbox.insert("1.0", "📚 Documentos Cargados:\n\n")

        for idx, doc in enumerate(self.documentos_cargados, 1):
            icono = {"pdf": "📄", "imagen": "🖼️", "audio": "🎵", "conversacion": "💬"}.get(doc["tipo"], "📁")
            estado = "✅ Procesado" if doc["procesado"] else "⏳ Pendiente"
            self.docs_listbox.insert("end", f"{idx}. {icono} {doc['nombre']} - {estado}\n")

    def cargar_lista_documentos(self):
        """Cargar lista de documentos desde config"""
        try:
            if self.config_file.exists():
                with open(self.config_file, "r", encoding="utf-8") as f:
                    config = json.load(f)
                    self.documentos_cargados = config.get("documentos", [])
                    self.actualizar_lista_documentos()
        except Exception as e:
            print(f"Error al cargar config A2: {e}")

    def guardar_config(self):
        """Guardar configuración del modelo"""
        try:
            config = {
                "temperatura": self.temp_slider.get(),
                "max_tokens": int(self.tokens_entry.get()),
                "context_messages": int(self.context_entry.get()),
                "documentos": self.documentos_cargados
            }

            self.config_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            self.app.update_status("Configuración A2 guardada", "green")
        except Exception as e:
            self.app.update_status(f"Error al guardar: {e}", "red")

    def entrenar_modelo(self):
        """Proceso de 'entrenamiento': Extrae texto de PDFs y otros archivos"""
        if not self.documentos_cargados:
            self.app.update_status("No hay documentos para procesar", "yellow")
            return

        self.app.update_status("🤖 Leyendo documentos (incluyendo PDFs)...", "yellow")
        try:
            from pypdf import PdfReader
            conocimiento_extra = ""
            
            for doc in self.documentos_cargados:
                if doc["procesado"]: continue
                
                path = Path(doc["path"])
                if not path.exists(): continue
                
                # Caso PDF
                if path.suffix.lower() == ".pdf":
                    reader = PdfReader(path)
                    for page in reader.pages:
                        conocimiento_extra += page.extract_text() + "\n"
                    doc["procesado"] = True
                
                # Caso TXT/JSON
                elif path.suffix.lower() in [".txt", ".json"]:
                    with open(path, "r", encoding="utf-8") as f:
                        conocimiento_extra += f"\n---\n{f.read()}\n"
                    doc["procesado"] = True

            # 2. Guardar en el cerebro de n8n
            knowledge_path = Path("../config/knowledge.txt")
            knowledge_path.parent.mkdir(parents=True, exist_ok=True)
            with open(knowledge_path, "a", encoding="utf-8") as f: # "a" para anexar conocimientos
                f.write(conocimiento_extra)

            self.actualizar_lista_documentos()
            self.guardar_config()
            
            # SINCRO CON N8N
            import subprocess
            subprocess.run(["python", "../actualizar_cerebro.py"], capture_output=True)
            
            self.app.update_status("✅ Bot entrenado con éxito (PDF procesado)", "green")
        except Exception as e:
            self.app.update_status(f"Error en entrenamiento: {e}", "red")

    def probar_ia(self):
        """Abrir ventana para probar el modelo directamente"""
        test_window = ctk.CTkToplevel(self.app)
        test_window.title("🧪 Laboratorio de Prueba IA")
        test_window.geometry("600x500")
        test_window.attributes("-topmost", True)

        test_window.grid_columnconfigure(0, weight=1)
        test_window.grid_rowconfigure(0, weight=1)

        chat_box = ctk.CTkTextbox(test_window, width=580, height=400)
        chat_box.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
        chat_box.insert("end", "🤖 IA: Hola, soy el asistente de Punto A. ¿Qué quieres probar?\n\n")

        entry_frame = ctk.CTkFrame(test_window)
        entry_frame.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="ew")
        entry_frame.grid_columnconfigure(0, weight=1)

        user_input = ctk.CTkEntry(entry_frame, placeholder_text="Escribe tu mensaje aquí...")
        user_input.grid(row=0, column=0, padx=(0, 10), pady=10, sticky="ew")

        def enviar():
            msg = user_input.get()
            if not msg: return
            chat_box.insert("end", f"👤 Tú: {msg}\n")
            user_input.delete(0, "end")
            
            # Simular llamada a Ollama local
            try:
                import requests
                r = requests.post("http://localhost:11434/api/chat", json={
                    "model": "llama3.2:3b-instruct-q4_K_M",
                    "messages": [{"role": "user", "content": msg}],
                    "stream": False
                })
                respuesta = r.json()["message"]["content"]
                chat_box.insert("end", f"🤖 IA: {respuesta}\n\n")
            except Exception as e:
                chat_box.insert("end", f"❌ Error: {e}\n\n")

        send_btn = ctk.CTkButton(entry_frame, text="Enviar", command=enviar, width=80)
        send_btn.grid(row=0, column=1, padx=0, pady=10)
        
        user_input.bind("<Return>", lambda e: enviar())
