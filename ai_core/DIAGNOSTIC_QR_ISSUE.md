# Diagnostic Report: Evolution API QR Code Not Generating

##User Issue:
WhatsApp QR code does NOT generate after fixing database environment variables.

## Status
- ✅ docker-compose.yml updated with `DATABASE_SAVE_DATA_INSTANCE: "true"` and other SAVE_DATA vars
- ✅ Evolution API container restarted with new config
- ✅ Baileys library works directly (tested creating socket, got QR in 2 seconds)
- ❌ Evolution API still returns `{"count":0}` on `GET /instance/connect`

## What We Fixed
1. Added missing environment variables in `config/docker-compose.yml`:
   ```yaml
   DATABASE_SAVE_DATA_INSTANCE: "true"
   DATABASE_SAVE_DATA_NEW_MESSAGE: "true"
   DATABASE_SAVE_MESSAGE_UPDATE: "true"
   DATABASE_SAVE_DATA_CONTACTS: "true"
   DATABASE_SAVE_DATA_CHATS: "true"
   ```

## What Works
- WebSocket to wss://web.whatsapp.com/ws/chat: ✅ Works (HTTP 101 upgrade)
- Baileys native test: ✅ QR generated in <2 seconds
- Auth state directory created: ✅ `/evolution/instances/{instanceId}/` exists
- Instance creation: ✅ Instance saved to database with "connecting" state
- `eventHandler()` registered: ✅ Code path exists and `connection.update` event is handled

## Code Paths Traced
1. **createInstance**: Creates `Rs` class (WhatsApp Baileys service)
2. **setInstance**: Sets individual properties, preserves `qrcode: {count:0}`
3. **connectToWhatsapp**: Calls `createClient(phoneNumber)`
4. **defineAuthState**: Returns `zn(instanceId, cache)` - file-system auth state
5. **createClient**: Creates Baileys socket with `makeWASocket(...)`, calls `eventHandler()`
6. **eventHandler**: Registers `client.ev.process()` for `connection.update` events
7. **connectionUpdate**: Processes `{qr, connection, lastDisconnect}` → sets `this.instance.qrcode`

## What's Missing
- No logs from `createClient`:
  - Expected: "Browser: [...]", "Baileys version: X.X.X", "Group Ignore: false"
  - Actual: Only "create instance {...}" log appears
- No QR event:
  - `this.instance.qrcode.count` stays at 0
  - No `qrcode.base64` set

## Hypotheses
1. **defineAuthState may still be broken**: `zn()` might not be returning a compatible auth state structure
2. **Socket not created**: `createClient` might be throwing BEFORE calling `makeWASocket`, error swallowed
3. **Event processing issue**: Baileys socket is created but events aren't being processed correctly
4. **Network delay inside container**: WS connects OK but WhatsApp servers may be timing out/delaying QR

## Next Steps
1. Add DEBUG logging to Evolution API:
   ```yaml
   LOG_BAILEYS: "debug"  # in docker-compose.yml
   LOG_LEVEL: "DEBUG,INFO,LOG,WARN,ERROR"
   ```

2. Test manually calling `defineAuthState` via container:
   ```bash
   docker exec chatbot_punto_a_evolution node -e "
   const path = require('path');
   const cwd = '/evolution';
   const At = path.join(cwd, 'instances');
   const fs = require('fs/promises');
   const baileys = require('baileys');
   const instanceId = '5ee2747c-161d-4f31-8d96-752e0c0eac5d';

   (async () => {
     // This is what zn() does
     const authDir = path.join(At, instanceId);
     await fs.mkdir(authDir, {recursive: true});

     // Now use Baileys' useMultiFileAuthState
     const { state, saveCreds } = await baileys.useMultiFileAuthState(authDir);
     console.log('Auth state OK:', !!state.creds);
   })();
   "
   ```

3. Check if socket creation fails silently:
   ```bash
   docker logs chatbot_punto_a_evolution --follow
   # Then create instance and watch for errors
   ```

4. Upgrade LOG_LEVEL to see full Baileys output and debug messages

## Recommendation
Since we're deep in Evolution API internals, **consider alternatives**:

1. **Switch to a simpler WhatsApp integration**:
   - Use WhatsApp Business API (official, but costs $)
   - Or use Baileys directly without Evolution API wrapper

2. **Open an issue with Evolution API**:
   - This might be a v2.2.3 bug
   - Try Evolution API v2.3.x or v2.1.x

3. **Manual QR workaround**:
   - Get QR from Baileys directly, save to file
   - Show QR in installer GUI from file instead of Evolution API

## Files Modified
- `c:\RouthLocal\punto_a\config\docker-compose.yml`
- `C:\ChatBot_Punto_A\config\docker-compose.yml` (deployed)

## Container Status
```bash
docker ps --filter name=chatbot_punto_a
# chatbot_punto_a_evolution: Running, healthy
# DATABASE_SAVE_DATA_INSTANCE=true confirmed via docker exec ... env
```

---

Date: 2026-04-08
Troubleshooter: Claude Opus 4.6
