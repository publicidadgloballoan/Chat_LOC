# SaaSIA — Meta Relay Server

Servidor de relay que recibe webhooks de Meta (WhatsApp, Messenger, Instagram) y los distribuye a las instancias locales de SaaSIA vía WebSocket.

**URL pública:** `https://relay.smart-box.com.ar`

---

## Arquitectura

```
Meta API → https://relay.smart-box.com.ar/webhook/meta
               ↓ (Cloudflare Tunnel)
           localhost:7010 (este servidor)
               ↓ (WebSocket)
           meta_service local (cada PC cliente)
               ↓ (HTTP)
           nucleo_ia.py
```

---

## Instalación en el servidor de licencias (192.168.1.163 — Windows)

### Paso 1: Instalar Node.js (si no está)
```
https://nodejs.org → descargar LTS → instalar
```

### Paso 2: Instalar dependencias del relay
```powershell
cd C:\SaaSIA\meta_relay
npm install
```

### Paso 3: Configurar variables de entorno
```powershell
copy .env.ejemplo .env
# Editar .env con el Notepad y cambiar META_VERIFY_TOKEN por uno secreto
notepad .env
```

### Paso 4: Configurar Cloudflare + smart-box.com.ar

#### 4.1 Agregar smart-box.com.ar a Cloudflare
1. Ir a https://dash.cloudflare.com → **Add a Site**
2. Ingresar: `smart-box.com.ar` → **Free plan**
3. Cloudflare te dará 2 nameservers, por ejemplo:
   ```
   aria.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```
4. Ir a **NIC.ar** → Mis dominios → `smart-box.com.ar` → **Modificar DNS**
5. Cambiar los nameservers por los de Cloudflare
6. Esperar ~30 minutos para propagación

#### 4.2 Instalar cloudflared en el servidor de licencias
```powershell
# Opción 1: via winget
winget install --id Cloudflare.cloudflared

# Opción 2: usar el .bat incluido
.\setup_cloudflare_tunnel.bat
```

#### 4.3 Crear tunnel
```powershell
# Login (abre navegador)
cloudflared tunnel login

# Crear tunnel con nombre
cloudflared tunnel create saasia-relay

# El comando devuelve un Tunnel ID, guardarlo!
# Ejemplo: a1b2c3d4-5678-abcd-ef01-234567890abc
```

#### 4.4 Crear config del tunnel
Crear archivo: `C:\Users\TU_USUARIO\.cloudflared\config.yml`
```yaml
tunnel: a1b2c3d4-5678-abcd-ef01-234567890abc   # <-- TU TUNNEL ID
credentials-file: C:\Users\TU_USUARIO\.cloudflared\a1b2c3d4-5678-abcd-ef01-234567890abc.json

ingress:
  - hostname: relay.smart-box.com.ar
    service: http://localhost:7010
  - service: http_status:404
```

#### 4.5 Agregar DNS en Cloudflare
```powershell
cloudflared tunnel route dns saasia-relay relay.smart-box.com.ar
```

Esto crea automáticamente el registro DNS `relay.smart-box.com.ar → tunnel` en Cloudflare.

#### 4.6 Instalar como servicio de Windows
```powershell
# Ejecutar como Administrador
cloudflared service install
net start cloudflared
```

Verificar:
```powershell
# El tunnel debe aparecer como HEALTHY
cloudflared tunnel list
```

### Paso 5: Arrancar el relay
```powershell
cd C:\SaaSIA\meta_relay
npm start
```

O instalar como servicio de Windows con NSSM:
```powershell
# Descargar NSSM de https://nssm.cc
nssm install MetaRelayServer "node" "C:\SaaSIA\meta_relay\server.js"
nssm set MetaRelayServer AppDirectory C:\SaaSIA\meta_relay
nssm start MetaRelayServer
```

### Paso 6: Verificar que todo funciona
```powershell
# Test local
curl http://localhost:7010/health

# Test via Cloudflare Tunnel
curl https://relay.smart-box.com.ar/health
```

---

## Configurar Meta App

### URL del Webhook a poner en Meta Dashboard:
```
https://relay.smart-box.com.ar/webhook/meta
```

### Verify Token (el que pusiste en .env):
```
SIA-META-VERIFY-2026
```

### Test de verificación:
```powershell
curl "https://relay.smart-box.com.ar/webhook/meta?hub.mode=subscribe&hub.verify_token=SIA-META-VERIFY-2026&hub.challenge=test123"
# Debe devolver: test123
```

---

## Monitoreo

```powershell
# Ver instancias conectadas
curl -H "apikey: PICE-SAAS-DEFAULT-KEY-2026" https://relay.smart-box.com.ar/relay/status
```

---

## Variables de entorno (.env)

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `PORT` | `7010` | Puerto del servidor relay |
| `META_VERIFY_TOKEN` | `SIA-META-VERIFY-2026` | Token de verificación de webhook Meta |
| `RELAY_API_KEY` | `PICE-SAAS-DEFAULT-KEY-2026` | Clave interna de autenticación |

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del relay |
| GET | `/webhook/meta` | Verificación de webhook Meta |
| POST | `/webhook/meta` | Recepción de eventos Meta |
| WS | `/ws` | Conexión de instancias locales |
| GET | `/relay/status` | Instancias conectadas (requiere apikey) |
