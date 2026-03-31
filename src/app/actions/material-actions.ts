"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMaterials() {
  return await prisma.material.findMany({
    orderBy: { data_upload: "desc" },
  });
}

export async function createMaterial(formData: FormData) {
  const titulo = formData.get("titulo") as string;
  const descricao = formData.get("descricao") as string;
  const tipo = formData.get("tipo") as string;
  const url = formData.get("url") as string;

  const material = await prisma.material.create({
    data: {
      titulo,
      descricao,
      tipo,
      url,
    },
  });
  revalidatePath("/");
  return material;
}

export async function deleteMaterial(id: string) {
  await prisma.material.delete({
    where: { id },
  });
  revalidatePath("/");
}

export async function updateMaterial(
  id: string,
  data: Partial<{
    titulo: string;
    descricao: string;
    url: string;
    tipo: string;
  }>
) {
  const material = await prisma.material.update({
    where: { id },
    data,
  });
  revalidatePath("/");
  return material;
}
