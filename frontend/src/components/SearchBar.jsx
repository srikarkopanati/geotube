import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const SUGGESTIONS = ['street food', 'travel vlog', 'walking tour', 'nature', 'festivals', 'city life'];

export default function SearchBar() {
  const { search, state } = useApp();
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = () => {
    const q = value.trim();
    if (q) {
      setShowSuggestions(false);
      search(q);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') setShowSuggestions(false);
  };

  const pickSuggestion = s => {
    setValue(s);
    setShowSuggestions(false);
    search(s);
  };

  const filtered = SUGGESTIONS.filter(s =>
    value.trim() ? s.toLowerCase().includes(value.toLowerCase()) : true
  );

  return (
    <div className="relative w-full max-w-sm">
      {/* Input row */}
      <div
        className={`
          flex items-center gap-2 glass rounded-full px-3 py-2
          transition-all duration-300
          ${showSuggestions || value ? 'border-red-500/40' : 'border-white/10'}
          border
        `}
      >
        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search videos globally…"
          disabled={state.loading}
          className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none min-w-0"
        />

        {value && (
          <button
            onClick={() => { setValue(''); inputRef.current?.focus(); }}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0 p-0.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <button
          onClick={handleSearch}
          disabled={!value.trim() || state.loading}
          className="flex-shrink-0 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed
                     rounded-full px-4 py-1.5 text-white text-xs font-semibold transition-colors glow-red"
        >
          Search
        </button>
      </div>

      {/* Dropdown suggestions */}
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 glass rounded-2xl py-2 z-50 border border-white/10 shadow-2xl">
          {filtered.map(s => (
            <button
              key={s}
              onMouseDown={() => pickSuggestion(s)}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white
                         hover:bg-white/05 transition-colors flex items-center gap-2"
            >
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
