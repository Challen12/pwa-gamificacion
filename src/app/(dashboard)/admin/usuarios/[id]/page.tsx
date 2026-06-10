import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserActivityClient } from "./UserActivityClient";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return redirect("/dashboard");

  const { id: userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) return <div>Usuario no encontrado</div>;

  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 100 // Limitar inicial
  });

  const steps = await prisma.step.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 100 // Limitar inicial
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="glass-card rounded-xl p-5 mesh-card-secondary text-center relative">
        <a href="/admin" className="absolute left-4 top-4 text-on-surface-variant hover:text-secondary material-symbols-outlined">arrow_back</a>
        <h1 className="font-headline-lg text-headline-lg text-secondary mb-1">Actividad del Usuario</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {user.name} ({user.username})
        </p>
      </header>

      <UserActivityClient activities={activities} steps={steps} userId={userId} />
    </div>
  );
}
