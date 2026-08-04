require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 7010;
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'SIA-META-VERIFY-2026';
const RELAY_API_KEY = process.env.RELAY_API_KEY || 'PICE-SAAS-DEFAULT-KEY-2026';

// ============================================================
// REGISTRO DE INSTANCIAS CONECTADAS VIA WEBSOCKET
// ============================================================
// Estructura:
//   instanceRegistry[instanceName] = { ws, phoneNumberIds: [], pageIds: [], igAccountIds: [] }
const instanceRegistry = {};

// Índice inverso: phone_number_id / page_id / ig_account_id → instanceName
const phoneIndex = {};   // phone_number_id → instanceName
const pageIndex = {};    // page_id → instanceName
const igIndex = {};      // ig_account_id → instanceName

function registerInstance(instanceName, config, ws) {
  // Limpiar registro viejo si existía
  unregisterInstance(instanceName);

  instanceRegistry[instanceName] = { ws, ...config };

  if (config.phoneNumberIds) {
    for (const id of config.phoneNumberIds) {
      phoneIndex[id] = instanceName;
    }
  }
  if (config.pageIds) {
    for (const id of config.pageIds) {
      pageIndex[id] = instanceName;
    }
  }
  if (config.igAccountIds) {
    for (const id of config.igAccountIds) {
      igIndex[id] = instanceName;
    }
  }

  console.log(`[RELAY] ✅ Instancia registrada: ${instanceName}`, {
    phoneNumberIds: config.phoneNumberIds,
    pageIds: config.pageIds,
    igAccountIds: config.igAccountIds
  });
}

function unregisterInstance(instanceName) {
  const existing = instanceRegistry[instanceName];
  if (!existing) return;

  if (existing.phoneNumberIds) {
    for (const id of existing.phoneNumberIds) delete phoneIndex[id];
  }
  if (existing.pageIds) {
    for (const id of existing.pageIds) delete pageIndex[id];
  }
  if (existing.igAccountIds) {
    for (const id of existing.igAccountIds) delete igIndex[id];
  }

  delete instanceRegistry[instanceName];
  console.log(`[RELAY] ❌ Instancia desregistrada: ${instanceName}`);
}

function pushToInstance(instanceName, event) {
  const entry = instanceRegistry[instanceName];
  if (!entry || entry.ws.readyState !== WebSocket.OPEN) {
    console.warn(`[RELAY] ⚠️  Instancia ${instanceName} no conectada o WS cerrado`);
    return false;
  }
  entry.ws.send(JSON.stringify(event));
  return true;
}

// ============================================================
// WEBSOCKET SERVER  (instancias locales conectan aqui)
// ============================================================
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  let registeredName = null;

  console.log(`[RELAY-WS] Nueva conexion WS desde ${req.socket.remoteAddress}`);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      // Mensaje de registro: la instancia local se identifica y declara sus IDs
      if (msg.type === 'register') {
        const { instanceName, apiKey, phoneNumberIds = [], pageIds = [], igAccountIds = [] } = msg;

        if (apiKey !== RELAY_API_KEY) {
          ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
          ws.close();
          return;
        }

        registeredName = instanceName;
        registerInstance(instanceName, { phoneNumberIds, pageIds, igAccountIds }, ws);
        ws.send(JSON.stringify({ type: 'registered', instanceName }));
        return;
      }

      // Ping / keepalive
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

    } catch (e) {
      console.error('[RELAY-WS] Error parseando mensaje:', e.message);
    }
  });

  ws.on('close', () => {
    if (registeredName) {
      unregisterInstance(registeredName);
    }
    console.log(`[RELAY-WS] Conexion cerrada: ${registeredName || 'sin registrar'}`);
  });

  ws.on('error', (err) => {
    console.error(`[RELAY-WS] Error en WS (${registeredName}):`, err.message);
  });
});

// ============================================================
// ENDPOINTS HTTP
// ============================================================

// ── Verificación de webhook Meta (GET) ──────────────────────
// Meta llama a esto cuando configurás el webhook en el Dashboard
app.get('/webhook/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`[RELAY] Meta webhook verification: mode=${mode}, token=${token}`);

  if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
    console.log('[RELAY] ✅ Webhook verificado por Meta');
    return res.status(200).send(challenge);
  }

  console.warn('[RELAY] ❌ Verificación de webhook fallida');
  return res.status(403).json({ error: 'Forbidden — verify_token no coincide' });
});

