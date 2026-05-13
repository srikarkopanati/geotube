import React from 'react';

export default function Loader({ message = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-space-black/75 backdrop-blur-sm">
      {/* Concentric spinning rings */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" />
        <div
          className="absolute inset-0 rounded-full border-2 border-t-red-500 border-r-red-500/40 border-b-transparent border-l-transparent spin-cw"
        />
        <div
          className="absolute inset-3 rounded-full border-2 border-b-red-400 border-l-red-400/50 border-t-transparent border-r-transparent spin-ccw"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-red-500 glow-red animate-pulse" />
        </div>
      </div>

      <p className="text-white font-semibold text-lg">{message}</p>
      <p className="text-gray-500 text-sm mt-2">This may take a moment on the first search.</p>
    </div>
  );
}
