import React, { useState } from 'react';
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
    gradient: 'from-red-500/20 to-rose-600/10',
    border:   'border-red-500/40',
    glow:     'rgba(239,68,68,0.35)',
    text:     'text-gradient-red',
    ring:     'ring-red-500/30',
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
    gradient: 'from-cyan-500/20 to-blue-600/10',
    border:   'border-cyan-400/40',
    glow:     'rgba(0,229,255,0.3)',
    text:     'text-gradient-cyan',
    ring:     'ring-cyan-400/30',
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
    gradient: 'from-orange-500/20 to-amber-600/10',
    border:   'border-orange-400/40',
    glow:     'rgba(251,146,60,0.3)',
    text:     'text-gradient-orange',
    ring:     'ring-orange-400/30',
  },
];

export default function ModeSelector() {
  const { state, setAppMode } = useApp();
  const { appMode } = state;
  const [pressed, setPressed] = useState(null);

  return (
    <div className="flex items-center gap-1 rounded-full p-1"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {MODES.map(mode => {
        const isActive = appMode === mode.id;
        return (
          <button
            key={mode.id}
            onMouseDown={() => setPressed(mode.id)}
            onMouseUp={() => setPressed(null)}
            onMouseLeave={() => setPressed(null)}
            onClick={() => setAppMode(mode.id)}
            className={[
              'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
              'transition-all duration-250 select-none outline-none',
              isActive ? `bg-gradient-to-r ${mode.gradient} border ${mode.border}` : 'border border-transparent',
              isActive ? `ring-1 ${mode.ring}` : '',
              pressed === mode.id ? 'scale-95' : 'scale-100',
              !isActive ? 'text-gray-500 hover:text-gray-200 hover:bg-white/[.06]' : '',
            ].filter(Boolean).join(' ')}
            style={isActive ? { boxShadow: `0 0 14px ${mode.glow}, 0 2px 8px rgba(0,0,0,0.4)` } : {}}
          >
            {/* Icon — show for all modes */}
            <span className={isActive ? mode.text : 'opacity-60'}>
              {mode.icon}
            </span>

            {/* Live ping — trending only */}
            {mode.id === 'trending' && (
              <span className="relative flex h-1.5 w-1.5 flex-shrink-0 -ml-0.5">
                {isActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isActive ? 'bg-orange-400' : 'bg-gray-600'}`} />
              </span>
            )}

            {/* Label */}
            <span className={isActive ? `${mode.text} font-bold` : ''}>
              {mode.label}
            </span>

            {/* Active underline shimmer */}
            {isActive && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-3/4 rounded-full opacity-60"
                style={{ background: `linear-gradient(90deg, transparent, ${mode.glow.replace('0.3', '0.8')}, transparent)` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
