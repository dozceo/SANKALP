"use client";
import React from 'react';

const COL_HEX = {
  student: '#9333ea', subject: '#3b82f6', chapter: '#06b6d4',
  topic: '#94a3b8', weakness: '#ef4444', strength: '#22c55e',
};

export default function Tooltip({ node, x, y }) {
  if (!node) return null;

  const ci = node.cL != null ? (node.cU - node.cL) : null;
  const ciCol = ci === null ? '#94a3b8' : ci < .2 ? '#22c55e' : ci < .4 ? '#f59e0b' : '#ef4444';
  const slopeStr = node.sl != null
    ? (node.sl > 0 ? '📈 +' : '📉 ') + node.sl.toFixed(3)
    : '—';
  const col = COL_HEX[node.t] || COL_HEX.topic;

  return (
    <div
      className="tooltip glass"
      style={{
        left: Math.min(x, window.innerWidth - 270),
        top: Math.min(y, window.innerHeight - 220),
      }}
    >
      <div className="tt-name" style={{ color: col }}>{node.n}</div>
      <div className="tt-row">
        <span className="tt-label">Type</span>
        <span className="tt-value">{node.t}</span>
      </div>
      {node.m != null && (
        <>
          <div className="tt-row">
            <span className="tt-label">Mastery</span>
            <span className="tt-value" style={{ color: node.m > .7 ? '#22c55e' : node.m > .4 ? '#f59e0b' : '#ef4444' }}>
              {Math.round(node.m * 100)}%
            </span>
          </div>
          <div className="tt-bar">
            <div className="tt-bar-fill" style={{ width: `${node.m * 100}%`, background: col }} />
          </div>
        </>
      )}
      {ci != null && (
        <div className="tt-row">
          <span className="tt-label">95% CI</span>
          <span className="tt-value" style={{ color: ciCol }}>
            {node.cL.toFixed(2)} — {node.cU.toFixed(2)}
          </span>
        </div>
      )}
      <div className="tt-row">
        <span className="tt-label">Trajectory</span>
        <span className="tt-value">{slopeStr}</span>
      </div>
      <div className="tt-row">
        <span className="tt-label">Salience</span>
        <span className="tt-value c-purple">{(node.salience ?? 0).toFixed(3)}</span>
      </div>
      <div className="tt-row">
        <span className="tt-label">Cluster</span>
        <span className="tt-value">{node.cluster || '—'}</span>
      </div>
      {node.fl?.length > 0 && (
        <div className="tt-row">
          <span className="tt-label">Flags</span>
          <span className="tt-value c-red">{node.fl.join(', ')}</span>
        </div>
      )}
    </div>
  );
}

