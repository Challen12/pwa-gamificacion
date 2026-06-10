"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSettings } from "./admin";
import sharp from "sharp";
import { join } from "path";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

import { checkUserChallenges } from "./challengesLogic";

/**
 * Obtiene los pasos de una fecha concreta
 */
export async function getStepsForDate(dateStr: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { count: 0 };

  const targetDate = new Date(dateStr);
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

  const stepRecord = await prisma.step.findFirst({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  return { count: stepRecord?.count || 0 };
}

/**
 * Registra pasos y actualiza puntos: 10,000 pasos = 10 puntos (1 paso = 0.001 puntos)
 */
export async function registerSteps(steps: number, dateStr: string) {
  if (steps < 0) return { error: "Cantidad de pasos no válida." };

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado." };

  const settings = await getSettings();
  const pointsRate = settings.pointsPerStep;
  const targetDate = new Date(dateStr);
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

  try {
    await prisma.$transaction(async (tx) => {
      // Buscar si ya hay registro hoy
      const existingStep = await tx.step.findFirst({
        where: {
          userId: session.user.id,
          date: { gte: startOfDay, lte: endOfDay }
        }
      });

      if (existingStep) {
        // Actualizar
        const diffSteps = steps - existingStep.count;
        const diffPoints = diffSteps * pointsRate;

        await tx.step.update({
          where: { id: existingStep.id },
          data: {
            count: steps,
            pointsEarned: existingStep.pointsEarned + diffPoints
          }
        });

        if (diffPoints !== 0) {
          await tx.user.update({
            where: { id: session.user.id },
            data: { points: { increment: diffPoints } }
          });
        }
      } else {
        // Crear nuevo
        const pointsEarned = steps * pointsRate;
        await tx.step.create({
          data: {
            userId: session.user.id,
            count: steps,
            pointsEarned,
            date: startOfDay // Guardamos a medianoche
          },
        });

        await tx.user.update({
          where: { id: session.user.id },
          data: { points: { increment: pointsEarned } }
        });
      }
    });

    await checkUserChallenges(session.user.id);
    revalidatePath("/dashboard");
    revalidatePath("/actividad");
    revalidatePath("/resumen");
    revalidatePath("/retos");
    return { success: true };
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
  const dateStr = formData.get("date") as string;
  const file = formData.get("image") as File | null;

  const duration = parseInt(durationStr);
  if (!type || isNaN(duration) || duration <= 0 || !intensity || !dateStr) {
    return { error: "Faltan campos obligatorios o son inválidos." };
  }

  const targetDate = new Date(dateStr);
  // Ajustar la hora al mediodía para evitar problemas de timezone
  targetDate.setHours(12, 0, 0, 0);

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

  // Points calculation from settings
  const settings = await getSettings();
  const pointsEarned = duration * settings.pointsPerExerciseMinute;

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
          date: targetDate
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

    await checkUserChallenges(session.user.id);
    revalidatePath("/dashboard");
    revalidatePath("/actividad");
    revalidatePath("/resumen");
    revalidatePath("/retos");
    return { success: true, pointsEarned };
  } catch (err) {
    console.error(err);
    return { error: "Error al guardar el ejercicio." };
  }
}

/**
 * Borrar Pasos
 */
export async function deleteStep(stepId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado." };

  try {
    await prisma.$transaction(async (tx) => {
      const step = await tx.step.findUnique({ where: { id: stepId } });
      if (!step || (step.userId !== session.user.id && session.user.role !== "ADMIN")) throw new Error("No autorizado");

      await tx.user.update({
        where: { id: step.userId },
        data: { points: { decrement: step.pointsEarned } }
      });

      await tx.step.delete({ where: { id: stepId } });
    });
    
    revalidatePath("/dashboard");
    revalidatePath("/resumen");
    return { success: true };
  } catch (e) {
    return { error: "Error al borrar los pasos." };
  }
}

/**
 * Borrar Ejercicio
 */
export async function deleteActivity(activityId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado." };

  try {
    await prisma.$transaction(async (tx) => {
      const act = await tx.activity.findUnique({ where: { id: activityId } });
      if (!act || (act.userId !== session.user.id && session.user.role !== "ADMIN")) throw new Error("No autorizado");

      await tx.user.update({
        where: { id: act.userId },
        data: { points: { decrement: act.pointsEarned } }
      });

      await tx.activity.delete({ where: { id: activityId } });
    });
    
    revalidatePath("/dashboard");
    revalidatePath("/resumen");
    return { success: true };
  } catch (e) {
    return { error: "Error al borrar el ejercicio." };
  }
}

/**
 * Actualizar Ejercicio
 */
export async function updateActivity(activityId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado." };

  const type = formData.get("type") as string;
  const durationStr = formData.get("duration") as string;
  const intensity = formData.get("intensity") as string;
  const duration = parseInt(durationStr);

  if (!type || isNaN(duration) || duration <= 0 || !intensity) {
    return { error: "Faltan campos obligatorios o son inválidos." };
  }

  const settings = await getSettings();
  const newPointsEarned = duration * settings.pointsPerExerciseMinute;

  try {
    const targetUserId = await prisma.$transaction(async (tx) => {
      const act = await tx.activity.findUnique({ where: { id: activityId } });
      if (!act || (act.userId !== session.user.id && session.user.role !== "ADMIN")) throw new Error("No autorizado");

      const diffPoints = newPointsEarned - act.pointsEarned;

      await tx.activity.update({
        where: { id: activityId },
        data: {
          type,
          duration,
          intensity,
          pointsEarned: newPointsEarned
        }
      });

      if (diffPoints !== 0) {
        await tx.user.update({
          where: { id: act.userId },
          data: { points: { increment: diffPoints } }
        });
      }
      return act.userId;
    });

    await checkUserChallenges(targetUserId);
    revalidatePath("/dashboard");
    revalidatePath("/resumen");
    revalidatePath("/retos");
    return { success: true };
  } catch (e) {
    return { error: "Error al actualizar el ejercicio." };
  }
}

/**
 * Actualizar Pasos
 */
export async function updateStep(stepId: string, count: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado." };

  if (count < 0) return { error: "Cantidad inválida" };

  const settings = await getSettings();
  const pointsRate = settings.pointsPerStep;
  const newPointsEarned = count * pointsRate;

  try {
    const targetUserId = await prisma.$transaction(async (tx) => {
      const step = await tx.step.findUnique({ where: { id: stepId } });
      if (!step || (step.userId !== session.user.id && session.user.role !== "ADMIN")) throw new Error("No autorizado");

      const diffPoints = newPointsEarned - step.pointsEarned;

      await tx.step.update({
        where: { id: stepId },
        data: {
          count,
          pointsEarned: newPointsEarned
        }
      });

      if (diffPoints !== 0) {
        await tx.user.update({
          where: { id: step.userId },
          data: { points: { increment: diffPoints } }
        });
      }
      return step.userId;
    });

    await checkUserChallenges(targetUserId);
    revalidatePath("/dashboard");
    revalidatePath("/resumen");
    revalidatePath("/retos");
    return { success: true };
  } catch (e) {
    return { error: "Error al actualizar los pasos." };
  }
}
