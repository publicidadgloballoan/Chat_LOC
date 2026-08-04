# Guía: Crear y Configurar la Meta App para SaaSIA

**App pública:** `smart-box.com.ar` → subdominio `relay.smart-box.com.ar`

> Esta guía cubre la creación desde cero de la Meta App que habilita
> WhatsApp Business API, Messenger e Instagram Messaging en SaaSIA.

---

## Requisitos previos

- [ ] Relay corriendo: `https://relay.smart-box.com.ar/health` responde `{"status":"ok"}`
- [ ] Cuenta de Facebook personal (para crear la app)
- [ ] Número de teléfono para WhatsApp Business (puede ser el mismo que ya usás con Baileys, pero **primero desconectalo de Baileys**)
- [ ] Página de Facebook (para Messenger/Instagram)
- [ ] Cuenta de Instagram Business conectada a la página de Facebook

---

## Paso 1: Crear la Meta App

1. Ir a **https://developers.facebook.com/apps**
2. Click en **"Crear app"**
3. Tipo de app: **"Business"** (o "Empresa")
4. Completar:
   - Nombre de la app: `SaaSIA`
   - Email de contacto: tu email
   - Business Portfolio: si tenés uno, sino continúa sin él
5. Click **"Crear app"**

---

## Paso 2: Agregar WhatsApp al app

1. En el dashboard del app → **"Agregar productos"**
2. Buscar **"WhatsApp"** → click **"Configurar"**
3. Asociar tu **Business Manager** (o crear uno)

### 2.1 Configurar número de teléfono

En **WhatsApp → Configuración de API**:

1. Click **"Agregar número de teléfono"**
2. Ingresar el número y verificar con SMS/llamada
3. Una vez verificado, copiá:
   - **Phone Number ID** (ejemplo: `123456789012345`)
   - **WhatsApp Business Account ID**

### 2.2 Obtener token permanente

> ⚠️ El token del dashboard expira en 24h. Para producción necesitás un **System User Token**.

**Opción rápida (test):**
- En "WhatsApp → Configuración de API" → copiar el token temporal

**Opción producción (recomendada):**
1. Ir a **Business Manager** → Configuración → **Usuarios del sistema**
2. Crear usuario del sistema: rol **"Admin"**
3. Click **"Generar token"** → Seleccionar la app → Permisos:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Copiar el token (¡no expira!)

### 2.3 Configurar Webhook de WhatsApp

En **WhatsApp → Configuración de API → Webhooks**:

1. Click **"Editar"**
2. URL de devolución de llamada:
   ```
   https://relay.smart-box.com.ar/webhook/meta
   ```
3. Token de verificación:
   ```
   SIA-META-VERIFY-2026
   ```
4. Click **"Verificar y guardar"** (debe responder OK ✅)
5. Suscribir a los campos:
   - ✅ `messages`
   - ✅ `message_deliveries`
   - ✅ `message_reads`

---

## Paso 3: Agregar Messenger al app

1. En el dashboard → **"Agregar productos"** → **"Messenger"** → Configurar

### 3.1 Generar Page Access Token

1. En **Messenger → Configuración de la API**
2. Seleccionar tu **Página de Facebook**
3. Click **"Generar token"** → copiarlo (expira en ~60 días salvo token permanente)
4. Para token permanente: usar **System User** del Business Manager (igual que WA)

### 3.2 Configurar Webhook de Messenger

En **Messenger → Configuración de la API → Webhooks**:

1. URL:
   ```
   https://relay.smart-box.com.ar/webhook/meta
   ```
2. Token de verificación:
   ```
   SIA-META-VERIFY-2026
   ```
3. Suscribir campos:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `message_deliveries`
4. Agregar la Página a los webhooks suscriptos

---

## Paso 4: Agregar Instagram al app

> Requiere: Página de Facebook con Instagram Business conectada

1. En el dashboard → **"Agregar productos"** → **"Instagram"** → Configurar

### 4.1 Conectar cuenta de Instagram

1. En **Instagram → Configuración**
2. Agregar la cuenta de Instagram Business
3. Copiar el **Instagram Account ID** (ejemplo: `17841401234567890`)

### 4.2 Configurar Webhook de Instagram

En **Instagram → Webhooks**:

1. URL:
   ```
   https://relay.smart-box.com.ar/webhook/meta
   ```
2. Token: `SIA-META-VERIFY-2026`
3. Suscribir:
   - ✅ `messages`
   - ✅ `messaging_postbacks`

---

## Paso 5: Conectar en SaaSIA

Una vez que tenés los tokens, conectar las instancias via API:

### WhatsApp
```bash
curl -X POST http://localhost:4000/channels/connect/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "botName": "mi_bot_wa",
    "companyId": 1,
    "credentials": {
      "type": "whatsapp",
      "phone_number_id": "TU_PHONE_NUMBER_ID",
      "access_token": "TU_ACCESS_TOKEN",
      "business_account_id": "TU_WABA_ID"
    }
  }'
```

### Messenger
```bash
curl -X POST http://localhost:4000/channels/connect/messenger \
  -H "Content-Type: application/json" \
  -d '{
    "botName": "mi_bot_fb",
    "companyId": 1,
    "credentials": {
      "type": "messenger",
      "page_id": "TU_PAGE_ID",
      "page_access_token": "TU_PAGE_TOKEN",
      "access_token": "TU_PAGE_TOKEN"
    }
  }'
```

### Instagram
```bash
curl -X POST http://localhost:4000/channels/connect/instagram \
  -H "Content-Type: application/json" \
  -d '{
    "botName": "mi_bot_ig",
    "companyId": 1,
    "credentials": {
      "type": "instagram",
      "instagram_account_id": "TU_IG_ACCOUNT_ID",
      "page_id": "TU_PAGE_ID",
      "page_access_token": "TU_PAGE_TOKEN",
      "access_token": "TU_PAGE_TOKEN"
    }
  }'
```

---

## Paso 6: Publicar la app (modo Live)

> En modo **Development**, los webhooks solo funcionan para cuentas de test.
> Para recibir mensajes de usuarios reales, la app debe estar en **modo Live**.

1. En el dashboard del app → arriba dice **"Modo de desarrollo"**
2. Click en el toggle para cambiar a **"Activo / Live"**
3. Meta puede pedir una revisión para permisos avanzados

**Permisos que necesitan revisión:**
- `whatsapp_business_messaging` — revisar solo si app nueva
- `pages_messaging` — para Messenger real
- `instagram_manage_messages` — para Instagram real

---

## Resumen de valores a guardar

| Variable | Descripción | Dónde conseguirlo |
|---|---|---|
| `phone_number_id` | ID del número WA | WhatsApp → Config API |
| `business_account_id` | WABA ID | WhatsApp → Config API |
| `access_token` (WA) | Token permanente | System User del Business Manager |
| `page_id` | ID de la página FB | Messenger → Config API |
| `page_access_token` | Token de la página | Messenger → Config API |
| `instagram_account_id` | ID cuenta IG | Instagram → Config |
| `META_VERIFY_TOKEN` | Token verificación webhook | Ya configurado: `SIA-META-VERIFY-2026` |

---

## Test rápido del webhook

```powershell
# Verificar que el relay responde correctamente a Meta
curl "https://relay.smart-box.com.ar/webhook/meta?hub.mode=subscribe&hub.verify_token=SIA-META-VERIFY-2026&hub.challenge=TEST123"
# Debe responder: TEST123
```

```powershell
# Verificar instancias conectadas al meta_service
curl -H "apikey: PICE-SAAS-DEFAULT-KEY-2026" http://localhost:8080/debug/instances
```
