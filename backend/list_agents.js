const { PrismaClient } = require('./prisma/generated-client-v2');
const prisma = new PrismaClient();

async function main() {
  const agents = await prisma.sAAgent.findMany();
  console.log('Agents:', agents);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
