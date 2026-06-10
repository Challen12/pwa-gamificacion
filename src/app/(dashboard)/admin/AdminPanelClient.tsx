"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  updateSettings, updateUser, deleteUser, 
  createReward, deleteReward, 
  createChallenge, deleteChallenge 
} from "@/lib/actions/admin";

export function AdminPanelClient({ users, rewards, challenges, settings }: any) {
  const [activeTab, setActiveTab] = useState("usuarios");
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleMessage = (msg: string, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  // ---- CONFIGURACIÓN ----
  const [pointsPerStep, setPointsPerStep] = useState(settings.pointsPerStep.toString());
  const [pointsPerExerciseMinute, setPointsPerExerciseMinute] = useState(settings.pointsPerExerciseMinute.toString());

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateSettings(parseFloat(pointsPerStep), parseFloat(pointsPerExerciseMinute));
    if (res.error) handleMessage(res.error, true);
    else handleMessage("Configuración guardada exitosamente.");
    setLoading(false);
  };

  // ---- USUARIOS ----
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserRole, setEditUserRole] = useState("");
  const [editUserPassword, setEditUserPassword] = useState("");

  const startEditUser = (u: any) => {
    setEditingUserId(u.id);
    setEditUserName(u.name);
    setEditUserRole(u.role);
    setEditUserPassword("");
  };

  const handleSaveUser = async (id: string) => {
    setLoading(true);
    const res = await updateUser(id, {
      name: editUserName,
      role: editUserRole,
      password: editUserPassword || undefined
    });
    if (res.error) handleMessage(res.error, true);
    else {
      handleMessage("Usuario actualizado.");
      setEditingUserId(null);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Seguro que quieres borrar este usuario y toda su actividad? Esta acción es irreversible.")) return;
    setLoading(true);
    const res = await deleteUser(id);
    if (res.error) handleMessage(res.error, true);
    else handleMessage("Usuario eliminado.");
    setLoading(false);
  };

  // ---- PREMIOS ----
  const handleCreateReward = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createReward(formData);
    if (res.error) handleMessage(res.error, true);
    else {
      handleMessage("Premio creado exitosamente.");
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm("¿Borrar premio?")) return;
    setLoading(true);
    await deleteReward(id);
    setLoading(false);
  };

  // ---- RETOS ----
  const handleCreateChallenge = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createChallenge(formData);
    if (res.error) handleMessage(res.error, true);
    else {
      handleMessage("Reto creado exitosamente.");
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm("¿Borrar reto?")) return;
    setLoading(true);
    await deleteChallenge(id);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Pestañas */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {['usuarios', 'premios', 'retos', 'configuracion'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-label-tech text-sm whitespace-nowrap transition-all ${activeTab === tab ? 'bg-tertiary text-on-tertiary shadow-md' : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {message && (
        <div className="bg-tertiary/20 text-on-surface p-3 rounded-lg text-center font-body-md shadow-sm border border-tertiary/30">
          {message}
        </div>
      )}

      {/* --- PESTAÑA USUARIOS --- */}
      {activeTab === 'usuarios' && (
        <div className="flex flex-col gap-3">
          {users.map((u: any) => (
            <div key={u.id} className="glass-card p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-3">
              {editingUserId === u.id ? (
                <div className="flex flex-col gap-3 bg-surface p-3 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-headline-sm text-primary">Editar {u.username}</span>
                    <button onClick={() => setEditingUserId(null)} className="text-on-surface-variant hover:text-error material-symbols-outlined text-sm">close</button>
                  </div>
                  <input className="input-focus-effect bg-surface-container-lowest rounded px-2 py-1 text-sm focus:outline-none" value={editUserName} onChange={e => setEditUserName(e.target.value)} placeholder="Nombre" />
                  <select className="input-focus-effect bg-surface-container-lowest rounded px-2 py-1 text-sm focus:outline-none" value={editUserRole} onChange={e => setEditUserRole(e.target.value)}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <input className="input-focus-effect bg-surface-container-lowest rounded px-2 py-1 text-sm focus:outline-none" value={editUserPassword} onChange={e => setEditUserPassword(e.target.value)} placeholder="Nueva contraseña (dejar blanco si no cambia)" type="password" />
                  <button onClick={() => handleSaveUser(u.id)} disabled={loading} className="bg-primary text-on-primary py-1.5 rounded text-sm font-label-tech uppercase mt-1">Guardar</button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="font-headline-sm text-on-surface flex items-center gap-2">
                      {u.name} 
                      {u.role === 'ADMIN' && <span className="material-symbols-outlined text-tertiary text-sm" title="Admin">shield</span>}
                    </h3>
                    <p className="text-sm text-on-surface-variant font-label-tech">{u.username}</p>
                    <p className="text-xs text-secondary font-label-tech mt-1">{u.points.toFixed(2)} pts totales</p>
                  </div>
                  <div className="flex gap-2 self-start sm:self-auto">
                    <button onClick={() => router.push(`/admin/usuarios/${u.id}`)} className="bg-surface-variant text-on-surface-variant hover:bg-primary/20 hover:text-primary transition-colors px-3 py-1 rounded-full text-xs font-label-tech flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">monitoring</span> Actividad
                    </button>
                    <button onClick={() => startEditUser(u)} className="bg-surface-variant text-on-surface-variant hover:bg-secondary/20 hover:text-secondary transition-colors p-1.5 rounded-full" title="Editar">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onClick={() => handleDeleteUser(u.id)} className="bg-surface-variant text-on-surface-variant hover:bg-error/20 hover:text-error transition-colors p-1.5 rounded-full" title="Eliminar">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- PESTAÑA PREMIOS --- */}
      {activeTab === 'premios' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleCreateReward} className="glass-card rounded-xl p-4 border border-outline-variant/30 flex flex-col gap-3">
            <h3 className="font-headline-sm text-tertiary">Crear Premio</h3>
            <input name="name" className="input-focus-effect bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none" placeholder="Nombre" required />
            <textarea name="description" className="input-focus-effect bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none" placeholder="Descripción" required />
            <div className="flex gap-2">
              <input name="pointsReq" type="number" className="input-focus-effect bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none w-1/2" placeholder="Puntos" required />
              <input name="expiresAt" type="date" className="input-focus-effect bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none w-1/2" />
            </div>
            <button type="submit" disabled={loading} className="bg-tertiary text-on-tertiary py-2 rounded-lg text-sm font-label-tech uppercase mt-1">Guardar</button>
          </form>

          <div className="flex flex-col gap-2">
            <h3 className="font-headline-sm text-on-surface px-1">Premios Activos</h3>
            {rewards.map((r: any) => (
              <div key={r.id} className="glass-card rounded-xl p-3 border border-outline-variant/30 flex justify-between items-center">
                <div>
                  <h4 className="font-body-md font-bold">{r.name}</h4>
                  <p className="text-xs text-tertiary font-label-tech">{r.pointsReq} pts</p>
                </div>
                <button onClick={() => handleDeleteReward(r.id)} className="text-error/70 hover:text-error p-1"><span className="material-symbols-outlined text-sm">delete</span></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- PESTAÑA RETOS --- */}
      {activeTab === 'retos' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleCreateChallenge} className="glass-card rounded-xl p-4 border border-outline-variant/30 flex flex-col gap-3">
            <h3 className="font-headline-sm text-tertiary">Crear Reto</h3>
            <input name="name" className="input-focus-effect bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none" placeholder="Nombre (Ej. Corre 10km)" required />
            <textarea name="description" className="input-focus-effect bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none" placeholder="Descripción" required />
            <select name="type" className="input-focus-effect bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none text-on-surface" required>
              <option value="pasos">Pasos</option>
              <option value="ejercicios">Ejercicios (minutos)</option>
              <option value="puntos">Puntos Totales</option>
            </select>
            <div className="flex gap-2">
              <input name="target" type="number" className="input-focus-effect bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none w-1/2" placeholder="Objetivo numérico" required />
              <input name="pointsReq" type="number" className="input-focus-effect bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none w-1/2" placeholder="Recompensa en Pts" required />
            </div>
            <button type="submit" disabled={loading} className="bg-tertiary text-on-tertiary py-2 rounded-lg text-sm font-label-tech uppercase mt-1">Guardar</button>
          </form>

          <div className="flex flex-col gap-2">
            <h3 className="font-headline-sm text-on-surface px-1">Retos Activos</h3>
            {challenges.map((c: any) => (
              <div key={c.id} className="glass-card rounded-xl p-3 border border-outline-variant/30 flex justify-between items-center">
                <div>
                  <h4 className="font-body-md font-bold">{c.name} <span className="text-xs font-normal opacity-70">({c.type})</span></h4>
                  <p className="text-xs text-tertiary font-label-tech">Meta: {c.target} | Premio: {c.pointsReq} pts</p>
                </div>
                <button onClick={() => handleDeleteChallenge(c.id)} className="text-error/70 hover:text-error p-1"><span className="material-symbols-outlined text-sm">delete</span></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- PESTAÑA CONFIGURACIÓN --- */}
      {activeTab === 'configuracion' && (
        <form onSubmit={handleSaveSettings} className="glass-card rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-4">
          <div className="bg-surface-container-low p-3 rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary mt-1">info</span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Define cuántos puntos obtiene el usuario al registrar actividad. Por defecto: <br/>- 1 paso = 0.001 pts (10k pasos = 10 pts) <br/>- 1 minuto ejercicio = 1.6667 pts (60min = 100 pts)
            </p>
          </div>

          <div>
            <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Puntos por 1 paso</label>
            <input 
              type="number" step="0.0001" 
              className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1 w-full text-body-lg focus:outline-none"
              value={pointsPerStep}
              onChange={(e) => setPointsPerStep(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">Puntos por 1 minuto de ejercicio</label>
            <input 
              type="number" step="0.0001" 
              className="input-focus-effect bg-surface-container-lowest rounded-lg px-3 py-2 mt-1 w-full text-body-lg focus:outline-none"
              value={pointsPerExerciseMinute}
              onChange={(e) => setPointsPerExerciseMinute(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-tertiary text-on-tertiary font-headline-sm py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md mt-2 flex justify-center items-center"
          >
            {loading ? "Guardando..." : "Guardar Configuración"}
          </button>
        </form>
      )}

    </div>
  );
}
