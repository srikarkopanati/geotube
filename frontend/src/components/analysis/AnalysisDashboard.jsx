import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import OverviewTab     from './tabs/OverviewTab';
import ComparisonTab   from './tabs/ComparisonTab';
import SimilaritiesTab from './tabs/SimilaritiesTab';
import DifferencesTab  from './tabs/DifferencesTab';
import AskAITab        from './tabs/AskAITab';

const TABS = [
  { id: 'overview',     label: 'Overview',    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'comparison',   label: 'Comparison',  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'similarities', label: 'Similarities', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id: 'differences',  label: 'Differences', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { id: 'askai',        label: 'Ask AI',      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

export default function AnalysisDashboard() {
  const { state } = useApp();
  const { analysisData, analysisError } = state;
  const [activeTab, setActiveTab] = useState('overview');

  if (analysisError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 text-sm font-medium">Analysis failed</p>
        <p className="text-gray-500 text-xs">{analysisError}</p>
      </div>
    );
  }

  if (!analysisData) return null;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':     return <OverviewTab     data={analysisData} />;
      case 'comparison':   return <ComparisonTab   data={analysisData} />;
      case 'similarities': return <SimilaritiesTab data={analysisData} />;
      case 'differences':  return <DifferencesTab  data={analysisData} />;
      case 'askai':        return <AskAITab         data={analysisData} />;
      default:             return null;
    }
  };

  return (
    <div className="flex flex-col h-full"
         style={{ background: 'rgba(5,8,16,0.95)', backdropFilter: 'blur(20px)' }}>

      {/* ── Dashboard header ──────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white font-bold text-base">Comparative Analysis</h2>
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {analysisData.domain}
          </span>
        </div>
        <p className="text-gray-500 text-xs">
          "{analysisData.query}" · {analysisData.countries?.length} countries
        </p>
      </div>

      {/* ── Tab strip ─────────────────────────────────────────── */}
      <div className="flex border-b border-white/5 px-2 flex-shrink-0 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap
              border-b-2 transition-all duration-150
              ${activeTab === tab.id
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-white/20'}
            `}
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={tab.icon} />
            </svg>
            {tab.label}
            {tab.id === 'askai' && (
              <span className="ml-0.5 px-1 py-0.5 rounded text-purple-300 bg-purple-500/20 text-[9px] leading-none">
                AI
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden px-5 py-4">
        {renderTab()}
      </div>

      {/* ── Footer: country legend ────────────────────────────── */}
      <div className="px-5 py-3 border-t border-white/5 flex-shrink-0 flex flex-wrap gap-3">
        {(analysisData.countries || []).map((c, i) => {
          const colors = ['#60a5fa','#f87171','#4ade80','#facc15'];
          return (
            <div key={c.country} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
              <span className="text-xs text-gray-400">{c.country}</span>
              <span className="text-xs text-gray-600">({c.videoCount})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
