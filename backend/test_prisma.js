const { PrismaClient } = require('./prisma/generated-client-v2');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.saaSCompany.count();
    console.log(`Connection successful. Companies count: ${count}`);
  } catch (e) {
    console.error('Connection failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
