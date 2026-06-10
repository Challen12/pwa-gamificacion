import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { RewardCard } from "./RewardCard";

export default async function PremiosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      rewards: true
    }
  });

  const rewards = await prisma.reward.findMany({
    orderBy: { pointsReq: 'asc' }
  });

  const userPoints = user?.points || 0;
  const claimedRewardIds = new Set(user?.rewards.map(ur => ur.rewardId));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="glass-card rounded-xl p-5 mesh-card-secondary text-center">
        <h1 className="font-headline-lg text-headline-lg text-secondary mb-1">Catálogo de Premios</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Tienes <span className="font-bold text-on-surface text-lg">{userPoints.toFixed(0)}</span> puntos disponibles.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4">
        {rewards.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-on-surface-variant">
            No hay premios disponibles en este momento.
          </div>
        ) : (
          rewards.map((reward) => (
            <RewardCard 
              key={reward.id} 
              reward={reward} 
              userPoints={userPoints} 
              isClaimed={claimedRewardIds.has(reward.id)} 
            />
          ))
        )}
      </section>
    </div>
  );
}
