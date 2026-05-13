import React from 'react';
import { useApp } from '../context/AppContext';

export default function Breadcrumb() {
  const { state, goBack, search } = useApp();
  const { level, query, selectedCountry, selectedCity } = state;

  if (!query) return null;

  const crumbs = [
    {
      label: 'Earth',
      active: level === 'global',
      onClick: level !== 'global' ? () => search(query) : null,
    },
    ...(selectedCountry
      ? [{
          label: selectedCountry,
          active: level === 'country',
          onClick: level === 'city' ? goBack : null,
        }]
      : []),
    ...(selectedCity
      ? [{ label: selectedCity, active: true, onClick: null }]
      : []),
  ];

  return (
    <div className="flex items-center gap-1">
      <div className="glass rounded-full px-4 py-2 flex items-center gap-1.5 text-sm">
        {/* Query badge */}
        <span className="text-gray-500 text-xs mr-1">"{query}"</span>

        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.label}>
            {i > 0 && <span className="text-gray-600 select-none">›</span>}
            <button
              onClick={crumb.onClick || undefined}
              disabled={!crumb.onClick}
              className={[
                'font-medium transition-colors',
                crumb.active ? 'text-white' : 'text-gray-400',
                crumb.onClick ? 'hover:text-red-400 cursor-pointer' : 'cursor-default',
              ].join(' ')}
            >
              {crumb.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Back button */}
      {level !== 'global' && (
        <button
          onClick={goBack}
          className="glass rounded-full px-3 py-2 flex items-center gap-1 text-xs text-red-400
                     hover:text-red-300 hover:border-red-500/50 transition-all"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}
    </div>
  );
}
