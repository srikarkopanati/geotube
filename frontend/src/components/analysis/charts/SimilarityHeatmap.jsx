import React from 'react';

function cellColor(value) {
  if (value === 100) return 'rgba(255,255,255,0.07)';
  if (value >= 70)   return 'rgba(74,222,128,0.75)';
  if (value >= 40)   return 'rgba(96,165,250,0.75)';
  return 'rgba(248,113,113,0.7)';
}

export default function SimilarityHeatmap({ data }) {
  if (!data || !data.countries || data.countries.length < 2) return null;

  const { countries, matrix } = data;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}
    >
      <h3 className="text-sm font-semibold text-white mb-1">Similarity Heatmap</h3>
      <p className="text-xs text-gray-500 mb-3">Jaccard similarity of extracted attributes (%)</p>

      <div className="overflow-x-auto">
        <table className="border-collapse mx-auto">
          <thead>
            <tr>
              <th className="w-24" />
              {countries.map(c => (
                <th key={c} className="px-2 pb-2 text-xs text-gray-400 font-normal text-center" style={{ minWidth: 72 }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {countries.map((row, i) => (
              <tr key={row}>
                <td className="pr-3 text-xs text-gray-400 text-right pb-1.5">{row}</td>
                {countries.map((col, j) => {
                  const val = matrix[i][j];
                  return (
                    <td key={col} className="p-1">
                      <div
                        className="flex items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{
                          background: cellColor(val),
                          width: 64,
                          height: 36,
                          fontSize: 12,
                        }}
                      >
                        {val === 100 ? '—' : `${val}%`}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center">
        {[['rgba(74,222,128,0.75)', '≥70% High'], ['rgba(96,165,250,0.75)', '40–69% Mid'], ['rgba(248,113,113,0.7)', '<40% Low']].map(([c, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: c }} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
