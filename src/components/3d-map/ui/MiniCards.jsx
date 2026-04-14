"use client";
import React from 'react';

export default function MiniCards({ stats }) {
  const cards = [
    { icon: '🎯', label: 'Routes',    value: stats.topics.toLocaleString(), bg: 'bg-purple', color: 'c-purple' },
    { icon: '📚', label: 'Subjects',   value: stats.knnEdges.toLocaleString(), sub: 'Now', spark: true, bg: 'bg-blue', color: 'c-blue' },
    { icon: '💪', label: 'Roots',      value: `${Math.round(stats.avgM * 100)}%`, bg: 'bg-green', color: 'c-green' },
    { icon: '🔥', label: 'Finesse',    value: `${stats.clusters}`, sub: 'Active', bg: 'bg-amber', color: 'c-amber' },
  ];

  return (
    <div className="mini-cards">
      {cards.map((c, i) => (
        <div key={i} className="mc-card glass">
          <div className={`mc-icon ${c.bg}`}>
            <span className={c.color}>{c.icon}</span>
          </div>
          <div className="mc-body">
            <div className="mc-label">{c.label}</div>
            <div className={`mc-value ${c.color}`}>{c.value}</div>
          </div>
          {c.sub && <div className="mc-sub">{c.sub}</div>}
          {c.spark && (
            <svg className="mc-spark" viewBox="0 0 48 20">
              <polyline
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.5"
                points="0,15 8,12 16,14 24,8 32,10 40,5 48,7"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

