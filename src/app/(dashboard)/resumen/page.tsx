import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "./CalendarView";

export default async function ResumenPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Fecha actual para calcular el mes
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  // Obtener actividades y pasos del usuario en el mes actual
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

  // Agrupar por día (formato YYYY-MM-DD)
  const activityByDate: Record<string, { hasActivity: boolean, details: string[] }> = {};

  activities.forEach(act => {
    const d = act.date.toISOString().split('T')[0];
    if (!activityByDate[d]) activityByDate[d] = { hasActivity: true, details: [] };
    activityByDate[d].details.push(`Ejercicio: ${act.type} (${act.duration} min)`);
  });

  steps.forEach(st => {
    const d = st.date.toISOString().split('T')[0];
    if (!activityByDate[d]) activityByDate[d] = { hasActivity: true, details: [] };
    activityByDate[d].details.push(`Pasos: ${st.count}`);
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
        currentYear={today.getFullYear()} 
        currentMonth={today.getMonth()} 
      />
    </div>
  );
}
