import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer,
} from 'recharts';

const BAR_GRADIENT = ['#60a5fa', '#818cf8', '#a78bfa', '#c084fc'];

const TooltipStyle = {
  background: 'rgba(5,8,16,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 11,
};

export default function AttributeHistogram({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}
    >
      <h3 className="text-sm font-semibold text-white mb-1">Top Attributes Frequency</h3>
      <p className="text-xs text-gray-500 mb-3">Most common items across all countries</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip contentStyle={TooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_GRADIENT[i % BAR_GRADIENT.length]} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
