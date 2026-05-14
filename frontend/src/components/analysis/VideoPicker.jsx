import React from 'react';
import { useApp } from '../../context/AppContext';

/**
 * Horizontal scroller showing videos for the currently selected country
 * in analysis mode. Clicking a video starts it in the left panel.
 */
export default function VideoPicker() {
  const { state, setAnalysisActiveVideo, setAnalysisSelectedCountry } = useApp();
  const { analysisData, analysisSelectedCountry, analysisActiveVideo } = state;

  if (!analysisData) return null;

  const countries = analysisData.countries || [];

  // Find the data for the currently active country
  const activeCountryData = countries.find(c => c.country === analysisSelectedCountry) || countries[0];
  const videos = activeCountryData?.videos || [];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4">
      {/* Country tab strip */}
      <div className="flex gap-2 mb-2">
        {countries.map(c => (
          <button
            key={c.country}
            onClick={() => setAnalysisSelectedCountry(c.country)}
            className={`
              px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150
              ${analysisSelectedCountry === c.country
                ? 'bg-cyan-500/30 border border-cyan-400/60 text-cyan-300'
                : 'glass border-transparent text-gray-400 hover:text-white'}
            `}
          >
            {c.country}
          </button>
        ))}
      </div>

      {/* Video strip */}
      <div
        className="glass rounded-xl p-3 flex gap-3 overflow-x-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        {videos.length === 0 && (
          <p className="text-gray-500 text-xs py-2 px-1">No videos for this country</p>
        )}
        {videos.map(v => (
          <button
            key={v.videoId}
            onClick={() => setAnalysisActiveVideo(v)}
            className={`
              flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200
              ${analysisActiveVideo?.videoId === v.videoId
                ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-transparent'
                : 'hover:ring-1 hover:ring-white/20'}
            `}
            style={{ width: 140 }}
          >
            <div className="relative">
              {v.thumbnail
                ? <img src={v.thumbnail} alt={v.title} className="w-full h-20 object-cover" />
                : <div className="w-full h-20 bg-white/5 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
              }
              {analysisActiveVideo?.videoId === v.videoId && (
                <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/80 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div className="p-1.5 bg-black/30 text-left">
              <p className="text-white text-xs line-clamp-2 leading-tight">{v.title}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
