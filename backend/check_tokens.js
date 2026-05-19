const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const result = await prisma.$queryRaw`SELECT id, business_name, license_token FROM companies`;
  console.log(JSON.stringify(result, null, 2));
}
run().finally(() => prisma.$disconnect());
