import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MissionCard } from "./MissionCard";

export default async function RetosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      missions: true
    }
  });

  const missions = await prisma.mission.findMany({
    orderBy: { pointsReq: 'asc' }
  });

  const userPoints = user?.points || 0;
  const completedMissions = new Set(user?.missions.map(um => um.missionId));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="glass-card rounded-xl p-5 mesh-card-primary text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Retos y Misiones</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Completa objetivos para ganar reconocimientos.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-headline-md text-headline-md text-on-surface px-2">Misiones Activas</h2>
        {missions.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-on-surface-variant">
            No hay misiones disponibles actualmente.
          </div>
        ) : (
          missions.map((mission) => (
            <MissionCard 
              key={mission.id} 
              mission={mission} 
              userPoints={userPoints} 
              isCompleted={completedMissions.has(mission.id)} 
            />
          ))
        )}
      </section>
    </div>
  );
}
