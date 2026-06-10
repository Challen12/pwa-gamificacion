"use client";

import { useState } from "react";

interface CalendarViewProps {
  activityData: Record<string, { hasActivity: boolean; details: string[] }>;
  currentYear: number;
  currentMonth: number;
}

export function CalendarView({ activityData, currentYear, currentMonth }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Obtener días del mes
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo
  
  // Ajustar para que el Lunes sea el primer día (Lunes = 0, Domingo = 6)
  const firstDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["L", "M", "X", "J", "V", "S", "D"];

  const todayStr = new Date().toISOString().split('T')[0];

  const renderDays = () => {
    const days = [];
    
    // Espacios vacíos antes del primer día
    for (let i = 0; i < firstDayOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 sm:h-16"></div>);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPastOrToday = dateStr <= todayStr;
      const data = activityData[dateStr];
      const hasActivity = data?.hasActivity;

      // Colores basados en el estado (Aprobación vs Alarma)
      let bgClass = "bg-surface-container-low text-on-surface";
      let borderClass = "border-outline-variant/30";
      let icon = null;

      if (isPastOrToday) {
        if (hasActivity) {
          bgClass = "bg-primary/20 text-primary font-bold";
          borderClass = "border-primary/40";
          icon = <span className="material-symbols-outlined text-[10px] sm:text-xs absolute bottom-1 right-1">verified</span>;
        } else {
          bgClass = "bg-error/15 text-error font-medium";
          borderClass = "border-error/30";
          icon = <span className="material-symbols-outlined text-[10px] sm:text-xs absolute bottom-1 right-1">warning</span>;
        }
      }

      if (dateStr === todayStr) {
        borderClass += " ring-2 ring-secondary ring-offset-2 ring-offset-background";
      }

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(dateStr)}
          className={`h-12 sm:h-16 rounded-lg border flex items-center justify-center relative cursor-pointer hover:scale-105 active:scale-95 transition-transform ${bgClass} ${borderClass}`}
        >
          <span className="text-sm sm:text-base">{day}</span>
          {icon}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="glass-card rounded-xl p-5 border border-outline-variant/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface capitalize">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex gap-2 text-xs font-label-tech">
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary/40 border border-primary/60"></span> Activo</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-error/30 border border-error/50"></span> Alarma</div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2 text-center font-label-tech text-on-surface-variant">
          {dayNames.map(d => <div key={d}>{d}</div>)}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {renderDays()}
        </div>
      </section>

      {/* Detalles del día seleccionado */}
      {selectedDate && (
        <section className="glass-card rounded-xl p-5 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">today</span>
            Detalle: {selectedDate.split('-').reverse().join('/')}
          </h3>
          
          {!activityData[selectedDate]?.hasActivity ? (
            <p className="text-on-surface-variant font-body-md bg-error/10 p-3 rounded-lg border border-error/20 flex gap-2 items-start">
              <span className="material-symbols-outlined text-error">notification_important</span>
              <span>No registraste actividad este día. Recuerda que la constancia es clave para subir de nivel.</span>
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {activityData[selectedDate].details.map((detail, idx) => (
                <li key={idx} className="bg-primary/10 p-3 rounded-lg border border-primary/20 text-on-surface font-body-md flex gap-2 items-center">
                   <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                   {detail}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
