import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NivelesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  const levels = await prisma.level.findMany({
    orderBy: { pointsReq: 'asc' }
  });

  const allUsers = await prisma.user.findMany({
    orderBy: { points: 'desc' },
    select: {
      id: true,
      name: true,
      points: true
    }
  });

  const userPoints = user?.points || 0;
  
  // Encontrar el nivel actual del usuario
  let currentLevel = levels.length > 0 ? levels[0] : null;
  for (const lvl of levels) {
    if (userPoints >= lvl.pointsReq) {
      currentLevel = lvl;
    }
  }

  const userRank = allUsers.findIndex(u => u.id === session.user.id) + 1;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Nivel Actual */}
      <header className="glass-card rounded-xl p-6 mesh-card-primary relative overflow-hidden flex flex-col items-center">
        <h1 className="font-headline-md text-headline-md text-primary mb-2">Tu Nivel Actual</h1>
        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-3xl font-bold text-primary shadow-inner mb-2 border-4 border-primary/20">
          {currentLevel ? currentLevel.name.split(' ')[1] || '1' : '0'}
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{currentLevel?.name || "Principiante"}</h2>
        <p className="font-label-tech text-label-tech text-on-surface-variant uppercase mt-1">Ranking: #{userRank}</p>
      </header>

      {/* Lista de Niveles */}
      <section>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 px-1">Camino de Niveles</h3>
        <div className="flex flex-col gap-3">
          {levels.length === 0 ? (
            <div className="glass-card rounded-xl p-4 text-center text-sm text-on-surface-variant">
              Los niveles están siendo configurados.
            </div>
          ) : (
            levels.map((level, index) => {
              const isAchieved = userPoints >= level.pointsReq;
              const pointsMissing = level.pointsReq - userPoints;
              
              return (
                <div key={level.id} className={`glass-card rounded-xl p-4 border border-outline-variant/30 flex items-center gap-4 ${isAchieved ? 'bg-primary/5' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
                    ${isAchieved ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">{level.name}</h4>
                    <div className="flex justify-between font-label-tech text-label-tech mt-1">
                      <span className="text-on-surface-variant">{level.pointsReq} pts req.</span>
                      {isAchieved ? (
                        <span className="text-primary flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check</span> Desbloqueado</span>
                      ) : (
                        <span className="text-error">Faltan {pointsMissing.toFixed(0)} pts</span>
                      )}
                    </div>
                    {!isAchieved && pointsMissing > 0 && (
                      <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (userPoints / level.pointsReq) * 100)}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

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

    </div>
  );
}
