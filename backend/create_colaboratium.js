const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const devDbPath = path.join(__dirname, 'prisma', 'dev.db');
const brainDbPath = path.join(__dirname, '..', 'ai_core', 'config', 'brain_sessions.db');

async function createCompanyAndUser() {
    const devDb = new sqlite3.Database(devDbPath);
    const brainDb = new sqlite3.Database(brainDbPath);

    const companyName = 'colaboratium';
    const taxId = '30712345671';
    const email = 'publicidadgloballoan@gmail.com';
    const rawPass = 'Grupo4656$';
    const now = Date.now();

    const passwordHash = await bcrypt.hash(rawPass, 10);

    // 1. Insertar o recuperar empresa en dev.db
    devDb.get("SELECT id FROM companies WHERE business_name = ? OR tax_id = ?", [companyName, taxId], (err, existingComp) => {
        if (err) {
            console.error('Error buscando empresa en dev.db:', err);
            return;
        }

        const handleWithCompanyId = (companyId) => {
            console.log(`✓ Empresa '${companyName}' ID: ${companyId}`);

            // 2. Insertar o actualizar agente/usuario en dev.db
            devDb.run(
                `INSERT INTO agents (company_id, name, email, password_hash, role, status, created_at)
                 VALUES (?, 'Colaboratium Admin', ?, ?, 'admin', 'active', ?)
                 ON CONFLICT(email) DO UPDATE SET 
                    company_id = excluded.company_id,
                    password_hash = excluded.password_hash,
                    role = 'admin',
                    status = 'active'`,
                [companyId, email, passwordHash, now],
                function(errAgent) {
                    if (errAgent) {
                        console.error('Error insertando agente en dev.db:', errAgent);
                    } else {
                        console.log(`✓ Usuario '${email}' creado/actualizado como admin con clave '${rawPass}'`);
                    }

                    // 3. Sincronizar en brain_sessions.db de AI Core
                    brainDb.run(
                        `INSERT INTO companies (id, name) VALUES (?, ?)
                         ON CONFLICT(id) DO UPDATE SET name = excluded.name`,
                        [companyId, companyName.toUpperCase()],
                        function(errBrain) {
                            if (errBrain) {
                                console.error('Error insertando empresa en brain_sessions.db:', errBrain);
                            } else {
                                console.log(`✓ Empresa sincronizada en brain_sessions.db con ID: ${companyId}`);
                            }

                            // 4. Crear carpetas de config para la nueva empresa
                            const compDir = path.join(__dirname, '..', 'ai_core', 'config', `company_${companyId}`);
                            fs.mkdirSync(path.join(compDir, 'configs'), { recursive: true });
                            fs.mkdirSync(path.join(compDir, 'media'), { recursive: true });
                            fs.mkdirSync(path.join(compDir, 'knowledge', 'general'), { recursive: true });
                            console.log(`✓ Carpetas de configuración creadas en: ${compDir}`);

                            // 5. Listar para verificación
                            devDb.all('SELECT id, business_name, tax_id FROM companies', (err1, comps) => {
                                console.log('\n--- EMPRESAS EN dev.db ---');
                                console.table(comps);

                                devDb.all('SELECT id, company_id, name, email, role, status FROM agents', (err2, agts) => {
                                    console.log('\n--- AGENTES EN dev.db ---');
                                    console.table(agts);

                                    brainDb.all('SELECT * FROM companies', (err3, brainComps) => {
                                        console.log('\n--- EMPRESAS EN brain_sessions.db ---');
                                        console.table(brainComps);

                                        devDb.close();
                                        brainDb.close();
                                    });
                                });
                            });
                        }
                    );
                }
            );
        };

        if (existingComp) {
            handleWithCompanyId(existingComp.id);
        } else {
            devDb.run(
                `INSERT INTO companies (business_name, tax_id, created_at) VALUES (?, ?, ?)`,
                [companyName, taxId, now],
                function(errIns) {
                    if (errIns) {
                        console.error('Error creando empresa en dev.db:', errIns);
                        return;
                    }
                    handleWithCompanyId(this.lastID);
                }
            );
        }
    });
}

createCompanyAndUser();
