"use client";

import { useState } from "react";
import { deleteActivity, updateActivity, deleteStep, updateStep } from "@/lib/actions/activity";

export function UserActivityClient({ activities, steps, userId }: any) {
  const [filterDate, setFilterDate] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Edit Ejercicio
  const [editingActId, setEditingActId] = useState<string | null>(null);
  const [editActType, setEditActType] = useState("");
  const [editActDuration, setEditActDuration] = useState("");
  const [editActIntensity, setEditActIntensity] = useState("");

  // Edit Step
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepCount, setEditStepCount] = useState("");

  const filteredActivities = filterDate 
    ? activities.filter((a: any) => new Date(a.date).toISOString().split('T')[0] === filterDate) 
    : activities;

  const filteredSteps = filterDate 
    ? steps.filter((s: any) => new Date(s.date).toISOString().split('T')[0] === filterDate) 
    : steps;

  // --- ACTIONS ---
  const handleDelAct = async (id: string) => {
    if (!confirm("¿Borrar este ejercicio?")) return;
    setLoadingId(id);
    await deleteActivity(id);
    setLoadingId(null);
  };

  const handleEditAct = (act: any) => {
    setEditingActId(act.id);
    setEditActType(act.type);
    setEditActDuration(act.duration.toString());
    setEditActIntensity(act.intensity);
  };

  const handleSaveAct = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setLoadingId(id);
    const formData = new FormData();
    formData.append("type", editActType);
    formData.append("duration", editActDuration);
    formData.append("intensity", editActIntensity);
    await updateActivity(id, formData);
    setEditingActId(null);
    setLoadingId(null);
  };

  const handleDelStep = async (id: string) => {
    if (!confirm("¿Borrar estos pasos?")) return;
    setLoadingId(id);
    await deleteStep(id);
    setLoadingId(null);
  };

  const handleEditStep = (step: any) => {
    setEditingStepId(step.id);
    setEditStepCount(step.count.toString());
  };

  const handleSaveStep = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setLoadingId(id);
    await updateStep(id, parseInt(editStepCount));
    setEditingStepId(null);
    setLoadingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-4 rounded-xl border border-outline-variant/30 flex items-center justify-between gap-4">
        <span className="font-label-tech text-on-surface-variant">Filtrar por fecha:</span>
        <input 
          type="date" 
          className="input-focus-effect bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
        {filterDate && (
          <button onClick={() => setFilterDate("")} className="text-error text-sm hover:underline font-label-tech">
            Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- COLUMNA PASOS --- */}
        <section className="flex flex-col gap-3">
          <h3 className="font-headline-sm text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">directions_walk</span> Historial de Pasos
          </h3>
          {filteredSteps.length === 0 ? (
            <p className="text-on-surface-variant text-sm p-4 text-center glass-card rounded-xl">No hay registros</p>
          ) : (
            filteredSteps.map((s: any) => (
              <div key={s.id} className="glass-card p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-3">
                {editingStepId === s.id ? (
                  <form onSubmit={(e) => handleSaveStep(e, s.id)} className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-headline-sm text-primary">Editar</span>
                      <button type="button" onClick={() => setEditingStepId(null)} className="text-on-surface-variant hover:text-error material-symbols-outlined text-sm">close</button>
                    </div>
                    <input type="number" className="input-focus-effect bg-surface-container-lowest rounded px-2 py-1 text-sm focus:outline-none" value={editStepCount} onChange={e => setEditStepCount(e.target.value)} required />
                    <button type="submit" disabled={loadingId === s.id} className="bg-primary text-on-primary py-1.5 rounded text-sm font-label-tech uppercase">Guardar</button>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-headline-sm">{s.count.toLocaleString()} Pasos</p>
                      <p className="text-xs text-on-surface-variant font-label-tech">{new Date(s.date).toLocaleDateString()} • {s.pointsEarned.toFixed(2)} pts</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditStep(s)} className="text-primary/70 hover:text-primary p-2 rounded-full hover:bg-primary/10" disabled={loadingId === s.id}><span className="material-symbols-outlined text-sm">edit</span></button>
                      <button onClick={() => handleDelStep(s.id)} className="text-error/70 hover:text-error p-2 rounded-full hover:bg-error/10" disabled={loadingId === s.id}><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        {/* --- COLUMNA EJERCICIOS --- */}
        <section className="flex flex-col gap-3">
          <h3 className="font-headline-sm text-secondary flex items-center gap-2">
            <span className="material-symbols-outlined">fitness_center</span> Historial de Ejercicios
          </h3>
          {filteredActivities.length === 0 ? (
            <p className="text-on-surface-variant text-sm p-4 text-center glass-card rounded-xl">No hay registros</p>
          ) : (
            filteredActivities.map((a: any) => (
              <div key={a.id} className="glass-card p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-3">
                {editingActId === a.id ? (
                  <form onSubmit={(e) => handleSaveAct(e, a.id)} className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-headline-sm text-secondary">Editar</span>
                      <button type="button" onClick={() => setEditingActId(null)} className="text-on-surface-variant hover:text-error material-symbols-outlined text-sm">close</button>
                    </div>
                    <input className="input-focus-effect bg-surface-container-lowest rounded px-2 py-1 text-sm focus:outline-none" value={editActType} onChange={e => setEditActType(e.target.value)} required />
                    <div className="flex gap-2">
                      <input type="number" className="input-focus-effect bg-surface-container-lowest rounded px-2 py-1 text-sm focus:outline-none w-1/2" value={editActDuration} onChange={e => setEditActDuration(e.target.value)} required />
                      <select className="input-focus-effect bg-surface-container-lowest rounded px-2 py-1 text-sm focus:outline-none w-1/2" value={editActIntensity} onChange={e => setEditActIntensity(e.target.value)}>
                        <option value="Suave">Suave</option>
                        <option value="Moderado">Moderado</option>
                        <option value="Titán">Titán</option>
                      </select>
                    </div>
                    <button type="submit" disabled={loadingId === a.id} className="bg-secondary text-on-secondary py-1.5 rounded text-sm font-label-tech uppercase">Guardar</button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-headline-sm">{a.type}</p>
                        <p className="text-sm text-on-surface-variant">{a.duration} min • {a.intensity}</p>
                        <p className="text-xs text-on-surface-variant font-label-tech mt-1">{new Date(a.date).toLocaleDateString()} • {a.pointsEarned.toFixed(2)} pts</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditAct(a)} className="text-secondary/70 hover:text-secondary p-2 rounded-full hover:bg-secondary/10" disabled={loadingId === a.id}><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => handleDelAct(a.id)} className="text-error/70 hover:text-error p-2 rounded-full hover:bg-error/10" disabled={loadingId === a.id}><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    </div>
                    {a.imageUrl && (
                      <div className="w-full h-32 relative rounded-lg overflow-hidden border border-outline-variant/20 mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.imageUrl} alt="Evidencia" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
