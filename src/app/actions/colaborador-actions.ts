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
    { nome: "Abraão Melo Vilela", cargo: "Analista de QA", status: "Ativo", data_admissao: new Date("2024-04-07"), data_nascimento: new Date("1995-05-25") },
    { nome: "Aguinaldo Aparecido de Brito Junior", cargo: "Analista de QA", status: "Ativo", data_admissao: new Date("2026-01-05"), data_nascimento: new Date("1994-07-14") },
    { nome: "Gabriel Marquez Volponi", cargo: "Analista de QA", status: "Ativo", data_admissao: new Date("2024-10-30"), data_nascimento: new Date("2001-05-11") },
    { nome: "Bruna Tatiane Bonecher Steffen", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2025-01-06"), data_nascimento: new Date("1986-02-02") },
    { nome: "Caio Fábio Duarte Ferreira", cargo: "Desenvolvedor Front-End", status: "Ativo", data_admissao: new Date("2023-03-06"), data_nascimento: new Date("1994-06-03") },
    { nome: "Carlos Eduardo Rodrigues Nogueira", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2025-10-29"), data_nascimento: new Date("1992-01-05") },
    { nome: "Carlos Pedrinho Weiss Filho", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2024-05-27"), data_nascimento: new Date("1980-04-16") },
    { nome: "Charles Janio Olavo Dos Santos", cargo: "Desenvolvedor Back-End", status: "Ativo", data_admissao: new Date("2023-07-24"), data_nascimento: new Date("1983-12-01") },
    { nome: "Christiane Zavatta", cargo: "Analista de Processos", status: "Ativo", data_admissao: new Date("2025-04-28"), data_nascimento: new Date("1983-01-21") },
    { nome: "Cíntia Ramos de Moura", cargo: "Product Owner", status: "Ativo", data_admissao: new Date("2025-12-01"), data_nascimento: new Date("1985-10-11") },
  ];

  for (const item of data) {
    await prisma.colaborador.upsert({
      where: { id: item.nome }, // Using name as a simple unique check for seed
      update: {},
      create: { ...item, id: undefined as any },
    });
  }
}
