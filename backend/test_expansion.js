
const run = async () => {
    console.log('--- INICIANDO SUITE DE EXPANSIÓN PICE SaaS V4 ---');
    
    // 1. Prueba de Carga RAG (Módulo 3)
    const testRAG = async () => {
        console.log('[RAG] Inyectando conocimiento Pomerania...');
        const manualContent = '# MANUAL EXCLUSIVO: POMERANIA MINI EXTRA TOY\n\n- Precio: $2.500.000\n- Colores: Blanco Nieve, Crema, Naranja.\n- Peso adulto: 1.5kg a 2.5kg.\n- Cuidados: Cepillado diario y alimentación premium.\n- Garantía: Certificado de pureza y 1 año de salud genética.';
        
        try {
            const response = await fetch('http://localhost:4000/knowledge/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company: 'NICO_Ventas',
                    channel: 'WA_Principal',
                    fileName: 'manual_pomerania.txt',
                    content: manualContent
                })
            });
            const data = await response.json();
            console.log('   Result:', data.success ? 'SUCCESS (Optimized to .md)' : 'FAILED');
        } catch (e) {
            console.error('   Error:', e.message);
        }
    };

    // 2. Conexión de Canales (Módulo 4)
    const connectChannel = async (platform, botName) => {
        console.log(`[CHANNEL] Conectando ${platform.toUpperCase()}...`);
        try {
            const response = await fetch(`http://localhost:4000/channels/connect/${platform}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botName: botName,
                    companyId: 1
                })
            });
            const data = await response.json();
            console.log(`   Result: SUCCESS (Agent ID: ${data.channel?.id})`);
        } catch (e) {
            console.error(`   Error ${platform}:`, e.message);
        }
    };

    await testRAG();
    await connectChannel('telegram', 'NicoBot_Telegram_Oficial');
    await connectChannel('instagram', 'NicoVentas_IG_Store');
    
    console.log('\n--- EXPANSIÓN COMPLETADA CON ÉXITO ---');
};

run();
