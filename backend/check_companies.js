const { PrismaClient } = require('./prisma/generated-client-v2');
const prisma = new PrismaClient();

async function main() {
    const companies = await prisma.saaSCompany.findMany();
    console.log("COMPANIES IN POSTGRES:");
    companies.forEach(c => console.log(`${c.id} | ${c.businessName}`));
    process.exit(0);
}
main();
