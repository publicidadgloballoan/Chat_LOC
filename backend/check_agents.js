const { PrismaClient } = require('./prisma/generated-client-v2');
const prisma = new PrismaClient();
async function run() {
  const agents = await prisma.sAAgent.findMany();
  console.log(JSON.stringify(agents, null, 2));
}
run().finally(() => prisma.$disconnect());
