
import React, { useState } from 'react';
import { Evaluation } from '../types';

interface ProgressChartProps {
  history: Evaluation[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ history }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; score: number; topic: string } | null>(null);

  if (history.length < 2) return null;

  const sorted = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10);

  const W = 600;
  const H = 120;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const minScore = Math.max(0, Math.min(...sorted.map(e => e.overallScore)) - 10);
  const maxScore = Math.min(100, Math.max(...sorted.map(e => e.overallScore)) + 10);
  const scoreRange = maxScore - minScore || 1;

  const toX = (i: number) => padL + (i / (sorted.length - 1)) * chartW;
  const toY = (score: number) => padT + chartH - ((score - minScore) / scoreRange) * chartH;

  const points = sorted.map((e, i) => ({ x: toX(i), y: toY(e.overallScore), score: e.overallScore, topic: e.topic, date: e.date }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x},${padT + chartH} L ${points[0].x},${padT + chartH} Z`;

  const getColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#f43f5e';
  };

  const yLabels = [minScore, Math.round((minScore + maxScore) / 2), maxScore];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 overflow-hidden">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Skor Trendi</h3>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Y-axis grid lines */}
          {yLabels.map((label, i) => {
            const y = toY(label);
            return (
              <g key={i}>
                <line
                  x1={padL}
                  y1={y}
                  x2={W - padR}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-slate-200 dark:text-slate-700"
                  strokeDasharray="4 4"
                />
                <text
                  x={padL - 4}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-slate-400 dark:fill-slate-500"
                  style={{ fontSize: 8, fontWeight: 600 }}
                >
                  {Math.round(label)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="currentColor"
            className="text-indigo-100 dark:text-indigo-900/20"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={6}
                fill="transparent"
                onMouseEnter={() => setTooltip({ x: p.x, y: p.y, score: p.score, topic: p.topic })}
                style={{ cursor: 'pointer' }}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill={getColor(p.score)}
                stroke="white"
                strokeWidth="1.5"
                className="dark:stroke-slate-900"
                style={{ pointerEvents: 'none' }}
              />

              {/* X-axis date label */}
              <text
                x={p.x}
                y={padT + chartH + 12}
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500"
                style={{ fontSize: 7, fontWeight: 500 }}
              >
                {new Date(p.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
              </text>
            </g>
          ))}

          {/* Tooltip */}
          {tooltip && (() => {
            const bW = 110;
            const bH = 34;
            const bX = Math.min(Math.max(tooltip.x - bW / 2, padL), W - padR - bW);
            const bY = tooltip.y - bH - 8;
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={bX} y={bY} width={bW} height={bH} rx={5} fill="#1e293b" />
                <text x={bX + bW / 2} y={bY + 11} textAnchor="middle" fill="white" style={{ fontSize: 9, fontWeight: 700 }}>
                  {tooltip.score} puan
                </text>
                <text x={bX + bW / 2} y={bY + 24} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 7 }}>
                  {tooltip.topic.length > 18 ? tooltip.topic.slice(0, 18) + '…' : tooltip.topic}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

export default ProgressChart;
