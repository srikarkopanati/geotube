import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#60a5fa', '#f87171', '#4ade80', '#facc15', '#c084fc', '#fb923c', '#34d399', '#a78bfa'];

const TooltipStyle = {
  background: 'rgba(5,8,16,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 11,
};

function SinglePie({ chart }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}
    >
      <h3 className="text-xs font-semibold text-white mb-2">{chart.title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chart.data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={72}
            dataKey="value"
            paddingAngle={2}
          >
            {chart.data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TooltipStyle} />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 10 }} iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function PieBreakdownChart({ charts }) {
  if (!charts || charts.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {charts.map(chart => (
        <SinglePie key={chart.key} chart={chart} />
      ))}
    </div>
  );
}
