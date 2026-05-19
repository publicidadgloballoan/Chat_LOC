const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const { Pool } = require('pg');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WEBHOOKS_FILE = path.join(__dirname, 'baileys_auth', 'webhooks.json');
const LID_MAP_FILE = path.join(__dirname, 'baileys_auth', 'lid_map.json');

class BaileysService {
  constructor(dbConfig) {
    this.instances = new Map();
    this.qrCodes = new Map();
    this.webhooks = new Map();
    this.lidToPhone = new Map();
    this.connectionStates = new Map(); // 'open' | 'connecting' | 'close'
    this.instancePhones = new Map();
    this.db = new Pool(dbConfig);
    this.logger = pino({ level: 'info' });
    this._loadWebhooks();
    this._loadLidMap();
  }

  _loadLidMap() {
    try {
      if (fs.existsSync(LID_MAP_FILE)) {
        const data = JSON.parse(fs.readFileSync(LID_MAP_FILE, 'utf8'));
        for (const [lid, phone] of Object.entries(data)) {
          this.lidToPhone.set(lid, phone);
        }
        this.logger.info(`Loaded ${this.lidToPhone.size} lid->phone mappings from disk`);
      }
    } catch (err) {
      this.logger.warn(`Could not load lid map: ${err.message}`);
    }
  }

  _saveLidMap() {
    try {
      const data = Object.fromEntries(this.lidToPhone);
      fs.writeFileSync(LID_MAP_FILE, JSON.stringify(data), 'utf8');
    } catch (err) {
      this.logger.warn(`Could not save lid map: ${err.message}`);
    }
  }

  _upsertContacts(contacts) {
    let changed = false;
    for (const contact of contacts) {
      const lid = (contact.lid || '').replace(/@.*$/, '');
      const phone = (contact.id || '').replace(/@.*$/, '').replace(/:.*$/, '');
      if (lid && phone) {
        this.lidToPhone.set(lid, phone);
        changed = true;
      }
    }
    if (changed) this._saveLidMap();
  }

  _loadWebhooks() {
    try {
      if (fs.existsSync(WEBHOOKS_FILE)) {
        const data = JSON.parse(fs.readFileSync(WEBHOOKS_FILE, 'utf8'));
        for (const [instanceName, url] of Object.entries(data)) {
          this.webhooks.set(instanceName, url);
          this.logger.info(`Webhook restored for ${instanceName}: ${url}`);
        }
      }
    } catch (err) {
      this.logger.warn(`Could not load webhooks from disk: ${err.message}`);
    }
  }

  _saveWebhooks() {
    try {
      const data = Object.fromEntries(this.webhooks);
      fs.mkdirSync(path.dirname(WEBHOOKS_FILE), { recursive: true });
      fs.writeFileSync(WEBHOOKS_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      this.logger.warn(`Could not save webhooks to disk: ${err.message}`);
    }
  }

  setWebhook(instanceName, webhookUrl) {
    this.webhooks.set(instanceName, webhookUrl);
    this._saveWebhooks();
    this.logger.info(`Webhook configured for ${instanceName}: ${webhookUrl}`);
  }

  async createInstance(instanceName) {
    try {
      // Si la instancia ya existe, limpiar socket pero conservar webhook
      if (this.instances.has(instanceName)) {
        this.logger.info(`Instance ${instanceName} already exists, cleaning up...`);
        await this.deleteInstance(instanceName, true);
      }

      const authDir = path.join(__dirname, 'baileys_auth', instanceName);
      const { state, saveCreds } = await useMultiFileAuthState(authDir);
      let version = [2, 233, 4];
      try {
        const verInfo = await fetchLatestBaileysVersion();
        version = verInfo.version;
      } catch (_) {}

      this.logger.info(`Creating instance ${instanceName} with Baileys ${version}`);

      const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        connectTimeoutMs: 60000,
        qrTimeout: 45000,
      });

      this.qrCodes.set(instanceName, { count: 0, code: null, base64: null });

      // Connection update handler
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          const qrData = this.qrCodes.get(instanceName);
          qrData.count++;
          qrData.code = qr;

          try {
            qrData.base64 = await QRCode.toDataURL(qr);
            this.logger.info(`QR code generated for ${instanceName}, count: ${qrData.count}`);
          } catch (err) {
            this.logger.error(`QR generation error: ${err.message}`);
          }
        }

