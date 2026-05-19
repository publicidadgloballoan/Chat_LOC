const { PrismaClient } = require('./prisma/generated-client-v2');
const prisma = new PrismaClient();
async function run() {
  const id = 1;
  const company = await prisma.saaSCompany.findUnique({ where: { id } });
  console.log('Company 1:', JSON.stringify(company, null, 2));
}
run().finally(() => prisma.$disconnect());
