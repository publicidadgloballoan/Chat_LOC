"""
Tab 4: Configuración A3 - Templates de Tickets
Crear y gestionar templates personalizados de tickets (soporte, ventas, etc.)
"""
import customtkinter as ctk
from tkinter import ttk
import json
from pathlib import Path


class ConfigA3Window:
    def __init__(self, parent, app):
        self.parent = parent
        self.app = app
        self.config_file = Path("../config/config_a3.json")
        self.templates = []
        self.template_actual = None

        # Layout principal
        parent.grid_columnconfigure(0, weight=0)
        parent.grid_columnconfigure(1, weight=1)
        parent.grid_rowconfigure(0, weight=1)

        # Panel izquierdo: Lista de templates
        self._crear_panel_lista(parent)

        # Panel derecho: Editor de template
        self._crear_panel_editor(parent)

        # Cargar templates existentes
        self.cargar_templates()

    def _crear_panel_lista(self, parent):
        """Panel izquierdo con lista de templates"""
        list_frame = ctk.CTkFrame(parent, width=300)
        list_frame.grid(row=0, column=0, padx=(10, 5), pady=10, sticky="nsew")
        list_frame.grid_columnconfigure(0, weight=1)
        list_frame.grid_rowconfigure(1, weight=1)
        list_frame.grid_propagate(False)

        # Header
        header_frame = ctk.CTkFrame(list_frame)
        header_frame.grid(row=0, column=0, padx=5, pady=5, sticky="ew")

        ctk.CTkLabel(header_frame, text="🎫 Templates", font=("Arial", 14, "bold")).pack(side="left", padx=10, pady=10)

        add_btn = ctk.CTkButton(
            header_frame,
            text="➕",
            command=self.nuevo_template,
            width=40,
            height=30
        )
        add_btn.pack(side="right", padx=10, pady=10)

        # Lista de templates
        self.template_listbox = ctk.CTkScrollableFrame(list_frame, width=280)
        self.template_listbox.grid(row=1, column=0, padx=5, pady=(0, 5), sticky="nsew")

        self.template_buttons = []

    def _crear_panel_editor(self, parent):
        """Panel derecho con editor de template"""
        editor_frame = ctk.CTkFrame(parent)
        editor_frame.grid(row=0, column=1, padx=(5, 10), pady=10, sticky="nsew")
        editor_frame.grid_columnconfigure(0, weight=1)
        editor_frame.grid_rowconfigure(2, weight=1)

        # Header
        ctk.CTkLabel(editor_frame, text="✏️ Editor de Template", font=("Arial", 16, "bold")).grid(
            row=0, column=0, padx=10, pady=10, sticky="w"
        )

        # Información básica del template
        info_frame = ctk.CTkFrame(editor_frame)
        info_frame.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="ew")
        info_frame.grid_columnconfigure(1, weight=1)

        # Nombre del template
        ctk.CTkLabel(info_frame, text="Nombre del Template:").grid(row=0, column=0, padx=10, pady=5, sticky="w")
        self.template_nombre_entry = ctk.CTkEntry(info_frame, width=300, placeholder_text="ej: Venta, Soporte, Reparación")
        self.template_nombre_entry.grid(row=0, column=1, padx=10, pady=5, sticky="w")

        # Tipo
        ctk.CTkLabel(info_frame, text="Tipo:").grid(row=1, column=0, padx=10, pady=5, sticky="w")
        self.template_tipo_combo = ctk.CTkComboBox(
            info_frame,
            values=["Venta", "Soporte Técnico", "Consulta", "Reclamo", "Otro"],
            width=200
        )
        self.template_tipo_combo.grid(row=1, column=1, padx=10, pady=5, sticky="w")

        # Prioridad
        ctk.CTkLabel(info_frame, text="Prioridad:").grid(row=2, column=0, padx=10, pady=5, sticky="w")
        self.template_prioridad_combo = ctk.CTkComboBox(
            info_frame,
            values=["Baja", "Media", "Alta", "Urgente"],
            width=150
        )
        self.template_prioridad_combo.set("Media")
        self.template_prioridad_combo.grid(row=2, column=1, padx=10, pady=5, sticky="w")

        # Campos del template
        campos_frame = ctk.CTkScrollableFrame(editor_frame, width=750, height=450)
        campos_frame.grid(row=2, column=0, padx=10, pady=(0, 10), sticky="nsew")
        campos_frame.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(campos_frame, text="📝 Campos del Template", font=("Arial", 14, "bold")).grid(
            row=0, column=0, padx=10, pady=10, sticky="w"
        )

        # Contenedor para campos dinámicos
        self.campos_container = ctk.CTkFrame(campos_frame)
        self.campos_container.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="ew")
        self.campos_container.grid_columnconfigure(0, weight=1)

        self.campos_widgets = []

        # Botón para agregar campo
        add_campo_btn = ctk.CTkButton(
            campos_frame,
            text="➕ Agregar Campo",
            command=self.agregar_campo,
            width=150
        )
        add_campo_btn.grid(row=2, column=0, padx=10, pady=10, sticky="w")

        # Instrucciones IA
        ia_frame = ctk.CTkFrame(campos_frame)
        ia_frame.grid(row=3, column=0, padx=10, pady=10, sticky="ew")
        ctk.CTkLabel(ia_frame, text="🤖 Instrucciones para la IA (Validación):", font=("Arial", 12, "bold")).grid(row=0, column=0, padx=10, pady=5, sticky="w")
        self.instrucciones_ia_text = ctk.CTkTextbox(ia_frame, width=700, height=80)
        self.instrucciones_ia_text.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="ew")
        self.instrucciones_ia_text.insert("1.0", "Solicita los datos requeridos de forma amable. Valida que el email tenga @ y el teléfono sea numérico.")

        # Botones finales
        btn_frame = ctk.CTkFrame(editor_frame)
        btn_frame.grid(row=3, column=0, padx=10, pady=(0, 10), sticky="ew")

        guardar_btn = ctk.CTkButton(
            btn_frame,
            text="💾 Guardar Template",
            command=self.guardar_template,
            width=160,
            height=40,
            font=("Arial", 13, "bold"),
            fg_color="green",
            hover_color="darkgreen"
        )
        guardar_btn.grid(row=0, column=0, padx=5, pady=5)

        eliminar_btn = ctk.CTkButton(
            btn_frame,
            text="🗑️ Eliminar",
            command=self.eliminar_template,
            width=120,
            height=40,
            fg_color="red",
            hover_color="darkred"
        )
        eliminar_btn.grid(row=0, column=1, padx=5, pady=5)

        probar_btn = ctk.CTkButton(
            btn_frame,
            text="🧪 Probar Template",
            command=self.probar_template,
            width=140,
            height=40
        )
        probar_btn.grid(row=0, column=2, padx=5, pady=5)

    def agregar_campo(self):
        """Agregar un nuevo campo al template"""
        row = len(self.campos_widgets)
        campo_frame = ctk.CTkFrame(self.campos_container)
        campo_frame.grid(row=row, column=0, padx=5, pady=5, sticky="ew")
        campo_frame.grid_columnconfigure(1, weight=1)
        ctk.CTkLabel(campo_frame, text="Campo:").grid(row=0, column=0, padx=5, pady=5)
        nombre_entry = ctk.CTkEntry(campo_frame, width=150, placeholder_text="ej: producto")
        nombre_entry.grid(row=0, column=1, padx=5, pady=5, sticky="w")
        tipo_combo = ctk.CTkComboBox(campo_frame, values=["Texto", "Número", "Email", "Teléfono", "Fecha", "Sí/No"], width=120)
        tipo_combo.grid(row=0, column=3, padx=5, pady=5)
        requerido_check = ctk.CTkCheckBox(campo_frame, text="Requerido")
        requerido_check.grid(row=0, column=4, padx=5, pady=5)
        del_btn = ctk.CTkButton(campo_frame, text="❌", command=lambda: self.eliminar_campo(campo_frame), width=40, fg_color="red")
        del_btn.grid(row=0, column=5, padx=5, pady=5)
        self.campos_widgets.append({"frame": campo_frame, "nombre": nombre_entry, "tipo": tipo_combo, "requerido": requerido_check})

    def eliminar_campo(self, frame):
        frame.destroy()
        self.campos_widgets = [c for c in self.campos_widgets if c["frame"] != frame]

    def nuevo_template(self):
        self.template_actual = None
        self.template_nombre_entry.delete(0, "end")
        self.template_tipo_combo.set("Venta")
        self.template_prioridad_combo.set("Media")
        self.instrucciones_ia_text.delete("1.0", "end")
        for campo in self.campos_widgets: campo["frame"].destroy()
        self.campos_widgets = []
        self.agregar_campo()
        self.app.update_status("Nuevo template creado", "blue")

    def guardar_template(self):
        nombre = self.template_nombre_entry.get()
        if not nombre: return
        template = {
            "nombre": nombre,
            "tipo": self.template_tipo_combo.get(),
            "prioridad": self.template_prioridad_combo.get(),
            "instrucciones_ia": self.instrucciones_ia_text.get("1.0", "end-1c"),
            "campos": []
        }
        for campo in self.campos_widgets:
            template["campos"].append({"nombre": campo["nombre"].get(), "tipo": campo["tipo"].get(), "requerido": campo["requerido"].get()})
        if self.template_actual is not None: self.templates[self.template_actual] = template
        else: self.templates.append(template)
        self.guardar_config(); self.actualizar_lista_templates(); self.app.update_status(f"Template '{nombre}' guardado", "green")

    def eliminar_template(self):
        if self.template_actual is not None:
            del self.templates[self.template_actual]
            self.guardar_config(); self.actualizar_lista_templates(); self.nuevo_template()

    def cargar_templates(self):
        try:
            if self.config_file.exists():
                with open(self.config_file, "r", encoding="utf-8") as f:
                    self.templates = json.load(f).get("templates", [])
                    self.actualizar_lista_templates()
        except: pass
        if not self.templates: self.nuevo_template()

    def actualizar_lista_templates(self):
        for btn in self.template_buttons: btn.destroy()
        self.template_buttons = []
        for idx, t in enumerate(self.templates):
            btn = ctk.CTkButton(self.template_listbox, text=f"🎫 {t['nombre']}", command=lambda i=idx: self.cargar_template(i), anchor="w", height=35)
            btn.pack(fill="x", padx=5, pady=2); self.template_buttons.append(btn)

    def cargar_template(self, index):
        self.template_actual = index
        t = self.templates[index]
        self.template_nombre_entry.delete(0, "end"); self.template_nombre_entry.insert(0, t["nombre"])
        self.template_tipo_combo.set(t["tipo"]); self.template_prioridad_combo.set(t["prioridad"])
        self.instrucciones_ia_text.delete("1.0", "end"); self.instrucciones_ia_text.insert("1.0", t.get("instrucciones_ia", ""))
        for c in self.campos_widgets: c["frame"].destroy()
        self.campos_widgets = []
        for c in t["campos"]:
            self.agregar_campo()
            self.campos_widgets[-1]["nombre"].insert(0, c["nombre"])
            self.campos_widgets[-1]["tipo"].set(c["tipo"])
            if c["requerido"]: self.campos_widgets[-1]["requerido"].select()

    def guardar_config(self):
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_file, "w", encoding="utf-8") as f: json.dump({"templates": self.templates}, f, indent=2, ensure_ascii=False)

    def probar_template(self):
        self.app.update_status("Simulación de ticket generada", "green")
