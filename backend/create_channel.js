const { PrismaClient } = require('./prisma/generated-client');
const prisma = new PrismaClient();

async function main() {
  // Crear el canal para Nico_Ventas (ID 2)
  const newChannel = await prisma.channel.create({
    data: {
      companyId: 2,
      platform: 'WhatsApp',
      botName: 'Nico Ventas Bot',
      instanceName: 'nico_ventas_wa',
      status: 'disconnected'
    }
  });
  console.log('Canal creado con éxito:', JSON.stringify(newChannel, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
