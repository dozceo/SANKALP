"use client";
import React, { useState } from 'react';

const ITEMS = [
  { icon: '🏠', label: 'Overview', active: true },
  { icon: '📊', label: 'Analytics' },
  { icon: '🔗', label: 'Connections' },
  { icon: '⚙️', label: 'Settings' },
  { icon: '📋', label: 'Clusters' },
  { icon: '📈', label: 'Trends' },
];

export default function Sidebar() {
  const [active, setActive] = useState(0);

  return (
    <div className="sidebar glass">
      {ITEMS.map((item, i) => (
        <button
          key={i}
          className={`sb-btn ${i === active ? 'active' : ''}`}
          title={item.label}
          onClick={() => setActive(i)}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}

