import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const SENTIMENT_COLORS = {
  Positive: '#4ade80',
  Neutral:  '#60a5fa',
  Negative: '#f87171',
};

const TooltipStyle = {
  background: 'rgba(5,8,16,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 11,
};

function CountryGauge({ country, sentiment }) {
  const pieData = [
    { name: 'Positive', value: sentiment.positive || 0 },
    { name: 'Neutral',  value: sentiment.neutral  || 0 },
    { name: 'Negative', value: sentiment.negative || 0 },
  ].filter(d => d.value > 0);

  const dominant = pieData.reduce((a, b) => a.value > b.value ? a : b, pieData[0] || { name: 'Neutral' });

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-gray-400 mb-1 font-medium">{country}</p>
      <ResponsiveContainer width={100} height={100}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={28}
            outerRadius={44}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            paddingAngle={1}
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={SENTIMENT_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TooltipStyle} formatter={(v, name) => [`${v}%`, name]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-1.5 mt-1 flex-wrap justify-center">
        {Object.entries(sentiment).map(([k, v]) => (
          <span key={k} className="text-xs font-medium" style={{ color: SENTIMENT_COLORS[k.charAt(0).toUpperCase() + k.slice(1)] }}>
            {v}%
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-0.5">{dominant.name}</p>
    </div>
  );
}

export default function SentimentGauge({ data }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}
    >
      <h3 className="text-sm font-semibold text-white mb-1">Content Sentiment</h3>
      <p className="text-xs text-gray-500 mb-3">Tone analysis of extracted attributes</p>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.entries(SENTIMENT_COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 justify-around">
        {Object.entries(data).map(([country, sentiment]) => (
          <CountryGauge key={country} country={country} sentiment={sentiment} />
        ))}
      </div>
    </div>
  );
}
