import React from 'react';

export default function OverviewTab({ data }) {
  const { countries = [], comparison = {} } = data;
  const { overview = [] } = comparison;

  return (
    <div className="space-y-4 overflow-y-auto pr-1" style={{ maxHeight: '100%' }}>
      {/* Domain badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 border border-purple-400/40 text-purple-300 uppercase tracking-wide">
          {data.domain || 'general'}
        </span>
        <span className="text-gray-500 text-xs">{countries.length} countries compared</span>
      </div>

      {/* Country cards */}
      <div className="space-y-3">
        {countries.map((c, i) => (
          <div key={c.country}
               className="rounded-xl border border-white/8 p-4 fade-up"
               style={{
                 background: 'rgba(255,255,255,0.04)',
                 backdropFilter: 'blur(8px)',
                 animationDelay: `${i * 80}ms`,
               }}>
            {/* Country header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
              <h3 className="text-white font-semibold text-sm">{c.country}</h3>
              <span className="ml-auto text-gray-500 text-xs">{c.videoCount} video{c.videoCount !== 1 ? 's' : ''} analysed</span>
            </div>

            {/* Overview sentence from comparison */}
            {overview[i] && (
              <p className="text-gray-300 text-xs leading-relaxed mb-3 italic">
                "{overview[i]}"
              </p>
            )}

            {/* Summary attributes */}
            {c.summary && Object.keys(c.summary).length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(c.summary).slice(0, 6).map(([key, val]) => {
                  if (!val || (Array.isArray(val) && val.length === 0)) return null;
                  const label  = key.replace(/_/g, ' ');
                  const display = Array.isArray(val) ? val.slice(0, 3).join(', ') : val;
                  return (
                    <div key={key} className="bg-white/3 rounded-lg p-2">
                      <p className="text-gray-500 text-xs capitalize mb-0.5">{label}</p>
                      <p className="text-gray-200 text-xs font-medium line-clamp-2">{display}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
