import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const MIN_YEAR = 2008;
const MAX_YEAR = 2024;
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

// Milestones shown on the slider track for context
const MILESTONES = [
  { year: 2008, label: 'Beijing' },
  { year: 2012, label: 'London' },
  { year: 2016, label: 'Rio' },
  { year: 2020, label: 'Tokyo' },
  { year: 2024, label: 'Paris' },
];

export default function TimelineSlider() {
  const { state, setYear, fetchTimeline } = useApp();
  const { selectedYear, query, timelineLoading, timelineMarkers } = state;

  // Local slider value for smooth drag (commits to context on release)
  const [localYear, setLocalYear] = useState(selectedYear);
  const debounceRef = useRef(null);

  // Sync if selectedYear changes externally (e.g., mode switch)
  useEffect(() => { setLocalYear(selectedYear); }, [selectedYear]);

  // Auto-fetch when slider first appears with a query
  useEffect(() => {
    if (query && timelineMarkers.length === 0 && !timelineLoading) {
      fetchTimeline(query, selectedYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback(e => {
    const yr = Number(e.target.value);
    setLocalYear(yr);
    // Debounce API call 300ms after user stops dragging
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setYear(yr), 300);
  }, [setYear]);

  const pct = ((localYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pb-6 px-8 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        {/* Glass card */}
        <div className="glass rounded-2xl px-6 py-4 border border-white/08 shadow-2xl">

          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Time Travel</span>
            </div>

            {/* Current year badge */}
            <div className="flex items-center gap-2">
              {timelineLoading && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent spin-cw" />
              )}
              <span className="text-xl font-bold text-white tabular-nums">{localYear}</span>
              {query && (
                <span className="text-xs text-gray-500">
                  {timelineMarkers.length > 0
                    ? `${timelineMarkers.length} countr${timelineMarkers.length === 1 ? 'y' : 'ies'}`
                    : timelineLoading ? '…' : 'no data'}
                </span>
              )}
            </div>
          </div>

          {/* Slider + milestones */}
          <div className="relative">
            {/* Custom track + thumb */}
            <div className="relative h-1.5 rounded-full bg-white/10 mb-3">
              {/* Filled portion */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            <input
              type="range"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={localYear}
              onChange={handleChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
              style={{ height: '12px', top: '-4px' }}
            />

            {/* Year tick labels */}
            <div className="flex justify-between text-[10px] text-gray-600 px-0.5">
              {YEARS.filter((_, i) => i % 4 === 0 || _ === MAX_YEAR).map(yr => (
                <span
                  key={yr}
                  className={yr === localYear ? 'text-cyan-400 font-semibold' : ''}
                >
                  {yr}
                </span>
              ))}
            </div>
          </div>

          {/* Query hint */}
          {!query && (
            <p className="text-center text-xs text-gray-600 mt-2">
              Search a topic first to see how content shifted across years
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
