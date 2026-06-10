"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteStep, deleteActivity, updateActivity, updateStep } from "@/lib/actions/activity";

interface CalendarViewProps {
  activityData: Record<string, { hasActivity: boolean; steps: any[]; activities: any[] }>;
  currentYear: number;
  currentMonth: number;
}

export function CalendarView({ activityData, currentYear, currentMonth }: CalendarViewProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Edit state
  const [editingAct, setEditingAct] = useState<any>(null);
  const [editType, setEditType] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editIntensity, setEditIntensity] = useState("");

  // Edit step state
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepCount, setEditStepCount] = useState("");

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const firstDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["L", "M", "X", "J", "V", "S", "D"];
  const todayStr = new Date().toISOString().split('T')[0];

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/resumen?month=${e.target.value}&year=${currentYear}`);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/resumen?month=${currentMonth}&year=${e.target.value}`);
  };

  const handleDeleteStep = async (id: string) => {
    if (!confirm("¿Seguro que quieres borrar estos pasos?")) return;
    setLoadingId(id);
    await deleteStep(id);
    setLoadingId(null);
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("¿Seguro que quieres borrar este ejercicio?")) return;
    setLoadingId(id);
    await deleteActivity(id);
    setLoadingId(null);
  };

  const handleEditClick = (act: any) => {
    setEditingAct(act.id);
    setEditType(act.type);
    setEditDuration(act.duration.toString());
    setEditIntensity(act.intensity);
  };

  const handleUpdateActivity = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setLoadingId(id);
    const formData = new FormData();
    formData.append("type", editType);
    formData.append("duration", editDuration);
    formData.append("intensity", editIntensity);
    await updateActivity(id, formData);
    setEditingAct(null);
    setLoadingId(null);
  };

  const handleEditStepClick = (step: any) => {
    setEditingStepId(step.id);
    setEditStepCount(step.count.toString());
  };

  const handleUpdateStep = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setLoadingId(id);
    await updateStep(id, parseInt(editStepCount) || 0);
    setEditingStepId(null);
    setLoadingId(null);
  };

  const renderDays = () => {
    const days = [];
    
    for (let i = 0; i < firstDayOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 sm:h-16"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPastOrToday = dateStr <= todayStr;
      const data = activityData[dateStr];
      const hasActivity = data?.hasActivity;

      let bgClass = "bg-surface-container-low text-on-surface hover:bg-surface-variant/50";
      let borderClass = "border-outline-variant/30";
      let icon = null;

      if (isPastOrToday) {
        if (hasActivity) {
          bgClass = "bg-primary/20 text-primary font-bold hover:bg-primary/30";
          borderClass = "border-primary/40";
          icon = <span className="material-symbols-outlined text-[10px] sm:text-xs absolute bottom-1 right-1">verified</span>;
        } else {
          bgClass = "bg-error/15 text-error font-medium hover:bg-error/20";
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
          className={`h-12 sm:h-16 rounded-lg border flex items-center justify-center relative cursor-pointer active:scale-95 transition-all ${bgClass} ${borderClass} ${selectedDate === dateStr ? 'ring-2 ring-primary ring-offset-2' : ''}`}
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
      {/* Selector de Mes/Año */}
      <section className="flex gap-2 justify-between">
        <select 
          value={currentMonth} 
          onChange={handleMonthChange}
          className="bg-surface-container glass-card border border-outline-variant/30 text-on-surface py-2 px-3 rounded-lg font-body-md focus:ring-primary focus:border-primary w-full outline-none"
        >
          {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select 
          value={currentYear} 
          onChange={handleYearChange}
          className="bg-surface-container glass-card border border-outline-variant/30 text-on-surface py-2 px-3 rounded-lg font-body-md focus:ring-primary focus:border-primary w-1/3 outline-none"
        >
          {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </section>

      <section className="glass-card rounded-xl p-5 border border-outline-variant/30">
        <div className="flex items-center justify-between mb-4">
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
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">today</span>
            {selectedDate.split('-').reverse().join('/')}
          </h3>
          
          {!activityData[selectedDate]?.hasActivity ? (
            <p className="text-on-surface-variant font-body-md bg-error/10 p-3 rounded-lg border border-error/20 flex gap-2 items-start">
              <span className="material-symbols-outlined text-error">notification_important</span>
              <span>No registraste actividad este día.</span>
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Pasos */}
              {activityData[selectedDate].steps.map((step) => (
                <div key={step.id} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex flex-col gap-3 group">
                  {editingStepId === step.id ? (
                    <form onSubmit={(e) => handleUpdateStep(e, step.id)} className="flex flex-col gap-3 relative z-10 bg-surface p-3 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-headline-sm text-primary">Editar Pasos</span>
                        <button type="button" onClick={() => setEditingStepId(null)} className="text-on-surface-variant hover:text-error material-symbols-outlined text-sm">close</button>
                      </div>
                      <input 
                        type="number"
                        className="bg-surface-container-lowest border border-outline-variant/30 rounded px-2 py-1 text-sm focus:outline-none w-full" 
                        value={editStepCount} onChange={e => setEditStepCount(e.target.value)} placeholder="Cantidad de pasos" required 
                      />
                      <button type="submit" disabled={loadingId === step.id} className="bg-primary text-on-primary py-1.5 rounded text-sm font-label-tech uppercase mt-1">
                        {loadingId === step.id ? "Guardando..." : "Guardar"}
                      </button>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">directions_walk</span>
                        </div>
                        <div>
                          <p className="font-headline-sm text-on-surface">{step.count.toLocaleString()} Pasos</p>
                          <p className="text-xs text-primary font-label-tech">+{step.pointsEarned.toFixed(2)} pts</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEditStepClick(step)}
                          disabled={loadingId === step.id}
                          className="text-primary/70 hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                          title="Editar pasos"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteStep(step.id)}
                          disabled={loadingId === step.id}
                          className="text-error/70 hover:text-error transition-colors p-2 rounded-full hover:bg-error/10"
                          title="Borrar pasos"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Ejercicios */}
              {activityData[selectedDate].activities.map((act) => (
                <div key={act.id} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex flex-col gap-3 group overflow-hidden relative">
                  
                  {editingAct === act.id ? (
                    <form onSubmit={(e) => handleUpdateActivity(e, act.id)} className="flex flex-col gap-3 relative z-10 bg-surface p-3 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-headline-sm text-primary">Editar Ejercicio</span>
                        <button type="button" onClick={() => setEditingAct(null)} className="text-on-surface-variant hover:text-error material-symbols-outlined text-sm">close</button>
                      </div>
                      <input 
                        className="bg-surface-container-lowest border border-outline-variant/30 rounded px-2 py-1 text-sm focus:outline-none" 
                        value={editType} onChange={e => setEditType(e.target.value)} placeholder="Tipo (ej. Basket)" required 
                      />
                      <div className="flex gap-2">
                        <input 
                          type="number" className="bg-surface-container-lowest border border-outline-variant/30 rounded px-2 py-1 text-sm focus:outline-none w-1/2" 
                          value={editDuration} onChange={e => setEditDuration(e.target.value)} placeholder="Minutos" required 
                        />
                        <select 
                          className="bg-surface-container-lowest border border-outline-variant/30 rounded px-2 py-1 text-sm focus:outline-none w-1/2" 
                          value={editIntensity} onChange={e => setEditIntensity(e.target.value)}
                        >
                          <option value="Suave">Suave</option>
                          <option value="Moderado">Moderado</option>
                          <option value="Titán">Titán</option>
                        </select>
                      </div>
                      <button type="submit" disabled={loadingId === act.id} className="bg-primary text-on-primary py-1.5 rounded text-sm font-label-tech uppercase mt-1">
                        {loadingId === act.id ? "Guardando..." : "Guardar"}
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex justify-between items-start z-10 relative">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
                          </div>
                          <div>
                            <p className="font-headline-sm text-on-surface">{act.type}</p>
                            <p className="text-sm text-on-surface-variant">{act.duration} min • {act.intensity}</p>
                            <p className="text-xs text-secondary font-label-tech mt-1">+{act.pointsEarned.toFixed(2)} pts</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEditClick(act)}
                            disabled={loadingId === act.id}
                            className="text-primary/70 hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                            title="Editar ejercicio"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteActivity(act.id)}
                            disabled={loadingId === act.id}
                            className="text-error/70 hover:text-error transition-colors p-2 rounded-full hover:bg-error/10"
                            title="Borrar ejercicio"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Foto del ejercicio - renderizado con img nativa para evitar problemas de optimización de Next.js en dev */}
                      {act.imageUrl && (
                        <div className="w-full h-40 relative rounded-lg overflow-hidden border border-outline-variant/20 mt-2 z-10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={act.imageUrl} 
                            alt="Evidencia de entrenamiento" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
