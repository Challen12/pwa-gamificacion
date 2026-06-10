"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function claimReward(rewardId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado." };

  try {
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId }
    });

    if (!reward) return { error: "Premio no encontrado." };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) return { error: "Usuario no encontrado." };
    if (user.points < reward.pointsReq) return { error: "Puntos insuficientes." };

    // Verificar si ya lo tiene
    const existing = await prisma.userReward.findUnique({
      where: {
        userId_rewardId: {
          userId: user.id,
          rewardId: reward.id
        }
      }
    });

    if (existing) return { error: "Ya has reclamado este premio." };

    await prisma.$transaction(async (tx) => {
      // Registrar que lo reclamó
      await tx.userReward.create({
        data: {
          userId: user.id,
          rewardId: reward.id
        }
      });
      // Restar puntos (opcional, si los premios "cuestan" puntos o si solo "desbloquean" por tenerlos)
      // "cuantos puntos te faltan para conseguir ese premio". Generalmente en gamificación los premios se *compran*.
      await tx.user.update({
        where: { id: user.id },
        data: { points: { decrement: reward.pointsReq } }
      });
    });

    revalidatePath("/premios");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Ocurrió un error al canjear el premio." };
  }
}
