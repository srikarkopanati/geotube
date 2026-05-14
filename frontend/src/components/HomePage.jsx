import React from 'react';
import { useApp } from '../context/AppContext';
import GlobeView from './GlobeView';
import SearchBar from './SearchBar';
import VideoSidebar from './VideoSidebar';
import Breadcrumb from './Breadcrumb';
import Loader from './Loader';
import ErrorState from './ErrorState';
import CountrySelector from './comparison/CountrySelector';
import CompareButton from './comparison/CompareButton';
import AnalysisLayout from './analysis/AnalysisLayout';
import ModeSelector from './ModeSelector';
import TimelineSlider from './TimelineSlider';
import TrendingPanel from './TrendingPanel';

export default function HomePage() {
  const { state, search, toggleCompareMode } = useApp();
  const {
    query, loading, error, markers, sidebarOpen, level,
    compareModeOn, comparisonSelected,
    analysisMode,
    appMode,
    timelineMarkers, timelineLoading,
    trendingData,
  } = state;

  /* ── Analysis mode — full split-screen takeover ──────────────────── */
  if (analysisMode) {
    return <AnalysisLayout />;
  }

  const showCompareUI = appMode === 'explore' && query && !loading && markers.length > 0 && level === 'global';
  const isTrending    = appMode === 'trending';
  const isTimeline    = appMode === 'timeline';

  /* Marker count shown in header — adapts to current mode */
  const markerCount = isTimeline
    ? timelineMarkers.length
    : isTrending
      ? trendingData.length
      : markers.length;

  const markerLabel = isTrending ? 'regions' : level === 'global' ? 'countries' : level === 'country' ? 'cities' : 'locations';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-black select-none">

      {/* ── Globe (full-page background) ─────────────────────── */}
      <GlobeView />

      {/* ── Top navigation bar ───────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-5 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center glow-red">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-wide">
            Geo<span className="text-red-500">Tube</span>
          </span>
        </div>

        {/* Search bar + mode selector — side by side in the centre */}
        <div className="flex-1 flex items-center justify-center gap-3">
          <div className={`transition-opacity duration-300 ${isTrending ? 'opacity-40 pointer-events-none' : ''}`}>
            <SearchBar />
          </div>
          <ModeSelector />
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {markerCount > 0 && (
            <div className="glass rounded-full px-3 py-1.5 text-xs text-gray-400">
              <span className="text-white font-semibold">{markerCount}</span>
              {' '}{markerLabel}
            </div>
          )}

          {/* Compare mode toggle — explore mode only */}
          {showCompareUI && (
            <button
              onClick={toggleCompareMode}
              title={compareModeOn ? 'Exit Compare Mode' : 'Select countries to compare'}
              className={`
                glass rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200
                flex items-center gap-1.5
                ${compareModeOn
                  ? 'border border-cyan-400/60 text-cyan-300 glow-blue'
                  : 'border border-transparent text-gray-400 hover:text-white hover:border-cyan-400/30'}
              `}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {compareModeOn ? 'Exit Compare' : 'Compare'}
            </button>
          )}
        </div>
      </header>

      {/* ── Breadcrumb — explore mode only, left side ────────────────── */}
      {query && appMode === 'explore' && (
        <div className="absolute top-[72px] left-6 z-20">
          <Breadcrumb />
        </div>
      )}

      {/* ── Compare mode hint ─────────────────────────────────── */}
      {showCompareUI && compareModeOn && (
        <div className="absolute top-[72px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="glass rounded-full px-4 py-2 text-xs text-cyan-300 border border-cyan-400/30">
            Click country markers to select for comparison (max 4)
          </div>
        </div>
      )}

      {/* ── Timeline mode label ───────────────────────────────── */}
      {isTimeline && (
        <div className="absolute top-[72px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="glass rounded-full px-4 py-2 text-xs text-cyan-300 border border-cyan-400/20">
            {timelineLoading
              ? 'Loading timeline data…'
              : timelineMarkers.length > 0
                ? `${timelineMarkers.length} countr${timelineMarkers.length === 1 ? 'y' : 'ies'} · drag the slider to travel through time`
                : query
                  ? `No data for ${state.selectedYear} — try a different year or search first`
                  : 'Search a topic first, then drag the slider to explore by year'}
          </div>
        </div>
      )}

      {/* ── Hero intro (shown before first search, explore mode) ─────── */}
      {!query && !loading && appMode === 'explore' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="text-center fade-up max-w-2xl px-6">
            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-5">
              Explore the World's<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600">
                YouTube Stories
              </span>
            </h1>
            <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
              Search any topic and discover geotagged videos on an interactive 3D globe.
            </p>
            <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
              {['street food', 'travel vlog', 'walking tour', 'nature', 'festivals'].map(tag => (
                <button
                  key={tag}
                  onClick={() => search(tag)}
                  className="glass rounded-full px-4 py-2 text-sm text-gray-300 hover:text-white
                             border border-transparent hover:border-red-500/50 transition-all duration-200
                             hover:glow-red"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Trending mode intro (no data yet) ────────────────────────── */}
      {isTrending && trendingData.length === 0 && !state.trendingLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center fade-up">
            <p className="text-gray-500 text-sm">Loading trending data…</p>
          </div>
        </div>
      )}

      {/* ── Level label overlay — explore only ───────────────────────── */}
      {appMode === 'explore' && query && !loading && markers.length > 0 && !compareModeOn && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="glass rounded-full px-5 py-2 text-xs text-gray-400 text-center">
            {level === 'global' && 'Click a country to zoom in'}
            {level === 'country' && 'Click a city to see videos'}
            {level === 'city' && 'Viewing videos in ' + state.selectedCity}
          </div>
        </div>
      )}

      {/* ── Comparison selection chips + connect button ───────── */}
      {showCompareUI && compareModeOn && <CountrySelector />}
      {showCompareUI && compareModeOn && comparisonSelected.length >= 2 && <CompareButton />}

      {/* ── Video sidebar (explore mode) ──────────────────────── */}
      {sidebarOpen && appMode === 'explore' && !compareModeOn && <VideoSidebar />}

      {/* ── Trending panel (trending mode) ────────────────────── */}
      {isTrending && <TrendingPanel />}

      {/* ── Timeline slider (timeline mode) ──────────────────── */}
      {isTimeline && <TimelineSlider />}

      {/* ── Overlays ─────────────────────────────────────────── */}
      {loading && <Loader message={state.loadingMessage} />}
      {error   && <ErrorState message={error} />}
    </div>
  );
}
