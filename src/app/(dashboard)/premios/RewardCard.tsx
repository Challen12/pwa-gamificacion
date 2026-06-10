"use client";

import { useState } from "react";
import Image from "next/image";
import { claimReward } from "@/lib/actions/rewards";

export function RewardCard({ reward, userPoints, isClaimed }: { reward: any, userPoints: number, isClaimed: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pointsMissing = reward.pointsReq - userPoints;
  const canClaim = pointsMissing <= 0 && !isClaimed;

  const handleClaim = async () => {
    setLoading(true);
    setError("");
    const res = await claimReward(reward.id);
    if (res.error) {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className={`glass-card rounded-xl p-4 border border-outline-variant/30 flex gap-4 items-center transition-all ${isClaimed ? 'opacity-80' : ''}`}>
      <div className="w-20 h-20 bg-surface-container-high rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0">
        {reward.imageUrl ? (
          <Image src={reward.imageUrl} alt={reward.name} fill className="object-cover" />
        ) : (
          <span className="material-symbols-outlined text-4xl text-secondary">redeem</span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">{reward.name}</h3>
        <p className="text-sm text-on-surface-variant mb-2 line-clamp-2">{reward.description}</p>
        
        {isClaimed ? (
          <div className="flex items-center gap-1 text-primary font-label-tech">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>Conseguido</span>
          </div>
        ) : (
          <div>
            <div className="flex justify-between text-xs font-label-tech text-on-surface-variant mb-1">
              <span>{reward.pointsReq} pts</span>
              {pointsMissing > 0 ? (
                <span className="text-error">Faltan {pointsMissing.toFixed(0)} pts</span>
              ) : (
                <span className="text-secondary">¡Disponible!</span>
              )}
            </div>
            {!canClaim && pointsMissing > 0 && (
              <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.min(100, (userPoints / reward.pointsReq) * 100)}%` }}></div>
              </div>
            )}
            
            {canClaim && (
              <button 
                onClick={handleClaim}
                disabled={loading}
                className="w-full mt-2 bg-secondary text-on-secondary py-1.5 rounded-lg font-label-tech uppercase hover:opacity-90 active:scale-95 transition-all text-sm"
              >
                {loading ? "Canjeando..." : "Canjear Premio"}
              </button>
            )}
            {error && <p className="text-error text-xs mt-1">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
