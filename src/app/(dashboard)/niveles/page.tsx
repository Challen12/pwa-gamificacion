import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllLevels, calculateLevelData } from "@/lib/levels";
import { LevelsList } from "./LevelsList";

export default async function NivelesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  const levels = getAllLevels();

  const allUsers = await prisma.user.findMany({
    orderBy: { points: 'desc' },
    select: {
      id: true,
      name: true,
      points: true
    }
  });

  const lastStep = await prisma.step.findFirst({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' }
  });

  const lastActivity = await prisma.activity.findFirst({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' }
  });

  let lastDate = null;
  if (lastStep && lastActivity) {
    lastDate = lastStep.date > lastActivity.date ? lastStep.date : lastActivity.date;
  } else if (lastStep) {
    lastDate = lastStep.date;
  } else if (lastActivity) {
    lastDate = lastActivity.date;
  }

  const userPoints = user?.points || 0;
  const levelData = calculateLevelData(userPoints);
  
  // Encontrar el nivel actual del usuario a partir de la math
  const currentLevel = levels.find(l => l.level === levelData.level) || levels[0];

  const userRank = allUsers.findIndex(u => u.id === session.user.id) + 1;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Nivel Actual */}
      <header className="glass-card rounded-xl p-6 mesh-card-primary relative overflow-hidden flex flex-col items-center">
        <h1 className="font-headline-md text-headline-md text-primary mb-2">Tu Nivel Actual</h1>
        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-3xl font-bold text-primary shadow-inner mb-2 border-4 border-primary/20">
          {currentLevel.level}
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{levelData.title}</h2>
        <p className="font-label-tech text-label-tech text-on-surface-variant uppercase mt-1">Ranking: #{userRank}</p>
      </header>

      {/* Ranking / Puntos */}
      <section className="mb-4">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 px-1">Clasificación Global</h3>
        <div className="glass-card rounded-xl overflow-hidden flex flex-col border border-outline-variant/30">
          {allUsers.map((u, i) => (
            <div key={u.id} className={`flex items-center justify-between p-4 border-b border-outline-variant/10 last:border-0 ${u.id === session.user.id ? 'bg-secondary/10' : ''}`}>
              <div className="flex items-center gap-3">
                <span className={`font-label-tech w-6 text-center ${i < 3 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                  {i + 1}
                </span>
                <span className="font-body-md text-on-surface">{u.name}</span>
              </div>
              <span className="font-label-tech text-label-tech text-secondary">{u.points.toFixed(0)} pts</span>
            </div>
          ))}
        </div>
      </section>

      {/* Lista de Niveles */}
      <section>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 px-1">Camino de Niveles</h3>
        <LevelsList 
          levels={levels} 
          userPoints={userPoints} 
          currentLevelId={currentLevel.id} 
          lastActivityDateStr={lastDate ? lastDate.toISOString() : null}
        />
      </section>

    </div>
  );
}
