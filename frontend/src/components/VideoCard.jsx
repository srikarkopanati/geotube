import React from 'react';
import { useApp } from '../context/AppContext';

export default function VideoCard({ video }) {
  const { openVideo, state } = useApp();
  const isActive = state.activeVideo?.videoId === video.videoId;

  const thumbnail =
    video.thumbnail ||
    `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;

  const formattedDate = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : null;

  return (
    <div
      onClick={() => openVideo(video)}
      className={[
        'cursor-pointer rounded-xl overflow-hidden transition-all duration-200 group',
        isActive
          ? 'ring-2 ring-red-500 glow-red scale-[1.01]'
          : 'hover:scale-[1.02] hover:ring-1 hover:ring-white/20',
      ].join(' ')}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900 overflow-hidden">
        <img
          src={thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => {
            e.target.src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
          }}
        />

        {/* Overlay + play button */}
        <div
          className={[
            'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200',
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          ].join(' ')}
        >
          <div className="w-12 h-12 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center glow-red">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {isActive && (
          <div className="absolute top-2 right-2 bg-red-600 rounded px-2 py-0.5 text-[10px] font-bold text-white tracking-wide">
            PLAYING
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="bg-white/[.04] group-hover:bg-white/[.07] transition-colors px-3 py-2.5">
        <h3
          className={[
            'text-sm font-medium line-clamp-2 transition-colors leading-snug',
            isActive ? 'text-red-400' : 'text-white group-hover:text-red-300',
          ].join(' ')}
        >
          {video.title}
        </h3>
        {formattedDate && (
          <p className="text-gray-500 text-xs mt-1">{formattedDate}</p>
        )}
      </div>
    </div>
  );
}
