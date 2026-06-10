"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function claimMission(missionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado." };

  try {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId }
    });

    if (!mission) return { error: "Misión no encontrada." };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) return { error: "Usuario no encontrado." };
    if (user.points < mission.pointsReq) return { error: "Puntos insuficientes." };

    const existing = await prisma.userMission.findUnique({
      where: {
        userId_missionId: {
          userId: user.id,
          missionId: mission.id
        }
      }
    });

    if (existing) return { error: "Ya has completado esta misión." };

    await prisma.userMission.create({
      data: {
        userId: user.id,
        missionId: mission.id
      }
    });

    revalidatePath("/retos");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Error al completar la misión." };
  }
}
