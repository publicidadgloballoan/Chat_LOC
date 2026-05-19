const { PrismaClient } = require('./prisma/generated-client-v2');
const prisma = new PrismaClient();

async function main() {
    const channels = await prisma.channel.findMany();
    console.log("CHANNELS IN POSTGRES:");
    channels.forEach(c => console.log(`${c.instanceName} | CompanyID: ${c.companyId}`));
    process.exit(0);
}
main();
