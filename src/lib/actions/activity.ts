"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { join } from "path";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

/**
 * Registra pasos y actualiza puntos: 1 paso = 0.0001 puntos
 */
export async function registerSteps(steps: number) {
  if (steps <= 0) return { error: "Cantidad de pasos no válida." };

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado." };

  const pointsEarned = steps * 0.0001;

  try {
    await prisma.$transaction(async (tx) => {
      // Registrar entrada
      await tx.step.create({
        data: {
          userId: session.user.id,
          count: steps,
          pointsEarned,
        },
      });

      // Actualizar total usuario
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          points: {
            increment: pointsEarned,
          },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/actividad");
    return { success: true, pointsEarned };
  } catch (err) {
    console.error(err);
    return { error: "Error al guardar los pasos." };
  }
}

/**
 * Registra un ejercicio y actualiza puntos: 1h (60 min) = 100 puntos
 */
export async function registerExercise(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado." };

  const type = formData.get("type") as string;
  const durationStr = formData.get("duration") as string;
  const intensity = formData.get("intensity") as string;
  const file = formData.get("image") as File | null;

  const duration = parseInt(durationStr);
  if (!type || isNaN(duration) || duration <= 0 || !intensity) {
    return { error: "Faltan campos obligatorios o son inválidos." };
  }

  let imageUrl = null;

  if (file && file.size > 0) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Procesar con sharp: reducir a max 800px de ancho y formato webp
      const optimizedBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const fileName = `${uuidv4()}.webp`;
      const uploadDir = join(process.cwd(), "public", "uploads");
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, optimizedBuffer);
      imageUrl = `/uploads/${fileName}`;
    } catch (e) {
      console.error("Error al procesar la imagen con sharp:", e);
      return { error: "Error al subir la imagen." };
    }
  }

  // 60 minutos = 100 puntos. Por tanto, 1 minuto = 100 / 60 puntos.
  const pointsEarned = (duration / 60) * 100;

  try {
    await prisma.$transaction(async (tx) => {
      // Registrar actividad
      await tx.activity.create({
        data: {
          userId: session.user.id,
          type,
          duration,
          intensity,
          pointsEarned,
          imageUrl,
        },
      });

      // Actualizar total usuario
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          points: {
            increment: pointsEarned,
          },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/actividad");
    return { success: true, pointsEarned };
  } catch (err) {
    console.error(err);
    return { error: "Error al guardar el ejercicio." };
  }
}
