require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const BaileysService = require('./baileys');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DB_CONFIG = {
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'chatbot_evolution',
  user: process.env.DB_USER || 'chatbot_punto_a',
  password: process.env.DB_PASSWORD,
};

const API_KEY = process.env.AUTHENTICATION_API_KEY;
const baileys = new BaileysService(DB_CONFIG);

// RUTA MULTIMEDIA EXENTA DE AUTH (PARA USO INTERNO DEL NUCLEO)
app.post('/message/base64/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message object required' });
    const b64 = await baileys.downloadMedia(instanceName, message);
    return res.status(200).json({ status: 'SUCCESS', base64: b64 });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Middleware de autenticacion
function authMiddleware(req, res, next) {
  const apikey = req.headers['apikey'];
  if (!apikey || apikey !== API_KEY) {
    return res.status(401).json({ status: 401, error: 'Unauthorized' });
  }
  next();
}

app.use(authMiddleware);

// POST /instance/create
app.post('/instance/create', async (req, res) => {
  try {
    const { instanceName, integration, qrcode } = req.body;
    if (!instanceName) return res.status(400).json({ error: 'instanceName is required' });
    const result = await baileys.createInstance(instanceName);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /instance/connect/:instanceName
app.get('/instance/connect/:instanceName', (req, res) => {
  try {
    const { instanceName } = req.params;
    const qr = baileys.getQRCode(instanceName);
    return res.status(200).json(qr);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /instance/connectionState/:instanceName
app.get('/instance/connectionState/:instanceName', (req, res) => {
  try {
    const { instanceName } = req.params;
    const state = baileys.getConnectionState(instanceName);
    // console.log(`[STATE] ${instanceName}:`, JSON.stringify(state));
    return res.status(200).json(state);
  } catch (error) {
    console.error(`[STATE-ERR] ${req.params.instanceName}:`, error.message);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /instance/delete/:instanceName
app.delete('/instance/delete/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;
    const result = await baileys.deleteInstance(instanceName);
    return res.status(200).json({ status: 'SUCCESS', response: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /webhook/set/:instanceName
app.put('/webhook/set/:instanceName', (req, res) => {
  try {
    const { instanceName } = req.params;
    const { url } = req.body;
    baileys.setWebhook(instanceName, url);
    return res.status(200).json({ status: 'SUCCESS' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /message/sendText/:instanceName
app.post('/message/sendText/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;
    const { number, text } = req.body;
    const formattedNumber = number.includes('@') ? number : `${number}@s.whatsapp.net`;
    await baileys.sendMessage(instanceName, formattedNumber, text);
    return res.status(200).json({ status: 'SUCCESS' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /message/sendMedia/:instanceName
app.post('/message/sendMedia/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;
    const { number, mediatype, media, caption, fileName } = req.body;
    const formattedNumber = number.includes('@') ? number : `${number}@s.whatsapp.net`;
    await baileys.sendMedia(instanceName, formattedNumber, mediatype, media, caption, fileName);
    return res.status(200).json({ status: 'SUCCESS' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// GET /instance/fetchInstances
app.get('/instance/fetchInstances', (req, res) => {
  try {
    // Filtrar para obtener solo las instancias reales, no los metadatos de telefono
    const instances = Array.from(baileys.instances.keys())
      .filter(name => !name.endsWith('_phone'))
      .map(name => {
        const state = baileys.connectionStates.get(name) || 'close';
        return {
          instance: { 
            instanceName: name, 
            integration: 'WHATSAPP-BAILEYS', 
            status: state === 'open' ? 'connected' : 'disconnected' 
          }
        };
      })
      .filter(inst => inst.instance.status === 'connected');
    return res.status(200).json(instances);
  } catch (error) {
    console.error('[SERVER-ERR] Error in fetchInstances:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// DEBUG
app.get('/debug/instances', (req, res) => {
  const keys = Array.from(baileys.instances.keys());
  const states = Array.from(baileys.connectionStates.entries());
  return res.json({ keys, states });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`WhatsApp Service (Baileys) running on port ${PORT}`);
  const AUTH_BASE = path.join(__dirname, 'baileys_auth');
  try {
    if (fs.existsSync(AUTH_BASE)) {
      const entries = fs.readdirSync(AUTH_BASE);
      for (const entry of entries) {
        const entryPath = path.join(AUTH_BASE, entry);
        if (fs.statSync(entryPath).isDirectory() && entry !== 'webhooks.json') {
          console.log(`Auto-starting instance: ${entry}`);
          await baileys.createInstance(entry);
        }
      }
    }
  } catch (err) {
    console.error('Error during auto-startup:', err.message);
  }
});
