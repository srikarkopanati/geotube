import React from 'react';
import { useApp } from '../context/AppContext';
import VideoCard from './VideoCard';

export default function VideoSidebar() {
  const { state, closeSidebar, closeVideo } = useApp();
  const { videos, selectedCity, selectedCountry, activeVideo, loading } = state;

  return (
    <div className="absolute right-0 top-0 h-screen w-[380px] z-30 flex flex-col slide-in-right">
      {/* Frosted-glass background panel */}
      <div className="absolute inset-0 bg-[#050810]/92 backdrop-blur-2xl border-l border-white/08" />

      <div className="relative flex flex-col h-full">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/08">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
              {selectedCountry}
            </div>
            <h2 className="text-white font-bold text-xl leading-tight">{selectedCity}</h2>
            <p className="text-red-500 text-sm font-medium mt-1">
              {videos.length} video{videos.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={closeSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400
                       hover:text-white hover:bg-white/10 transition-all flex-shrink-0 mt-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Embedded Player ────────────────────────────────────── */}
        {activeVideo && (
          <div className="border-b border-white/08">
            {/* Player container */}
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
            {/* Now-playing bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-red-600/10 border-t border-red-500/20">
              <p className="text-white text-xs font-medium line-clamp-1 flex-1">{activeVideo.title}</p>
              <button
                onClick={closeVideo}
                className="ml-3 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Video List ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            /* Skeleton placeholders */
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="aspect-video skeleton" />
                <div className="bg-white/[.04] p-3 space-y-2">
                  <div className="h-3 skeleton rounded w-full" />
                  <div className="h-3 skeleton rounded w-3/4" />
                </div>
              </div>
            ))
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600 py-12">
              <svg className="w-14 h-14 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No videos found for this city.</p>
            </div>
          ) : (
            videos.map(v => <VideoCard key={v.videoId} video={v} />)
          )}
        </div>
      </div>
    </div>
  );
}
