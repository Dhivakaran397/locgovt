import React, { useEffect, useRef } from 'react';

const LEVELS = [
  { level: 1,  minXP: 0,     maxXP: 200,   label: 'Citizen Recruit',      color: '#475569' },
  { level: 2,  minXP: 200,   maxXP: 500,   label: 'Civic Explorer',       color: '#0284c7' },
  { level: 3,  minXP: 500,   maxXP: 1000,  label: 'Active Citizen',       color: '#0d7a3c' },
  { level: 4,  minXP: 1000,  maxXP: 1800,  label: 'District Contributor', color: '#b45309' },
  { level: 5,  minXP: 1800,  maxXP: 3000,  label: 'Civic Leader',         color: '#7c3aed' },
  { level: 6,  minXP: 3000,  maxXP: 5000,  label: 'Steward Counselor',    color: '#db2777' },
  { level: 7,  minXP: 5000,  maxXP: 8000,  label: 'National Ambassador',  color: '#0f294a' },
  { level: 8,  minXP: 8000,  maxXP: 12000, label: 'Apex Defender',        color: '#dc2626' },
  { level: 9,  minXP: 12000, maxXP: 18000, label: 'State Guardian',       color: '#ea580c' },
  { level: 10, minXP: 18000, maxXP: 99999, label: 'Civic Legend',         color: '#d97706' },
];

const getLevelData = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
};

const LevelWidget = ({ xp = 0, compact = false }) => {
  const svgRef    = useRef(null);
  const levelData = getLevelData(xp);
  const next      = LEVELS.find((l) => l.level === levelData.level + 1);

  const rangeXP    = (next?.minXP ?? levelData.maxXP) - levelData.minXP;
  const earnedXP   = Math.max(0, xp - levelData.minXP);
  const pct        = Math.min(100, rangeXP > 0 ? (earnedXP / rangeXP) * 100 : 100);
  const toNext     = next ? Math.max(0, next.minXP - xp) : 0;

  const R         = compact ? 26 : 42;
  const STROKE    = compact ? 4  : 6;
  const CIRC      = 2 * Math.PI * R;
  const dashOffset = CIRC - (CIRC * pct) / 100;

  useEffect(() => {
    const ring = svgRef.current?.querySelector('.ring-fill');
    if (!ring) return;
    ring.style.strokeDashoffset = CIRC.toString();
    const raf = requestAnimationFrame(() => {
      ring.style.transition = 'stroke-dashoffset 1s ease-out';
      ring.style.strokeDashoffset = dashOffset.toString();
    });
    return () => cancelAnimationFrame(raf);
  }, [xp, CIRC, dashOffset]);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <svg ref={svgRef} width={60} height={60} viewBox="0 0 64 64" className="-rotate-90">
            <circle cx="32" cy="32" r={R} fill="none" stroke="#e2e8f0" strokeWidth={STROKE} />
            <circle
              className="ring-fill"
              cx="32" cy="32" r={R}
              fill="none"
              stroke={levelData.color}
              strokeWidth={STROKE}
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-extrabold text-xs" style={{ color: levelData.color }}>
              {levelData.level}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold font-display" style={{ color: levelData.color }}>
            {levelData.label}
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            {toNext > 0 ? `${toNext.toLocaleString()} XP to Level ${levelData.level + 1}` : 'MAX LEVEL'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-4">
      <p className="section-label">CIVIC RANK</p>

      <div className="relative">
        <svg ref={svgRef} width={100} height={100} viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#e2e8f0" strokeWidth={STROKE} />
          <circle
            className="ring-fill"
            cx="50" cy="50" r={R}
            fill="none"
            stroke={levelData.color}
            strokeWidth={STROKE}
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-extrabold text-2xl" style={{ color: levelData.color }}>
            {levelData.level}
          </span>
          <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">LEVEL</span>
        </div>
      </div>

      <div className="text-center space-y-1 w-full">
        <p className="font-display text-sm font-bold" style={{ color: levelData.color }}>
          {levelData.label}
        </p>
        <p className="font-mono text-xs text-slate-500">
          {xp.toLocaleString()} Total XP
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>{earnedXP.toLocaleString()} XP</span>
          <span>{rangeXP.toLocaleString()} XP</span>
        </div>
        <div className="xp-bar-track">
          <div
            className="xp-bar-fill"
            style={{
              width:           `${pct}%`,
              backgroundColor: levelData.color,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export { getLevelData };
export default LevelWidget;
