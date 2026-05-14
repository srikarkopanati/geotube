import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const MIN_YEAR = 2008;
const MAX_YEAR = 2024;
const YEARS    = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

// Notable events shown as milestone dots on the track
const MILESTONES = [
  { year: 2008, label: "Beijing '08" },
  { year: 2012, label: "London '12"  },
  { year: 2016, label: "Rio '16"     },
  { year: 2020, label: "Tokyo '20"   },
  { year: 2024, label: "Paris '24"   },
];

function pct(year) {
  return ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
}

export default function TimelineSlider() {
  const { state, setYear, fetchTimeline } = useApp();
  const { selectedYear, query, timelineLoading, timelineMarkers } = state;

  const [localYear, setLocalYear]   = useState(selectedYear);
  const [hoveredMs, setHoveredMs]   = useState(null);
  const debounceRef                 = useRef(null);

  useEffect(() => { setLocalYear(selectedYear); }, [selectedYear]);

  useEffect(() => {
    if (query && timelineMarkers.length === 0 && !timelineLoading) {
      fetchTimeline(query, selectedYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback(e => {
    const yr = Number(e.target.value);
    setLocalYear(yr);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setYear(yr), 300);
  }, [setYear]);

  const filledPct  = pct(localYear);
  const activeMile = MILESTONES.find(m => m.year === localYear);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pb-5 px-6 pointer-events-none slide-up">
      <div className="max-w-2xl mx-auto pointer-events-auto">

        {/* ── Milestone tooltip ───────────────────────────────────── */}
        <div className="flex justify-center mb-2 h-6">
          {(activeMile || hoveredMs) && (
            <div className="glass rounded-full px-3 py-1 text-[11px] text-cyan-300 border border-cyan-400/20 fade-up">
              {(activeMile || hoveredMs).label}
            </div>
          )}
        </div>

        {/* ── Main card ───────────────────────────────────────────── */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{
            background: 'linear-gradient(135deg, rgba(8,12,30,0.92) 0%, rgba(5,8,20,0.95) 100%)',
            border:     '1px solid rgba(0,229,255,0.15)',
            boxShadow:  '0 -4px 40px rgba(0,229,255,0.06), 0 8px 32px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.25)' }}>
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan-400/70">
                Time Travel
              </span>
            </div>

            {/* Year + status */}
            <div className="flex items-center gap-2.5">
              {timelineLoading && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400/70 border-t-transparent spin-cw" />
              )}
              <span className="text-2xl font-black tabular-nums text-gradient-cyan">
                {localYear}
              </span>
              <span className="text-[11px] text-gray-600 tabular-nums min-w-[56px] text-right">
                {!query
                  ? 'no search'
                  : timelineLoading
                  ? 'loading…'
                  : timelineMarkers.length > 0
                  ? `${timelineMarkers.length} countr${timelineMarkers.length === 1 ? 'y' : 'ies'}`
                  : 'no data'}
              </span>
            </div>
          </div>

          {/* Track area */}
          <div className="relative select-none" style={{ paddingBottom: '18px' }}>

            {/* Background track */}
            <div className="relative h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>

              {/* Filled + glow */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
                style={{
                  width: `${filledPct}%`,
                  background: 'linear-gradient(90deg, #0ea5e9, #22d3ee)',
                  boxShadow:  '0 0 8px rgba(0,229,255,0.6)',
                }}
              />

              {/* Milestone dots */}
              {MILESTONES.map(ms => (
                <div
                  key={ms.year}
                  onMouseEnter={() => setHoveredMs(ms)}
                  onMouseLeave={() => setHoveredMs(null)}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full
                             cursor-pointer transition-transform duration-150 hover:scale-150 z-10"
                  style={{
                    left:       `${pct(ms.year)}%`,
                    background: ms.year <= localYear ? '#22d3ee' : 'rgba(255,255,255,0.2)',
                    boxShadow:  ms.year <= localYear ? '0 0 6px rgba(0,229,255,0.8)' : 'none',
                  }}
                />
              ))}

              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4
                           rounded-full border-2 border-cyan-300 bg-[#050810] z-20
                           transition-all duration-150 pointer-events-none"
                style={{
                  left:      `${filledPct}%`,
                  boxShadow: '0 0 10px rgba(0,229,255,0.7), 0 0 3px rgba(0,229,255,1)',
                }}
              />
            </div>

            {/* Hidden native range input — drives all interactions */}
            <input
              type="range"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={localYear}
              onChange={handleChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{ height: '20px', top: '-8px' }}
            />

            {/* Year labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-0.5">
              {YEARS.filter((_, i) => i % 4 === 0 || _ === MAX_YEAR).map(yr => (
                <span
                  key={yr}
                  className="text-[10px] tabular-nums transition-colors duration-150"
                  style={{ color: yr === localYear ? '#67e8f9' : 'rgba(255,255,255,0.2)' }}
                >
                  {yr}
                </span>
              ))}
            </div>
          </div>

          {/* No-query hint */}
          {!query && (
            <p className="text-center text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Search a topic first, then drag to travel through time
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
