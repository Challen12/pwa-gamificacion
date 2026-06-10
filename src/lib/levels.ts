/**
 * Calcula el nivel, título y progreso basándose en los puntos totales.
 * La curva es exponencial: cada nivel requiere un 8% más de puntos que el anterior, partiendo de 100.
 */

export function calculateLevelData(totalPoints: number) {
  const basePoints = 100;
  const exponentMultiplier = 1.08;

  let level = 1;
  let pointsAccumulatedForCurrentLevel = 0;
  let pointsToNext = Math.floor(basePoints * Math.pow(exponentMultiplier, 0)); // 100 pts for level 1 to 2

  // Calcular el nivel actual iterativamente
  let remainingPoints = totalPoints;
  
  while (remainingPoints >= pointsToNext && level < 100) {
    remainingPoints -= pointsToNext;
    pointsAccumulatedForCurrentLevel += pointsToNext;
    level++;
    pointsToNext = Math.floor(basePoints * Math.pow(exponentMultiplier, level - 1));
  }

  // Si llegamos a nivel 100
  if (level === 100) {
    pointsToNext = 0;
    remainingPoints = totalPoints - pointsAccumulatedForCurrentLevel; 
  }

  // Título basado en el nivel
  let title = "Novato";
  if (level >= 10) title = "Aprendiz";
  if (level >= 20) title = "Aventurero";
  if (level >= 30) title = "Guerrero";
  if (level >= 40) title = "Veterano";
  if (level >= 50) title = "Maestro";
  if (level >= 60) title = "Gran Maestro";
  if (level >= 70) title = "Épico";
  if (level >= 80) title = "Legendario";
  if (level >= 90) title = "Mítico";
  if (level === 100) title = "Dios de Onlinemente";

  // Progreso porcentual
  let progressPercentage = 0;
  if (level < 100) {
    progressPercentage = (remainingPoints / pointsToNext) * 100;
  } else {
    progressPercentage = 100; // Al máximo nivel la barra está llena
  }

  return {
    level,
    title,
    currentLevelPoints: remainingPoints, // Puntos conseguidos dentro del nivel actual
    pointsToNext, // Puntos totales requeridos en este nivel
    progressPercentage
  };
}

/**
 * Genera el listado completo de los 100 niveles.
 */
export function getAllLevels() {
  const levels = [];
  const basePoints = 100;
  const exponentMultiplier = 1.08;
  
  let totalPoints = 0;
  
  for (let i = 1; i <= 100; i++) {
    let title = "Novato";
    if (i >= 10) title = "Aprendiz";
    if (i >= 20) title = "Aventurero";
    if (i >= 30) title = "Guerrero";
    if (i >= 40) title = "Veterano";
    if (i >= 50) title = "Maestro";
    if (i >= 60) title = "Gran Maestro";
    if (i >= 70) title = "Épico";
    if (i >= 80) title = "Legendario";
    if (i >= 90) title = "Mítico";
    if (i === 100) title = "Dios de Onlinemente";
    
    levels.push({
      id: `lvl_${i}`,
      level: i,
      name: `${title} (Nivel ${i})`,
      pointsReq: Math.floor(totalPoints)
    });
    
    // Calcular siguiente salto
    let pointsToNext = Math.floor(basePoints * Math.pow(exponentMultiplier, i - 1));
    totalPoints += pointsToNext;
  }
  
  return levels;
}
