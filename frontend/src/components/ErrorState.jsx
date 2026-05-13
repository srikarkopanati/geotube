import React from 'react';
import { useApp } from '../context/AppContext';

export default function ErrorState({ message }) {
  const { clearError } = useApp();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="glass rounded-2xl p-4 border border-red-500/30 shadow-xl">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center mt-0.5">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Notice</p>
            <p className="text-gray-400 text-sm mt-0.5 leading-relaxed">{message}</p>
          </div>

          {/* Dismiss */}
          <button
            onClick={clearError}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500
                       hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
