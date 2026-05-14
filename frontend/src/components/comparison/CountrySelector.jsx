import React from 'react';
import { useApp } from '../../context/AppContext';

/**
 * Chip strip showing currently selected countries.
 * Positioned in the bottom-right corner above the CompareButton.
 */
export default function CountrySelector() {
  const { state, toggleCountrySelection } = useApp();
  const { comparisonSelected } = state;

  if (comparisonSelected.length === 0) return null;

  return (
    <div
      className="absolute bottom-20 right-6 z-20 flex flex-col items-end gap-2 fade-up"
      style={{ maxWidth: 320 }}
    >
      <div className="text-xs text-gray-500 mb-1">
        {comparisonSelected.length}/4 selected
      </div>
      <div className="flex flex-wrap gap-2 justify-end">
        {comparisonSelected.map(c => (
          <button
            key={c.label}
            onClick={() => toggleCountrySelection(c.label, c.lat, c.lng)}
            className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              bg-cyan-500/15 border border-cyan-400/50 text-cyan-300
              hover:bg-cyan-500/25 hover:border-cyan-300 transition-all duration-150
              glow-blue
            "
            title={`Remove ${c.label}`}
          >
            {c.label}
            <svg className="w-3 h-3 opacity-70 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
