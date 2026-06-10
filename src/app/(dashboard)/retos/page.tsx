import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserChallengesProgress } from "@/lib/actions/challengesLogic";

export default async function RetosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/login");

  const challenges = await getUserChallengesProgress(session.user.id);

  const activeChallenges = challenges.filter(c => !c.isCompleted);
  const completedChallenges = challenges.filter(c => c.isCompleted);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="glass-card rounded-xl p-5 mesh-card-primary text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-3xl">sports_score</span>
          Retos
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Supera tus límites y gana recompensas especiales
        </p>
      </header>

      <section>
        <h2 className="font-headline-sm text-on-surface mb-3 px-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">bolt</span>
          Retos Activos
        </h2>
        {activeChallenges.length === 0 ? (
          <div className="glass-card p-6 rounded-xl text-center border border-outline-variant/30">
            <p className="text-on-surface-variant">No hay retos activos en este momento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeChallenges.map(c => {
              const progressPercent = Math.min(100, Math.max(0, (c.currentProgress / c.target) * 100));
              
              return (
                <div key={c.id} className="glass-card p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-3 relative overflow-hidden group hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <h3 className="font-headline-sm text-primary">{c.name}</h3>
                      <p className="text-sm text-on-surface-variant mt-1">{c.description}</p>
                    </div>
                    <div className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full font-label-tech text-xs flex items-center gap-1 shadow-sm border border-tertiary/20">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      +{c.pointsReq} pts
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mt-2 z-10">
                    <div className="flex justify-between text-xs font-label-tech text-on-surface-variant">
                      <span>{c.currentProgress.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {c.target.toLocaleString()} {c.type}</span>
                      <span>{progressPercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {completedChallenges.length > 0 && (
        <section className="mt-4">
          <h2 className="font-headline-sm text-on-surface mb-3 px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">verified</span>
            Retos Completados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {completedChallenges.map(c => (
              <div key={c.id} className="bg-surface-container-low p-4 rounded-xl border border-secondary/20 flex gap-3 items-center opacity-80 hover:opacity-100 transition-opacity">
                <div className="bg-secondary/20 p-2 rounded-full text-secondary">
                  <span className="material-symbols-outlined">emoji_events</span>
                </div>
                <div>
                  <h3 className="font-body-md font-bold text-on-surface">{c.name}</h3>
                  <p className="text-xs text-on-surface-variant font-label-tech">Completado el {c.completedAt?.toLocaleDateString()}</p>
                  <p className="text-xs text-secondary mt-0.5">+{c.pointsReq} puntos obtenidos</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
