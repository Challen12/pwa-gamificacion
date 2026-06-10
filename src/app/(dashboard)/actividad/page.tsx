"use client";

import { useState, useEffect } from "react";
import { registerSteps, registerExercise, getStepsForDate } from "@/lib/actions/activity";

export default function ActividadPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [stepsDate, setStepsDate] = useState(todayStr);
  const [exerciseDate, setExerciseDate] = useState(todayStr);

  const [steps, setSteps] = useState("");
  const [exerciseType, setExerciseType] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("Suave");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Cargar pasos si se selecciona otra fecha
  useEffect(() => {
    const fetchSteps = async () => {
      const res = await getStepsForDate(stepsDate);
      if (res.count > 0) {
        setSteps(res.count.toString());
      } else {
        setSteps("");
      }
    };
    fetchSteps();
  }, [stepsDate]);

  const handleStepsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    const parsedSteps = parseInt(steps);
    if (isNaN(parsedSteps) || parsedSteps < 0) {
      setMessage("Cantidad de pasos inválida");
      setIsLoading(false);
      return;
    }

    const res = await registerSteps(parsedSteps, stepsDate);
    if (res.error) {
      setMessage(`Error: ${res.error}`);
    } else {
      setMessage(`¡Pasos guardados exitosamente para el día ${stepsDate.split('-').reverse().join('/')}!`);
    }
    setIsLoading(false);
  };

  const handleExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("type", exerciseType);
    formData.append("duration", duration);
    formData.append("intensity", intensity);
    formData.append("date", exerciseDate);
    if (image) {
      formData.append("image", image);
    }
    
    const res = await registerExercise(formData);
    if (res.error) {
      setMessage(`Error: ${res.error}`);
    } else {
      setMessage(`¡Conseguiste ${res.pointsEarned?.toFixed(2)} puntos por el ejercicio!`);
      setExerciseType("");
      setDuration("");
      setImage(null);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="glass-card rounded-xl p-5 mesh-card-primary text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Actividad Diaria</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Registra tus pasos y ejercicios para ganar puntos.
        </p>
      </header>

      {message && (
        <div className="bg-primary-container text-on-primary-container p-4 rounded-lg text-center font-body-md font-medium shadow-sm">
          {message}
        </div>
      )}

      {/* Registro de Pasos */}
      <section className="glass-card rounded-xl p-5 border border-outline-variant/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-full text-2xl">directions_walk</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">Registrar Pasos</h2>
        </div>
        <form onSubmit={handleStepsSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Fecha</label>
              <div className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1">
                <input 
                  type="date" 
                  className="bg-transparent border-none w-full text-body-lg focus:ring-0 p-0 text-on-surface"
                  value={stepsDate}
                  onChange={(e) => setStepsDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Cantidad de pasos</label>
              <div className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1">
                <input 
                  type="number" 
                  className="bg-transparent border-none w-full text-body-lg focus:ring-0 p-0 text-on-surface"
                  placeholder="Ej. 8500"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <p className="font-label-tech text-xs text-on-surface-variant/70 ml-1">10,000 pasos = 10 puntos. Puedes editar tus pasos de días anteriores.</p>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-primary text-on-primary font-headline-sm py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md mt-2 flex justify-center items-center"
          >
            {isLoading ? "Guardando..." : "Sumar Pasos"}
          </button>
        </form>
      </section>

      {/* Registro de Ejercicio */}
      <section className="glass-card rounded-xl p-5 border border-outline-variant/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-full text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">Registrar Ejercicio</h2>
        </div>
        <form onSubmit={handleExerciseSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Fecha</label>
              <div className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1">
                <input 
                  type="date" 
                  className="bg-transparent border-none w-full text-body-lg focus:ring-0 p-0 text-on-surface"
                  value={exerciseDate}
                  onChange={(e) => setExerciseDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Tipo de Ejercicio</label>
              <div className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1">
                <input 
                  type="text" 
                  className="bg-transparent border-none w-full text-body-lg focus:ring-0 p-0 text-on-surface"
                  placeholder="Ej. Correr, Natación..."
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Minutos</label>
              <div className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1">
                <input 
                  type="number" 
                  className="bg-transparent border-none w-full text-body-lg focus:ring-0 p-0 text-on-surface"
                  placeholder="Ej. 45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Intensidad</label>
              <div className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1 h-[44px]">
                <select 
                  className="bg-transparent border-none w-full h-full text-body-md focus:ring-0 p-0 text-on-surface outline-none"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                >
                  <option value="Suave" className="bg-surface text-on-surface">Suave</option>
                  <option value="Moderado" className="bg-surface text-on-surface">Moderado</option>
                  <option value="Titán" className="bg-surface text-on-surface">Titán</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-2">
             <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1 mb-2 block">Foto (Opcional)</label>
             <label className="border-2 border-dashed border-outline-variant/40 rounded-xl p-4 flex flex-col items-center justify-center text-on-surface-variant/70 cursor-pointer hover:bg-surface-variant/20 transition-colors relative overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImage(e.target.files[0]);
                    }
                  }}
                />
                {image ? (
                  <span className="font-body-md text-primary text-center truncate w-full px-4">{image.name}</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-3xl mb-1">add_a_photo</span>
                    <span className="font-label-tech text-sm">Subir imagen</span>
                  </>
                )}
             </label>
             {image && (
                <button type="button" onClick={() => setImage(null)} className="text-error text-xs uppercase font-label-tech mt-2 ml-1">Quitar foto</button>
             )}
          </div>

          <p className="font-label-tech text-xs text-on-surface-variant/70 ml-1">1 hora de ejercicio = 100 puntos</p>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-secondary text-on-secondary font-headline-sm py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md mt-2 flex justify-center items-center"
          >
            {isLoading ? "Guardando..." : "Subir Actividad"}
          </button>
        </form>
      </section>
    </div>
  );
}
