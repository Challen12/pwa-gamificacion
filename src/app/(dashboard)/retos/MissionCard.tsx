"use client";

import { useState } from "react";
import { claimMission } from "@/lib/actions/missions";

export function MissionCard({ mission, userPoints, isCompleted }: { mission: any, userPoints: number, isCompleted: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pointsMissing = mission.pointsReq - userPoints;
  const canClaim = pointsMissing <= 0 && !isCompleted;

  const handleClaim = async () => {
    setLoading(true);
    setError("");
    const res = await claimMission(mission.id);
    if (res.error) {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className={`glass-card rounded-xl p-4 border border-outline-variant/30 flex gap-4 items-center transition-all ${isCompleted ? 'opacity-80' : ''}`}>
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
        <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : "'FILL' 0" }}>
          {isCompleted ? "task_alt" : "target"}
        </span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">{mission.name}</h3>
        <p className="text-sm text-on-surface-variant mb-2">{mission.description}</p>
        
        {isCompleted ? (
          <div className="flex items-center gap-1 text-primary font-label-tech">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>Completada</span>
          </div>
        ) : (
          <div>
            <div className="flex justify-between text-xs font-label-tech text-on-surface-variant mb-1">
              <span>Req: {mission.pointsReq} pts</span>
              {pointsMissing > 0 ? (
                <span className="text-error">Faltan {pointsMissing.toFixed(0)} pts</span>
              ) : (
                <span className="text-secondary">Lista para cobrar</span>
              )}
            </div>
            {!canClaim && pointsMissing > 0 && (
              <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (userPoints / mission.pointsReq) * 100)}%` }}></div>
              </div>
            )}
            
            {canClaim && (
              <button 
                onClick={handleClaim}
                disabled={loading}
                className="w-full mt-1 bg-primary text-on-primary py-1.5 rounded-lg font-label-tech uppercase hover:opacity-90 active:scale-95 transition-all text-sm"
              >
                {loading ? "Verificando..." : "Completar Misión"}
              </button>
            )}
            {error && <p className="text-error text-xs mt-1">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
