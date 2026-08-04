const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('c:/SaaSIA/backend/prisma/dev.db');

async function fixUsers() {
    const hash = await bcrypt.hash('Tomi4656$', 10);
    console.log('Hash generado para Tomi4656$:', hash);

    const now = Date.now();

    // 1. admin@antigravity.io
    db.run(
        `INSERT INTO agents (company_id, name, email, password_hash, role, status, created_at)
         VALUES (1, 'Admin Antigravity', 'admin@antigravity.io', ?, 'admin', 'active', ?)
         ON CONFLICT(email) DO UPDATE SET password_hash = ?, role = 'admin', status = 'active'`,
        [hash, now, hash],
        function(err) {
            if (err) console.error('Error admin@antigravity.io:', err);
            else console.log('✓ Usuario admin@antigravity.io actualizado/creado con rol admin y clave Tomi4656$');
        }
    );

    // 2. damduff@gmail.com
    db.run(
        `INSERT INTO agents (company_id, name, email, password_hash, role, status, created_at)
         VALUES (1, 'Damian Duff', 'damduff@gmail.com', ?, 'admin', 'active', ?)
         ON CONFLICT(email) DO UPDATE SET password_hash = ?, role = 'admin', status = 'active'`,
        [hash, now, hash],
        function(err) {
            if (err) console.error('Error damduff@gmail.com:', err);
            else console.log('✓ Usuario damduff@gmail.com actualizado/creado con rol admin y clave Tomi4656$');

            // Listar todos los usuarios para verificación
            db.all('SELECT id, company_id, name, email, role, status FROM agents', (err, rows) => {
                console.log('\n--- LISTADO DE AGENTES EN BASE DE DATOS ---');
                console.table(rows);
                db.close();
            });
        }
    );
}

fixUsers();
