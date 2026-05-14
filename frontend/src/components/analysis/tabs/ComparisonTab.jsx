import React from 'react';

export default function ComparisonTab({ data }) {
  const { countries = [] } = data;
  if (countries.length === 0) return null;

  // Collect all schema keys from the first country's summary
  const firstSummary = countries[0]?.summary || {};
  const schemaKeys = Object.keys(firstSummary);

  if (schemaKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        No structured attributes available.
      </div>
    );
  }

  const renderValue = val => {
    if (!val || (Array.isArray(val) && val.length === 0)) return <span className="text-gray-600 text-xs">—</span>;
    if (Array.isArray(val)) {
      return (
        <div className="flex flex-wrap gap-1">
          {val.slice(0, 4).map((item, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded text-xs bg-white/5 text-gray-300 border border-white/5">
              {item}
            </span>
          ))}
        </div>
      );
    }
    return <span className="text-gray-200 text-xs">{val}</span>;
  };

  return (
    <div className="overflow-auto pr-1" style={{ maxHeight: '100%' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left text-gray-500 text-xs font-normal py-2 pr-3 sticky top-0 bg-transparent"
                style={{ minWidth: 90 }}>
              Attribute
            </th>
            {countries.map(c => (
              <th key={c.country} className="text-left py-2 px-2 sticky top-0 bg-transparent"
                  style={{ minWidth: 110 }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-white text-xs font-semibold">{c.country}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schemaKeys.map((key, i) => (
            <tr key={key}
                className={`border-t ${i % 2 === 0 ? 'border-white/3' : 'border-white/5'}`}
                style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
              <td className="py-2.5 pr-3 text-gray-400 text-xs capitalize align-top">
                {key.replace(/_/g, ' ')}
              </td>
              {countries.map(c => (
                <td key={c.country} className="py-2.5 px-2 align-top">
                  {renderValue(c.summary?.[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
