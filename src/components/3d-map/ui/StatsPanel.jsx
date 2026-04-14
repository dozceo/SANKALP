"use client";
import React from 'react';

export default function StatsPanel({ stats }) {
  const rows = [
    { icon: '📍', label: 'Points',  value: `${(stats.avgM * 100 * 27.3).toFixed(0)}`, accent: 'blue', bg: 'bg-blue' },
    { icon: '⚡', label: 'Watts',   value: `${(stats.avgSal * 1000 * 6.53).toFixed(0)}`, accent: 'amber', bg: 'bg-amber' },
    { icon: '📚', label: 'Schedule', value: `${Math.round(stats.avgM * 100)}%`, sub: 'AGI', accent: 'green', bg: 'bg-green' },
  ];

  return (
    <div className="stats-panel glass">
      <div className="sp-header">
        <span className="sp-title">
          <span className="sp-icon">📊</span> Stannerts
        </span>
        <span className="sp-dropdown">▾</span>
      </div>

      <div className="sp-label">Salience</div>

      {rows.map((r, i) => (
        <div key={i} className="sp-row">
          <div className="sp-row-left">
            <div className={`sp-row-icon ${r.bg}`}>
              <span className={`c-${r.accent}`}>{r.icon}</span>
            </div>
            <div>
              <div className="sp-row-label">{r.label}</div>
              <div className={`sp-row-value c-${r.accent}`}>
                {r.value}
                {r.sub && <span style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 4 }}>{r.sub}</span>}
              </div>
            </div>
          </div>
          <div className="sp-row-right">›</div>
        </div>
      ))}
    </div>
  );
}

