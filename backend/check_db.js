const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('dev.db'); db.all('SELECT email, role FROM SAAgent', [], (err, rows) => { if (err) throw err; console.log(rows); });
