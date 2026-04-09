require("dotenv").config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function hashCPF(cpf) {
  const digits = String(cpf).replace(/\D/g, "");
  if (!digits || digits.length < 8) return null;
  return crypto.createHash("sha256").update(digits).digest("hex");
}

function maskCPF(cpf) {
  const digits = String(cpf).replace(/\D/g, "");
  if (!digits || digits.length < 8) return null;
  const d = digits.padStart(11, "0");
  return `***.***. ${d.substring(6, 9)}-${d.substring(9, 11)}`.replace(" ", "");
}

function excelDateToJS(excelDate) {
  if (!excelDate || typeof excelDate !== "number") return null;
  return new Date(Math.round((excelDate - 25569) * 86400 * 1000));
}

function parseBRDate(str) {
  if (!str) return null;
  const parts = String(str).trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    if (c.length === 4) return new Date(`${c}-${b.padStart(2,"0")}-${a.padStart(2,"0")}`);
    return new Date(`${a}-${b.padStart(2,"0")}-${c.padStart(2,"0")}`);
  }
  return null;
}

// ─── LEITURA DAS PLANILHAS ───────────────────────────────────────────────────

const publicDir = path.join(__dirname, "../public");
const allFiles = fs.readdirSync(publicDir);
const vagasFile = allFiles.find(f => f.toLowerCase().includes("planilha"));
const perfFile  = allFiles.find(f => f.toLowerCase().includes("ciclo"));

const wbVagas = XLSX.readFile(path.join(publicDir, vagasFile));
const wbPerf  = XLSX.readFile(path.join(publicDir, perfFile));

