import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#60a5fa', '#f87171', '#4ade80', '#facc15'];

const TooltipStyle = {
  background: 'rgba(5,8,16,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 11,
};

function SingleBarChart({ chart, index }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}
    >
      <h3 className="text-xs font-semibold text-white mb-3">{chart.title}</h3>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={chart.data} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="country" tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chart.data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function BarComparisonChart({ charts }) {
  if (!charts || charts.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {charts.map((chart, i) => (
        <SingleBarChart key={chart.key} chart={chart} index={i} />
      ))}
    </div>
  );
}
