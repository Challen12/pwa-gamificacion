import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  // Calculate today's steps
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayStepsData = await prisma.step.aggregate({
    where: {
      userId: session.user.id,
      date: { gte: today }
    },
    _sum: { count: true }
  });

  const user = {
    name: dbUser?.name || session.user.name || "Usuario",
    level: 1, // To be calculated later based on points
    points: dbUser?.points || 0,
    rank: 1, // To be calculated later
    steps: todayStepsData._sum.count || 0,
    goal: 10000,
  };

  return (
    <>
      {/* Header Perfil */}
      <section className="glass-card rounded-xl p-6 flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary-container/10"></div>
        <button className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors z-10 p-2 rounded-full hover:bg-surface-variant/50">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="relative z-10 w-24 h-24 rounded-full p-1 bg-gradient-to-br from-primary to-secondary-fixed mb-4">
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-surface bg-surface-container flex items-center justify-center text-primary font-bold text-2xl">
            {user.name.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary font-label-tech text-label-tech px-2 py-1 rounded-full border-2 border-surface shadow-sm">
            Nvl {user.level}
          </div>
        </div>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-1 z-10">{user.name}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-4 z-10">Corredor Principiante</p>
        
        <div className="w-full z-10">
          <div className="flex justify-between font-label-tech text-label-tech text-on-surface-variant mb-2">
            <span>Exp. Nivel {user.level}</span>
            <span>{user.points} / 2,000 XP</span>
          </div>
          <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full progress-bar-fill" style={{ width: "62.5%" }}></div>
          </div>
        </div>
      </section>

      {/* Estadísticas Rápidas */}
      <section className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-lg p-4 flex flex-col items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer">
          <span className="material-symbols-outlined text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="font-headline-md text-headline-md text-on-surface">{(user.points / 1000).toFixed(1)}k</span>
          <span className="font-label-tech text-label-tech text-on-surface-variant uppercase mt-1">Puntos</span>
        </div>
        <div className="glass-card rounded-lg p-4 flex flex-col items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-secondary/10 rounded-bl-full"></div>
          <span className="material-symbols-outlined text-tertiary mb-2">leaderboard</span>
          <span className="font-headline-md text-headline-md text-on-surface">#{user.rank}</span>
          <span className="font-label-tech text-label-tech text-on-surface-variant uppercase mt-1">Ranking</span>
        </div>
      </section>

      {/* Dashboard de Actividad Diaria */}
      <section className="glass-card rounded-xl p-5 mesh-card-primary">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Tu Día</h2>
        <div className="flex flex-col gap-4">
          
          {/* Pasos */}
          <div className="bg-surface/60 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-full">directions_walk</span>
                <span className="font-body-md text-body-md font-semibold text-on-surface">Pasos</span>
              </div>
              <span className="font-label-tech text-label-tech text-on-surface-variant">Meta: {user.goal.toLocaleString()}</span>
            </div>
            <div className="flex items-end gap-3 mb-2">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">{user.steps.toLocaleString()}</span>
              <span className="font-body-md text-body-md text-on-surface-variant pb-1">pasos hoy</span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-4">
              <div className="h-full bg-primary rounded-full progress-bar-fill" style={{ width: `${(user.steps / user.goal) * 100}%` }}></div>
            </div>
            <div className="input-focus-effect bg-surface-container-lowest rounded-t-lg px-3 py-2 flex items-center justify-between">
              <input className="bg-transparent border-none text-body-md font-body-md text-on-surface placeholder-on-surface-variant/50 focus:ring-0 p-0 w-full outline-none" placeholder="Añadir pasos manuales" type="number" />
              <button className="text-primary hover:text-primary-container p-1 flex"><span className="material-symbols-outlined">add_circle</span></button>
            </div>
          </div>

          {/* Ejercicio */}
          <div className="bg-surface/60 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-full">fitness_center</span>
                <span className="font-body-md text-body-md font-semibold text-on-surface">Ejercicio Activo</span>
              </div>
              <button className="font-label-tech text-label-tech text-primary hover:underline">Registrar</button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30">
                 <span className="text-on-surface-variant text-sm">No has registrado ejercicios hoy.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
