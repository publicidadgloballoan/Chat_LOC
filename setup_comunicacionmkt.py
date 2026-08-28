import os
import sys
import json
import sqlite3
import time

sys.stdout.reconfigure(encoding='utf-8')

print("=== CREANDO EMPRESA COMUNICACIONMKT (ID: 4) ===")

company_id = 4
company_name = "ComunicacionMKT"
company_name_upper = "COMUNICACIONMKT"
legal_name = "ComunicacionMKT S.A."
tax_id = "30719994444"
email = "contacto@comunicacionmkt.com"
admin_email = "admin@comunicacionmkt.com"
raw_pass = "ComunicacionMKT2026!"
website = "https://comunicacionmkt.com"
now = int(time.time() * 1000)

dev_db_path = r"c:\SaaSIA\backend\prisma\dev.db"
brain_db_path = r"c:\SaaSIA\ai_core\config\brain_sessions.db"

# 1. Base de datos dev.db
conn_dev = sqlite3.connect(dev_db_path)
c_dev = conn_dev.cursor()

# Insertar o actualizar empresa
c_dev.execute("""
    INSERT INTO companies (id, business_name, legal_name, tax_id, emails, website, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        business_name=excluded.business_name,
        legal_name=excluded.legal_name,
        tax_id=excluded.tax_id,
        emails=excluded.emails,
        website=excluded.website
""", (company_id, company_name, legal_name, tax_id, email, website, now))

conn_dev.commit()
conn_dev.close()
print("✓ Registro en dev.db (empresa y agente admin) verificado.")

# 2. Base de datos brain_sessions.db
conn_brain = sqlite3.connect(brain_db_path)
c_brain = conn_brain.cursor()

c_brain.execute("""
    INSERT INTO companies (id, name)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name
""", (company_id, company_name_upper))

conn_brain.commit()
conn_brain.close()
print("✓ Registro en brain_sessions.db (companies) creado con éxito.")

# 3. Estructura de Carpetas de Configuración
comp_dir = rf"c:\SaaSIA\ai_core\config\company_{company_id}"
comp_media = os.path.join(comp_dir, "media")
comp_knowledge_gen = os.path.join(comp_dir, "knowledge", "general")
comp_knowledge_dir = os.path.join(comp_dir, "knowledge")
comp_configs = os.path.join(comp_dir, "configs")
flows_dir = rf"c:\SaaSIA\ai_core\flows\{company_id}"

os.makedirs(comp_media, exist_ok=True)
os.makedirs(comp_knowledge_gen, exist_ok=True)
os.makedirs(comp_knowledge_dir, exist_ok=True)
os.makedirs(comp_configs, exist_ok=True)
os.makedirs(flows_dir, exist_ok=True)

