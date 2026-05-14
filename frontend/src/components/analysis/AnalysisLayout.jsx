import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import GlobeView from '../GlobeView';
import AnalysisDashboard from './AnalysisDashboard';
import ProgressIndicator from './ProgressIndicator';
import VideoPicker from './VideoPicker';

const LEFT_RATIO = 0.55; // 55% of viewport

/**
 * Split-screen layout for analysis mode.
 *   Left  (55vw): interactive globe + selected country chips + video picker + mini player
 *   Right (45vw): tabbed analysis dashboard
 */
export default function AnalysisLayout() {
  const { state, exitAnalysisMode } = useApp();
  const { analysisLoading, analysisError, analysisData, analysisActiveVideo, query, comparisonSelected } = state;

  const [leftWidth,  setLeftWidth]  = useState(Math.floor(window.innerWidth * LEFT_RATIO));

  useEffect(() => {
    const onResize = () => setLeftWidth(Math.floor(window.innerWidth * LEFT_RATIO));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="fixed inset-0 flex bg-space-black overflow-hidden" style={{ zIndex: 50 }}>

      {/* ── LEFT PANEL ──────────────────────────────────────────── */}
      <div className="relative flex-shrink-0 overflow-hidden border-r border-white/5"
           style={{ width: leftWidth }}>

        {/* Globe fills this panel */}
        <div className="absolute inset-0">
          <GlobeView containerWidth={leftWidth} analysisGlobe={true} />
        </div>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4 flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={exitAnalysisMode}
            className="glass rounded-full w-9 h-9 flex items-center justify-center
                       border border-white/10 hover:border-white/30 transition-colors"
            title="Exit Analysis Mode"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {/* Logo + query */}
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg tracking-wide">
              Geo<span className="text-red-500">Tube</span>
            </span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-300 text-sm">"{query}"</span>
          </div>

          {/* Mode badge */}
          <div className="ml-auto glass rounded-full px-3 py-1 text-xs text-cyan-300 border border-cyan-400/30">
            Analysis Mode
          </div>
        </div>

        {/* Selected countries chips — positioned mid-left */}
        {comparisonSelected.length > 0 && (
          <div className="absolute left-4 bottom-52 z-10">
            <div className="flex flex-wrap gap-1.5 max-w-xs">
              {comparisonSelected.map(c => (
                <span key={c.label}
                      className="px-2.5 py-1 rounded-full text-xs font-medium
                                 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Video player — compact fixed-size player above the picker */}
        {analysisActiveVideo && (
          <div className="absolute left-4 z-10" style={{ bottom: 215, width: Math.min(leftWidth - 32, 380) }}>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/80 shadow-2xl">
              <div className="px-3 py-2 bg-black/40 flex items-center gap-2">
                <p className="text-white text-xs font-medium line-clamp-1 flex-1">
                  {analysisActiveVideo.title}
                </p>
              </div>
              <div style={{ height: 200 }}>
                <iframe
                  key={analysisActiveVideo.videoId}
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${analysisActiveVideo.videoId}?autoplay=0`}
                  title={analysisActiveVideo.title}
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Video picker strip at bottom */}
        {analysisData && <VideoPicker />}

        {/* Hint when no video selected */}
        {analysisData && !analysisActiveVideo && (
          <div className="absolute bottom-52 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <div className="glass rounded-full px-4 py-1.5 text-xs text-gray-500">
              Select a video below to watch it here
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {analysisLoading || (!analysisData && !analysisError)
          ? <ProgressIndicator />
          : <AnalysisDashboard />
        }
      </div>
    </div>
  );
}
