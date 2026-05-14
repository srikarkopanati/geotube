import React from 'react';
import { useApp } from '../../../context/AppContext';

export default function RepresentativeVideoList({ videos }) {
  const { setAnalysisActiveVideo } = useApp();

  if (!videos || videos.length === 0) return null;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}
    >
      <h3 className="text-sm font-semibold text-white mb-1">Representative Videos</h3>
      <p className="text-xs text-gray-500 mb-3">Top video per country — click to play</p>
      <div className="space-y-2">
        {videos.map(v => (
          <button
            key={v.videoId}
            className="w-full flex gap-3 p-2.5 rounded-lg text-left transition-colors hover:bg-white/5 group"
            onClick={() => setAnalysisActiveVideo(v)}
          >
            {v.thumbnail ? (
              <img
                src={v.thumbnail}
                alt={v.title}
                className="w-20 h-12 object-cover rounded flex-shrink-0 ring-1 ring-white/5"
              />
            ) : (
              <div className="w-20 h-12 rounded bg-white/5 flex-shrink-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium line-clamp-2 group-hover:text-cyan-300 transition-colors">
                {v.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-white/5 text-gray-400 border border-white/5">
                  {v.country}
                </span>
                {v.publishedAt && (
                  <span className="text-xs text-gray-600">{v.publishedAt?.slice(0, 10)}</span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 self-center">
              <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center
                              group-hover:bg-cyan-500/20 group-hover:border group-hover:border-cyan-400/30 transition-all">
                <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
