require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const SQLite = require("better-sqlite3");

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Criar usuários base (Roles)
  const bp = await prisma.user.upsert({
    where: { email: "rh@venice.com.br" },
    update: {},
    create: {
      email: "rh@venice.com.br",
      name: "Ana (BP RH)",
      role: "BP",
    },
  });

  const sdm = await prisma.user.upsert({
    where: { email: "sdm@venice.com.br" },
    update: {},
    create: {
      email: "sdm@venice.com.br",
      name: "Carlos (SDM)",
      role: "SDM",
    },
  });

  // 2. Criar Vagas iniciais
  const vagas = [
    {
      titulo: "SM Sênior · Esteira de Crédito",
      perfil_tipo: "SM",
      senioridade: "Sênior",
      aba_atual: "RECRUTAMENTO",
      etapa_atual: "REQUISICAO",
      urgencia: "ALTA",
      squad_destino: "Crédito Imobiliário",
      responsavel_id: bp.id,
      criado_por_id: bp.id,
      sla_dias: 2,
    },
    {
      titulo: "PO Pleno · Cartões",
      perfil_tipo: "PO",
      senioridade: "Pleno",
      aba_atual: "RECRUTAMENTO",
      etapa_atual: "TRIAGEM",
      urgencia: "NORMAL",
      squad_destino: "Loyalty",
      responsavel_id: bp.id,
      criado_por_id: bp.id,
      sla_dias: 10,
    },
    {
      titulo: "Arquiteto de Soluções · Core Banking",
      perfil_tipo: "Dev",
      senioridade: "Especialista",
      aba_atual: "ONBOARDING",
      etapa_atual: "CONTRATACAO",
      urgencia: "CRITICA",
      squad_destino: "Infra",
      responsavel_id: sdm.id, // SDM do lado de onboarding
      criado_por_id: bp.id,
      sla_dias: 15,
    },
  ];

  for (const v of vagas) {
    await prisma.vaga.create({ data: v });
  }

  console.log("Seed completa: Usuários e Vagas criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
