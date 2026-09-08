const bcrypt = require("bcrypt");
const prisma = require("../src/lib/prisma");

const DEMO_EMAIL = "demo@profitpeak.dev";
const DEMO_PASSWORD = "demopass123";

async function main() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, password },
  });
  console.log(`Seeded demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
