import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminPanelClient } from "./AdminPanelClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-[50vh] text-center">
        <span className="material-symbols-outlined text-6xl text-error opacity-50">gpp_bad</span>
        <h1 className="font-headline-lg text-headline-lg text-error">Acceso Denegado</h1>
        <p className="text-on-surface-variant">Necesitas permisos de administrador para ver esta página.</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { points: 'desc' },
    select: { id: true, name: true, username: true, role: true, points: true }
  });

  const rewards = await prisma.reward.findMany();
  const challenges = await prisma.challenge.findMany();
  
  let settings = await prisma.settings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = { id: "global", pointsPerStep: 0.001, pointsPerExerciseMinute: 1.6667 };
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="glass-card rounded-xl p-5 mesh-card-tertiary text-center">
        <h1 className="font-headline-lg text-headline-lg text-tertiary mb-1">Panel de Control</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Gestión Global de Gamificación
        </p>
      </header>
      
      <AdminPanelClient 
        users={users} 
        rewards={rewards} 
        challenges={challenges} 
        settings={settings} 
      />
    </div>
  );
}
