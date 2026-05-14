import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const REFRESH_MS = 15 * 60 * 1000;

function timeAgo(ts) {
  if (!ts) return 'never';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function RegionCard({ region, isActive, onClick }) {
  const thumbUrl = region.topVideos?.[0]?.thumbnail;
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left rounded-2xl overflow-hidden transition-all duration-200 group',
        isActive ? 'scale-[1.01]' : 'hover:scale-[1.01]',
      ].join(' ')}
      style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(251,146,60,0.12) 0%, rgba(5,8,20,0.9) 100%)'
          : 'rgba(255,255,255,0.03)',
        border: isActive
          ? '1px solid rgba(251,146,60,0.35)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isActive ? '0 0 20px rgba(251,146,60,0.15)' : 'none',
      }}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Thumbnail */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-900">
          {thumbUrl ? (
            <>
              <img
                src={thumbUrl}
                alt={region.region}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(251,146,60,0.2) 0%, transparent 60%)' }} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-sm truncate transition-colors duration-200 ${isActive ? 'text-orange-200' : 'text-white group-hover:text-orange-100'}`}>
            {region.region}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
            </span>
            <span className="text-orange-400/80 text-[11px] font-medium">
              {region.videoCount} trending now
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0
          ${isActive ? 'bg-orange-500/20 text-orange-300' : 'bg-white/[.05] text-gray-600 group-hover:bg-orange-500/10 group-hover:text-orange-400'}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
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
        isPlaying ? 'scale-[1.01]' : 'hover:scale-[1.01]',
      ].join(' ')}
      style={{
        border: isPlaying
          ? '1px solid rgba(251,146,60,0.5)'
          : '1px solid rgba(255,255,255,0.05)',
        boxShadow: isPlaying ? '0 0 16px rgba(251,146,60,0.2)' : 'none',
      }}
    >
      <div className="relative aspect-video bg-gray-900 overflow-hidden">
        <img
          src={thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`; }}
        />
        {/* Hover / playing overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200
          ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(251,146,60,0.9)', boxShadow: '0 0 20px rgba(251,146,60,0.5)' }}>
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {isPlaying && (
          <div className="absolute top-2 right-2 rounded-md px-2 py-0.5 text-[10px] font-black text-white tracking-wide"
            style={{ background: '#f97316' }}>
            PLAYING
          </div>
        )}
      </div>
      <div className="px-3 py-2.5 transition-colors duration-200"
        style={{ background: isPlaying ? 'rgba(251,146,60,0.06)' : 'rgba(255,255,255,0.03)' }}>
        <p className={`text-sm font-medium line-clamp-2 leading-snug transition-colors duration-200
          ${isPlaying ? 'text-orange-200' : 'text-gray-200 group-hover:text-orange-100'}`}>
          {video.title}
        </p>
      </div>
    </button>
  );
}

export default function TrendingPanel() {
  const { state, fetchTrending, setActiveTrendingRegion, setAppMode } = useApp();
  const { trendingData, trendingLoading, trendingLastRefresh, activeTrendingRegion } = state;

  const [activeVideo, setActiveVideo] = useState(null);
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    refreshTimerRef.current = setInterval(fetchTrending, REFRESH_MS);
    return () => clearInterval(refreshTimerRef.current);
  }, [fetchTrending]);

  useEffect(() => { setActiveVideo(null); }, [activeTrendingRegion]);

  const handleRegionClick = useCallback(region => setActiveTrendingRegion(region), [setActiveTrendingRegion]);
  const handleBack        = useCallback(() => setActiveTrendingRegion(null),       [setActiveTrendingRegion]);
  const handleClose       = useCallback(() => setAppMode('explore'),               [setAppMode]);

  const topVideos = activeTrendingRegion?.topVideos || [];

  return (
    <div className="absolute right-0 top-0 h-screen w-[380px] z-30 flex flex-col slide-in-right">
      {/* Background */}
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(20,10,5,0.97) 0%, rgba(5,8,16,0.96) 100%)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(251,146,60,0.1)',
        }} />

      {/* Top glow accent */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(251,146,60,0.5), transparent)' }} />

      <div className="relative flex flex-col h-full">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Live badge row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)' }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                </span>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Live</span>
              </div>
              <span className="text-[11px] text-gray-600">
                {timeAgo(trendingLastRefresh)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {activeTrendingRegion && (
                <button onClick={handleBack}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500
                             hover:text-white hover:bg-white/10 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {!activeTrendingRegion && (
                <button onClick={fetchTrending} disabled={trendingLoading}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500
                             hover:text-orange-400 hover:bg-white/10 transition-all disabled:opacity-30">
                  <svg className={`w-4 h-4 ${trendingLoading ? 'spin-cw' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              <button onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500
                           hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Title */}
          {activeTrendingRegion ? (
            <div>
              <h2 className="text-xl font-black text-gradient-orange">{activeTrendingRegion.region}</h2>
              <p className="text-[12px] text-orange-400/60 mt-0.5">
                {topVideos.length} trending video{topVideos.length !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-black text-white">Trending Worldwide</h2>
              <p className="text-[12px] text-gray-600 mt-0.5">
                {trendingData.length} regions tracked
              </p>
            </div>
          )}
        </div>

        {/* ── Embedded player ─────────────────────────────────── */}
        {activeTrendingRegion && activeVideo && (
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
            <div className="flex items-center justify-between px-4 py-2"
              style={{ background: 'rgba(251,146,60,0.07)', borderTop: '1px solid rgba(251,146,60,0.15)' }}>
              <p className="text-white text-xs font-medium line-clamp-1 flex-1">{activeVideo.title}</p>
              <button onClick={() => setActiveVideo(null)}
                className="ml-3 text-gray-500 hover:text-white transition-colors flex-shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {trendingLoading && trendingData.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl skeleton" />
            ))
          ) : activeTrendingRegion ? (
            topVideos.length === 0 ? (
              <div className="flex items-center justify-center h-full py-12">
                <p className="text-sm text-gray-600">No videos available for this region.</p>
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
          ) : trendingData.length === 0 ? (
            <div className="flex items-center justify-center h-full py-12 text-center">
              <p className="text-sm text-gray-600">No trending data — check your YouTube API key.</p>
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
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        {!activeTrendingRegion && trendingData.length > 0 && (
          <div className="px-5 py-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
              Click a globe marker or region to see trending videos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
