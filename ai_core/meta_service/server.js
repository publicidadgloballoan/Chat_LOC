require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { WebSocket } = require('ws');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================================
// CONFIGURACIÓN
// ============================================================
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.AUTHENTICATION_API_KEY || 'PICE-SAAS-DEFAULT-KEY-2026';
const RELAY_WS_URL = process.env.META_RELAY_WS || 'wss://meta-relay.tudominio.com/ws';
const RELAY_API_KEY = process.env.RELAY_API_KEY || 'PICE-SAAS-DEFAULT-KEY-2026';
const NUCLEO_WEBHOOK_URL = process.env.NUCLEO_WEBHOOK_URL || 'http://localhost:5000/webhook';
const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v20.0';
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

// ============================================================
// REGISTRO DE INSTANCIAS (en memoria)
// ============================================================
// instances[instanceName] = {
//   credentials: { type, phone_number_id?, access_token, page_id?, ig_account_id? },
//   webhookUrl: string,
//   status: 'connected' | 'disconnected'
// }
const instances = {};
const webhooks = {};

// ============================================================
// CLIENTE WEBSOCKET → RELAY
// ============================================================
let wsClient = null;
let wsReconnectTimer = null;

function connectToRelay() {
  if (wsClient && (wsClient.readyState === WebSocket.CONNECTING || wsClient.readyState === WebSocket.OPEN)) {
    return;
  }

  console.log(`[META-SVC] Conectando al relay: ${RELAY_WS_URL}`);

  try {
    wsClient = new WebSocket(RELAY_WS_URL);
  } catch (e) {
    console.error(`[META-SVC] Error creando WebSocket: ${e.message}`);
    scheduleReconnect();
    return;
  }

  wsClient.on('open', () => {
    console.log('[META-SVC] ✅ WebSocket conectado al relay');
    clearTimeout(wsReconnectTimer);

    // Registrar todas las instancias activas al reconectar
    for (const [instanceName, inst] of Object.entries(instances)) {
      if (inst.status === 'connected') {
        registerInstanceOnRelay(instanceName, inst.credentials);
      }
    }

    // Keepalive cada 30s
    const pingInterval = setInterval(() => {
      if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        wsClient.send(JSON.stringify({ type: 'ping' }));
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  });

  wsClient.on('message', (data) => {
    try {
      const event = JSON.parse(data.toString());
      handleRelayEvent(event);
    } catch (e) {
      console.error('[META-SVC] Error parseando evento del relay:', e.message);
    }
  });

  wsClient.on('close', (code, reason) => {
    console.warn(`[META-SVC] WebSocket cerrado (code=${code}). Reconectando en 5s...`);
    scheduleReconnect();
  });

  wsClient.on('error', (err) => {
    console.error(`[META-SVC] Error WebSocket: ${err.message}`);
  });
}

function scheduleReconnect() {
  clearTimeout(wsReconnectTimer);
  wsReconnectTimer = setTimeout(() => {
    console.log('[META-SVC] Reintentando conexion al relay...');
    connectToRelay();
  }, 5000);
}

function registerInstanceOnRelay(instanceName, credentials) {
  if (!wsClient || wsClient.readyState !== WebSocket.OPEN) return;

  const payload = {
    type: 'register',
    instanceName,
    apiKey: RELAY_API_KEY,
    phoneNumberIds: credentials.type === 'whatsapp' ? [credentials.phone_number_id] : [],
    pageIds: (credentials.type === 'messenger' || credentials.type === 'instagram') ? [credentials.page_id] : [],
    igAccountIds: credentials.type === 'instagram' ? [credentials.ig_account_id] : []
  };

  wsClient.send(JSON.stringify(payload));
  console.log(`[META-SVC] Instancia ${instanceName} registrada en relay`);
}

// ============================================================
// MANEJO DE EVENTOS DEL RELAY
// ============================================================
async function handleRelayEvent(event) {
  const { type, instanceName } = event;

  if (type === 'registered') {
    console.log(`[META-SVC] ✅ Relay confirmó registro de: ${instanceName}`);
    return;
  }

  if (type === 'pong') return;

  if (type === 'error') {
    console.error(`[META-SVC] Error del relay: ${event.message}`);
    return;
  }

  // ── WhatsApp message ────────────────────────────────────────
  if (type === 'whatsapp_message') {
    await processWhatsAppMessage(event);
    return;
  }

  // ── Messenger message ───────────────────────────────────────
  if (type === 'messenger_message') {
    await processMessengerMessage(event);
    return;
  }

  // ── Instagram message ───────────────────────────────────────
  if (type === 'instagram_message') {
    await processInstagramMessage(event);
    return;
  }
}

// ── Procesar mensaje de WhatsApp ─────────────────────────────
async function processWhatsAppMessage(event) {
  const { instanceName, message, contacts, metadata } = event;

  // Solo procesar mensajes de texto, imagen, audio, video, documento
  if (!message) return;

  const from = message.from; // número del usuario (sin @)
  const msgId = message.id;
  const timestamp = message.timestamp;
  const contactName = contacts?.[0]?.profile?.name || from;

  // Construir payload en el formato que espera nucleo_ia.py
  // (compatible con el formato que usaba Baileys)
  let conversationText = null;
  let messagePayload = {};

  if (message.type === 'text') {
    conversationText = message.text?.body;
    messagePayload = { conversation: conversationText };
  } else if (message.type === 'image') {
    messagePayload = {
      imageMessage: {
        url: null, // Meta API: descargar con el media_id
        mediaId: message.image?.id,
        mimetype: message.image?.mime_type,
        caption: message.image?.caption || ''
      }
    };
  } else if (message.type === 'audio') {
    messagePayload = {
      audioMessage: {
        mediaId: message.audio?.id,
        mimetype: message.audio?.mime_type || 'audio/ogg'
      }
    };
  } else if (message.type === 'video') {
    messagePayload = {
      videoMessage: {
        mediaId: message.video?.id,
        mimetype: message.video?.mime_type,
        caption: message.video?.caption || ''
      }
    };
  } else if (message.type === 'document') {
    messagePayload = {
      documentMessage: {
        mediaId: message.document?.id,
        mimetype: message.document?.mime_type,
        fileName: message.document?.filename || 'document'
      }
    };
  } else if (message.type === 'interactive') {
    // Respuesta a botones
    const btnReply = message.interactive?.button_reply?.title ||
                     message.interactive?.list_reply?.title || '';
    conversationText = btnReply;
    messagePayload = { conversation: conversationText };
  } else {
    // Tipo no soportado, ignorar
    console.log(`[META-SVC] Tipo de mensaje WA no soportado: ${message.type}`);
    return;
  }

  const webhookPayload = {
    instance: instanceName,
    data: {
      key: {
        remoteJid: `${from}@s.whatsapp.net`,
        fromMe: false,
        id: msgId
      },
      message: messagePayload,
      pushName: contactName,
      messageTimestamp: parseInt(timestamp),
      // Campo extra para que nucleo pueda descargar media via Meta API
      _metaMessage: message,
      _metaPhoneNumberId: metadata?.phone_number_id
    }
  };

  await forwardToNucleo(instanceName, webhookPayload);
}

// ── Procesar mensaje de Messenger ────────────────────────────
async function processMessengerMessage(event) {
  const { instanceName, senderId, messaging } = event;

  if (!messaging.message) return; // ignorar postback, etc. (por ahora)
  const msg = messaging.message;
  if (msg.is_echo) return; // ignorar mensajes propios

  const text = msg.text || '';
  const msgId = msg.mid;

  const webhookPayload = {
    instance: instanceName,
    data: {
      key: {
        remoteJid: `${senderId}@messenger`,
        fromMe: false,
        id: msgId
      },
      message: {
        conversation: text
      },
      pushName: senderId,
      messageTimestamp: Math.floor(messaging.timestamp / 1000),
      _platform: 'messenger'
    }
  };

  await forwardToNucleo(instanceName, webhookPayload);
}

// ── Procesar mensaje de Instagram ────────────────────────────
async function processInstagramMessage(event) {
  const { instanceName, senderId, messaging } = event;

  if (!messaging.message) return;
  const msg = messaging.message;
  if (msg.is_echo) return;

  const text = msg.text || '';
  const msgId = msg.mid;

  const webhookPayload = {
    instance: instanceName,
    data: {
      key: {
        remoteJid: `${senderId}@instagram`,
        fromMe: false,
        id: msgId
      },
      message: {
        conversation: text
      },
      pushName: senderId,
      messageTimestamp: Math.floor(messaging.timestamp / 1000),
      _platform: 'instagram'
    }
  };

  await forwardToNucleo(instanceName, webhookPayload);
}

// ── Forwardear al nucleo IA ───────────────────────────────────
async function forwardToNucleo(instanceName, payload) {
  const targetUrl = webhooks[instanceName] || NUCLEO_WEBHOOK_URL;
  try {
    await axios.post(targetUrl, payload, { timeout: 10000 });
    console.log(`[META-SVC] ✅ Evento forwarded a nucleo (${instanceName})`);
  } catch (e) {
    console.error(`[META-SVC] ❌ Error forwarding a nucleo (${instanceName}): ${e.message}`);
  }
}

// ============================================================
// META GRAPH API — ENVÍO DE MENSAJES
// ============================================================
async function sendWhatsAppText(phoneNumberId, accessToken, to, text) {
  const url = `${META_GRAPH_BASE}/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to.replace('@s.whatsapp.net', ''),
    type: 'text',
    text: { preview_url: false, body: text }
  };
  const resp = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
  });
  return resp.data;
}

async function sendWhatsAppMedia(phoneNumberId, accessToken, to, mediatype, mediaUrl, caption, filename, mimetype, mediaId = null) {
  const url = `${META_GRAPH_BASE}/${phoneNumberId}/messages`;
  const cleanTo = to.replace('@s.whatsapp.net', '');

  // mediatype: image, audio, video, document
  const typeMap = { image: 'image', audio: 'audio', video: 'video', document: 'document', sticker: 'sticker' };
  const metaType = typeMap[mediatype] || 'document';

  const mediaObj = {};
  if (mediaId) mediaObj.id = mediaId;
  else mediaObj.link = mediaUrl;

  if (caption && metaType !== 'audio') mediaObj.caption = caption;
  if (filename && metaType === 'document') mediaObj.filename = filename;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanTo,
    type: metaType,
    [metaType]: mediaObj
  };

  const resp = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
  });
  return resp.data;
}

async function sendMessengerText(pageId, pageAccessToken, recipientId, text) {
  const url = `${META_GRAPH_BASE}/${pageId}/messages`;
  const payload = {
    recipient: { id: recipientId },
    message: { text },
    messaging_type: 'RESPONSE'
  };
  const resp = await axios.post(url, payload, {
    params: { access_token: pageAccessToken }
  });
  return resp.data;
}

async function sendInstagramText(pageId, pageAccessToken, recipientId, text) {
  // Instagram usa el mismo endpoint que Messenger pero con /me/messages
  const url = `${META_GRAPH_BASE}/me/messages`;
  const payload = {
    recipient: { id: recipientId },
    message: { text }
  };
  const resp = await axios.post(url, payload, {
    params: { access_token: pageAccessToken }
  });
  return resp.data;
}

// ── Descargar media de WhatsApp (devuelve base64) ─────────────
async function downloadWhatsAppMedia(mediaId, accessToken) {
  // 1. Obtener URL del media
  const metaResp = await axios.get(`${META_GRAPH_BASE}/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const mediaUrl = metaResp.data.url;

  // 2. Descargar el binario
  const dlResp = await axios.get(mediaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: 'arraybuffer'
  });

  const base64 = Buffer.from(dlResp.data).toString('base64');
  const mimetype = dlResp.headers['content-type'] || 'application/octet-stream';
  return { base64, mimetype };
}

// ============================================================
// RUTAS HTTP (misma interfaz que tenía Baileys)
// ============================================================

// Health check (sin auth)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'meta-service-local',
    wsConnected: wsClient?.readyState === WebSocket.OPEN,
    instances: Object.keys(instances).length
  });
});

