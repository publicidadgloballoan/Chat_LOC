"""
Tab 2: Configuración A1 - Botonera Determinista
Configurar opciones del menú, saludo inicial, nombre del agente, tono de respuestas
"""
import customtkinter as ctk
from tkinter import filedialog
import json
import requests
import subprocess
from pathlib import Path


class ConfigA1Window:
    def __init__(self, parent, app):
        self.parent = parent
        self.app = app
        self.config_file = Path("../config/config_a1.json")
        self.config = self.cargar_configuracion()

        # Layout con scroll
        parent.grid_columnconfigure(0, weight=1)
        parent.grid_rowconfigure(0, weight=1)

        # Scroll frame
        scroll_frame = ctk.CTkScrollableFrame(parent, width=1050, height=650)
        scroll_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
        scroll_frame.grid_columnconfigure(0, weight=1)

        # Sección 1: Información General
        self._crear_seccion_general(scroll_frame)

        # Sección 2: Saludo Inicial
        self._crear_seccion_saludo(scroll_frame)

        # Sección 3: Opciones de Menú
        self._crear_seccion_menu(scroll_frame)

        # Botones de acción
        btn_frame = ctk.CTkFrame(parent)
        btn_frame.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="ew")

        guardar_btn = ctk.CTkButton(
            btn_frame,
            text="💾 Guardar Configuración",
            command=self.guardar_configuracion,
            width=180,
            height=40,
            font=("Arial", 14, "bold")
        )
        guardar_btn.grid(row=0, column=0, padx=10, pady=10)

        probar_btn = ctk.CTkButton(
            btn_frame,
            text="🧪 Probar Menú",
            command=self.probar_menu,
            width=140,
            height=40
        )
        probar_btn.grid(row=0, column=1, padx=10, pady=10)

        reset_btn = ctk.CTkButton(
            btn_frame,
            text="🔄 Reset Valores",
            command=self.reset_valores,
            width=140,
            height=40,
            fg_color="orange",
            hover_color="darkorange"
        )
        reset_btn.grid(row=0, column=2, padx=10, pady=10)

    def _crear_seccion_general(self, parent):
        """Sección de información general"""
        frame = ctk.CTkFrame(parent)
        frame.grid(row=0, column=0, padx=10, pady=10, sticky="ew")
        frame.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(frame, text="📋 Información General", font=("Arial", 16, "bold")).grid(
            row=0, column=0, columnspan=2, padx=10, pady=10, sticky="w"
        )

        # Nombre de la empresa
        ctk.CTkLabel(frame, text="Nombre de la Empresa:").grid(row=1, column=0, padx=10, pady=5, sticky="w")
        self.empresa_entry = ctk.CTkEntry(frame, width=400)
        self.empresa_entry.grid(row=1, column=1, padx=10, pady=5, sticky="ew")
        self.empresa_entry.insert(0, self.config.get("empresa", ""))

        # Nombre del agente
        ctk.CTkLabel(frame, text="Nombre del Agente Virtual:").grid(row=2, column=0, padx=10, pady=5, sticky="w")
        self.agente_entry = ctk.CTkEntry(frame, width=400)
        self.agente_entry.grid(row=2, column=1, padx=10, pady=5, sticky="ew")
        self.agente_entry.insert(0, self.config.get("nombre_agente", "Asistente Virtual"))

        # Tono de respuestas
        ctk.CTkLabel(frame, text="Tono de Respuestas:").grid(row=3, column=0, padx=10, pady=5, sticky="w")
        self.tono_combo = ctk.CTkComboBox(
            frame,
            values=["Formal", "Informal", "Amable", "Profesional", "Amigable", "Técnico"],
            width=200
        )
        self.tono_combo.grid(row=3, column=1, padx=10, pady=5, sticky="w")
        self.tono_combo.set(self.config.get("tono", "Amable"))

    def _crear_seccion_saludo(self, parent):
        """Sección de saludo inicial"""
        frame = ctk.CTkFrame(parent)
        frame.grid(row=1, column=0, padx=10, pady=10, sticky="ew")
        frame.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(frame, text="👋 Saludo Inicial", font=("Arial", 16, "bold")).grid(
            row=0, column=0, padx=10, pady=10, sticky="w"
        )

        ctk.CTkLabel(frame, text="Mensaje de bienvenida que recibirá el usuario al iniciar conversación:").grid(
            row=1, column=0, padx=10, pady=(0, 5), sticky="w"
        )

        self.saludo_text = ctk.CTkTextbox(frame, width=1000, height=100)
        self.saludo_text.grid(row=2, column=0, padx=10, pady=(0, 10), sticky="ew")
        self.saludo_text.insert("1.0", self.config.get("saludo_inicial", ""))

        # Variables dinámicas disponibles
        info_label = ctk.CTkLabel(
            frame,
            text="Variables disponibles: {empresa}, {agente}, {hora}, {dia}",
            text_color="gray"
        )
        info_label.grid(row=3, column=0, padx=10, pady=(0, 10), sticky="w")

    def _crear_seccion_menu(self, parent):
        """Sección de opciones de menú"""
        self.menu_frame = ctk.CTkFrame(parent)
        self.menu_frame.grid(row=2, column=0, padx=10, pady=10, sticky="ew")
        self.menu_frame.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(self.menu_frame, text="🔘 Opciones del Menú", font=("Arial", 16, "bold")).grid(
            row=0, column=0, columnspan=2, padx=10, pady=10, sticky="w"
        )

        self.menu_options = []
        opciones = self.config.get("opciones_menu", [
            {"numero": "1", "nombre": "Precios e Información", "respuesta": ""},
            {"numero": "2", "nombre": "Ventas y Contacto", "respuesta": ""},
            {"numero": "soporte", "nombre": "Soporte Técnico", "respuesta": ""}
        ])

        for idx, opcion in enumerate(opciones):
            self._crear_opcion_menu(self.menu_frame, idx + 1, opcion)

        # Botón para agregar opción
        self.add_btn = ctk.CTkButton(
            self.menu_frame,
            text="➕ Agregar Opción",
            command=self.agregar_opcion,
            width=150
        )
        self.add_btn.grid(row=len(opciones) + 1, column=0, padx=10, pady=10, sticky="w")

    def _crear_opcion_menu(self, parent, row_num, opcion):
        """Crear controles para una opción del menú"""
        option_frame = ctk.CTkFrame(parent)
        option_frame.grid(row=row_num, column=0, padx=10, pady=5, sticky="ew")
        option_frame.grid_columnconfigure(2, weight=1)

        # Número/trigger
        ctk.CTkLabel(option_frame, text="Opción:").grid(row=0, column=0, padx=5, pady=5)
        numero_entry = ctk.CTkEntry(option_frame, width=80)
        numero_entry.grid(row=0, column=1, padx=5, pady=5)
        numero_entry.insert(0, opcion.get("numero", ""))

        # Nombre
        ctk.CTkLabel(option_frame, text="Nombre:").grid(row=0, column=2, padx=5, pady=5)
        nombre_entry = ctk.CTkEntry(option_frame, width=200)
        nombre_entry.grid(row=0, column=3, padx=5, pady=5)
        nombre_entry.insert(0, opcion.get("nombre", ""))

        # Tipo de Respuesta
        ctk.CTkLabel(option_frame, text="Tipo:").grid(row=0, column=4, padx=5, pady=5)
        tipo_combo = ctk.CTkComboBox(option_frame, values=["Texto", "Submenú", "Archivo"], width=120)
        tipo_combo.grid(row=0, column=5, padx=5, pady=5)
        tipo_combo.set(opcion.get("tipo_respuesta", "Texto"))

        # Archivo Adjunto
        ctk.CTkLabel(option_frame, text="Adjunto:").grid(row=0, column=6, padx=5, pady=5)
        archivo_entry = ctk.CTkEntry(option_frame, width=150)
        archivo_entry.grid(row=0, column=7, padx=5, pady=5)
        archivo_entry.insert(0, opcion.get("archivo", ""))

        btn_archivo = ctk.CTkButton(
            option_frame,
            text="📁",
            width=30,
            command=lambda e=archivo_entry: self.seleccionar_adjunto(e)
        )
        btn_archivo.grid(row=0, column=8, padx=5, pady=5)

        # Respuesta / Submenú
        ctk.CTkLabel(option_frame, text="Respuesta / Submenú:").grid(row=1, column=0, padx=5, pady=5, sticky="nw")
        respuesta_text = ctk.CTkTextbox(option_frame, width=800, height=60)
        respuesta_text.grid(row=1, column=1, columnspan=8, padx=5, pady=5, sticky="ew")
        respuesta_text.insert("1.0", opcion.get("respuesta", ""))

        self.menu_options.append({
            "numero": numero_entry,
            "nombre": nombre_entry,
            "tipo_respuesta": tipo_combo,
            "respuesta": respuesta_text,
            "archivo": archivo_entry
        })

    def seleccionar_adjunto(self, entry):
        """Seleccionar archivo adjunto para la opcion de menu"""
        path = filedialog.askopenfilename(
            title="Seleccionar archivo adjunto",
            filetypes=[("Documentos", "*.pdf *.xlsx *.xls *.csv *.db"), ("Todos", "*.*")]
        )
        if path:
            entry.delete(0, "end")
            entry.insert(0, path)

    def agregar_opcion(self):
        """Agregar nueva opción al menú"""
        idx = len(self.menu_options) + 1
        nueva_opcion = {"numero": "", "nombre": "", "respuesta": ""}
        self._crear_opcion_menu(self.menu_frame, idx, nueva_opcion)
        self.add_btn.grid(row=idx + 1, column=0, padx=10, pady=10, sticky="w")
        self.app.update_status("Nueva opción habilitada en el grid. (¡No olvides guardar!)", "green")

    def guardar_configuracion(self):
        """Guardar configuración a archivo JSON"""
        try:
            config = {
                "empresa": self.empresa_entry.get(),
                "nombre_agente": self.agente_entry.get(),
                "tono": self.tono_combo.get(),
                "saludo_inicial": self.saludo_text.get("1.0", "end-1c"),
                "opciones_menu": []
            }

            for opt in self.menu_options:
                config["opciones_menu"].append({
                    "numero": opt["numero"].get(),
                    "nombre": opt["nombre"].get(),
                    "tipo_respuesta": opt["tipo_respuesta"].get(),
                    "respuesta": opt["respuesta"].get("1.0", "end-1c"),
                    "archivo": opt["archivo"].get()
                })

            # Guardar a archivo
            self.config_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            self.app.update_status("Configuración guardada localmente", "blue")
            
            # SINCRO CON N8N
            self.sincronizar_con_cerebro()
            
        except Exception as e:
            self.app.update_status(f"Error al guardar: {e}", "red")

    def sincronizar_con_cerebro(self):
        """Metodo magico que sube los cambios a n8n sin que lo vea el usuario"""
        self.app.update_status("Sincronizando con el bot...", "yellow")
        try:
            # 1. Obtener API KEY de n8n
            res = subprocess.run(["docker", "exec", "chatbot_punto_a_postgres", "psql", "-U", "chatbot_punto_a", "-d", "chatbot_punto_a", "-A", "-t", "-c", "SELECT \"apiKey\" FROM user_api_keys LIMIT 1"], capture_output=True, text=True)
            n8n_key = res.stdout.strip()
            
            # 2. Re-importar el workflow (el script actualizar_cerebro.py ya lo sabe hacer)
            subprocess.run(["python", "../actualizar_cerebro.py"], capture_output=True)
            
            self.app.update_status("✅ Bot configurado y en línea", "green")
        except:
            self.app.update_status("⚠️ Guardado, pero falla sincro con n8n", "yellow")

    def cargar_configuracion(self):
        """Cargar configuración desde archivo JSON"""
        try:
            if self.config_file.exists():
                with open(self.config_file, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error al cargar configuración: {e}")

        # Configuración por defecto
        return {
            "empresa": "Punto A",
            "nombre_agente": "Asistente Virtual",
            "tono": "Amable",
            "saludo_inicial": "Hola! Soy {agente} de {empresa}. ¿En qué puedo ayudarte?",
            "opciones_menu": []
        }

    def probar_menu(self):
        """Probar el menú actual"""
        from tkinter import messagebox
        texto = f"{self.saludo_text.get('1.0', 'end-1c')}\n\n"
        for opt in self.menu_options:
            texto += f"{opt['numero'].get()} - {opt['nombre'].get()}\n"
        
        messagebox.showinfo("Vista Previa del Menú", texto)

    def reset_valores(self):
        """Resetear a valores por defecto"""
        self.empresa_entry.delete(0, 'end')
        self.empresa_entry.insert(0, "Punto A")
        self.agente_entry.delete(0, 'end')
        self.agente_entry.insert(0, "Asistente Virtual")
        self.tono_combo.set("Amable")
        self.saludo_text.delete("1.0", "end")
        self.saludo_text.insert("1.0", "Hola! Soy {agente} de {empresa}. ¿En qué puedo ayudarte?")
        self.app.update_status("Formulario reseteado (Reinicia la app para limpiar botones extra)", "blue")
