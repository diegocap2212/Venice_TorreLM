require("dotenv").config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 0. Limpar dados anteriores para evitar duplicatas
  await prisma.vaga.deleteMany({});
  await prisma.colaborador.deleteMany({});

  // 1. Criar usuários base (Roles) com senha padrão 'venice123'
  const hashedPassword = await bcrypt.hash("venice123", 10);

  const bp = await prisma.user.upsert({
    where: { email: "rh@venice.com.br" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "rh@venice.com.br",
      password: hashedPassword,
      name: "Ana (BP RH)",
      role: "BP",
    },
  });

  const sdm = await prisma.user.upsert({
    where: { email: "sdm@venice.com.br" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "sdm@venice.com.br",
      password: hashedPassword,
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

  // 3. Criar Colaboradores
  const colaboradores = [
    { nome: "Abraão Melo Vilela", cargo: "Analista de QA", status: "Ativo", data_admissao: new Date("2024-04-07"), data_nascimento: new Date("1995-05-25"), torre: "Backoffice", squad: "Faturamento - Squad Tera", email: "ext.abraao.vilela@lmmobilidade.com.br" },
    { nome: "Aguinaldo Aparecido de Brito Junior", cargo: "Analista de QA", status: "Ativo", data_admissao: new Date("2026-01-05"), data_nascimento: new Date("1994-07-14"), torre: "Vendas assistidas e seminovos", squad: "Canal Indireto", email: "ext.aguinaldo.junior@lmmobilidade.com.br" },
    { nome: "Gabriel Marquez Volponi", cargo: "Analista de QA", status: "Ativo", data_admissao: new Date("2024-10-30"), data_nascimento: new Date("2001-05-11"), torre: "Vendas assistidas e seminovos", squad: "Pricing", email: "ext.gabriel.volponi@lmmobilidade.com.br" },
    { nome: "Bruna Tatiane Bonnecher Steffen", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2025-01-06"), data_nascimento: new Date("1986-02-02"), torre: "Backoffice", squad: "Contábil/Fiscal", email: "ext.bruna.steffen@lmmobilidade.com.br" },
    { nome: "Caio Fábio Duarte Ferreira", cargo: "Desenvolvedor Front-End", status: "Ativo", data_admissao: new Date("2023-03-06"), data_nascimento: new Date("1994-06-03"), torre: "Autoatendimento e ativação", squad: "Portal do cliente", email: "venice.caio@lmmobilidade.com.br" },
    { nome: "Carlos Eduardo Rodrigues Nogueira", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2025-10-27"), data_nascimento: new Date("1992-01-05"), torre: "Autoatendimento e ativação", squad: "Portal do cliente", email: "ext.carlos.nogueira@lmmobilidade.com.br" },
    { nome: "Carlos Pedrinho Weiss Filho", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2024-05-27"), data_nascimento: new Date("1980-04-16"), torre: "Autoatendimento e ativação", squad: "Esteira de crédito", email: "venice.carlos.filho@lmmobilidade.com.br" },
    { nome: "Charles Janio Olavo Dos Santos", cargo: "Desenvolvedor Back-End", status: "Ativo", data_admissao: new Date("2023-07-24"), data_nascimento: new Date("1983-12-01"), torre: "Vendas assistidas e seminovos", squad: "Canal Indireto", email: "ext.charles.santos@lmmobilidade.com.br" },
    { nome: "Christiane Zavatta", cargo: "Analista de Processos", status: "Ativo", data_admissao: new Date("2024-04-29"), data_nascimento: new Date("1983-01-21"), torre: "Governança", squad: "Mapeando processos locavia", email: "ext.christiane.zavatta@lmmobilidade.com.br" },
    { nome: "Cíntia Ramos de Moura", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2025-12-01"), data_nascimento: new Date("1985-10-11"), torre: "Dados", squad: "Domínios", email: "ext.cintia.moura@lmmobilidade.com.br" },
    { nome: "Felipe de Souza Modesto", cargo: "Desenvolvedor Back-End", status: "Ativo", data_admissao: new Date("2022-08-22"), data_nascimento: new Date("1996-10-23"), torre: "Vendas assistidas e seminovos", squad: "Pricing", email: "ext.felipe.modesto@lmmobilidade.com.br" },
    { nome: "Danilo Zangari da Silva", cargo: "Desenvolvedor Front-End", status: "Ativo", data_admissao: new Date("2018-04-22"), data_nascimento: new Date("1993-05-25"), torre: "Vendas assistidas e seminovos", squad: "Canal Indireto", email: "venice.danilo@lmmobilidade.com.br" },
    { nome: "Diego Oliveira Correa", cargo: "Consultor SAP FI", status: "Ativo", data_admissao: new Date("2024-09-10"), data_nascimento: new Date("1989-01-28"), torre: "Backoffice", squad: "Modulo FI e S/4HANA", email: "ext.diego.correa@lmmobilidade.com.br" },
    { nome: "Edmilson Gomes Naves Filho", cargo: "Scrum Master", status: "Ativo", data_admissao: new Date("2024-11-07"), data_nascimento: new Date("1988-01-14"), torre: "Agilistas", squad: "Cross", email: "ext.edmilson.naves@lmmobilidade.com.br" },
    { nome: "Beatriz Carreiro Silva Barguil", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2026-01-05"), data_nascimento: new Date("1997-02-25"), torre: "Vendas assistidas e seminovos", squad: "Salesforce", email: "ext.beatriz.barguil@lmmobilidade.com.br" },
    { nome: "Elizabeth Monteiro Prado", cargo: "Scrum Master", status: "Ativo", data_admissao: new Date("2023-10-05"), data_nascimento: new Date("1989-09-13"), torre: "Agilistas", squad: "Cross", email: "venice.elizabeth@lmmobilidade.com.br" },
    { nome: "Emerson Bomfim de Macedo Silva", cargo: "Engenheiro de Dados", status: "Ativo", data_admissao: new Date("2025-10-29"), data_nascimento: new Date("2000-07-28"), torre: "Dados", squad: "Domínios e estruturante", email: "ext.emerson.silva@lmmobilidade.com.br" },
    { nome: "Fabiano Fiumari", cargo: "Desenvolvedor ABAP", status: "Ativo", data_admissao: new Date("2024-08-05"), data_nascimento: new Date("1979-10-11"), torre: "Backoffice", squad: "ABAP", email: "venice.fabiano.fuma@lmmobilidade.com.br" },
    { nome: "Felipe Candido Gonçalves de Castro", cargo: "Tech Lead", status: "Ativo", data_admissao: new Date("2024-07-30"), data_nascimento: new Date("1991-11-06"), torre: "Autoatendimento e ativação", squad: "Portal do cliente e autoatendimento - Cross", email: "venice.felipe.castro@lmmobilidade.com.br" },
    { nome: "Danielle Vianna Pezetta", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2024-11-11"), data_nascimento: new Date("1984-04-05"), torre: "Relacionamento e Operações", squad: "Logística", email: "ext.danielle.pezetta@lmmobilidade.com.br" },
    { nome: "Filipe Cardoso", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2025-04-22"), data_nascimento: new Date("1991-01-12"), torre: "Backoffice", squad: "Responsavel pelo S/4HANA", email: "ext.filipe.cardoso@lmmobilidade.com.br" },
    { nome: "Edvania da Conceição Mota Lima", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2024-10-21"), data_nascimento: new Date("1982-02-09"), torre: "Vendas assistidas e seminovos", squad: "Canal Indireto", email: "ext.edvania.mota@lmmobilidade.com.br" },
    { nome: "Gabriela Caroline dos Reis Braga", cargo: "Scrum Master", status: "Ativo", data_admissao: new Date("2025-04-07"), data_nascimento: new Date("1986-08-10"), torre: "Agilistas", squad: "Cross", email: "ext.gabriela.reis@lmmobilidade.com.br" },
    { nome: "Géssica Danielly Rodrigues Andrade", cargo: "Desenvolvedor Back-End", status: "Ativo", data_admissao: new Date("2024-12-09"), data_nascimento: new Date("1990-11-10"), torre: "Autoatendimento e ativação", squad: "Portal de autoatendimento", email: "ext.gessica.andrade@lmmobilidade.com.br" },
    { nome: "Gilbert Soares Silva Costa", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2024-12-16"), data_nascimento: new Date("1991-07-26"), torre: "Backoffice", squad: "Compras e estoque", email: "ext.gilbert.costa@lmmobilidade.com.br" },
    { nome: "Gilson da Costa Pereira Delicado", cargo: "Product UI", status: "Ativo", data_admissao: new Date("2025-02-01"), data_nascimento: new Date("1983-10-15"), torre: "Autoatendimento e ativação", squad: "Portal do cliente", email: "ext.gilson.delicado@lmmobilidade.com.br" },
    { nome: "Guilherme Camargo Teixeira", cargo: "Analista de Dados", status: "Ativo", data_admissao: new Date("2025-09-02"), data_nascimento: new Date("1997-05-11"), torre: "Dados", squad: "BI", email: "ext.guilherme.teixeira@lmmobilidade.com.br" },
    { nome: "Heloísa Martins de Oliveira", cargo: "Consultor SAP MM", status: "Ativo", data_admissao: new Date("2025-04-22"), data_nascimento: new Date("1991-05-05"), torre: "Backoffice", squad: "Modulo MM", email: "ext.heloisa.oliveira@lmmobilidade.com.br" },
    { nome: "Igor Gomes Silva", cargo: "Tech Lead", status: "Ativo", data_admissao: new Date("2025-02-17"), data_nascimento: new Date("1993-01-23"), torre: "Autoatendimento e ativação", squad: "Esteira de crédito", email: "ext.igor.silva@lmmobilidade.com.br" },
    { nome: "Laís Pó Nascimento", cargo: "Analista de dados", status: "Ativo", data_admissao: new Date("2024-07-10"), data_nascimento: new Date("1989-05-18"), torre: "Dados", squad: "BI", email: "ext.lais.nascimento@lmmobilidade.com.br" },
    { nome: "Lucas Neder de Souza", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2025-01-13"), data_nascimento: new Date("1986-06-14"), torre: "Vendas assistidas e seminovos", squad: "Seminovos", email: "ext.lucas.souza@lmmobilidade.com.br" },
    { nome: "Marco Felipe de Paiva Lourenço", cargo: "QA Lead", status: "Ativo", data_admissao: new Date("2024-12-09"), data_nascimento: new Date("1984-06-03"), torre: "Autoatendimento e ativação", squad: "QA Lead - cross", email: "ext.marco.paiva@lmmobilidade.com.br" },
    { nome: "Michele Regina Mezzarobba Cardoso", cargo: "Analista de QA", status: "Ativo", data_admissao: new Date("2025-04-08"), data_nascimento: new Date("1980-02-15"), torre: "Autoatendimento e ativação", squad: "Portal do cliente", email: "ext.michele.cardoso@lmmobilidade.com.br" },
    { nome: "Milton Cesar Leal de Lima", cargo: "Desenvolvedor ABAP", status: "Ativo", data_admissao: new Date("2025-03-12"), data_nascimento: new Date("1982-03-13"), torre: "Backoffice", squad: "ABAP", email: "ext.milton.lima@lmmobilidade.com.br" },
    { nome: "Nayara Correia Pessoa", cargo: "UX", status: "Ativo", data_admissao: new Date("2024-05-20"), data_nascimento: new Date("1988-04-11"), torre: "Agilistas", squad: "Cross como UX", email: "venice.nayara@lmmobilidade.com.br" },
    { nome: "Rafael Lisboa da Silva", cargo: "Scrum Master", status: "Ativo", data_admissao: new Date("2025-02-18"), data_nascimento: new Date("1983-11-10"), torre: "Agilistas", squad: "Cross", email: "ext.rafael.silva@lmmobilidade.com.br" },
    { nome: "Raphaela de Oliveira Barros", cargo: "Analista de QA", status: "Ativo", data_admissao: new Date("2025-12-04"), data_nascimento: new Date("1993-03-21"), torre: "Backoffice", squad: "Faturamento - Squad Tera", email: "ext.raphaela.barros@lmmobilidade.com.br" },
    { nome: "Renato Raito Neto", cargo: "Arquiteto de Dados", status: "Ativo", data_admissao: new Date("2025-08-25"), data_nascimento: new Date("1989-06-03"), torre: "Dados", squad: "Cross em todas squads", email: "ext.renato.neto@lmmobilidade.com.br" },
    { nome: "Robson Rodrigues Klein", cargo: "Desenvolvedor Front-End", status: "Ativo", data_admissao: new Date("2024-08-26"), data_nascimento: new Date("1989-08-23"), torre: "Autoatendimento e ativação", squad: "Portal de autoatendimento", email: "ext.robson.klein@lmmobilidade.com.br" },
    { nome: "Sanmara Alves Araújo", cargo: "Analista de QA", status: "Ativo", data_admissao: new Date("2025-01-14"), data_nascimento: new Date("1986-08-18"), torre: "Vendas assistidas e seminovos", squad: "Contratos - time optimus e amarok", email: "ext.sanmara.araujo@lmmobilidade.com.br" },
    { nome: "Tatiana Moreira", cargo: "Analista de Dados", status: "Ativo", data_admissao: new Date("2025-01-27"), data_nascimento: new Date("1980-11-12"), torre: "Dados", squad: "BI", email: "ext.tatiana.moreira@lmmobilidade.com.br" },
    { nome: "Thiago da Silva Alves", cargo: "SRE", status: "Ativo", data_admissao: new Date("2026-01-21"), data_nascimento: new Date("1981-10-30"), torre: "Infraestrutura", squad: "Plataforma", email: "ext.thiago.alves@lmmobilidade.com.br" },
    { nome: "Vânia Carolina Teixeira Viturino", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2024-09-16"), data_nascimento: new Date("1984-03-13"), torre: "Relacionamento e Operações", squad: "Chatbot", email: "ext.vania.viturino@lmmobilidade.com.br" },
    { nome: "Vinícius Saliture Martins", cargo: "Consultor SAP", status: "Ativo", data_admissao: new Date("2025-02-18"), data_nascimento: new Date("1989-07-26"), torre: "Backoffice", squad: "Atendimento N1 e módulo FI", email: "ext.vinicius.martins@lmmobilidade.com.br" }
  ];

  for (const v of vagas) {
    await prisma.vaga.create({ data: v });
  }

  for (const c of colaboradores) {
    await prisma.colaborador.create({ data: c });
  }

  console.log("Seed completa: Usuários, Vagas e Colaboradores criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
