"use client";

import { useState } from "react";

interface Level {
  id: string;
  level: number;
  name: string;
  pointsReq: number;
}

interface LevelsListProps {
  levels: Level[];
  userPoints: number;
  currentLevelId: string;
  lastActivityDateStr: string | null;
}

export function LevelsList({ levels, userPoints, currentLevelId, lastActivityDateStr }: LevelsListProps) {
  const [showAllUnlocked, setShowAllUnlocked] = useState(false);

  // Separar niveles en conseguidos (<= currentLevel), el actual, y los bloqueados (> currentLevel)
  const unlockedLevels = levels.filter(l => userPoints >= l.pointsReq);
  const lockedLevels = levels.filter(l => userPoints < l.pointsReq);
  
  const currentLevel = unlockedLevels[unlockedLevels.length - 1] || levels[0];
  const pastUnlockedLevels = unlockedLevels.slice(0, -1);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Recientemente";
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Botón Ver Más para los niveles pasados */}
      {pastUnlockedLevels.length > 0 && (
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setShowAllUnlocked(!showAllUnlocked)}
            className="text-primary font-label-tech text-sm hover:underline flex items-center justify-center gap-1 py-2 glass-card rounded-xl border border-outline-variant/30"
          >
            {showAllUnlocked ? (
              <><span className="material-symbols-outlined text-sm">expand_less</span> Ocultar niveles anteriores</>
            ) : (
              <><span className="material-symbols-outlined text-sm">expand_more</span> Ver {pastUnlockedLevels.length} niveles anteriores</>
            )}
          </button>

          {showAllUnlocked && pastUnlockedLevels.map((level, index) => (
            <div key={level.id} className="glass-card rounded-xl p-4 border border-outline-variant/30 flex items-center gap-4 bg-primary/5 opacity-70 scale-95 origin-top transition-all animate-in fade-in slide-in-from-top-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 bg-primary text-on-primary">
                {level.level}
              </div>
              <div className="flex-1">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">{level.name}</h4>
                <div className="flex justify-between font-label-tech text-label-tech mt-1">
                  <span className="text-on-surface-variant">{level.pointsReq} pts req.</span>
                  <span className="text-primary flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check</span> Desbloqueado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nivel Actual */}
      {currentLevel && (
        <div className="glass-card rounded-xl p-4 border-2 border-primary/40 flex items-center gap-4 bg-primary/10 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-primary/10">
            <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          </div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0 bg-primary text-on-primary z-10 shadow-md">
            {currentLevel.level}
          </div>
          <div className="flex-1 z-10">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">{currentLevel.name}</h4>
            <div className="flex justify-between font-label-tech text-label-tech mt-1">
              <span className="text-on-surface-variant">{currentLevel.pointsReq} pts req.</span>
              <div className="flex flex-col items-end">
                <span className="text-primary flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[14px]">verified</span> Nivel Actual
                </span>
                <span className="text-on-surface-variant text-xs flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                  {formatDate(lastActivityDateStr)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Próximos niveles (Bloqueados) - Solo mostramos los 3 siguientes para no saturar */}
      {lockedLevels.slice(0, 3).map((level) => {
        const pointsMissing = level.pointsReq - userPoints;
        
        return (
          <div key={level.id} className="glass-card rounded-xl p-4 border border-outline-variant/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 bg-surface-container-highest text-on-surface-variant">
              {level.level}
            </div>
            
            <div className="flex-1">
              <h4 className="font-headline-sm text-headline-sm text-on-surface">{level.name}</h4>
              <div className="flex justify-between font-label-tech text-label-tech mt-1">
                <span className="text-on-surface-variant">{level.pointsReq} pts req.</span>
                <span className="text-error">Faltan {pointsMissing.toFixed(0)} pts</span>
              </div>
              <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden mt-2">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (userPoints / level.pointsReq) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        );
      })}
      
      {lockedLevels.length > 3 && (
        <div className="text-center py-2 text-on-surface-variant font-label-tech text-sm opacity-60">
          ... y {lockedLevels.length - 3} niveles más por descubrir.
        </div>
      )}
    </div>
  );
}
