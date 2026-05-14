import React from 'react';
import { useApp } from '../../context/AppContext';

const STEPS = [
  'Fetching video transcripts…',
  'Extracting metadata…',
  'Comparing countries…',
  'Generating dashboard…',
];

export default function ProgressIndicator() {
  const { state } = useApp();
  const { analysisProgress, analysisError } = state;

  if (analysisError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 text-sm">{analysisError}</p>
        <p className="text-gray-500 text-xs">Check that videos for these countries exist in the database.</p>
      </div>
    );
  }

  const currentStep = STEPS.indexOf(analysisProgress);
  const activeStep  = currentStep === -1 ? 0 : currentStep;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
      {/* Animated spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 spin-cw" />
        <div className="absolute inset-2 rounded-full border border-transparent border-b-blue-400 spin-ccw" />
        <div className="absolute inset-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
        </div>
      </div>

      {/* Current message */}
      <div className="text-center">
        <p className="text-white font-medium text-sm mb-1">
          {analysisProgress || 'Initialising…'}
        </p>
        <p className="text-gray-500 text-xs">This may take up to 60 seconds</p>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className={`
              rounded-full transition-all duration-500
              ${i < activeStep  ? 'w-2 h-2 bg-cyan-400' :
                i === activeStep ? 'w-3 h-3 bg-cyan-400 shadow-lg shadow-cyan-400/50' :
                                   'w-2 h-2 bg-white/10'}
            `}
          />
        ))}
      </div>

      {/* Step labels */}
      <div className="w-full max-w-xs space-y-2">
        {STEPS.map((step, i) => (
          <div key={step} className={`flex items-center gap-2 text-xs transition-all duration-300
              ${i < activeStep  ? 'text-cyan-400/70' :
                i === activeStep ? 'text-white' : 'text-gray-600'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                ${i < activeStep  ? 'bg-cyan-500/30 text-cyan-400' :
                  i === activeStep ? 'border border-cyan-400 text-cyan-400' : 'border border-white/10 text-gray-600'}`}>
              {i < activeStep
                ? <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                : i === activeStep
                  ? <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 spin-cw" />
                  : null}
            </div>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
