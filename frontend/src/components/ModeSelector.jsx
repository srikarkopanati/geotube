import React from 'react';
import { useApp } from '../context/AppContext';

const MODES = [
  {
    id: 'explore',
    label: 'Explore',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
  {
    id: 'timeline',
    label: 'Time Travel',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'trending',
    label: 'Trending Live',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

const COLOR = {
  explore:  { active: 'border-red-500/60 text-red-400 glow-red',   dot: 'bg-red-500'    },
  timeline: { active: 'border-cyan-400/60 text-cyan-300 glow-blue', dot: 'bg-cyan-400'   },
  trending: { active: 'border-orange-400/60 text-orange-300',       dot: 'bg-orange-400' },
};

export default function ModeSelector() {
  const { state, setAppMode } = useApp();
  const { appMode } = state;

  return (
    <div className="flex items-center gap-1 glass rounded-full px-1.5 py-1 border border-white/08">
      {MODES.map(mode => {
        const isActive = appMode === mode.id;
        const colors   = COLOR[mode.id];
        return (
          <button
            key={mode.id}
            onClick={() => setAppMode(mode.id)}
            className={[
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
              'transition-all duration-200 select-none',
              isActive
                ? `bg-white/[.08] border ${colors.active}`
                : 'border border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[.05]',
            ].join(' ')}
          >
            {/* Live pulse dot — only for trending */}
            {mode.id === 'trending' && (
              <span className="relative flex h-2 w-2 flex-shrink-0">
                {isActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? colors.dot : 'bg-gray-600'}`} />
              </span>
            )}
            {mode.id !== 'trending' && mode.icon}
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
