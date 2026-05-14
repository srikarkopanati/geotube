import React from 'react';

const ICONS = {
  globe: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  video: 'M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  similarity: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4',
  domain: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
};
const CARD_COLORS = ['#60a5fa', '#4ade80', '#c084fc', '#facc15'];

export default function ScoreCardGrid({ cards }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => {
        const color = CARD_COLORS[i % CARD_COLORS.length];
        return (
          <div
            key={card.label}
            className="rounded-xl p-4 flex items-center gap-3 transition-transform hover:scale-[1.02]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${color}25`,
              borderLeft: `3px solid ${color}`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15` }}
            >
              <svg className="w-5 h-5" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ICONS[card.icon] || ICONS.globe} />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-white leading-none">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
