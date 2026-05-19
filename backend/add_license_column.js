const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres:cebdef04370d542a7e7d70827ce798cb@localhost:5432/saas_antigravity"
});

async function run() {
  await client.connect();
  try {
    await client.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS license_token TEXT;');
    console.log('Column license_token added successfully');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await client.end();
  }
}

run();
