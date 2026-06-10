"use client";

import { useState } from "react";
import { createReward } from "@/lib/actions/admin";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointsReq, setPointsReq] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("pointsReq", pointsReq);
    if (expiresAt) formData.append("expiresAt", expiresAt);

    const res = await createReward(formData);
    if (res.error) {
      setMessage(`Error: ${res.error}`);
    } else {
      setMessage("¡Premio creado exitosamente!");
      setName("");
      setDescription("");
      setPointsReq("");
      setExpiresAt("");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="glass-card rounded-xl p-5 mesh-card-tertiary text-center">
        <h1 className="font-headline-lg text-headline-lg text-tertiary mb-1">Panel de Control</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Administración de Gamificación
        </p>
      </header>

      {message && (
        <div className="bg-tertiary/20 text-on-surface p-4 rounded-lg text-center font-body-md font-medium shadow-sm border border-tertiary/30">
          {message}
        </div>
      )}

      {/* Crear Premio */}
      <section className="glass-card rounded-xl p-5 border border-outline-variant/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-tertiary p-2 bg-tertiary/10 rounded-full text-2xl">add_shopping_cart</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">Crear Nuevo Premio</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Nombre del Premio</label>
            <div className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1">
              <input 
                type="text" 
                className="bg-transparent border-none w-full text-body-lg focus:ring-0 p-0 text-on-surface"
                placeholder="Ej. Taza Corporativa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Descripción</label>
            <div className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1">
              <textarea 
                className="bg-transparent border-none w-full text-body-md focus:ring-0 p-0 text-on-surface h-20 resize-none outline-none"
                placeholder="Detalles sobre el premio..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Puntos Necesarios</label>
              <div className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1">
                <input 
                  type="number" 
                  className="bg-transparent border-none w-full text-body-lg focus:ring-0 p-0 text-on-surface"
                  placeholder="Ej. 5000"
                  value={pointsReq}
                  onChange={(e) => setPointsReq(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Fecha de Caducidad</label>
              <div className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1">
                <input 
                  type="date" 
                  className="bg-transparent border-none w-full text-body-md focus:ring-0 p-0 text-on-surface outline-none"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-tertiary text-on-tertiary font-headline-sm py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md mt-2 flex justify-center items-center"
          >
            {loading ? "Creando..." : "Guardar Premio"}
          </button>
        </form>
      </section>

      {/* Próximamente */}
      <section className="glass-card rounded-xl p-5 border border-outline-variant/30 text-center text-on-surface-variant flex flex-col items-center gap-2">
        <span className="material-symbols-outlined text-4xl opacity-50">construction</span>
        <p>Gestión de Usuarios, Retos y Misiones en próxima actualización</p>
      </section>
    </div>
  );
}
