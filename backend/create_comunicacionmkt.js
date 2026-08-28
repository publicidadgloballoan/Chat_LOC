const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const devDbPath = path.join(__dirname, 'prisma', 'dev.db');
const brainDbPath = path.join(__dirname, '..', 'ai_core', 'config', 'brain_sessions.db');

async function createComunicacionMKTCompanyAndUser() {
    const devDb = new sqlite3.Database(devDbPath);
    const brainDb = new sqlite3.Database(brainDbPath);

    const companyId = 4;
    const companyName = 'ComunicacionMKT';
    const companyNameUpper = 'COMUNICACIONMKT';
    const taxId = '30719994444';
    const email = 'contacto@comunicacionmkt.com';
    const adminEmail = 'admin@comunicacionmkt.com';
    const rawPass = 'ComunicacionMKT2026!';
    const now = Date.now();

    const passwordHash = await bcrypt.hash(rawPass, 10);

    // 1. Insertar o actualizar empresa en dev.db
    devDb.run(
        `INSERT INTO companies (id, business_name, legal_name, tax_id, emails, website, created_at)
         VALUES (?, ?, 'ComunicacionMKT S.A.', ?, ?, 'https://comunicacionmkt.com', ?)
         ON CONFLICT(id) DO UPDATE SET
            business_name = excluded.business_name,
            legal_name = excluded.legal_name,
            tax_id = excluded.tax_id,
            emails = excluded.emails,
            website = excluded.website`,
        [companyId, companyName, taxId, email, now],
        function(errComp) {
            if (errComp) {
                console.error('Error insertando empresa en dev.db:', errComp);
                return;
            }
            console.log(`✓ Empresa '${companyName}' registrada en dev.db con ID ${companyId}`);

            // 2. Insertar o actualizar agente en dev.db
            devDb.run(
                `INSERT INTO agents (company_id, name, email, password_hash, role, status, created_at)
                 VALUES (?, 'ComunicacionMKT Admin', ?, ?, 'admin', 'active', ?)
                 ON CONFLICT(email) DO UPDATE SET
                    company_id = excluded.company_id,
                    password_hash = excluded.password_hash,
                    role = 'admin',
                    status = 'active'`,
                [companyId, adminEmail, passwordHash, now],
                function(errAgent) {
                    if (errAgent) {
                        console.error('Error insertando agente en dev.db:', errAgent);
                    } else {
                        console.log(`✓ Usuario '${adminEmail}' creado en dev.db con clave '${rawPass}'`);
                    }

                    // 3. Sincronizar en brain_sessions.db
                    brainDb.run(
                        `INSERT INTO companies (id, name) VALUES (?, ?)
                         ON CONFLICT(id) DO UPDATE SET name = excluded.name`,
                        [companyId, companyNameUpper],
                        function(errBrain) {
                            if (errBrain) {
                                console.error('Error en brain_sessions.db:', errBrain);
                            } else {
                                console.log(`✓ Empresa sincronizada en brain_sessions.db (ID: ${companyId})`);
                            }

                            devDb.all('SELECT id, business_name, tax_id FROM companies', (e1, comps) => {
                                console.log('\n--- EMPRESAS EN dev.db ---');
                                console.table(comps);

                                brainDb.all('SELECT * FROM companies', (e2, brainComps) => {
                                    console.log('\n--- EMPRESAS EN brain_sessions.db ---');
                                    console.table(brainComps);

                                    devDb.close();
                                    brainDb.close();
                                });
                            });
                        }
                    );
                }
            );
        }
    );
}

createComunicacionMKTCompanyAndUser();
