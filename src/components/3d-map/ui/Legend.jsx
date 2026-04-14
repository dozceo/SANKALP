"use client";
import React from 'react';

export default function Legend() {
  return (
    <div className="legend glass">
      <div className="lg-row">
        <div className="lg-line" style={{ borderTop: '2px solid #d4a843' }} />
        <span>KNN-Similarity</span>
      </div>
      <div className="lg-row">
        <div className="lg-line" style={{ borderTop: '2px solid #4a6fa5' }} />
        <span>Hierarchy</span>
      </div>
      <div className="lg-row">
        <div className="lg-dot" style={{ background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
        <span>Weakness</span>
      </div>
      <div className="lg-row">
        <div className="lg-dot" style={{ background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
        <span>Strength</span>
      </div>
    </div>
  );
}

