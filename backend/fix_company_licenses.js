const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const companies = await prisma.$queryRaw`SELECT id, business_name FROM companies`;
  console.log('Companies:', companies);
  
  const canes = companies.find(c => c.business_name.toLowerCase().includes('canes') || c.business_name.toLowerCase().includes('nico'));
  if (canes) {
    await prisma.$executeRaw`UPDATE companies SET license_token = 'SIA-7436-88D9-6F2A-C350' WHERE id = ${canes.id}`;
    console.log(`Updated license for ${canes.business_name}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
