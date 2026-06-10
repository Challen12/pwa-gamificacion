"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createReward(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return { error: "No autorizado." };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const pointsReqStr = formData.get("pointsReq") as string;
  const expiresAtStr = formData.get("expiresAt") as string;
  // TODO: Add Image Processing

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
      data: {
        name,
        description,
        pointsReq,
        expiresAt,
        // imageUrl: TODO
      }
    });

    revalidatePath("/admin");
    revalidatePath("/premios");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Error al crear el premio." };
  }
}
