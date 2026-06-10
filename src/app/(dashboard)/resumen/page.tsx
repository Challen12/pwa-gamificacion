import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "./CalendarView";

export default async function ResumenPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const resolvedParams = await searchParams;

  const today = new Date();
  const currentYear = resolvedParams.year ? parseInt(resolvedParams.year) : today.getFullYear();
  const currentMonth = resolvedParams.month ? parseInt(resolvedParams.month) : today.getMonth();

  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

  const activities = await prisma.activity.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  const steps = await prisma.step.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  const activityByDate: Record<string, { hasActivity: boolean, steps: any[], activities: any[] }> = {};

  activities.forEach(act => {
    const d = act.date.toISOString().split('T')[0];
    if (!activityByDate[d]) activityByDate[d] = { hasActivity: true, steps: [], activities: [] };
    activityByDate[d].activities.push(act);
  });

  steps.forEach(st => {
    const d = st.date.toISOString().split('T')[0];
    if (!activityByDate[d]) activityByDate[d] = { hasActivity: true, steps: [], activities: [] };
    activityByDate[d].steps.push(st);
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="glass-card rounded-xl p-5 mesh-card-primary text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Resumen de Actividad</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Tu historial mensual de esfuerzo y dedicación.
        </p>
      </header>

      <CalendarView 
        activityData={activityByDate} 
        currentYear={currentYear} 
        currentMonth={currentMonth} 
      />
    </div>
  );
}
