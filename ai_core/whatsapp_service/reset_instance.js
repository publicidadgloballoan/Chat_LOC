const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const instanceName = process.argv[2];
if (!instanceName) {
    console.error('Uso: node reset_instance.js <nombre_instancia>');
    process.exit(1);
}

const authDir = path.join(__dirname, 'baileys_auth', instanceName);

console.log(`[RESET] Eliminando sesion para ${instanceName}...`);

if (fs.existsSync(authDir)) {
    try {
        fs.rmSync(authDir, { recursive: true, force: true });
        console.log(`[RESET] Directorio ${authDir} eliminado.`);
    } catch (err) {
        console.error(`[RESET] Error eliminando directorio: ${err.message}`);
    }
} else {
    console.log(`[RESET] No existe directorio de sesion para ${instanceName}.`);
}

console.log(`[RESET] La instancia ${instanceName} ha sido reseteada. Escanea el QR nuevamente en el Dashboard.`);
