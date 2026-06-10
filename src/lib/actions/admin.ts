"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

function checkAdmin(session: any) {
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado.");
}

// --- CONFIGURACIÓN ---
export async function getSettings() {
  const settings = await prisma.settings.findUnique({ where: { id: "global" } });
  if (settings) return settings;
  return { pointsPerStep: 0.001, pointsPerExerciseMinute: 1.6667 };
}

export async function updateSettings(pointsPerStep: number, pointsPerExerciseMinute: number) {
  const session = await getServerSession(authOptions);
  checkAdmin(session);
  
  await prisma.settings.upsert({
    where: { id: "global" },
    update: { pointsPerStep, pointsPerExerciseMinute },
    create: { id: "global", pointsPerStep, pointsPerExerciseMinute }
  });
  
  revalidatePath("/admin");
  return { success: true };
}

// --- USUARIOS ---
export async function getUsers() {
  const session = await getServerSession(authOptions);
  checkAdmin(session);
  
  return prisma.user.findMany({
    orderBy: { points: 'desc' },
    select: { id: true, username: true, name: true, role: true, points: true }
  });
}

export async function updateUser(userId: string, data: { name?: string; role?: string; password?: string }) {
  const session = await getServerSession(authOptions);
  checkAdmin(session);
  
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.role) updateData.role = data.role;
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
  
  await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
  
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  checkAdmin(session);
  
  // Cascades in Prisma should delete activities, steps, etc.
  await prisma.user.delete({ where: { id: userId } });
  
  revalidatePath("/admin");
  return { success: true };
}

// --- PREMIOS ---
export async function createReward(formData: FormData) {
  const session = await getServerSession(authOptions);
  checkAdmin(session);

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const pointsReqStr = formData.get("pointsReq") as string;
  const expiresAtStr = formData.get("expiresAt") as string;

  const pointsReq = parseInt(pointsReqStr);

  if (!name || !description || isNaN(pointsReq)) {
    return { error: "Faltan campos obligatorios." };
  }

  let expiresAt = null;
  if (expiresAtStr) {
    expiresAt = new Date(expiresAtStr);
  }

  try {
    await prisma.reward.create({
      data: { name, description, pointsReq, expiresAt }
    });

    revalidatePath("/admin");
    revalidatePath("/premios");
    return { success: true };
  } catch (err) {
    return { error: "Error al crear el premio." };
  }
}

export async function deleteReward(id: string) {
  const session = await getServerSession(authOptions);
  checkAdmin(session);
  await prisma.reward.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/premios");
  return { success: true };
}

// --- RETOS ---
export async function createChallenge(formData: FormData) {
  const session = await getServerSession(authOptions);
  checkAdmin(session);

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as string;
  const targetStr = formData.get("target") as string;
  const pointsReqStr = formData.get("pointsReq") as string;

  const target = parseInt(targetStr);
  const pointsReq = parseInt(pointsReqStr);

  if (!name || !description || !type || isNaN(target) || isNaN(pointsReq)) {
    return { error: "Faltan campos obligatorios." };
  }

  try {
    await prisma.challenge.create({
      data: { name, description, type, target, pointsReq }
    });
    revalidatePath("/admin");
    revalidatePath("/retos");
    return { success: true };
  } catch (err) {
    return { error: "Error al crear el reto." };
  }
}

export async function deleteChallenge(id: string) {
  const session = await getServerSession(authOptions);
  checkAdmin(session);
  await prisma.challenge.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/retos");
  return { success: true };
}

export async function updateChallenge(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  checkAdmin(session);

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as string;
  const targetStr = formData.get("target") as string;
  const pointsReqStr = formData.get("pointsReq") as string;

  const target = parseInt(targetStr);
  const pointsReq = parseInt(pointsReqStr);

  if (!name || !description || !type || isNaN(target) || isNaN(pointsReq)) {
    return { error: "Faltan campos obligatorios." };
  }

  try {
    await prisma.challenge.update({
      where: { id },
      data: { name, description, type, target, pointsReq }
    });
    revalidatePath("/admin");
    revalidatePath("/retos");
    return { success: true };
  } catch (e) {
    return { error: "Error al actualizar el reto." };
  }
}

