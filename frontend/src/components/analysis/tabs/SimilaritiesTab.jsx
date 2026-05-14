import React from 'react';

export default function SimilaritiesTab({ data }) {
  const similarities = data?.comparison?.similarities || [];

  if (similarities.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        No similarities detected.
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '100%' }}>
      <p className="text-gray-500 text-xs mb-4">
        These traits appear across <span className="text-white">{data.countries?.length || 'all'}</span> countries.
      </p>
      {similarities.map((item, i) => (
        <div
          key={i}
          className="flex gap-3 rounded-xl p-3.5 fade-up"
          style={{
            background: 'rgba(0,210,255,0.06)',
            border: '1px solid rgba(0,210,255,0.15)',
            animationDelay: `${i * 60}ms`,
          }}
        >
          <div className="w-5 h-5 rounded-full bg-cyan-500/30 border border-cyan-400/40 flex-shrink-0
                          flex items-center justify-center mt-0.5">
            <svg className="w-3 h-3 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
}
