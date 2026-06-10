import { prisma } from "@/lib/prisma";

/**
 * Revisa todos los retos activos y comprueba si el usuario los ha cumplido.
 * Si los cumple, le otorga los puntos y lo marca como completado.
 */
export async function checkUserChallenges(userId: string) {
  // 1. Obtener usuario con sus puntos
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  // 2. Obtener retos activos que NO haya completado el usuario
  const uncompletedChallenges = await prisma.challenge.findMany({
    where: {
      users: {
        none: { userId }
      }
    }
  });

  if (uncompletedChallenges.length === 0) return;

  // 3. Agregar estadísticas del usuario solo si es necesario
  const needsSteps = uncompletedChallenges.some(c => c.type === 'pasos');
  const needsExercises = uncompletedChallenges.some(c => c.type === 'ejercicios');

  let totalSteps = 0;
  let totalExerciseMinutes = 0;

  if (needsSteps) {
    const stepsAggr = await prisma.step.aggregate({
      where: { userId },
      _sum: { count: true }
    });
    totalSteps = stepsAggr._sum.count || 0;
  }

  if (needsExercises) {
    const exercisesAggr = await prisma.activity.aggregate({
      where: { userId },
      _sum: { duration: true }
    });
    totalExerciseMinutes = exercisesAggr._sum.duration || 0;
  }

  // 4. Comprobar cada reto
  let totalPointsEarned = 0;
  const challengesToMark = [];

  for (const c of uncompletedChallenges) {
    let completed = false;

    if (c.type === 'pasos' && totalSteps >= c.target) completed = true;
    else if (c.type === 'ejercicios' && totalExerciseMinutes >= c.target) completed = true;
    else if (c.type === 'puntos' && user.points >= c.target) completed = true;

    if (completed) {
      challengesToMark.push(c);
      totalPointsEarned += c.pointsReq; // El campo pointsReq es la recompensa del reto
    }
  }

  // 5. Guardar transaccionalmente si se completó alguno
  if (challengesToMark.length > 0) {
    await prisma.$transaction(async (tx) => {
      // Crear registros de que los ha completado
      for (const c of challengesToMark) {
        await tx.userChallenge.create({
          data: { userId, challengeId: c.id }
        });
      }
      
      // Sumar recompensa al usuario
      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: totalPointsEarned } }
      });
    });
  }
}

/**
 * Devuelve el listado de retos con el progreso actual del usuario incrustado.
 * Ideal para pintar las barras de progreso en la UI.
 */
export async function getUserChallengesProgress(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  const allChallenges = await prisma.challenge.findMany({
    include: {
      users: {
        where: { userId }
      }
    }
  });

  const needsSteps = allChallenges.some(c => c.type === 'pasos');
  const needsExercises = allChallenges.some(c => c.type === 'ejercicios');

  let totalSteps = 0;
  let totalExerciseMinutes = 0;

  if (needsSteps) {
    const stepsAggr = await prisma.step.aggregate({
      where: { userId },
      _sum: { count: true }
    });
    totalSteps = stepsAggr._sum.count || 0;
  }

  if (needsExercises) {
    const exercisesAggr = await prisma.activity.aggregate({
      where: { userId },
      _sum: { duration: true }
    });
    totalExerciseMinutes = exercisesAggr._sum.duration || 0;
  }

  return allChallenges.map(c => {
    const isCompleted = c.users.length > 0;
    const completedAt = isCompleted ? c.users[0].completedAt : null;
    let current = 0;
    
    if (c.type === 'pasos') current = totalSteps;
    else if (c.type === 'ejercicios') current = totalExerciseMinutes;
    else if (c.type === 'puntos') current = user.points;

    return {
      ...c,
      currentProgress: current,
      isCompleted,
      completedAt
    };
  });
}
