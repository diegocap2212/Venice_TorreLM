"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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
  const file = formData.get("file") as File | null;

  let finalUrl = url;

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create directory if not exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique name
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);
    finalUrl = `/uploads/${fileName}`;
  }

  const material = await prisma.material.create({
    data: {
      titulo,
      descricao,
      tipo,
      url: finalUrl,
    },
  });
  revalidatePath("/");
  return material;
}

export async function deleteMaterial(id: string) {
  const material = await prisma.material.findUnique({
    where: { id },
  });

  if (material && material.url.startsWith("/uploads/")) {
    const filePath = join(process.cwd(), "public", material.url);
    if (existsSync(filePath)) {
      await unlink(filePath).catch(console.error);
    }
  }

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
