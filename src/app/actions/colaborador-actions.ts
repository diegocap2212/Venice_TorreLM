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
    },
    {
      nome: "Camila dos Santos Silveira",
      cargo: "Scrum Master",
      status: "Ativo",
      data_admissao: new Date("2023-08-15"),
      data_nascimento: new Date("1990-11-20"),
      torre: "Governança e Agilidade",
      squad: "Agilidade Corporativa",
      email: "ext.camila.silveira@lmmobilidade.com.br"
    },
    {
      nome: "Daniel Augusto de Oliveira",
      cargo: "Desenvolvedor Back-End",
      status: "Ativo",
      data_admissao: new Date("2024-02-10"),
      data_nascimento: new Date("1988-04-12"),
      torre: "Backoffice",
      squad: "ERP Integration",
      email: "ext.daniel.oliveira@lmmobilidade.com.br"
    },
    {
      nome: "Eduardo Henrique Silva",
      cargo: "UX Designer",
      status: "Ativo",
      data_admissao: new Date("2024-05-20"),
      data_nascimento: new Date("1993-09-30"),
      torre: "Autoatendimento e ativação",
      squad: "Design System",
      email: "ext.eduardo.silva@lmmobilidade.com.br"
    },
    {
      nome: "Fernanda Lima de Souza",
      cargo: "Analista de QA",
      status: "Férias",
      data_admissao: new Date("2023-11-01"),
      data_nascimento: new Date("1996-01-15"),
      torre: "Vendas assistidas e seminovos",
      squad: "CRM - Squad Aura",
      email: "ext.fernanda.souza@lmmobilidade.com.br"
    },
    {
      nome: "Guilherme de Araujo Santos",
      cargo: "Arquiteto de Soluções",
      status: "Ativo",
      data_admissao: new Date("2022-12-05"),
      data_nascimento: new Date("1985-03-22"),
      torre: "Core Products",
      squad: "Architecture Team",
      email: "ext.guilherme.santos@lmmobilidade.com.br"
    },
    {
      nome: "Helena Maria Ferreira",
      cargo: "Product Owner",
      status: "Ativo",
      data_admissao: new Date("2024-06-15"),
      data_nascimento: new Date("1991-08-10"),
      torre: "Autoatendimento e ativação",
      squad: "Mobile App",
      email: "ext.helena.ferreira@lmmobilidade.com.br"
    },
    {
      nome: "Igor Lopes Vieira",
      cargo: "Desenvolvedor Front-End",
      status: "Ativo",
      data_admissao: new Date("2024-01-20"),
      data_nascimento: new Date("1997-12-05"),
      torre: "Backoffice",
      squad: "Painel Administrativo",
      email: "ext.igor.vieira@lmmobilidade.com.br"
    },
    {
      nome: "Jessica Regina da Silva",
      cargo: "Analista de Dados",
      status: "Ativo",
      data_admissao: new Date("2024-03-12"),
      data_nascimento: new Date("1994-05-18"),
      torre: "Data & Analytics",
      squad: "BI - Squad Insight",
      email: "ext.jessica.silva@lmmobilidade.com.br"
    },
    {
      nome: "Kleber Machado Junior",
      cargo: "DevOps Engineer",
      status: "Ativo",
      data_admissao: new Date("2023-10-10"),
      data_nascimento: new Date("1989-02-28"),
      torre: "Core Products",
      squad: "SRE / Cloud",
      email: "ext.kleber.junior@lmmobilidade.com.br"
    },
    {
      nome: "Larissa Bueno de Camargo",
      cargo: "Analista de QA",
      status: "Ativo",
      data_admissao: new Date("2024-07-01"),
      data_nascimento: new Date("1995-10-12"),
      torre: "Backoffice",
      squad: "Financeiro",
      email: "ext.larissa.camargo@lmmobilidade.com.br"
    }
  ];

  for (const item of data) {
    const existing = await prisma.colaborador.findFirst({
      where: { nome: item.nome }
    });

    if (existing) {
      await prisma.colaborador.update({
        where: { id: existing.id },
        data: item,
      });
    } else {
      await prisma.colaborador.create({
        data: item,
      });
    }
  }
}