        if (connection === 'close') {
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          this.logger.info(`Connection closed for ${instanceName}, reconnect: ${shouldReconnect}`);
          this.connectionStates.set(instanceName, 'close');

          if (shouldReconnect && this.instances.has(instanceName)) {
            setTimeout(() => this.createInstance(instanceName), 3000);
          } else {
            this.instances.delete(instanceName);
          }
        } else if (connection === 'open') {
          const userJid = String(sock.user?.id || '');
          const phone = userJid.split('@')[0].split(':')[0];
          this.logger.info(`Connection opened for ${instanceName} as ${phone}`);
          this.connectionStates.set(instanceName, 'open');
          this.instancePhones.set(instanceName, String(phone)); // Store in dedicated map

          // Limpiar QR al conectar
          if (this.qrCodes.has(instanceName)) {
            this.qrCodes.get(instanceName).code = null;
            this.qrCodes.get(instanceName).base64 = null;
          }
        } else if (qr) {
          this.connectionStates.set(instanceName, 'connecting');
        }
      });

      // Messages handler
      sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
          for (const msg of messages) {
            if (!msg.message || msg.key.fromMe) continue;

            const from = msg.key.remoteJid;

            // Skip group messages only
            if (from.endsWith('@g.us')) continue;

            const messageText = msg.message.conversation ||
                               msg.message.extendedTextMessage?.text ||
                               '';

            // Resolve @lid to real phone number
            let resolvedJid = from;
            if (from.endsWith('@lid')) {
              const lidId = from.replace(/@lid$/, '');
              const realPhone = this.lidToPhone.get(lidId);
              if (realPhone) {
                resolvedJid = `${realPhone}@s.whatsapp.net`;
                this.logger.info(`Resolved @lid ${from} -> ${resolvedJid}`);
              } else {
                this.logger.warn(`Could not resolve @lid ${from}, using as-is`);
              }
            }

            this.logger.info(`Message received from ${resolvedJid}: ${messageText}`);

            // Log message to messages.jsonl
            try {
              const msgLog = {
                fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
                numero: resolvedJid.replace('@s.whatsapp.net', ''),
                mensaje: messageText,
                rol: 'user'
              };
              fs.appendFileSync(path.join(__dirname, 'baileys_auth', 'messages.jsonl'), JSON.stringify(msgLog) + '\n');
            } catch (err) {
              this.logger.error(`Error logging message: ${err.message}`);
            }

            // Send to webhook if configured
            const webhookUrl = this.webhooks.get(instanceName);
            if (webhookUrl) {
              try {
                const resolvedKey = { ...msg.key, remoteJid: resolvedJid };
                await axios.post(webhookUrl, {
                  event: 'messages.upsert',
                  instance: instanceName,
                  data: {
                    key: resolvedKey,
                    message: msg.message,
                    messageTimestamp: msg.messageTimestamp,
                    pushName: msg.pushName
                  }
                }, { timeout: 5000 });

                this.logger.info(`Message forwarded to webhook: ${webhookUrl}`);
              } catch (err) {
                this.logger.error(`Webhook error: ${err.message}`);
              }
            }
          }
        } catch (error) {
          this.logger.error(`Error processing messages: ${error.message}`);
        }
      });

      sock.ev.on('creds.update', saveCreds);

      // Map lid -> real phone number from contacts (sync on connect + updates)
      sock.ev.on('contacts.set', ({ contacts }) => { this._upsertContacts(contacts); });
      sock.ev.on('contacts.upsert', (contacts) => { this._upsertContacts(contacts); });
      sock.ev.on('contacts.update', (updates) => { this._upsertContacts(updates); });

      this.instances.set(instanceName, sock);

      return {
        instance: {
          instanceName,
          integration: 'WHATSAPP-BAILEYS',
          status: 'connecting'
        },
        qrcode: this.qrCodes.get(instanceName)
      };
    } catch (error) {
      this.logger.error(`Error creating instance: ${error.message}`);
      throw error;
    }
  }

  async sendMessage(instanceName, to, text) {
    const sock = this.instances.get(instanceName);
    if (!sock) {
      throw new Error(`Instance ${instanceName} not found`);
    }

    try {
      await sock.sendMessage(to, { text });
      this.logger.info(`Message sent to ${to}: ${text}`);

      // Log outgoing message
      try {
        const msgLog = {
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
          numero: to.replace('@s.whatsapp.net', ''),
          mensaje: text,
          rol: 'assistant'
        };
        fs.appendFileSync(path.join(__dirname, 'baileys_auth', 'messages.jsonl'), JSON.stringify(msgLog) + '\n');
      } catch (err) {
        this.logger.error(`Error logging outgoing message: ${err.message}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      throw error;
    }
  }

  async sendMedia(instanceName, to, mediatype, media, caption, fileName) {
    const sock = this.instances.get(instanceName);
    if (!sock) throw new Error(`Instance ${instanceName} not found`);

    try {
      const buffer = Buffer.from(media, 'base64');
      let payload = {};

      if (mediatype === 'image') {
        payload = { image: buffer, caption: caption };
      } else if (mediatype === 'video') {
        payload = { video: buffer, caption: caption };
      } else if (mediatype === 'audio') {
        payload = { audio: buffer, mimetype: 'audio/mp4' };
      } else {
        payload = { document: buffer, fileName: fileName || 'document.pdf', mimetype: 'application/pdf' };
      }

      await sock.sendMessage(to, payload);
      this.logger.info(`Media sent to ${to} (${mediatype})`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error sending media: ${error.message}`);
      throw error;
    }
  }

  async downloadMedia(instanceName, messageBody) {
    const sock = this.instances.get(instanceName);
    if (!sock) throw new Error(`Instance ${instanceName} not found`);

    try {
        // El nucleo IA envia { message: { ... } }
        const message = messageBody.message || messageBody;
        const buffer = await downloadMediaMessage(
            { message },
            'buffer',
            {},
            { 
                logger: this.logger,
                reuploadRequest: sock.updateMediaMessage
            }
        );
        return buffer.toString('base64');
    } catch (error) {
        this.logger.error(`Error downloading media: ${error.message}`);
        throw error;
    }
  }

  getQRCode(instanceName) {
    if (!this.qrCodes.has(instanceName)) {
      return { count: 0 };
    }
    return this.qrCodes.get(instanceName);
  }

  getConnectionState(instanceName) {
    const state = String(this.connectionStates.get(instanceName) || 'close');
    const phone = this.instancePhones.get(instanceName) || null;
    return {
      instance: {
        instanceName: String(instanceName),
        state: state,
        phone: phone || null
      }
    };
  }

  async deleteInstance(instanceName, keepWebhook = false) {
    const sock = this.instances.get(instanceName);
    if (sock) {
      try { await sock.logout(); } catch (_) {}
      try { sock.end(); } catch (_) {}
    }
    this.instances.delete(instanceName);
    this.instancePhones.delete(instanceName);
    this.qrCodes.delete(instanceName);
    this.connectionStates.delete(instanceName);
    if (!keepWebhook) {
      this.webhooks.delete(instanceName);
      this._saveWebhooks();
    }
    return { message: 'Instance deleted' };
  }
}

module.exports = BaileysService;
