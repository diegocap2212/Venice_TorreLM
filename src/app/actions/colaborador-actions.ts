"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getColaboradores() {
  return await prisma.colaborador.findMany({
    orderBy: { nome: "asc" },
  });
}

export async function createColaborador(data: {
  nome: string;
  cargo: string;
  status: string;
  data_admissao: Date;
  data_nascimento: Date;
  torre?: string;
  squad?: string;
  email?: string;
  data_desligamento?: Date;
  informacoes_internas?: string;
}) {
  const colaborador = await prisma.colaborador.create({
    data,
  });
  revalidatePath("/");
  return colaborador;
}

export async function updateColaborador(
  id: string,
  data: Partial<{
    nome: string;
    cargo: string;
    status: string;
    data_admissao: Date;
    data_nascimento: Date;
    torre: string;
    squad: string;
    email: string;
    data_desligamento: Date;
    informacoes_internas: string;
  }>
) {
  const colaborador = await prisma.colaborador.update({
    where: { id },
    data,
  });
  revalidatePath("/");
  return colaborador;
}

export async function deleteColaborador(id: string) {
  await prisma.colaborador.delete({
    where: { id },
  });
  revalidatePath("/");
}

// Seed function for the initial image data
export async function seedColaboradores() {
  const data = [
    {
      nome: "Abraão Melo Vilela",
      cargo: "Analista de QA",
      status: "Ativo",
      data_admissao: new Date("2024-04-07"),
      data_nascimento: new Date("1995-05-25"),
      torre: "Backoffice",
      squad: "Faturamento - Squad Tera",
      email: "ext.abraao.vilela@lmmobilidade.com.br"
    },
    {
      nome: "Aguinaldo Aparecido de Brito Junior",
      cargo: "Analista de QA",
      status: "Ativo",
      data_admissao: new Date("2026-01-05"),
      data_nascimento: new Date("1994-07-14"),
      torre: "Vendas assistidas e seminovos",
      squad: "Canal Indireto",
      email: "ext.aguinaldo.junior@lmmobilidade.com.br"
    },
    {
      nome: "Gabriel Marquez Volponi",
      cargo: "Analista de QA",
      status: "Ativo",
      data_admissao: new Date("2024-10-30"),
      data_nascimento: new Date("2001-05-11"),
      torre: "Vendas assistidas e seminovos",
      squad: "Pricing",
      email: "ext.gabriel.volponi@lmmobilidade.com.br"
    },
    {
      nome: "Bruna Tatiane Bonnecher Steffen",
      cargo: "Product Owner",
      status: "Ativo",
      data_admissao: new Date("2025-01-06"),
      data_nascimento: new Date("1986-02-02"),
      torre: "Backoffice",
      squad: "Contábil/Fiscal",
      email: "ext.bruna.steffen@lmmobilidade.com.br"
    },
    {
      nome: "Caio Fábio Duarte Ferreira",
      cargo: "Desenvolvedor Front-End",
      status: "Ativo",
      data_admissao: new Date("2023-03-06"),
      data_nascimento: new Date("1994-06-03"),
      torre: "Autoatendimento e ativação",
      squad: "Portal do cliente",
      email: "venice.caio@lmmobilidade.com.br"
    }
  ];

  for (const item of data) {
    await prisma.colaborador.upsert({
      where: { id: item.nome }, // Using name as a simple unique seed check (ideally use ID)
      update: { ...item },
      create: { ...item },
    });
  }
}
