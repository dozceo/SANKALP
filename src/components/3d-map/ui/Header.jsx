"use client";
import React from 'react';

export default function Header({ mode = 'student' }) {
  return (
    <div className="header">
      <div className="header-logo">🧠</div>
      <div className="header-brand">
        <span className="header-sub">SANKALP</span>
        <span className="header-title">{mode === 'teacher' ? 'Student Learning Network' : 'AEI Brain Map — Neural Copy'}</span>
      </div>
      <div className="header-tags">
        <span className="tag tag-3d">THREE.js 3D</span>
        <span className="tag tag-knn">vec0 KNN</span>
        <span className="tag tag-louv">Louvain</span>
        {mode === 'student' && <span className="tag tag-prev">NEURAL COPY</span>}
        {mode === 'teacher' && <span className="tag" style={{background:'rgba(34,197,94,.1)',color:'#4ade80',border:'1px solid rgba(34,197,94,.2)'}}>CLASS NETWORK</span>}
      </div>
    </div>
  );
}
