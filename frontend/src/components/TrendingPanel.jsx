import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const REFRESH_MS = 15 * 60 * 1000; // 15 minutes

function timeAgo(ts) {
  if (!ts) return 'never';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function RegionCard({ region, isActive, onClick }) {
  const thumbUrl = region.topVideos?.[0]?.thumbnail;
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left rounded-xl overflow-hidden transition-all duration-200 group',
        isActive
          ? 'ring-2 ring-orange-400/70 bg-white/[.07]'
          : 'bg-white/[.04] hover:bg-white/[.07] hover:ring-1 hover:ring-orange-400/30',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
          {thumbUrl ? (
            <img src={thumbUrl} alt={region.region} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">{region.region}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
            <span className="text-orange-400 text-xs font-medium">
              {region.videoCount} trending
            </span>
          </div>
        </div>

        {/* Arrow */}
        <svg className="w-4 h-4 text-gray-600 group-hover:text-orange-400 transition-colors flex-shrink-0"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

function VideoRow({ video, isPlaying, onPlay }) {
  const thumbnail = video.thumbnail ||
    `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;

  return (
    <button
      onClick={onPlay}
      className={[
        'w-full text-left rounded-xl overflow-hidden transition-all duration-200 group',
        isPlaying
          ? 'ring-2 ring-orange-400/70 scale-[1.01]'
          : 'hover:scale-[1.01] hover:ring-1 hover:ring-white/20',
      ].join(' ')}
    >
      <div className="relative aspect-video bg-gray-900 overflow-hidden">
        <img
          src={thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`; }}
        />
        <div className={[
          'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200',
          isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        ].join(' ')}>
          <div className="w-10 h-10 rounded-full bg-orange-500/90 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {isPlaying && (
          <div className="absolute top-2 right-2 bg-orange-500 rounded px-2 py-0.5 text-[10px] font-bold text-white">
            PLAYING
          </div>
        )}
      </div>
      <div className="bg-white/[.04] group-hover:bg-white/[.07] transition-colors px-3 py-2">
        <p className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-orange-300 transition-colors">
          {video.title}
        </p>
      </div>
    </button>
  );
}

export default function TrendingPanel() {
  const { state, fetchTrending, setActiveTrendingRegion, setAppMode } = useApp();
  const { trendingData, trendingLoading, trendingLastRefresh, activeTrendingRegion } = state;

  // Local player state (no need to pollute global context)
  const [activeVideo, setActiveVideo] = useState(null);
  const refreshTimerRef = useRef(null);

  // Auto-refresh every 15 minutes
  useEffect(() => {
    refreshTimerRef.current = setInterval(fetchTrending, REFRESH_MS);
    return () => clearInterval(refreshTimerRef.current);
  }, [fetchTrending]);

  // Reset player when region changes
  useEffect(() => { setActiveVideo(null); }, [activeTrendingRegion]);

  const handleRegionClick = useCallback(region => {
    setActiveTrendingRegion(region);
  }, [setActiveTrendingRegion]);

  const handleBack = useCallback(() => {
    setActiveTrendingRegion(null);
  }, [setActiveTrendingRegion]);

  const handleClose = useCallback(() => {
    setAppMode('explore');
  }, [setAppMode]);

  const topVideos = activeTrendingRegion?.topVideos || [];

  return (
    <div className="absolute right-0 top-0 h-screen w-[380px] z-30 flex flex-col slide-in-right">
      {/* Frosted-glass background */}
      <div className="absolute inset-0 bg-[#050810]/92 backdrop-blur-2xl border-l border-white/08" />

      <div className="relative flex flex-col h-full">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/08">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              <span className="text-[10px] text-orange-400 uppercase tracking-widest font-semibold">Live</span>
            </div>

            {activeTrendingRegion ? (
              <>
                <h2 className="text-white font-bold text-xl leading-tight">
                  {activeTrendingRegion.region}
                </h2>
                <p className="text-orange-500 text-sm font-medium mt-1">
                  {topVideos.length} trending video{topVideos.length !== 1 ? 's' : ''}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-white font-bold text-xl leading-tight">Trending Worldwide</h2>
                <p className="text-gray-500 text-xs mt-1">
                  Updated {timeAgo(trendingLastRefresh)}
                  {trendingLoading && ' · refreshing…'}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            {/* Back button in region view */}
            {activeTrendingRegion && (
              <button
                onClick={handleBack}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400
                           hover:text-white hover:bg-white/10 transition-all"
                title="Back to regions"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Refresh button */}
            {!activeTrendingRegion && (
              <button
                onClick={fetchTrending}
                disabled={trendingLoading}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400
                           hover:text-orange-400 hover:bg-white/10 transition-all disabled:opacity-40"
                title="Refresh"
              >
                <svg className={`w-4 h-4 ${trendingLoading ? 'spin-cw' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}

            {/* Close (exits trending mode) */}
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400
                         hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Embedded player (region videos view) ────────────── */}
        {activeTrendingRegion && activeVideo && (
          <div className="border-b border-white/08">
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                key={activeVideo.videoId}
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between px-4 py-2 bg-orange-500/10 border-t border-orange-500/20">
              <p className="text-white text-xs font-medium line-clamp-1 flex-1">{activeVideo.title}</p>
              <button
                onClick={() => setActiveVideo(null)}
                className="ml-3 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Content area ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {trendingLoading && trendingData.length === 0 ? (
            /* Skeleton loading */
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="h-16 skeleton rounded-xl" />
              </div>
            ))
          ) : activeTrendingRegion ? (
            /* Videos for the selected region */
            topVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600 py-12">
                <p className="text-sm">No videos available for this region.</p>
              </div>
            ) : (
              topVideos.map(v => (
                <VideoRow
                  key={v.videoId}
                  video={v}
                  isPlaying={activeVideo?.videoId === v.videoId}
                  onPlay={() => setActiveVideo(v)}
                />
              ))
            )
          ) : (
            /* Region list */
            trendingData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600 py-12">
                <p className="text-sm text-center">
                  No trending data available. Check your YouTube API key.
                </p>
              </div>
            ) : (
              trendingData.map(region => (
                <RegionCard
                  key={region.region}
                  region={region}
                  isActive={activeTrendingRegion?.region === region.region}
                  onClick={() => handleRegionClick(region)}
                />
              ))
            )
          )}
        </div>

        {/* ── Footer hint ──────────────────────────────────────── */}
        {!activeTrendingRegion && trendingData.length > 0 && (
          <div className="px-5 py-3 border-t border-white/08 text-center">
            <p className="text-[11px] text-gray-600">
              Click a globe hotspot or region above to see trending videos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