// Middleware de autenticación
function authMiddleware(req, res, next) {
  const apikey = req.headers['apikey'];
  if (!apikey || apikey !== API_KEY) {
    return res.status(401).json({ status: 401, error: 'Unauthorized' });
  }
  next();
}

// Multimedia sin auth (para uso interno del nucleo)
app.post('/message/base64/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message object required' });

    const inst = instances[instanceName];
    if (!inst) return res.status(404).json({ error: 'Instance not found' });

    const mediaId = message?.imageMessage?.mediaId ||
                    message?.audioMessage?.mediaId ||
                    message?.videoMessage?.mediaId ||
                    message?.documentMessage?.mediaId ||
                    message?._metaMessage?.image?.id ||
                    message?._metaMessage?.audio?.id ||
                    message?._metaMessage?.video?.id ||
                    message?._metaMessage?.document?.id;

    if (!mediaId) return res.status(400).json({ error: 'No mediaId in message' });

    const { base64, mimetype } = await downloadWhatsAppMedia(mediaId, inst.credentials.access_token);
    return res.json({ status: 'SUCCESS', base64, mimetype });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.use(authMiddleware);

// ── POST /instance/create ─────────────────────────────────────
// Body: { instanceName, credentials: { type, phone_number_id?, access_token, ... } }
app.post('/instance/create', async (req, res) => {
  try {
    const { instanceName, credentials } = req.body;
    if (!instanceName) return res.status(400).json({ error: 'instanceName is required' });
    if (!credentials || !credentials.type) return res.status(400).json({ error: 'credentials.type is required (whatsapp|messenger|instagram)' });
    if (!credentials.access_token) return res.status(400).json({ error: 'credentials.access_token is required' });

    // Guardar instancia
    instances[instanceName] = {
      credentials,
      status: 'connected'
    };

    // Registrar en el relay por WebSocket
    registerInstanceOnRelay(instanceName, credentials);

    console.log(`[META-SVC] ✅ Instancia creada: ${instanceName} (${credentials.type})`);
    return res.json({
      status: 'SUCCESS',
      instanceName,
      type: credentials.type,
      integration: `META-${credentials.type.toUpperCase()}`
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ── GET /instance/connect/:instanceName ──────────────────────
// Con Meta API no hay QR. Devuelve el estado actual.
app.get('/instance/connect/:instanceName', (req, res) => {
  const { instanceName } = req.params;
  const inst = instances[instanceName];
  if (!inst) return res.status(404).json({ error: 'Instance not found' });

  return res.json({
    instanceName,
    status: inst.status,
    type: inst.credentials?.type,
    message: 'Meta API — no QR needed. Configure credentials to connect.'
  });
});

// ── GET /instance/connectionState/:instanceName ──────────────
app.get('/instance/connectionState/:instanceName', (req, res) => {
  const { instanceName } = req.params;
  const inst = instances[instanceName];
  if (!inst) {
    return res.json({ instance: { instanceName, state: 'close' } });
  }
  return res.json({
    instance: {
      instanceName,
      state: inst.status === 'connected' ? 'open' : 'close',
      type: inst.credentials?.type
    }
  });
});

// ── DELETE /instance/delete/:instanceName ────────────────────
app.delete('/instance/delete/:instanceName', async (req, res) => {
  const { instanceName } = req.params;
  delete instances[instanceName];
  delete webhooks[instanceName];
  console.log(`[META-SVC] 🗑️  Instancia eliminada: ${instanceName}`);
  return res.json({ status: 'SUCCESS' });
});

// ── GET /instance/fetchInstances ─────────────────────────────
app.get('/instance/fetchInstances', (req, res) => {
  const result = Object.entries(instances)
    .filter(([, inst]) => inst.status === 'connected')
    .map(([name, inst]) => ({
      instance: {
        instanceName: name,
        integration: `META-${inst.credentials?.type?.toUpperCase() || 'UNKNOWN'}`,
        status: 'connected'
      }
    }));
  return res.json(result);
});

// ── PUT /webhook/set/:instanceName ───────────────────────────
app.put('/webhook/set/:instanceName', (req, res) => {
  const { instanceName } = req.params;
  const { url } = req.body;
  webhooks[instanceName] = url;
  console.log(`[META-SVC] Webhook seteado para ${instanceName}: ${url}`);
  return res.json({ status: 'SUCCESS' });
});

// ── POST /message/sendText/:instanceName ─────────────────────
app.post('/message/sendText/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;
    const { number, text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const inst = instances[instanceName];
    if (!inst) return res.status(404).json({ error: `Instance ${instanceName} not found` });

    const creds = inst.credentials;
    const cleanNumber = number.includes('@') ? number.split('@')[0] : number;

    if (creds.type === 'whatsapp') {
      await sendWhatsAppText(creds.phone_number_id, creds.access_token, cleanNumber, text);
    } else if (creds.type === 'messenger') {
      await sendMessengerText(creds.page_id, creds.page_access_token || creds.access_token, cleanNumber, text);
    } else if (creds.type === 'instagram') {
      await sendInstagramText(creds.page_id, creds.page_access_token || creds.access_token, cleanNumber, text);
    } else {
      return res.status(400).json({ error: `Unknown credential type: ${creds.type}` });
    }

    return res.json({ status: 'SUCCESS' });
  } catch (e) {
    console.error(`[META-SVC] Error sendText: ${e.response?.data ? JSON.stringify(e.response.data) : e.message}`);
    return res.status(500).json({ error: e.response?.data?.error?.message || e.message });
  }
});

// ── POST /message/sendMedia/:instanceName ────────────────────
app.post('/message/sendMedia/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;
    const { number, mediatype, media, caption, fileName, mimetype } = req.body;

    const inst = instances[instanceName];
    if (!inst) return res.status(404).json({ error: `Instance ${instanceName} not found` });

    const creds = inst.credentials;
    const cleanNumber = number.includes('@') ? number.split('@')[0] : number;

    if (creds.type === 'whatsapp') {
      let mediaUrl = media;
      let mediaId = null;
      if (media.startsWith('data:') || !media.startsWith('http')) {
        const b64Data = media.replace(/^data:.*?;base64,/, '');
        const buffer = Buffer.from(b64Data, 'base64');
        const form = new FormData();
        form.append('messaging_product', 'whatsapp');
        form.append('file', buffer, { filename: fileName || 'file.bin', contentType: mimetype || 'application/octet-stream' });
        const uploadRes = await axios.post(`${META_GRAPH_BASE}/${creds.phone_number_id}/media`, form, {
          headers: { ...form.getHeaders(), Authorization: `Bearer ${creds.access_token}` }
        });
        mediaId = uploadRes.data.id;
        mediaUrl = null;
      }
      await sendWhatsAppMedia(creds.phone_number_id, creds.access_token, cleanNumber, mediatype, mediaUrl, caption, fileName, mimetype, mediaId);
    } else {
      return res.status(400).json({ error: 'sendMedia solo soportado para WhatsApp en esta version' });
    }

    return res.json({ status: 'SUCCESS' });
  } catch (e) {
    console.error(`[META-SVC] Error sendMedia: ${e.response?.data ? JSON.stringify(e.response.data) : e.message}`);
    return res.status(500).json({ error: e.response?.data?.error?.message || e.message });
  }
});

// ── Debug ─────────────────────────────────────────────────────
app.get('/debug/instances', (req, res) => {
  const data = Object.entries(instances).map(([name, inst]) => ({
    name,
    type: inst.credentials?.type,
    status: inst.status,
    hasToken: !!inst.credentials?.access_token,
    webhook: webhooks[name] || null
  }));
  return res.json({ wsConnected: wsClient?.readyState === WebSocket.OPEN, instances: data });
});

// ============================================================
// ARRANQUE
// ============================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║    SaaSIA — Meta Service Local                       ║
║    Puerto: ${PORT}                                        ║
║                                                      ║
║  Soporta: WhatsApp + Messenger + Instagram           ║
║  (Reemplaza Baileys e instagrapi)                    ║
╚══════════════════════════════════════════════════════╝
  `);
  console.log(`[META-SVC] Relay WS: ${RELAY_WS_URL}`);
  console.log(`[META-SVC] Nucleo webhook: ${NUCLEO_WEBHOOK_URL}`);

  // Conectar al relay con delay inicial
  setTimeout(connectToRelay, 2000);
});

process.on('uncaughtException', (err) => {
  console.error('[META-SVC] Uncaught Exception:', err.stack || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[META-SVC] Unhandled Rejection:', reason?.stack || reason);
});
