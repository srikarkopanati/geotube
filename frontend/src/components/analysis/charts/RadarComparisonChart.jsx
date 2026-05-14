import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, Tooltip, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#60a5fa', '#f87171', '#4ade80', '#facc15'];

const TooltipStyle = {
  background: 'rgba(5,8,16,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 11,
};

export default function RadarComparisonChart({ data, countries }) {
  if (!data || data.length === 0 || !countries || countries.length === 0) return null;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}
    >
      <h3 className="text-sm font-semibold text-white mb-1">Attribute Radar Comparison</h3>
      <p className="text-xs text-gray-500 mb-3">Count of distinct items per category</p>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} />
          {countries.map((c, i) => (
            <Radar
              key={c}
              name={c}
              dataKey={c}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.12}
              strokeWidth={2}
            />
          ))}
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
          <Tooltip contentStyle={TooltipStyle} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
