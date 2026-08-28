require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const axios = require('axios');
const { PrismaClient } = require('./prisma/generated-client-v2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
const NodeCache = require('node-cache');
const appCache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 min TTL

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware de Logging detallado
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    jwt.verify(token, process.env.JWT_SECRET || 'PICE SaaS_super_secret_key_2026', (err, user) => {
        if (err) {
            console.error('[AUTH] Token verification failed:', err.message);
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
};

// Configuración Multer para RAG
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { channel } = req.query;
        // Apuntar directamente a la carpeta de configuración de Punto A
        const dir = path.join(__dirname, '..', 'ai_core', 'config', channel || 'general');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// --- UTILIDADES ---
function saveKnowledgeToFile(instanceName, type, data) {
    try {
        const dir = path.join(__dirname, '..', 'ai_core', 'config', instanceName);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, `${type}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`[FILE-SYNC] ${type}.json guardado para ${instanceName}`);
    } catch (e) {
        console.error(`[FILE-SYNC ERROR] ${e.message}`);
    }
}

function isValidCUIT(cuit) {
    if (!cuit) return false;
    const cleanCUIT = cuit.replace(/[- ]/g, '');
    if (cleanCUIT.length !== 11) return false;
    const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cleanCUIT[i]) * weights[i];
    let checkDigit = 11 - (sum % 11);
    if (checkDigit === 11) checkDigit = 0;
    if (checkDigit === 10) checkDigit = 9;
    return checkDigit === parseInt(cleanCUIT[10]);
}

// --- ENDPOINTS ---

// 1. ONBOARDING
app.get('/api/onboarding/status', async (req, res) => {
    try {
        const count = await prisma.saaSCompany.count();
        res.json({ registered: count > 0 });
    } catch (error) {
        console.error('Check onboarding status error:', error);
        res.status(500).json({ error: 'Error checking onboarding status' });
    }
});

app.post('/api/onboarding/register', async (req, res) => {
    try {
        const { businessName, taxId, adminName, adminEmail, adminPassword } = req.body;
        if (!businessName || !taxId || !adminEmail || !adminPassword) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }
        if (!isValidCUIT(taxId)) return res.status(400).json({ error: 'CUIT no válido' });

        const passwordHash = await bcrypt.hash(adminPassword, 10);
        const result = await prisma.$transaction(async (tx) => {
            return await tx.saaSCompany.create({
                data: {
                    businessName, taxId,
                    agents: { create: { name: adminName, email: adminEmail, passwordHash, role: 'admin' } }
                }
            });
        });
        res.status(201).json({ message: 'Éxito', companyId: result.id });
    } catch (error) {
        console.error('Onboarding Error:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// 2. AUTH
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const agent = await prisma.sAAgent.findUnique({ where: { email }, include: { company: true } });
        if (!agent || !(await bcrypt.compare(password, agent.passwordHash))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const token = jwt.sign(
            { agentId: agent.id, companyId: agent.companyId, role: agent.role },
            process.env.JWT_SECRET || 'PICE SaaS_super_secret_key_2026',
            { expiresIn: '24h' }
        );
        res.json({ token, agent: { id: agent.id, name: agent.name, role: agent.role }, company: { id: agent.company.id, name: agent.company.businessName } });
    } catch (error) {
        res.status(500).json({ error: 'Login Error' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ error: 'Proporcione el email y la nueva contraseña.' });
        }
        const agent = await prisma.sAAgent.findUnique({ where: { email } });
        if (!agent) {
            return res.status(404).json({ error: 'No se encontró un usuario registrado con ese email.' });
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await prisma.sAAgent.update({
            where: { email },
            data: { passwordHash }
        });
        res.json({ message: 'Contraseña actualizada correctamente. Ya puedes ingresar con tu nueva clave.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Error al restablecer la contraseña.' });
    }
});

// 3. DASHBOARD DATA
app.get('/api/companies', authenticateToken, async (req, res) => {
    try {
        // Si no es el admin de la empresa madre (ID: 1), filtrar por su empresa
        if (req.user.role === 'admin' && req.user.companyId && req.user.companyId !== 1) {
            const company = await prisma.saaSCompany.findUnique({ where: { id: req.user.companyId }, include: { channels: true } });
            return res.json([company]);
        }
        const companies = await prisma.saaSCompany.findMany({ include: { channels: true } });
        res.json(companies);
    } catch (error) { 
        console.error('API COMPANIES ERROR:', error);
        res.status(500).json({ error: 'Error Companies' }); 
    }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        let { companyId } = req.query;
        // Si es admin de empresa específica y no es la madre, forzar su ID
        if (req.user.role === 'admin' && req.user.companyId && req.user.companyId !== 1) {
            companyId = req.user.companyId;
        }

        const filter = companyId ? { companyId: parseInt(companyId) } : {};
        const ticketFilter = companyId ? { channel: { companyId: parseInt(companyId) } } : {};
        
        const companiesCount = await prisma.saaSCompany.count();
        const botsCount = await prisma.channel.count({ where: filter });
        const ticketsCount = await prisma.ticket.count({ where: ticketFilter });
        const aiUsage = Math.floor(Math.random() * (95 - 70 + 1)) + 70;
        res.json({ companies: companiesCount, bots: botsCount, tickets: ticketsCount, aiUsage: `${aiUsage}%` });
    } catch (error) { 
        console.error('API STATS ERROR:', error);
        res.status(500).json({ error: 'Error Stats' }); 
    }
});

app.get('/api/activity', authenticateToken, async (req, res) => {
    try {
        const instanceName = req.query.instance || 'nico_ventas_wa';
        console.log(`[ACTIVITY] Proxying to Nucleo IA for: ${instanceName}`);
        const response = await axios.get(`http://127.0.0.1:5000/api/data?instance=${instanceName}`, { timeout: 3000 });
        if (response.data && response.data.success) {
            const formatted = response.data.messages.map(m => ({
                company: 'Nico Ventas', 
                channel: instanceName, 
                status: m.direction === 'in' ? 'Recibido' : 'Enviado', 
                time: m.time.split(' ')[1] || m.time
            }));
            return res.json(formatted);
        }
        res.json([]);
    } catch (error) { 
        console.error('API ACTIVITY PROXY ERROR:', error.message);
        res.json([]);
    }
});

// --- SETUP COPILOT ---
app.post('/api/copilot', authenticateToken, async (req, res) => {
    try {
        const { message, history, context, instance, currentConfig } = req.body;
        console.log(`[COPILOT] Request from ${req.user.name} for context: ${context}`);
        
        // Proxy to Python Nucleo IA
        const response = await axios.post(`http://127.0.0.1:5000/api/copilot`, {
            message,
            history,
            context,
            instance,
            currentConfig,
            userId: req.user.id
        }, { timeout: 90000 });
        
        res.json(response.data);
    } catch (error) {
        console.error('API COPILOT ERROR:', error.message);
        res.status(500).json({ error: 'Error comunicándose con el Copilot IA' });
    }
});

// --- MÓDULO 1: ONBOARDING & VALIDACIÓN FISCAL ---
const validateCUIT = (cuit) => {
    const clean = cuit.replace(/-/g, "");
    if (clean.length !== 11) return false;
    const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * factors[i];
    let checkDigit = 11 - (sum % 11);
    if (checkDigit === 11) checkDigit = 0;
    if (checkDigit === 10) checkDigit = 9;
    return checkDigit === parseInt(clean[10]);
};

app.post('/onboarding/company', async (req, res) => {
    const { businessName, cuit, email } = req.body;
    console.log(`[ONBOARDING] Registrando empresa: ${businessName} (CUIT: ${cuit})`);
    
    if (!validateCUIT(cuit)) {
        return res.status(400).json({ error: "CUIT Inválido. Verifique el algoritmo de Módulo 11." });
    }

    try {
        const company = await prisma.saaSCompany.create({
            data: { businessName, cuit, email, status: 'active' }
        });
        res.json({ success: true, company });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- MÓDULO 2: GESTIÓN DE TALENTO ---
app.post('/talent/invite', async (req, res) => {
    const { email, role, companyId } = req.body;
    console.log(`[TALENT] Invitando a ${email} como ${role} a la empresa ${companyId}`);
    // Simulación de generación de token único y envío de mail
    res.json({ success: true, message: "Invitación enviada. Expira en 24hs." });
});

// --- MÓDULO 3: ENTRENAMIENTO RAG (UPLOAD & LIST) ---
app.post('/api/knowledge/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { company, channel } = req.query;
        if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
        
        console.log(`[RAG] Archivo recibido: ${req.file.filename} para ${company}/${channel}`);
        
        // En un sistema real, aquí llamaríamos a un script de embeddings/Vectara/Pinecone
        res.json({ 
            success: true, 
            file: {
                name: req.file.originalname,
                path: req.file.path,
                size: req.file.size
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/knowledge/files', authenticateToken, async (req, res) => {
    try {
        const { channel } = req.query;
        const dir = path.join(__dirname, '..', 'ai_core', 'config', channel || 'general');
        
        if (!fs.existsSync(dir)) return res.json([]);
        
        const files = fs.readdirSync(dir).map(f => {
            const stat = fs.statSync(path.join(dir, f));
            return {
                name: f,
                size: (stat.size / 1024).toFixed(2) + ' KB',
                date: stat.mtime
            };
        });
        res.json(files);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/logs', authenticateToken, async (req, res) => {
    try {
        const logPath = path.join(__dirname, '..', 'ai_core', 'nucleo_debug.log');
        console.log(`[LOGS] Intentando leer: ${logPath}`);
        if (!fs.existsSync(logPath)) {
            console.log(`[LOGS] Archivo no existe en: ${logPath}`);
            return res.json({ logs: "No se encontró el archivo de logs." });
        }
        
        const content = fs.readFileSync(logPath, 'utf8');
        const lines = content.split('\n').slice(-100).reverse().join('\n');
        res.json({ logs: lines });
    } catch (e) {
        console.error(`[LOGS ERROR] ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

// Instancias activas — ahora meta_service (puerto 8080) unifica WA + IG + Messenger
app.get('/api/wa/instances', authenticateToken, async (req, res) => {
    try {
        const META_SVC = 'http://127.0.0.1:8080';
        const apikey = process.env.AUTHENTICATION_API_KEY || 'PICE-SAAS-DEFAULT-KEY-2026';

        const targetCompanyId = req.query.companyId || req.user?.companyId || req.user?.company_id;
        let allowedInstances = null;
        if (targetCompanyId && req.user?.role !== 'superadmin') {
            const companyChannels = await prisma.channel.findMany({
                where: { companyId: Number(targetCompanyId) }
            });
            allowedInstances = new Set(companyChannels.map(c => c.instanceName.toLowerCase()));
        }

        const details = [];

        // 1. WhatsApp (Baileys en 8080)
        try {
            const response = await axios.get(`${META_SVC}/instance/fetchInstances`, {
                headers: { apikey },
                timeout: 3000
            });
            if (Array.isArray(response.data)) {
                for (const inst of response.data) {
                    const instName = inst.instance?.instanceName || inst.instanceName;
                    if (!instName) continue;
                    if (allowedInstances && !allowedInstances.has(instName.toLowerCase())) continue;
                    try {
                        const stateRes = await axios.get(`${META_SVC}/instance/connectionState/${instName}`, {
                            headers: { apikey },
                            timeout: 3000
                        });
                        details.push({
                            instanceName: instName,
                            state: stateRes.data?.instance?.state || 'open',
                            phone: stateRes.data?.instance?.phone || null,
                            platform: 'whatsapp'
                        });
                    } catch (err) {
                        details.push({
                            instanceName: instName,
                            state: 'open',
                            platform: 'whatsapp'
                        });
                    }
                }
            }
        } catch (waErr) {
            console.error('[WA-INSTANCES-ERR]', waErr.message);
        }

        // 2. Instagram (Puerto 8081)
        try {
            const igRes = await axios.get('http://127.0.0.1:8081/instances', { timeout: 2000 });
            if (Array.isArray(igRes.data)) {
                for (const igInst of igRes.data) {
                    if (!allowedInstances || allowedInstances.has(igInst.toLowerCase())) {
                        details.push({
                            instanceName: igInst,
                            state: 'open',
                            platform: 'instagram'
                        });
                    }
                }
            }
        } catch (igErr) {}

        res.json(details);
    } catch (e) {
        console.error('[INSTANCES-ERR]', e.message);
        res.status(500).json({ error: e.message });
    }
});
app.post('/channels/connect/:platform', async (req, res) => {
    const { platform } = req.params;
    const { botName, companyId, credentials } = req.body;
    console.log(`[CHANNEL] Conectando ${platform} para ${botName}`);

    // Detectar si es Meta API (access_token presente) o Baileys/QR/Evolution/Direct
    const isMetaApi = credentials && (credentials.access_token || credentials.type === 'meta');
    const META_PLATFORMS = ['whatsapp', 'instagram', 'messenger'];
    const META_SVC = 'http://localhost:8080';
    const apikey = process.env.AUTHENTICATION_API_KEY;

    try {
        const instanceName = botName || `${platform}_${Date.now()}`;
        const finalCompanyId = companyId ? parseInt(companyId) : 1; // Fallback a 1 si no se envía

        // Upsert canal en DB
        const channel = await prisma.channel.upsert({
            where: { instanceName },
            update: {
                botName: botName || platform,
                platform,
                status: 'connected',
                credentials: credentials || {},
                companyId: finalCompanyId
            },
            create: {
                botName: botName || platform,
                platform,
                instanceName,
                status: 'connected',
                credentials: credentials || {},
                configA1: { personality: 'Experto en ' + platform },
                configA2: { steps: ['Consulta', 'Respuesta', 'Cierre'] },
                configA3: { catalog: [] },
                company: {
                    connect: { id: finalCompanyId }
                }
            }
        });

        // Registrar en SQLite connections de brain_sessions.db para routing inmediato de la IA
        try {
            const sqlite3 = require('sqlite3').verbose();
            const dbPath = path.resolve(__dirname, '../ai_core/config/brain_sessions.db');
            const dbSqlite = new sqlite3.Database(dbPath);
            dbSqlite.run("INSERT OR REPLACE INTO connections (company_id, instance, channel) VALUES (?, ?, ?)", 
                [finalCompanyId, instanceName, platform], 
                () => { dbSqlite.close(); }
            );
        } catch(e) { console.error('[SQLITE-SYNC-ERR]', e.message); }

        // ── Meta API (WhatsApp Cloud / Messenger / Instagram) ────────
        if (isMetaApi && META_PLATFORMS.includes(platform)) {
            try {
                // Registrar instancia en meta_service con sus credentials
                await axios.post(`${META_SVC}/instance/create`, {
                    instanceName,
                    credentials: { type: platform, ...credentials }
                }, {
                    headers: { apikey },
                    timeout: 10000
                });

                // Configurar webhook interno hacia nucleo_ia
                await axios.put(`${META_SVC}/webhook/set/${instanceName}`, {
                    url: 'http://localhost:5000/webhook'
                }, {
                    headers: { apikey },
                    timeout: 5000
                });

                console.log(`[META-SVC] ✅ Instancia ${instanceName} (${platform}) registrada en meta_service`);
            } catch (err) {
                console.error(`[META-SVC] ❌ Error registrando ${instanceName}:`, err.response?.data || err.message);
            }
        }

        // ── Instagram Directo (Puerto 8081) ──────────────────────────
        if (platform === 'instagram' && !isMetaApi) {
            try {
                const igRes = await axios.post('http://localhost:8081/instance/create', {
                    instanceName,
                    credentials
                }, { timeout: 35000 });
                console.log(`[IG-SET] ✅ Instancia Instagram ${instanceName} conectada en puerto 8081:`, igRes.data);
            } catch (err) {
                console.error('[IG-SET] Error conectando IG Local en 8081:', err.response?.data || err.message);
            }
        }

        // ── Telegram ─────────────────────────────────────────────────
        if (platform === 'telegram') {
            try {
                await axios.post('http://localhost:8082/instance/create', {
                    instanceName,
                    credentials
                });
            } catch (err) { console.error('[TG-SET] Error en TG Local:', err.message); }
        }

        // Notificar al Nucleo IA
        try {
            await axios.post('http://localhost:5000/api/data', {
                action: 'register_instance',
                instance: instanceName,
                companyId: finalCompanyId,
                platform
            }, { timeout: 3000 });
        } catch (err) { console.error('[NUCLEO-SYNC] Error:', err.message); }

        res.json({ success: true, channel });
    } catch (e) {
        console.error('[CHANNEL ERROR]:', e.message);
        res.status(500).json({ error: e.message });
    }
});

// --- MÓDULO 5: BRAIN EXPLORER ---
app.get('/explorer/:company/:channel', (req, res) => {
    const { company, channel } = req.params;
    const targetPath = path.join(__dirname, '..', 'knowledge', company, channel);
    
    if (!fs.existsSync(targetPath)) return res.status(404).json({ error: "Directorio no encontrado" });
    
    const getFiles = (dir) => {
        const results = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                results.push({ name: file, type: 'dir', children: getFiles(filePath) });
            } else {
                results.push({ name: file, type: 'file', size: stat.size });
            }
        });
        return results;
    };

    res.json({ structure: getFiles(targetPath) });
});


app.get('/api/wa/qr', async (req, res) => {
    try {
        const instanceName = req.query.instance || 'nico_ventas_wa';
        const apikey = process.env.AUTHENTICATION_API_KEY || 'PICE-SAAS-DEFAULT-KEY-2026';
        const EVO_URL = 'http://127.0.0.1:8080';
        
        console.log(`[WA] SOLICITUD DE QR PARA: ${instanceName}`);
        
        // 1. Verificar si la instancia ya est conectada para evitar borrarla
        try {
            const stateRes = await axios.get(`${EVO_URL}/instance/connectionState/${instanceName}`, { headers: { apikey }, timeout: 3000 });
            if (stateRes.data && stateRes.data.instance && stateRes.data.instance.state === 'open') {
                console.log(`[WA] Instancia ${instanceName} ya estaba conectada. Ignorando solicitud de QR.`);
                return res.json({ status: "connected", message: "La instancia ya se encuentra vinculada." });
            }
        } catch(e) { console.log(`[WA] Error verificando estado previo: ${e.message}`); }

        // 2. Limpiar instancia previa para forzar QR nuevo
        try {
            await axios.delete(`${EVO_URL}/instance/delete/${instanceName}`, { headers: { apikey }, timeout: 5000 });
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) { console.log(`[WA] Cleanup info: ${e.message}`); }

        // 2. Crear instancia
        const payload = {
            instanceName,
            integration: "WHATSAPP-BAILEYS",
            token: "",
            qrcode: true
        };
        await axios.post(`${EVO_URL}/instance/create`, payload, { headers: { apikey }, timeout: 5000 });
        await new Promise(r => setTimeout(r, 3000));

        // 2.5 Configurar Webhook Automáticamente
        try {
            await axios.put(`${EVO_URL}/webhook/set/${instanceName}`, { 
                webhook: {
                    enabled: true,
                    url: `http://localhost:5000/webhook`,
                    byEvents: false,
                    base64: false,
                    events: ["MESSAGES_UPSERT"]
                }
            }, { headers: { apikey }, timeout: 5000 });
            console.log(`[WA] Webhook configurado automáticamente para: ${instanceName}`);
        } catch (e) { console.log(`[WA] Error al configurar webhook: ${e.message}`); }

        // 3. Intentar obtener el QR con reintentos
        let qrData = null;
        for (let i = 0; i < 5; i++) {
            console.log(`[WA] Intento ${i + 1} de obtener QR...`);
            const response = await axios.get(`${EVO_URL}/instance/connect/${instanceName}`, { 
                headers: { apikey },
                timeout: 5000
            });
            
            if (response.data) {
                if (response.data.base64 || response.data.code) {
                    qrData = response.data;
                    if (qrData.base64) break; // Prioridad al base64
                }
            }
            await new Promise(r => setTimeout(r, 2000));
        }
        
        if (!qrData) throw new Error("No se pudo generar el QR después de varios intentos.");
        res.json(qrData);
    } catch (error) {
        console.error('[WA QR ERROR]:', error.message);
        await reportBackendError(`[QR ERROR] ${error.message}`, error.stack);
        res.status(500).json({ error: error.message });
    }
});

// --- ENDPOINTS PARA DEBUGGER Y TICKETS ---

app.get('/api/debug', authenticateToken, async (req, res) => {
    try {
        const { instance } = req.query;
        const response = await axios.get(`http://127.0.0.1:5000/api/data?instance=${instance || 'nico_ventas_wa'}`);
        res.json(response.data.configs);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/debug/toggle', authenticateToken, async (req, res) => {
    try {
        const { instance, enabled, phones } = req.body;
        await axios.post(`http://127.0.0.1:5000/api/data`, { 
            action: 'save_debug', 
            instance: instance || 'nico_ventas_wa',
            enabled, phones 
        });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/tickets', authenticateToken, async (req, res) => {
    try {
        const tickets = await prisma.ticket.findMany({ 
            where: { channel: { companyId: req.user.companyId } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tickets);
    } catch (error) { res.json([]); }
});

// --- MÓDULO 7: ESTRUCTURA DE CONOCIMIENTO (RAG OPTIMIZED) ---

app.get('/api/knowledge/structured', authenticateToken, async (req, res) => {
    try {
        const { instanceName } = req.query;
        if (!instanceName) return res.status(400).json({ error: 'Falta instanceName' });

        const channel = await prisma.channel.findUnique({
            where: { instanceName },
            include: {
                stocks: true,
                pricing: true,
                identity: true,
                logistics: true
            }
        });

        if (!channel) return res.status(404).json({ error: 'Canal no encontrado' });

        res.json({
            stock: channel.stocks,
            pricing: channel.pricing[0] || null,
            identity: channel.identity,
            logistics: channel.logistics
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/knowledge/stock', authenticateToken, async (req, res) => {
    try {
        const { instanceName, items } = req.body;
        const channel = await prisma.channel.findUnique({ where: { instanceName } });
        if (!channel) return res.status(404).json({ error: 'Canal no encontrado' });

        // Borrar stock anterior y cargar nuevo (Sincronización total)
        await prisma.productStock.deleteMany({ where: { channelId: channel.id } });
        
        const created = await prisma.productStock.createMany({
            data: items.map(item => ({
                channelId: channel.id,
                productId: item.productId,
                breed: item.breed,
                sex: item.sex,
                age: item.age,
                color: item.color,
                status: item.status || 'disponible'
            }))
        });

        res.json({ success: true, count: created.count });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/knowledge/pricing', authenticateToken, async (req, res) => {
    try {
        const { instanceName, pricing } = req.body;
        const channel = await prisma.channel.findUnique({ where: { instanceName } });
        if (!channel) return res.status(404).json({ error: 'Canal no encontrado' });

        await prisma.pricingConfig.deleteMany({ where: { channelId: channel.id } });
        const created = await prisma.pricingConfig.create({
            data: {
                channelId: channel.id,
                cashPrice: pricing.cashPrice,
                listPrice: pricing.listPrice,
                minDeposit: pricing.minDeposit,
                supportedQuotas: parseInt(pricing.supportedQuotas),
                approxInterest: pricing.approxInterest
            }
        });

        saveKnowledgeToFile(instanceName, 'pricing', created);
        res.json({ success: true, pricing: created });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/knowledge/identity', authenticateToken, async (req, res) => {
    try {
        const { instanceName, identity } = req.body;
        const channel = await prisma.channel.findUnique({ where: { instanceName } });
        if (!channel) return res.status(404).json({ error: 'Canal no encontrado' });

        const updated = await prisma.companyIdentity.upsert({
            where: { channelId: channel.id },
            update: identity,
            create: { ...identity, channelId: channel.id }
        });

        saveKnowledgeToFile(instanceName, 'identity', updated);
        res.json({ success: true, identity: updated });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/knowledge/logistics', authenticateToken, async (req, res) => {
    try {
        const { instanceName, logistics } = req.body;
        const channel = await prisma.channel.findUnique({ where: { instanceName } });
        if (!channel) return res.status(404).json({ error: 'Canal no encontrado' });

        const updated = await prisma.logisticsConfig.upsert({
            where: { channelId: channel.id },
            update: logistics,
            create: { ...logistics, channelId: channel.id }
        });

        saveKnowledgeToFile(instanceName, 'logistics', updated);
        res.json({ success: true, logistics: updated });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- MÓDULO 6: GESTIÓN ADMINISTRATIVA (NUEVA CONFIGURACIÓN) ---

app.get('/api/admin/hardware', authenticateToken, async (req, res) => {
    try {
        const os = require('os');
        const stats = {
            cpu: os.cpus()[0].model,
            cores: os.cpus().length,
            memory: Math.round(os.totalmem() / (1024 ** 3)) + ' GB',
            freeMemory: Math.round(os.freemem() / (1024 ** 3)) + ' GB',
            platform: os.platform(),
            uptime: Math.round(os.uptime() / 3600) + ' horas',
            tokensUsed: Math.floor(Math.random() * 500000) + 100000, // Simulado
            totalTokens: 1000000
        };
        res.json(stats);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/swarm/next-agent', authenticateToken, async (req, res) => {
    try {
        const { instanceName } = req.query;
        const orchestrator = await prisma.channel.findUnique({ where: { instanceName } });
        if (!orchestrator || orchestrator.swarmRole !== 'orchestrator') {
            return res.status(400).json({ error: 'La instancia no es un orquestador' });
        }

        const agents = await prisma.channel.findMany({
            where: { parentId: orchestrator.id, status: 'connected' },
            orderBy: { loadCount: 'asc' }
        });

        if (agents.length === 0) return res.status(404).json({ error: 'No hay agentes disponibles' });

        const agent = agents[0];
        // Incrementar carga
        await prisma.channel.update({ where: { id: agent.id }, data: { loadCount: { increment: 1 } } });

        // Generar Trace ID para seguimiento
        const traceId = `swarm_${Date.now()}`;
        
        res.json({
            agentInstance: agent.instanceName,
            agentPhone: agent.credentials?.me?.id?.split(':')[0] || 'unknown',
            traceId,
            handoffLink: `https://wa.me/${agent.credentials?.me?.id?.split(':')[0]}?text=Ref-${traceId}: Hola`
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/companies', authenticateToken, async (req, res) => {
    try {
        const companies = await prisma.saaSCompany.findMany({ include: { _count: { select: { agents: true } } } });
        res.json(companies);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST: Crear nueva empresa (requiere token de licencia válido + TOTP)
app.post('/api/admin/companies', authenticateToken, async (req, res) => {
    try {
        const { businessName, taxId, email, phones, website, licenseToken, totpCode } = req.body;

        if (!businessName || !taxId) {
            return res.status(400).json({ error: 'Faltan campos obligatorios: businessName, taxId' });
        }

        // --- VALIDACIÓN DE LICENCIA ---
        if (!licenseToken || !totpCode) {
            return res.status(403).json({ 
                error: 'Se requiere Token de Licencia y código de Google Authenticator para registrar una empresa.',
                code: 'LICENSE_REQUIRED'
            });
        }

        const LICENSE_SERVER = process.env.LICENSE_SERVER || 'http://127.0.0.1:7000';
        console.log(`[LICENSE] Intentando validar token: ${licenseToken.substring(0,8)}...`);
        console.log(`[LICENSE] Servidor destino: ${LICENSE_SERVER}/api/validate`);
        
        let licenseValid = false;
        let licenseData = {};

        try {
            console.log(`[LICENSE] Enviando petición POST a ${LICENSE_SERVER}...`);
            const licResp = await axios.post(`${LICENSE_SERVER}/api/validate`, {
                token: licenseToken,
                totp_code: totpCode
            }, { timeout: 10000 });
            
            console.log(`[LICENSE] Respuesta recibida:`, licResp.data);
            
            if (licResp.data && licResp.data.valid) {
                licenseValid = true;
                licenseData = licResp.data;
                console.log(`[LICENSE] ✅ Validación exitosa para: ${licenseData.company_name}`);
            } else {
                console.log(`[LICENSE] ❌ Validación rechazada por el servidor:`, licResp.data?.reason);
                return res.status(403).json({ 
                    error: licResp.data?.reason || 'Token de licencia inválido.',
                    code: 'LICENSE_INVALID'
                });
            }
        } catch (licErr) {
            console.error('[LICENSE] Error validando contra:', LICENSE_SERVER);
            console.error('[LICENSE] Mensaje de error:', licErr.message);
            
            const serverMsg = licErr.response?.data?.error || licErr.response?.data?.reason;
            
            return res.status(licErr.response?.status || 503).json({ 
                error: serverMsg || 'No se pudo verificar la licencia. Verificar conexión con el servidor de licencias.',
                details: licErr.message,
                code: 'LICENSE_SERVER_ERROR'
            });
        }

        // --- CREAR EMPRESA ---
        const company = await prisma.saaSCompany.create({
            data: {
                businessName,
                taxId: taxId || '',
                emails: email || '',
                phones: phones || '',
                website: website || '',
                licenseToken: licenseToken || ''
            }
        });

        console.log(`[COMPANY] ✅ Nueva empresa creada: ${businessName} (licencia: ${licenseToken.substring(0,12)}...)`);
        
        // Sincronizar licencia asíncronamente con Nucleo IA
        syncLicenseWithNucleo().catch(err => console.error('[SYNC-ERR]', err.message));

        res.status(201).json({ 
            success: true, 
            company,
            license: {
                company_name: licenseData.company_name,
                subscription_end: licenseData.subscription_end,
                warning: licenseData.warning
            }
        });
    } catch (e) { 
        console.error('[COMPANY CREATE ERROR]:', e.message);
        if (e.code === 'P2002') {
            return res.status(400).json({ error: 'La empresa o CUIT ya se encuentra registrada en el sistema.' });
        }
        res.status(500).json({ error: e.message }); 
    }
});

// GET: Estado de licencia del sistema (para el dashboard)
app.get('/api/license/status', authenticateToken, async (req, res) => {
    try {
        const LICENSE_SERVER = process.env.LICENSE_SERVER || 'http://127.0.0.1:7000';
        const licenseFile = require('path').join(__dirname, '..', 'ai_core', 'config', 'license_config.json');
        
        const companyId = req.user.companyId;
        let targetCompanyId = companyId;
        
        // Si es Super Admin y especifica otra empresa válida, permitir ver su licencia
        if (req.user.companyId === 1 && req.query.companyId && req.query.companyId !== 'undefined') {
            const parsed = parseInt(req.query.companyId);
            if (!isNaN(parsed)) targetCompanyId = parsed;
        }

        console.log(`[LICENSE] Step 1: companyId=${companyId}, targetCompanyId=${targetCompanyId}`);
        const company = await prisma.saaSCompany.findUnique({ where: { id: targetCompanyId } });
        console.log(`[LICENSE] Step 2: company found=${company?.businessName}, token=${company?.licenseToken}`);
        console.log('Company full object:', JSON.stringify(company, null, 2));
        
        let tokenToVerify = company?.licenseToken;
        let localData = {};

        // Si no hay token en la DB de la empresa, buscar en el archivo local (legacy/global)
        if (!tokenToVerify) {
            try {
                if (require('fs').existsSync(licenseFile)) {
                    localData = JSON.parse(require('fs').readFileSync(licenseFile, 'utf8'));
                    tokenToVerify = localData.token;
                }
            } catch (e) {}
        }
        
        if (!tokenToVerify) {
            return res.json({ status: 'no_license', message: 'Sin licencia instalada para esta empresa' });
        }

        try {
            const r = await axios.get(`${LICENSE_SERVER}/api/status/${tokenToVerify}`, { timeout: 5000 });
            console.log(`[LICENSE] Step 3: Server response:`, r.data);
            // Sincronizar licencia asíncronamente con Nucleo IA
            syncLicenseWithNucleo().catch(err => console.error('[SYNC-ERR]', err.message));
            
            res.json({
                status: r.data.valid ? 'active' : 'blocked',
                company_name: r.data.company_name || company?.businessName || localData.company_name,
                days_remaining: r.data.days_remaining,
                subscription_end: r.data.subscription_end || localData.subscription_end,
                token_preview: tokenToVerify ? tokenToVerify.substring(0, 12) + '...' : null,
                warning: r.data.warning || (r.data.days_remaining <= 7 ? 
                    `⚠️ Suscripción vence en ${r.data.days_remaining} días` : null)
            });
        } catch (e) {
            // Sincronizar licencia asíncronamente con Nucleo IA
            syncLicenseWithNucleo().catch(err => console.error('[SYNC-ERR]', err.message));

            // Modo offline: usar datos locales
            res.json({
                status: 'offline',
                company_name: localData.company_name,
                subscription_end: localData.subscription_end,
                token_preview: localData.token ? localData.token.substring(0, 12) + '...' : null,
                warning: '⚠️ Sin conexión al servidor de licencias (modo offline)'
            });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});


app.put('/api/admin/companies/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await prisma.saaSCompany.update({
            where: { id: parseInt(id) },
            data: {
                businessName: data.businessName,
                legalName: data.legalName,
                taxId: data.taxId,
                taxType: data.taxType,
                phones: data.phones,
                website: data.website,
                emails: data.emails
            }
        });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});



app.get('/api/admin/agents', authenticateToken, async (req, res) => {
    try {
        const { companyId } = req.query;
        const filter = companyId ? { companyId: parseInt(companyId) } : {};
        const agents = await prisma.sAAgent.findMany({ where: filter });
        res.json(agents);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/agents', authenticateToken, async (req, res) => {
    try {
        const data = req.body;
        const passwordHash = await bcrypt.hash(data.password || '123456', 10);
        const agent = await prisma.sAAgent.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: data.role,
                companyId: parseInt(data.companyId),
                passwordHash: passwordHash,
                status: 'active'
            }
        });
        res.json(agent);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/agents/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await prisma.sAAgent.update({
            where: { id: parseInt(id) },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: data.role,
                status: data.status
            }
        });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/agents/:id', authenticateToken, async (req, res) => {
    try {
        await prisma.sAAgent.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/channels/:id', authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { botName, configA1, configA2, configA3 } = req.body;
        
        let data = {};
        if (botName !== undefined) data.botName = botName;
        if (configA1 !== undefined) { try { data.configA1 = typeof configA1 === 'string' ? JSON.parse(configA1) : configA1; } catch { data.configA1 = configA1; } }
        if (configA2 !== undefined) { try { data.configA2 = typeof configA2 === 'string' ? JSON.parse(configA2) : configA2; } catch { data.configA2 = configA2; } }
        if (configA3 !== undefined) { try { data.configA3 = typeof configA3 === 'string' ? JSON.parse(configA3) : configA3; } catch { data.configA3 = configA3; } }
        
        const updated = await prisma.channel.update({
            where: { id },
            data
        });
        
        // Sincronizar con los archivos JSON en ai_core/config/instanceName/
        if (updated.instanceName) {
            
            const configDir = path.join(__dirname, '..', 'ai_core', 'config', updated.instanceName);
            if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
            
            if (data.configA1 !== undefined) fs.writeFileSync(path.join(configDir, 'config_a1.json'), JSON.stringify(data.configA1, null, 2));
            if (data.configA2 !== undefined) fs.writeFileSync(path.join(configDir, 'config_a2.json'), JSON.stringify(data.configA2, null, 2));
            if (data.configA3 !== undefined) fs.writeFileSync(path.join(configDir, 'config_a3.json'), JSON.stringify(data.configA3, null, 2));
        }

        res.json(updated);
    } catch (e) {
        console.error("Error updating channel:", e);
        res.status(500).json({ error: e.message });
    }
});

app.all('/api/data', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const url = `http://127.0.0.1:5000/api/data`;
        const method = req.method;
        const params = req.query;
        let response;
        
        // Interceptar delete_instance para borrar de Prisma tambien
        if (method === 'POST' && req.body && req.body.action === 'delete_instance') {
            try {
                await prisma.channel.deleteMany({
                    where: { instanceName: req.body.instance }
                });
            } catch (err) {
                console.error('[PRISMA-DELETE] Error:', err.message);
            }
        }

        if (req.file) {
            // Si hay archivo, reconstruir el form-data para el Nucleo IA
            const FormData = require('form-data');
            const form = new FormData();
            form.append('file', fs.createReadStream(req.file.path), req.file.originalname);
            
            // Agregar otros campos si existen en req.body
            Object.keys(req.body).forEach(key => {
                form.append(key, req.body[key]);
            });

            response = await axios.post(url, form, {
                headers: { ...form.getHeaders() },
                params,
                timeout: 60000
            });
            
            // Limpiar archivo temporal del backend
            try { fs.unlinkSync(req.file.path); } catch(e) {}
        } else {
            response = await axios({
                method,
                url,
                data: req.body,
                params,
                timeout: 60000
            });
        }

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('[API DATA PROXY ERROR]:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// --- MÓDULO 8: GESTOR DE FLUJOS (.FLU) ---

const getFlowsDir = (companyId) => {
    const dir = path.join(__dirname, '..', 'ai_core', 'flows', String(companyId || 'general'));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
};

app.get('/api/flows', authenticateToken, (req, res) => {
    try {
        const companyId = req.query.companyId || req.user.companyId;
        const flowsDir = getFlowsDir(companyId);
        console.log(`[FLOWS] Fetching flows for company ${companyId} from ${flowsDir}`);
        const files = fs.readdirSync(flowsDir).filter(f => f.endsWith('.flu'));
        const flows = files.map(f => {
            try {
                const content = fs.readFileSync(path.join(flowsDir, f), 'utf8');
                return {
                    name: f.replace('.flu', ''),
                    path: f,
                    content: JSON.parse(content)
                };
            } catch (err) { 
                console.error(`[FLOWS] Error parsing ${f}:`, err.message);
                return null; 
            }
        }).filter(f => f !== null);
        console.log(`[FLOWS] Found ${flows.length} valid flows`);
        res.json(flows);
    } catch (e) { 
        console.error(`[FLOWS] GET Error:`, e.message);
        res.status(500).json({ error: e.message }); 
    }
});

app.post('/api/flows/save', authenticateToken, (req, res) => {
    try {
        const { name, flow, companyId } = req.body;
        const targetCompanyId = companyId || req.user.companyId;
        const flowsDir = getFlowsDir(targetCompanyId);
        const filePath = path.join(flowsDir, `${name}.flu`);
        fs.writeFileSync(filePath, JSON.stringify(flow, null, 2));
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- IMPORTAR PRECIOS DESDE CSV / XLS / PDF ---
app.post('/api/knowledge/upload-pricing', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { instanceName, targetFile } = req.body; // targetFile: 'pricing' | 'logistics'
        if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo.' });
        if (!instanceName) return res.status(400).json({ error: 'Falta instanceName.' });

        const channel = await prisma.channel.findFirst({ where: { instanceName } });
        if (!channel) return res.status(404).json({ error: 'Canal no encontrado.' });

        const companyId = channel.companyId;
        const configDir = path.join(__dirname, '..', 'ai_core', 'config', `company_${companyId}`, 'configs');
        if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

        const ext = path.extname(req.file.originalname).toLowerCase();
        let result = {};

        if (ext === '.csv') {
            const csvContent = fs.readFileSync(req.file.path, 'utf8');
            const lines = csvContent.split('\n').filter(l => l.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            for (let i = 1; i < lines.length; i++) {
                const vals = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const row = {};
                headers.forEach((h, idx) => row[h] = vals[idx] || '');
                
                // Detect if it's a logistics row (has localidad/km/costo) or pricing (name/precio)
                if (row.localidad || row.zona) {
                    const key = row.localidad || row.zona;
                    const price = parseInt((row.costo || row.precio || '0').replace(/\D/g, '')) || 0;
                    result[key] = price;
                } else if (row.nombre || row.raza || row.producto) {
                    const key = row.nombre || row.raza || row.producto;
                    result[key] = {
                        precio: row.precio || row.price || 0,
                        stock: parseInt(row.stock) || 100,
                        macho: row.macho,
                        hembra: row.hembra
                    };
                }
            }
        } else {
            // For PDF/XLS: delegate to Python nucleo
            const formData = new FormData();
            formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);
            formData.append('action', 'parse_pricing_file');
            formData.append('instance', instanceName);
            formData.append('target', targetFile || 'logistics');
            try {
                const pyResp = await axios.post('http://127.0.0.1:5000/api/data', formData, {
                    headers: { ...formData.getHeaders() }, timeout: 30000
                });
                result = pyResp.data?.result || {};
            } catch (pyErr) {
                console.error('[UPLOAD-PRICING] Python parse failed:', pyErr.message);
                return res.status(500).json({ error: 'Error procesando el archivo en el núcleo IA.' });
            }
        }

        const outFile = targetFile === 'pricing' ? 'pricing.json' : 'logistics.json';
        const outPath = path.join(configDir, outFile);
        
        // Merge with existing
        let existing = {};
        if (fs.existsSync(outPath)) {
            try { existing = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
        }
        const merged = { ...existing, ...result };
        fs.writeFileSync(outPath, JSON.stringify(merged, null, 2));
        
        try { fs.unlinkSync(req.file.path); } catch {}
        
        res.json({ success: true, entries: Object.keys(result).length, file: outFile });
    } catch (e) { 
        console.error('[UPLOAD-PRICING ERROR]:', e.message);
        res.status(500).json({ error: e.message }); 
    }
});

app.delete('/api/flows/:name', authenticateToken, (req, res) => {
    try {
        const { name } = req.params;
        const companyId = req.query.companyId || req.user.companyId;
        const flowsDir = getFlowsDir(companyId);
        const filePath = path.join(flowsDir, `${name}.flu`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[FLOWS] Deleted flow file: ${filePath}`);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'El flujo no existe' });
        }
    } catch (e) {
        console.error(`[FLOWS] DELETE Error:`, e.message);
        res.status(500).json({ error: e.message });
    }
});


// ============================================================
// MÓDULO 9: ADMINISTRACIÓN DE LICENCIAS (Solo Superadmin)
// ============================================================

const LICENSE_ADMIN_KEY = process.env.LICENSE_ADMIN_KEY || 'CAMBIA_ESTA_CLAVE_ADMIN_123!';
const LICENSE_SRV = process.env.LICENSE_SERVER || 'http://127.0.0.1:7000';
const LIC_HEADERS = { 'X-Admin-Key': LICENSE_ADMIN_KEY, 'Content-Type': 'application/json' };

// Middleware: solo superadmin (companyId === 1)
const onlySuperAdmin = (req, res, next) => {
    if (req.user?.companyId !== 1 && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso restringido al superadministrador.' });
    }
    next();
};

// GET: Listar todas las licencias
app.get('/api/admin/licenses', authenticateToken, onlySuperAdmin, async (req, res) => {
    try {
        const r = await axios.get(`${LICENSE_SRV}/admin/list_licenses`, {
            headers: LIC_HEADERS, timeout: 8000
        });
        res.json(r.data);
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            return res.status(503).json({ error: 'Servidor de licencias no disponible. ¿Está corriendo en el puerto 7000?' });
        }
        res.status(500).json({ error: e.response?.data?.error || e.message });
    }
});

// POST: Crear nueva licencia
app.post('/api/admin/licenses/create', authenticateToken, onlySuperAdmin, async (req, res) => {
    try {
        const { company_name, email, months = 1 } = req.body;
        if (!company_name) return res.status(400).json({ error: 'company_name es requerido' });
        const r = await axios.post(`${LICENSE_SRV}/admin/create_license`, {
            company_name, email, months: parseInt(months)
        }, { headers: LIC_HEADERS, timeout: 8000 });
        res.status(201).json(r.data);
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            return res.status(503).json({ error: 'Servidor de licencias no disponible.' });
        }
        res.status(500).json({ error: e.response?.data?.error || e.message });
    }
});

// POST: Renovar licencia
app.post('/api/admin/licenses/renew/:token', authenticateToken, onlySuperAdmin, async (req, res) => {
    try {
        const { token } = req.params;
        const { months = 1 } = req.body;
        const r = await axios.post(`${LICENSE_SRV}/admin/renew/${encodeURIComponent(token)}`,
            { months: parseInt(months) },
            { headers: LIC_HEADERS, timeout: 8000 }
        );
        res.json(r.data);
    } catch (e) {
        res.status(500).json({ error: e.response?.data?.error || e.message });
    }
});

// POST: Revocar/bloquear licencia
app.post('/api/admin/licenses/revoke/:token', authenticateToken, onlySuperAdmin, async (req, res) => {
    try {
        const { token } = req.params;
        const r = await axios.post(`${LICENSE_SRV}/admin/revoke/${encodeURIComponent(token)}`,
            {}, { headers: LIC_HEADERS, timeout: 8000 }
        );
        res.json(r.data);
    } catch (e) {
        res.status(500).json({ error: e.response?.data?.error || e.message });
    }
});

// GET: Estado individual de una licencia
app.get('/api/admin/licenses/status/:token', authenticateToken, onlySuperAdmin, async (req, res) => {
    try {
        const r = await axios.get(`${LICENSE_SRV}/api/status/${encodeURIComponent(req.params.token)}`,
            { timeout: 5000 }
        );
        res.json(r.data);
    } catch (e) {
        res.status(500).json({ error: e.response?.data?.error || e.message });
    }
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('[GLOBAL ERROR]', err.stack);
    reportBackendError(err.message, err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

async function reportBackendError(message, stack) {
    try {
        const licServer = process.env.LICENSE_SERVER;
        const licToken = process.env.LICENSE_TOKEN;
        if (!licServer || !licToken) return;

        let console_log = 'Captured in backend process.';
        // Intentar leer las últimas líneas de logs del backend si existiera un archivo de logs,
        // o si no, simplemente reportar el stack trace.
        
        await axios.post(`${licServer}/api/report_issue`, {
            token: licToken,
            component: 'backend',
            error_message: message,
            stack_trace: stack,
            console_log: console_log
        }, { timeout: 5000 });
    } catch (e) {
        console.error('Failed to report backend error to license server:', e.message);
    }
}

// Global Process Exception Handlers
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.stack || err);
    reportBackendError(err.message || String(err), err.stack || String(err));
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    reportBackendError(reason?.message || String(reason), reason?.stack || String(reason));
});

async function syncWhatsappInstances() {
    try {
        console.log('[SYNC] Sincronizando instancias de WhatsApp con la base de datos...');
        const apikey = process.env.AUTHENTICATION_API_KEY || 'PICE-SAAS-DEFAULT-KEY-2026';
        const EVO_URL = 'http://127.0.0.1:8080';

        // 1. Obtener canales de la BD
        const dbChannels = await prisma.channel.findMany({
            where: { platform: { in: ['WHATSAPP', 'whatsapp'] } }
        });
        const activeNames = new Set(dbChannels.map(c => c.instanceName));
        console.log(`[SYNC] Canales activos en BD:`, Array.from(activeNames));

        // 2. Obtener instancias en el servicio de WhatsApp
        const response = await axios.get(`${EVO_URL}/debug/instances`, {
            headers: { apikey },
            timeout: 5000
        });

        const runningInstances = response.data.keys || [];
        console.log(`[SYNC] Instancias corriendo en servicio WA:`, runningInstances);

        // 3. Eliminar las que no estén en la BD
        const runningSet = new Set(runningInstances);
        for (const inst of runningInstances) {
            if (!activeNames.has(inst) && inst !== 'test_qr' && !inst.endsWith('_phone')) {
                console.log(`[SYNC] Detectada instancia no registrada en la base de datos: ${inst}. Eliminando de la memoria y disco...`);
                try {
                    await axios.delete(`${EVO_URL}/instance/delete/${inst}`, {
                        headers: { apikey },
                        timeout: 5000
                    });
                    console.log(`[SYNC] Instancia ${inst} eliminada con éxito.`);
                } catch (err) {
                    console.error(`[SYNC] Error eliminando ${inst}:`, err.message);
                }
            }
        }

        // 4. Iniciar las registradas que no están corriendo en Baileys
        for (const channel of dbChannels) {
            if ((channel.platform === 'WHATSAPP' || channel.platform === 'whatsapp') && !runningSet.has(channel.instanceName)) {
                console.log(`[SYNC] Instancia registrada en DB pero no activa en servicio WA: ${channel.instanceName}. Autoconectando...`);
                try {
                    await axios.get(`${EVO_URL}/instance/connect/${channel.instanceName}`, {
                        headers: { apikey },
                        timeout: 5000
                    });
                } catch (err) {
                    console.error(`[SYNC] Fallo reconexion auto de ${channel.instanceName}:`, err.message);
                }
            }
        }
    } catch (error) {
        console.error('[SYNC ERROR]: Falló la sincronización de instancias:', error.message);
    }
}

async function syncLicenseWithNucleo() {
    try {
        console.log('[LICENSE-SYNC] Sincronizando licencia con Nucleo IA...');
        // Buscar la primera compañía con licencia
        const company = await prisma.saaSCompany.findFirst({
            where: {
                licenseToken: { not: '' }
            }
        });
        
        const licenseToken = company?.licenseToken || process.env.LICENSE_TOKEN;
        const licenseServer = process.env.LICENSE_SERVER || 'http://127.0.0.1:7000';
        
        if (licenseToken) {
            console.log(`[LICENSE-SYNC] Enviando licencia a Nucleo IA (Server: ${licenseServer}, Token: ${licenseToken.substring(0, 12)}...)`);
            await axios.post('http://127.0.0.1:5000/api/config_license', {
                license_server: licenseServer,
                license_token: licenseToken
            }, { timeout: 5000 });
            console.log('[LICENSE-SYNC] ✅ Licencia sincronizada con éxito.');
        } else {
            console.log('[LICENSE-SYNC] No se encontró un token de licencia para sincronizar.');
        }
    } catch (err) {
        console.error('[LICENSE-SYNC ERROR] Falló sincronización con Nucleo IA:', err.message);
    }
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Orchestrator running on http://0.0.0.0:${PORT}`);
    // Sincronizar instancias de whatsapp después de 10 segundos
    setTimeout(syncWhatsappInstances, 10000);
    setInterval(syncWhatsappInstances, 300000);
    
    // Sincronizar licencia con Nucleo IA después de 5 segundos
    setTimeout(syncLicenseWithNucleo, 5000);
    // Y sincronizar periódicamente cada 5 minutos
    setInterval(syncLicenseWithNucleo, 300000);
});



const sqlite3 = require('sqlite3').verbose();
const path = require('path');

app.get('/api/models-stats', authenticateToken, (req, res) => {
  const dbPath = path.join(__dirname, '..', 'ai_core', 'config', 'brain_sessions.db');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return res.status(500).json({error: err.message});
    db.all('SELECT * FROM ai_models_stats ORDER BY success_count DESC', [], (err, rows) => {
      db.close();
      if (err) return res.status(500).json({error: err.message});
      res.json(rows);
    });
  });
});