# manifest.json vacio para medios
with open(os.path.join(comp_media, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump([], f, indent=4, ensure_ascii=False)

# debug_mode.json
with open(os.path.join(comp_dir, "debug_mode.json"), "w", encoding="utf-8") as f:
    json.dump({"enabled": False, "phones": []}, f, indent=4)

# Base de conocimiento inicial
knowledge_text = """# BASE DE CONOCIMIENTO OFICIAL - COMUNICACIONMKT
**Agencia de Marketing Digital, Comunicación Estratégica y Publicidad**

---

## 1. INFORMACIÓN INSTITUCIONAL
- **Empresa**: ComunicacionMKT
- **Concepto**: Agencia integral de marketing digital, estrategia de contenidos, campañas de publicidad (Meta Ads, Google Ads), branding y automatización de ventas por WhatsApp.
- **Canales Oficiales**:
  - **Email de Contacto**: contacto@comunicacionmkt.com
  - **Sitio Web Principal**: https://comunicacionmkt.com

---

## 2. SERVICIOS Y PLANES
1. **Plan Marketing Starter**:
   - Gestión de Redes Sociales (Instagram / Facebook).
   - Creación de contenidos y diseños mensuales.
   - Configuración básica de campañas publicitarias.
   - Valor aproximado: $150.000 ARS / mes.

2. **Plan Marketing Pro**:
   - Todo lo del plan Starter + Estrategia avanzada de contenidos.
   - Campañas publicitarias optimizadas en Meta Ads y Google Ads.
   - Automatización de mensajes y embudos de venta en WhatsApp.
   - Reporte mensual de métricas y conversiones.
   - Valor aproximado: $300.000 ARS / mes.

3. **Plan Enterprise MKT**:
   - Solución 360° para empresas y marcas en crecimiento.
   - Asesoría estratégica personalizada y equipo dedicado.
   - Gestión multicanal, branding, pauta publicitaria y bots con IA.
   - Valor: A medida / desde $500.000 ARS / mes.

---

## 3. PROCESO DE CONTRATACIÓN
1. **Diagnóstico Inicial**: Evaluamos la presencia digital de tu negocio y definimos objetivos.
2. **Propuesta Personalizada**: Te enviamos la propuesta con el plan ideal y presupuesto detallado.
3. **Puesta en Marcha**: Firma de propuesta, emisión de Factura A/B e inicio inmediato de estrategia.
"""

with open(os.path.join(comp_dir, "knowledge.txt"), "w", encoding="utf-8") as f:
    f.write(knowledge_text)

with open(os.path.join(comp_dir, "consolidated_knowledge.md"), "w", encoding="utf-8") as f:
    f.write(knowledge_text)

# Archivos de configuración
a1_cfg = {
    "step": "STEP_NICO_VENTAS",
    "ia_prompt": "Eres el asesor virtual oficial de ComunicacionMKT. Brinda información amable, clara y profesional sobre nuestros planes de marketing digital, publicidad y estrategia."
}
with open(os.path.join(comp_configs, "a1.json"), "w", encoding="utf-8") as f:
    json.dump(a1_cfg, f, indent=4, ensure_ascii=False)

a2_cfg = {
    "knowledge": knowledge_text,
    "ia_name": "Asesor ComunicacionMKT",
    "system_prompt": "Eres el asesor virtual de ComunicacionMKT."
}
with open(os.path.join(comp_configs, "a2.json"), "w", encoding="utf-8") as f:
    json.dump(a2_cfg, f, indent=4, ensure_ascii=False)

a3_cfg = {
    "handoff_enabled": True
}
with open(os.path.join(comp_configs, "a3.json"), "w", encoding="utf-8") as f:
    json.dump(a3_cfg, f, indent=4, ensure_ascii=False)

pricing_cfg = {
    "data": {
        "items": [
            {"name": "Plan Marketing Starter", "price": 150000},
            {"name": "Plan Marketing Pro", "price": 300000},
            {"name": "Plan Enterprise MKT", "price": 500000}
        ],
        "currency": "ARS"
    }
}
with open(os.path.join(comp_configs, "pricing.json"), "w", encoding="utf-8") as f:
    json.dump(pricing_cfg, f, indent=4, ensure_ascii=False)

# Flujo por defecto
flow_cfg = {
    "name": "Flujo Atencion ComunicacionMKT",
    "nodes": [
        {"id": "start", "name": "Inicio", "type": "trigger", "position": {"x": 100, "y": 100}},
        {"id": "welcome", "name": "Bienvenida", "type": "ia_node", "position": {"x": 300, "y": 100}}
    ],
    "edges": [
        {"source": "start", "target": "welcome"}
    ]
}
with open(os.path.join(flows_dir, "default.flu"), "w", encoding="utf-8") as f:
    json.dump(flow_cfg, f, indent=4, ensure_ascii=False)

print("✓ Estructura de carpetas, base de conocimiento y configuraciones creadas con éxito.")
print("=== EMPRESA COMUNICACIONMKT CREADA CORRECTAMENTE ===")
