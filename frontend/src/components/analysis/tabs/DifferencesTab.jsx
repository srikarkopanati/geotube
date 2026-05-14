import React from 'react';

export default function DifferencesTab({ data }) {
  const differences = data?.comparison?.differences || [];
  const countries   = data?.countries || [];

  // Assign a colour per country for visual association
  const COUNTRY_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc'];
  const colorMap = {};
  countries.forEach((c, i) => {
    colorMap[c.country] = COUNTRY_COLORS[i % COUNTRY_COLORS.length];
  });

  // Try to detect which country a difference refers to (for coloring)
  const detectCountry = text => {
    for (const c of countries) {
      if (text.toLowerCase().includes(c.country.toLowerCase())) return c.country;
    }
    return null;
  };

  if (differences.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        No notable differences detected.
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '100%' }}>
      <p className="text-gray-500 text-xs mb-4">
        Contrasting traits that distinguish each country's approach.
      </p>
      {differences.map((item, i) => {
        const country = detectCountry(item);
        const color   = country ? colorMap[country] : '#94a3b8';
        return (
          <div
            key={i}
            className="flex gap-3 rounded-xl p-3.5 fade-up"
            style={{
              background: `${color}08`,
              border: `1px solid ${color}25`,
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: `${color}25`, border: `1px solid ${color}50` }}
            >
              <svg className="w-3 h-3" fill="none" stroke={color} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="flex-1">
              {country && (
                <span className="text-xs font-semibold mr-2" style={{ color }}>
                  {country}
                </span>
              )}
              <span className="text-gray-200 text-sm leading-relaxed">{item}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
