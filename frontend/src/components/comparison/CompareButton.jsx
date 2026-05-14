import React from 'react';
import { useApp } from '../../context/AppContext';

/**
 * Floating CTA that appears when 2+ countries are selected.
 * Triggers the full analysis pipeline on click.
 */
export default function CompareButton() {
  const { state, runComparison } = useApp();
  const { comparisonSelected, analysisLoading } = state;

  if (comparisonSelected.length < 2) return null;

  return (
    <div className="absolute bottom-6 right-6 z-20 fade-up">
      <button
        onClick={runComparison}
        disabled={analysisLoading}
        className="
          flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold
          bg-gradient-to-r from-cyan-500 to-blue-600 text-white
          shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50
          hover:scale-105 active:scale-95 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
          glow-blue
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Compare {comparisonSelected.length} Countries
      </button>
    </div>
  );
}
