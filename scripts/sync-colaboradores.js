
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const path = require('path');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CSV_PATH = "C:\\Users\\Usuario\\Downloads\\Colaboradores LM - Venice - BP - Leticia Almeida Fernandes(Prestadores LM).csv";

async function sync() {
  console.log("🚀 Iniciando sincronização da planilha...");

  if (!fs.existsSync(CSV_PATH)) {
    console.error("❌ Arquivo não encontrado:", CSV_PATH);
    process.exit(1);
  }

  const buffer = fs.readFileSync(CSV_PATH);
  // Detectando encoding: tenta UTF-8, se falhar ou der caracteres estranhos, o fallback para Windows-1252 seria manual
  const content = buffer.toString('utf-8'); 
  
  const lines = content.split('\n');
  const headers = lines[0].split(';').map(h => h.trim().replace(/^\"|\"$/g, ''));
  
  console.log("📊 Colunas identificadas:", headers.join(', '));

  const map = {
    nome: headers.indexOf("Colaborador"),
    status: headers.indexOf("Status"),
    cargo: headers.indexOf("Cargo"),
    data_admissao: headers.indexOf("Data admissão"),
    data_nascimento: headers.indexOf("Data de Nascimento"),
    email: headers.indexOf("Email Venice"),
    torre: headers.indexOf("Torre"),
    squad: headers.indexOf("Squad"),
  };

  // Ajustes de nomes de colunas conforme o 'cat' anterior
  if (map.nome === -1) map.nome = headers.indexOf("Colaborador ");
  if (map.email === -1) map.email = headers.indexOf("E-mail Venice");

  let count = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(';').map(c => c.trim().replace(/^\"|\"$/g, ''));
    if (cols.length < 5) continue;

    const nome = cols[map.nome];
    if (!nome) continue;

    const status = cols[map.status] || "Ativo";
    const cargo = cols[map.cargo] || "-";
    const torre = cols[map.torre] || "Não Atribuída";
    const squad = cols[map.squad] || "Não Atribuído";
    const email = cols[map.email] || null;

    const parseDate = (str) => {
      if (!str || str === "Sem reajuste" || str === "-") return new Date();
      const parts = str.split('/');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
      return new Date();
    };

    const data_admissao = parseDate(cols[map.data_admissao]);
    const data_nascimento = parseDate(cols[map.data_nascimento]);

    try {
      // Busca pelo nome
      const existing = await prisma.colaborador.findFirst({
        where: { nome: nome }
      });

      if (existing) {
        await prisma.colaborador.update({
          where: { id: existing.id },
          data: {
            cargo,
            status,
            torre,
            squad,
            email,
            data_admissao,
            data_nascimento,
          }
        });
      } else {
        await prisma.colaborador.create({
          data: {
            nome,
            cargo,
            status,
            torre,
            squad,
            email,
            data_admissao,
            data_nascimento,
          }
        });
      }
      count++;
    } catch (err) {
      console.error(`⚠️ Erro ao processar ${nome}:`, err.message);
      skipped++;
    }
  }

  console.log(`✅ Sincronização concluída! ${count} registros processados, ${skipped} falhas.`);
  process.exit(0);
}

sync().catch(err => {
    console.error("❌ Erro fatal:", err);
    process.exit(1);
});
