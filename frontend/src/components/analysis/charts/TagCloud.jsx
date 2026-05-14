import React from 'react';

const TAG_COLORS = ['text-cyan-400', 'text-blue-400', 'text-purple-400', 'text-green-400', 'text-yellow-400', 'text-pink-400'];

function sizeClass(ratio) {
  if (ratio > 0.85) return 'text-xl font-black';
  if (ratio > 0.65) return 'text-lg font-bold';
  if (ratio > 0.45) return 'text-base font-semibold';
  if (ratio > 0.25) return 'text-sm font-medium';
  return 'text-xs font-normal';
}

export default function TagCloud({ data }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}
    >
      <h3 className="text-sm font-semibold text-white mb-1">Keyword Cloud</h3>
      <p className="text-xs text-gray-500 mb-3">Most frequent concepts across all countries</p>
      <div className="flex flex-wrap gap-2 items-center">
        {data.map((tag, i) => {
          const ratio = tag.value / maxVal;
          return (
            <span
              key={tag.text}
              className={`${sizeClass(ratio)} ${TAG_COLORS[i % TAG_COLORS.length]} leading-tight transition-opacity hover:opacity-100 opacity-80 cursor-default`}
              title={`Appears ${tag.value} time${tag.value !== 1 ? 's' : ''}`}
            >
              {tag.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