async function main() {
  console.log("🧹 Limpando dados anteriores...");
  await prisma.auditLog.deleteMany({});
  await prisma.cicloPerformance.deleteMany({});
  await prisma.horaExtra.deleteMany({});
  await prisma.followUp.deleteMany({});
  await prisma.checklistItemStatus.deleteMany({});
  await prisma.vagaCandidato.deleteMany({});
  await prisma.candidato.deleteMany({});
  await prisma.vaga.deleteMany({});
  await prisma.colaborador.deleteMany({});

  // ─── 1. USUÁRIOS DA WHITELIST ────────────────────────────────────────────
  console.log("👥 Criando usuários BP Hub...");
  const hashedPassword = await bcrypt.hash("Venice@BP2026", 10);

  const diego = await prisma.user.upsert({
    where: { email: "diego.caporusso@venicetech.com.br" },
    update: { password: hashedPassword, role: "BP_ADMIN", name: "Diego Caporusso" },
    create: { email: "diego.caporusso@venicetech.com.br", password: hashedPassword, name: "Diego Caporusso", role: "BP_ADMIN" },
  });
  await prisma.user.upsert({
    where: { email: "leticia.almeida@venicetech.com.br" },
    update: { password: hashedPassword, role: "BP_ADMIN", name: "Leticia Almeida" },
    create: { email: "leticia.almeida@venicetech.com.br", password: hashedPassword, name: "Leticia Almeida", role: "BP_ADMIN" },
  });
  await prisma.user.upsert({
    where: { email: "lucas.rodrigues@venicetech.com.br" },
    update: { password: hashedPassword, role: "BP_ADMIN", name: "Lucas Rodrigues" },
    create: { email: "lucas.rodrigues@venicetech.com.br", password: hashedPassword, name: "Lucas Rodrigues", role: "BP_ADMIN" },
  });

  const bp = diego;

  // ─── 2. COLABORADORES DA ABA "Prestadores LM" ────────────────────────────
  console.log("🏢 Importando colaboradores da planilha...");

  // Usamos dados do seed original + complementamos
  const colaboradoresBase = [
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
    { nome: "Danielle Vianna Pezetta", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2024-11-11"), data_nascimento: new Date("1984-04-05"), torre: "Relacionamento e Operações", squad: "Logística", email: "ext.danielle.pezetta@lmmobilidade.com.br" },
    { nome: "Danilo Zangari da Silva", cargo: "Desenvolvedor Front-End", status: "Ativo", data_admissao: new Date("2018-04-22"), data_nascimento: new Date("1993-05-25"), torre: "Vendas assistidas e seminovos", squad: "Canal Indireto", email: "venice.danilo@lmmobilidade.com.br" },
    { nome: "Diego Oliveira Correa", cargo: "Consultor SAP FI", status: "Ativo", data_admissao: new Date("2024-09-10"), data_nascimento: new Date("1989-01-28"), torre: "Backoffice", squad: "Modulo FI e S/4HANA", email: "ext.diego.correa@lmmobilidade.com.br" },
    { nome: "Edmilson Gomes Naves Filho", cargo: "Scrum Master", status: "Ativo", data_admissao: new Date("2024-11-07"), data_nascimento: new Date("1988-01-14"), torre: "Agilistas", squad: "Cross", email: "ext.edmilson.naves@lmmobilidade.com.br" },
    { nome: "Beatriz Carreiro Silva Barguil", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2026-01-05"), data_nascimento: new Date("1997-02-25"), torre: "Vendas assistidas e seminovos", squad: "Salesforce", email: "ext.beatriz.barguil@lmmobilidade.com.br" },
    { nome: "Elizabeth Monteiro Prado", cargo: "Scrum Master", status: "Ativo", data_admissao: new Date("2023-10-05"), data_nascimento: new Date("1989-09-13"), torre: "Agilistas", squad: "Cross", email: "venice.elizabeth@lmmobilidade.com.br" },
    { nome: "Emerson Bomfim de Macedo Silva", cargo: "Engenheiro de Dados", status: "Ativo", data_admissao: new Date("2025-10-29"), data_nascimento: new Date("2000-07-28"), torre: "Dados", squad: "Domínios e estruturante", email: "ext.emerson.silva@lmmobilidade.com.br" },
    { nome: "Fabiano Fiumari", cargo: "Desenvolvedor ABAP", status: "Ativo", data_admissao: new Date("2024-08-05"), data_nascimento: new Date("1979-10-11"), torre: "Backoffice", squad: "ABAP", email: "venice.fabiano.fuma@lmmobilidade.com.br" },
    { nome: "Felipe Candido Gonçalves de Castro", cargo: "Tech Lead", status: "Ativo", data_admissao: new Date("2024-07-30"), data_nascimento: new Date("1991-11-06"), torre: "Autoatendimento e ativação", squad: "Portal do cliente e autoatendimento - Cross", email: "venice.felipe.castro@lmmobilidade.com.br" },
    { nome: "Felipe de Souza Modesto", cargo: "Desenvolvedor Back-End", status: "Ativo", data_admissao: new Date("2022-08-22"), data_nascimento: new Date("1996-10-23"), torre: "Vendas assistidas e seminovos", squad: "Pricing", email: "ext.felipe.modesto@lmmobilidade.com.br" },
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
    { nome: "Vinícius Saliture Martins", cargo: "Consultor SAP", status: "Ativo", data_admissao: new Date("2025-02-18"), data_nascimento: new Date("1989-07-26"), torre: "Backoffice", squad: "Atendimento N1 e módulo FI", email: "ext.vinicius.martins@lmmobilidade.com.br" },
  ];

  const colaboradoresMap = {};
  for (const c of colaboradoresBase) {
    const created = await prisma.colaborador.create({ data: c });
    colaboradoresMap[c.nome.toLowerCase().trim()] = created;
  }
  console.log(`✅ ${colaboradoresBase.length} colaboradores criados`);

  // ─── 3. VAGAS ABERTAS DA PLANILHA ────────────────────────────────────────
  console.log("📋 Importando vagas abertas...");
  const wsVagasAbertas = wbVagas.Sheets["Vagas Abertas"];
  const vagasRows = XLSX.utils.sheet_to_json(wsVagasAbertas, { header: 1, defval: "" });

  // Row 0 = headers: [" ","Vaga","Data abertura vaga","Status","Candidato","Telefone","E-mail","CPF","Consulta CPF","Link CV"]
  // Agrupa por número de vaga (coluna 0)
  const vagasMap = {};
  for (let i = 1; i < vagasRows.length; i++) {
    const row = vagasRows[i];
    if (!row[1]) continue; // sem título de vaga

    const numVaga = String(row[0]);
    const tituloVaga = String(row[1]).trim();
    const dataAberturaExcel = row[2];
    const statusStr = String(row[3] || "").trim();
    const candidatoNome = String(row[4] || "").trim();
    const telefone = String(row[5] || "").trim();
    const emailCand = String(row[6] || "").trim();
    const cpfRaw = row[7];
    const consultaCPF = String(row[8] || "").trim();
    const linkCV = String(row[9] || "").trim();

    const dataAbertura = excelDateToJS(dataAberturaExcel) || new Date("2026-01-01");

    // Determina etapa baseado no status
    let etapa = "TRIAGEM";
    const statusLower = statusStr.toLowerCase();
    if (statusLower.includes("aguardando feedback")) etapa = "SHORTLIST";
    else if (statusLower.includes("aguardando agenda")) etapa = "ENTREVISTA_CLIENTE";
    else if (statusLower.includes("entrevista")) etapa = "ENTREVISTA_CLIENTE";
    else if (statusLower.includes("validação cpf") || statusLower.includes("aguardando validação")) etapa = "TRIAGEM";
    else if (statusLower.includes("proposta")) etapa = "APROVACAO_PROPOSTA";

    if (!vagasMap[numVaga]) {
      vagasMap[numVaga] = {
        titulo: tituloVaga,
        perfil_tipo: tituloVaga.includes("Dev") || tituloVaga.includes("Eng") || tituloVaga.includes("Tech") ? "Dev" :
                     tituloVaga.includes("PO") || tituloVaga.includes("Product") ? "PO" :
                     tituloVaga.includes("QA") ? "QA" :
                     tituloVaga.includes("Scrum") || tituloVaga.includes("SM") ? "Scrum Master" :
                     tituloVaga.includes("SAP") ? "SAP" :
                     tituloVaga.includes("Gov") || tituloVaga.includes("Dados") ? "Dados" : "Outros",
        senioridade: tituloVaga.toLowerCase().includes("lead") || tituloVaga.toLowerCase().includes("arq") ? "Sênior" :
                     tituloVaga.toLowerCase().includes("analista") ? "Pleno" : "Pleno",
        aba_atual: "RECRUTAMENTO",
        etapa_atual: etapa,
        urgencia: "NORMAL",
        squad_destino: "LM",
        data_abertura: dataAbertura,
        data_etapa_atual: new Date(),
        sla_dias: 3,
        responsavel_id: bp.id,
        criado_por_id: bp.id,
        bizneo_link: linkCV.startsWith("http") ? linkCV : null,
      };
      vagasMap[numVaga].candidatos = [];
    }

    // Adiciona candidato a esta vaga (se houver nome)
    if (candidatoNome) {
      const cpfHash = hashCPF(cpfRaw);
      const cpfMasked = maskCPF(cpfRaw);
      const cpfOK = consultaCPF.toLowerCase().includes("ok");
      const cpfReprovado = consultaCPF.toLowerCase().includes("negad") || consultaCPF.toLowerCase().includes("reprovar");

      vagasMap[numVaga].candidatos.push({
        nome: candidatoNome,
        telefone: telefone || null,
        email: emailCand || null,
        cpf_hash: cpfHash,
        cpf_masked: cpfMasked,
        status_cpf: cpfOK ? "APROVADO" : cpfReprovado ? "REPROVADO" : "PENDENTE",
        linkedin: linkCV.startsWith("http") ? linkCV : null,
        observacoes: statusStr || null,
      });
    }
  }

  // Cria as vagas e candidatos
  let totalVagas = 0, totalCandidatos = 0;
  for (const [numVaga, vd] of Object.entries(vagasMap)) {
    const { candidatos: cands, ...vagaData } = vd;

    const vaga = await prisma.vaga.create({ data: vagaData });
    totalVagas++;

    for (const cand of cands) {
      try {
        // Verifica duplicidade de CPF
        let candidato;
        if (cand.cpf_hash) {
          candidato = await prisma.candidato.findUnique({ where: { cpf_hash: cand.cpf_hash } });
        }
        if (!candidato) {
          candidato = await prisma.candidato.create({ data: cand });
          totalCandidatos++;
        }
        await prisma.vagaCandidato.upsert({
          where: { vaga_id_candidato_id: { vaga_id: vaga.id, candidato_id: candidato.id } },
          create: { vaga_id: vaga.id, candidato_id: candidato.id, status: "EM_PROCESSO" },
          update: {},
        });
      } catch (err) {
        console.warn(`  ⚠️ Candidato '${cand.nome}' ignorado:`, err.message);
      }
    }
  }
  console.log(`✅ ${totalVagas} vagas criadas com ${totalCandidatos} candidatos`);

  // ─── 4. CICLOS DE PERFORMANCE DA PLANILHA ────────────────────────────────
  console.log("📈 Importando ciclos de performance...");
  const wsAutoav = wbPerf.Sheets["Autoavaliação"];
  const autoavRows = XLSX.utils.sheet_to_json(wsAutoav, { header: 1, defval: "" });

  // Headers: Cliente | Data | Nome | Cargo | Squad | Líder Squad | 1ª Semana BP | ...notas...
  let totalCiclos = 0;
  for (let i = 1; i < autoavRows.length; i++) {
    const row = autoavRows[i];
    const nomeColab = String(row[2] || "").trim();
    if (!nomeColab) continue;

    // Tenta encontrar colaborador pelo nome (match parcial)
    const key = nomeColab.toLowerCase().trim();
    let colab = colaboradoresMap[key];

    if (!colab) {
      // Busca pelo primeiro nome e sobrenome
      colab = Object.values(colaboradoresMap).find(c =>
        c.nome.toLowerCase().includes(nomeColab.split(" ")[0].toLowerCase())
      );
    }

    if (!colab) {
      console.warn(`  ⚠️ Colaborador não encontrado para ciclo: ${nomeColab}`);
      continue;
    }

    try {
      await prisma.cicloPerformance.createMany({
        data: [
          {
            colaborador_id: colab.id,
            periodo: "2026-S1",
            tipo: "AUTOAVALIACAO",
            responsavel: "BP",
            status: "CONCLUIDO",
            data_prevista: new Date("2026-03-01"),
            data_realizado: new Date("2026-04-09"),
          },
          {
            colaborador_id: colab.id,
            periodo: "2026-S1",
            tipo: "FEEDBACK_CLIENTE",
            responsavel: "GESTOR_CONTAS",
            status: "PENDENTE",
            data_prevista: new Date("2026-05-01"),
          },
          {
            colaborador_id: colab.id,
            periodo: "2026-S1",
            tipo: "PDI",
            responsavel: "BP",
            status: "PENDENTE",
            data_prevista: new Date("2026-05-15"),
          },
        ],
      });
      totalCiclos++;
    } catch (err) {
      console.warn(`  ⚠️ Ciclo de ${nomeColab}:`, err.message);
    }
  }
  console.log(`✅ ${totalCiclos} ciclos de performance importados`);

  // ─── 5. FOLLOW-UPS PARA ADMITIDOS RECENTES (últimos 90 dias) ─────────────
  console.log("📅 Gerando follow-ups para admissões recentes...");
  const agora = new Date();
  const noventa = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000);

  const admitidosRecentes = await prisma.colaborador.findMany({
    where: {
      status: "Ativo",
      data_admissao: { gte: noventa },
    },
  });

  for (const colab of admitidosRecentes) {
    const admissao = new Date(colab.data_admissao);
    const followUps = [
      { tipo: "SEMANA_1",    dias: 7  },
      { tipo: "MES_1",       dias: 30 },
      { tipo: "FEEDBACK_45", dias: 45 },
      { tipo: "FEEDBACK_90", dias: 90 },
    ].map(({ tipo, dias }) => {
      const data_prevista = new Date(admissao.getTime() + dias * 24 * 60 * 60 * 1000);
      const status = data_prevista < agora ? "REALIZADO" : "PENDENTE";
      return {
        colaborador_id: colab.id,
        tipo,
        data_prevista,
        status,
        data_realizado: status === "REALIZADO" ? data_prevista : null,
      };
    });

    await prisma.followUp.createMany({ data: followUps });
  }
  console.log(`✅ Follow-ups gerados para ${admitidosRecentes.length} colaboradores recentes`);

  console.log("\n🎉 Seed completa! BP Hub carregado com dados reais.");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
