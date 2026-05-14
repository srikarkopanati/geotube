import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import * as api from '../../../services/api';

const SUGGESTIONS = [
  'Why is each country different?',
  'Which country seems most affordable?',
  'What do all countries have in common?',
  'Which country has the most unique approach?',
];

export default function AskAITab({ data }) {
  const { state } = useApp();
  const [input,    setInput]    = useState('');
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async question => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setLoading(true);

    try {
      const resp = await api.analyzeChat(
        state.query,
        state.comparisonSelected.map(c => c.label),
        q,
        data,
      );
      setMessages(m => [...m, { role: 'ai', text: resp.answer }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'ai', text: `Sorry, I couldn't answer that: ${err.message}`, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message history */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2 pr-1">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/30 mx-auto mb-3 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
              Ask me anything about the comparison between{' '}
              {state.comparisonSelected.map(c => c.label).join(', ')}.
            </p>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-cyan-500/20 border border-cyan-400/30 text-white'
                : msg.error
                  ? 'bg-red-500/10 border border-red-400/20 text-red-300'
                  : 'bg-white/5 border border-white/8 text-gray-200'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3 flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                     style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)}
                    className="text-xs glass rounded-full px-3 py-1.5 text-gray-400
                               hover:text-white hover:border-purple-400/40 border border-transparent transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about these countries…"
          rows={2}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                     placeholder-gray-600 resize-none focus:outline-none focus:border-purple-400/50 transition-colors"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="self-end w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-400/40 text-purple-300
                     flex items-center justify-center hover:bg-purple-500/50 transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
