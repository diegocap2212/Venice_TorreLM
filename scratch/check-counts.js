
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const all = await prisma.colaborador.findMany({
    select: { status: true }
  });
  
  const counts = all.reduce((acc, curr) => {
    acc[curr.status || "null"] = (acc[curr.status || "null"] || 0) + 1;
    return acc;
  }, {});
  
  console.log("Total Colaboradores:", all.length);
  console.log("Counts per Status:", counts);
  process.exit(0);
}

check();