// ── Recepción de eventos Meta (POST) ────────────────────────
// Meta manda todos los eventos aqui: WA, Messenger, Instagram
app.post('/webhook/meta', (req, res) => {
  // Responder 200 INMEDIATAMENTE (Meta requiere < 5 seg o reintenta)
  res.status(200).send('EVENT_RECEIVED');

  const body = req.body;
  if (!body || !body.object) return;

  console.log(`[RELAY] 📥 Evento Meta recibido: object=${body.object}`);

  // ── WhatsApp ────────────────────────────────────────────────
  if (body.object === 'whatsapp_business_account') {
    for (const entry of (body.entry || [])) {
      for (const change of (entry.changes || [])) {
        if (change.field !== 'messages') continue;
        const value = change.value;
        const phoneNumberId = value?.metadata?.phone_number_id;

        if (!phoneNumberId) continue;

        const instanceName = phoneIndex[phoneNumberId];
        if (!instanceName) {
          console.warn(`[RELAY] ⚠️  phone_number_id ${phoneNumberId} no tiene instancia registrada`);
          continue;
        }

        // Pushear cada mensaje individual
        for (const message of (value.messages || [])) {
          const event = {
            type: 'whatsapp_message',
            instanceName,
            phoneNumberId,
            from: message.from,
            messageId: message.id,
            timestamp: message.timestamp,
            message,
            contacts: value.contacts || [],
            metadata: value.metadata
          };
          pushToInstance(instanceName, event);
          console.log(`[RELAY] → WA message routed to ${instanceName} (from ${message.from})`);
        }

        // Status updates (delivered, read, etc)
        for (const status of (value.statuses || [])) {
          const event = {
            type: 'whatsapp_status',
            instanceName,
            phoneNumberId,
            status
          };
          pushToInstance(instanceName, event);
        }
      }
    }
    return;
  }

  // ── Facebook Messenger ──────────────────────────────────────
  if (body.object === 'page') {
    for (const entry of (body.entry || [])) {
      const pageId = entry.id;
      const instanceName = pageIndex[pageId];

      if (!instanceName) {
        console.warn(`[RELAY] ⚠️  page_id ${pageId} no tiene instancia registrada`);
        continue;
      }

      for (const messagingEvent of (entry.messaging || [])) {
        const event = {
          type: 'messenger_message',
          instanceName,
          pageId,
          senderId: messagingEvent.sender?.id,
          recipientId: messagingEvent.recipient?.id,
          timestamp: messagingEvent.timestamp,
          messaging: messagingEvent
        };
        pushToInstance(instanceName, event);
        console.log(`[RELAY] → Messenger message routed to ${instanceName} (from ${messagingEvent.sender?.id})`);
      }
    }
    return;
  }

  // ── Instagram ───────────────────────────────────────────────
  if (body.object === 'instagram') {
    for (const entry of (body.entry || [])) {
      const igAccountId = entry.id;
      const instanceName = igIndex[igAccountId];

      if (!instanceName) {
        console.warn(`[RELAY] ⚠️  ig_account_id ${igAccountId} no tiene instancia registrada`);
        continue;
      }

      for (const messagingEvent of (entry.messaging || [])) {
        const event = {
          type: 'instagram_message',
          instanceName,
          igAccountId,
          senderId: messagingEvent.sender?.id,
          recipientId: messagingEvent.recipient?.id,
          timestamp: messagingEvent.timestamp,
          messaging: messagingEvent
        };
        pushToInstance(instanceName, event);
        console.log(`[RELAY] → IG message routed to ${instanceName} (from ${messagingEvent.sender?.id})`);
      }
    }
    return;
  }

  console.log(`[RELAY] Objeto desconocido: ${body.object}`);
});

// ── Status del relay (para monitoreo) ───────────────────────
app.get('/relay/status', (req, res) => {
  const apiKey = req.headers['apikey'];
  if (apiKey !== RELAY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const instances = Object.entries(instanceRegistry).map(([name, info]) => ({
    instanceName: name,
    connected: info.ws.readyState === WebSocket.OPEN,
    phoneNumberIds: info.phoneNumberIds,
    pageIds: info.pageIds,
    igAccountIds: info.igAccountIds
  }));

  return res.json({
    status: 'ok',
    connectedInstances: instances.length,
    instances,
    phoneIndex,
    pageIndex,
    igIndex
  });
});

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'meta-relay',
    uptime: process.uptime(),
    connectedInstances: Object.keys(instanceRegistry).length
  });
});

// ============================================================
// ARRANQUE
// ============================================================
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║        SaaSIA — Meta Relay Server                    ║
║        Puerto: ${PORT}                                    ║
║                                                      ║
║  Endpoints:                                          ║
║    GET  /webhook/meta    ← verificación Meta         ║
║    POST /webhook/meta    ← eventos WA/IG/FB          ║
║    WS   /ws              ← instancias locales        ║
║    GET  /relay/status    ← monitoreo                 ║
║    GET  /health                                      ║
╚══════════════════════════════════════════════════════╝
  `);
  console.log(`[RELAY] META_VERIFY_TOKEN configurado: ${META_VERIFY_TOKEN ? 'SI' : 'NO ⚠️'}`);
});

process.on('uncaughtException', (err) => {
  console.error('[RELAY] Uncaught Exception:', err.stack || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[RELAY] Unhandled Rejection:', reason?.stack || reason);
});
