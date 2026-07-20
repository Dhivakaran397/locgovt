import React from 'react';

const BADGE_CATALOGUE = [
  { id: 'first_service',      emoji: '🚀', label: 'First Contact',     desc: 'Visited your first official service portal.',    color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd' },
  { id: 'feedback_hero',      emoji: '⭐', label: 'Feedback Steward',  desc: 'Provided helpful feedback for 5+ portal visits.', color: '#b45309', bg: '#fef3c7', border: '#fde68a' },
  { id: 'community_voice',    emoji: '📢', label: 'Civic voice',       desc: 'Initiated 3+ discussion threads in the forum.',  color: '#7c3aed', bg: '#f3e8ff', border: '#e9d5ff' },
  { id: 'document_master',    emoji: '📂', label: 'Document Master',   desc: 'Converted or optimized 10+ local files.',       color: '#0d7a3c', bg: '#dcfce7', border: '#bbf7d0' },
  { id: 'district_explorer',  emoji: '🗺️', label: 'Region Explorer',   desc: 'Used services across 3+ localized districts.',   color: '#0891b2', bg: '#ecfeff', border: '#c5f6fa' },
  { id: 'top_voter',          emoji: '👍', label: 'Civic Evaluator',   desc: 'Upvoted 20+ community posts.',                   color: '#db2777', bg: '#fce7f3', border: '#fbcfe8' },
  { id: 'civic_legend',       emoji: '🏛️', label: 'State Ambassador',  desc: 'Achieved top rank of Level 10.',                  color: '#ea580c', bg: '#fffaf0', border: '#ffd8a8' },
  { id: 'power_user',         emoji: '⚡', label: 'Daily Contributor', desc: 'Active citizen streak status.',                  color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
];

const BadgeItem = ({ badge, earned }) => (
  <div
    className="relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-300"
    style={{
      background:  earned ? badge.bg : '#f8fafc',
      borderColor: earned ? badge.border : '#e2e8f0',
      opacity:     earned ? 1 : 0.45,
      filter:      earned ? 'none' : 'grayscale(1)',
    }}
    title={`${badge.label}: ${badge.desc}`}
  >
    <div className="text-2xl mt-1">{badge.emoji}</div>
    <div className="text-center">
      <p className="text-[10px] font-bold text-slate-800 font-display truncate max-w-full">
        {badge.label}
      </p>
    </div>

    {!earned && (
      <div className="absolute top-1.5 right-1.5" title="Locked">
        <svg className="w-2.5 h-2.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 8h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zM9 6a3 3 0 016 0v2H9V6zm9 14H6V10h12v10zm-6-3a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </div>
    )}
  </div>
);

const BadgeDisplay = ({ earnedBadges = [] }) => {
  const earnedSet   = new Set(earnedBadges);
  const earnedCount = earnedBadges.length;
  const totalCount  = BADGE_CATALOGUE.length;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="section-label">CIVIC BADGES & ACHIEVEMENTS</p>
        <span className="badge badge-green font-mono text-[9px]">
          {earnedCount} / {totalCount} UNLOCKED
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="xp-bar-track">
          <div
            className="xp-bar-fill"
            style={{
              width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`,
              background: 'var(--gov-navy)',
            }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {BADGE_CATALOGUE.map((badge) => (
          <BadgeItem
            key={badge.id}
            badge={badge}
            earned={earnedSet.has(badge.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default BadgeDisplay;
