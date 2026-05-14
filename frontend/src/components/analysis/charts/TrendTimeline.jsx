import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#60a5fa', '#f87171', '#4ade80', '#facc15'];

const TooltipStyle = {
  background: 'rgba(5,8,16,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 11,
};

export default function TrendTimeline({ data, countries }) {
  if (!data || data.length === 0 || !countries || countries.length === 0) return null;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}
    >
      <h3 className="text-sm font-semibold text-white mb-1">Content Activity Timeline</h3>
      <p className="text-xs text-gray-500 mb-3">Estimated upload activity by country</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            {countries.map((c, i) => (
              <linearGradient key={c} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TooltipStyle} />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 10 }} />
          {countries.map((c, i) => (
            <Area
              key={c}
              type="monotone"
              dataKey={c}
              stroke={COLORS[i % COLORS.length]}
              fill={`url(#grad${i})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
