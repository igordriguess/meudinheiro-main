import React, { useState } from 'react';
import { SimulationPoint } from '../types/finance';
import { formatBRL } from '../services/simulationEngine';

interface PerformanceChartProps {
  timeline: SimulationPoint[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ timeline }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(
    Math.max(0, timeline.length - 1)
  );

  if (!timeline || timeline.length < 2) return null;

  const safeIdx = Math.min(selectedIndex, timeline.length - 1);
  const activePoint = timeline[safeIdx];

  const allValues = timeline.flatMap((p) => [
    p.invested,
    p.poupancaNet,
    p.cdbNet,
    p.tesouroSelicNet,
    p.lciLcaNet,
  ]);
  const minVal = Math.min(...allValues) * 0.96;
  const maxVal = Math.max(...allValues) * 1.02;
  const range = Math.max(1, maxVal - minVal);

  const width = 760;
  const height = 270;
  const padLeft = 72;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 32;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const getX = (index: number) => {
    if (timeline.length <= 1) return padLeft;
    return padLeft + (index / (timeline.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    return padTop + plotHeight - ((val - minVal) / range) * plotHeight;
  };

  const buildPath = (selector: (p: SimulationPoint) => number) => {
    return timeline
      .map((pt, idx) => {
        const x = getX(idx).toFixed(1);
        const y = getY(selector(pt)).toFixed(1);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const cdbPath = buildPath((p) => p.cdbNet);
  const lciPath = buildPath((p) => p.lciLcaNet);
  const tesouroPath = buildPath((p) => p.tesouroSelicNet);
  const poupancaPath = buildPath((p) => p.poupancaNet);

  return (
    <section className="bg-[#121418] border border-white/[0.08] rounded-2xl p-5 sm:p-7 space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#10B981]">Projeção</p>
          </div>
          <h3 className="mt-1 text-xl sm:text-2xl font-display font-semibold text-[#F4F5F7]">
            Evolução do patrimônio no tempo
          </h3>
          <p className="text-xs text-[#9499A3] mt-1">
            Toque ou passe o cursor sobre o gráfico para inspecionar cada mês
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#9499A3]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" />
            <span className="text-[#F4F5F7] font-medium">CDB</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] inline-block" />
            <span>LCI/LCA</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA] inline-block" />
            <span>Tesouro Selic</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#646973] inline-block" />
            <span>Poupança</span>
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-[#0A0B0D] to-[#10191A] border border-[#10B981]/20 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="font-mono font-semibold text-[#F4F5F7] tabular-nums">
          {activePoint.month === 0 ? 'Início (Mês 0)' : `Mês ${activePoint.month}`}
          <span className="mx-2 text-[#646973]">·</span>
          <span className="text-[#9499A3] font-normal">
            Investido: {formatBRL(Math.round(activePoint.invested))}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono tabular-nums">
          <span className="text-[#10B981] font-semibold">
            CDB: {formatBRL(Math.round(activePoint.cdbNet))}
          </span>
          <span className="text-[#38BDF8]">
            LCI/LCA: {formatBRL(Math.round(activePoint.lciLcaNet))}
          </span>
          <span className="text-[#A78BFA]">
            Tesouro: {formatBRL(Math.round(activePoint.tesouroSelicNet))}
          </span>
          <span className="text-[#9499A3]">
            Poupança: {formatBRL(Math.round(activePoint.poupancaNet))}
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-60 sm:h-72 overflow-visible"
          role="img"
          aria-label="Gráfico de evolução do valor acumulado por mês"
        >
          <defs>
            <linearGradient id="cdb-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((ratio) => {
            const y = padTop + ratio * plotHeight;
            const val = maxVal - ratio * range;
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#646973"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {formatBRL(Math.round(val))}
                </text>
              </g>
            );
          })}

          <path
            d={`${cdbPath} L ${getX(timeline.length - 1).toFixed(1)} ${height - padBottom} L ${getX(0).toFixed(1)} ${height - padBottom} Z`}
            fill="url(#cdb-area-gradient)"
            stroke="none"
          />
          <path
            d={poupancaPath}
            fill="none"
            stroke="#646973"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={tesouroPath}
            fill="none"
            stroke="#A78BFA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={lciPath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={cdbPath}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <line
            x1={getX(safeIdx)}
            y1={padTop}
            x2={getX(safeIdx)}
            y2={height - padBottom}
            stroke="rgba(255,255,255,0.35)"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          <circle
            cx={getX(safeIdx)}
            cy={getY(activePoint.poupancaNet)}
            r="4"
            fill="#646973"
          />
          <circle
            cx={getX(safeIdx)}
            cy={getY(activePoint.tesouroSelicNet)}
            r="4"
            fill="#A78BFA"
          />
          <circle
            cx={getX(safeIdx)}
            cy={getY(activePoint.lciLcaNet)}
            r="4.5"
            fill="#38BDF8"
          />
          <circle
            cx={getX(safeIdx)}
            cy={getY(activePoint.cdbNet)}
            r="5.5"
            fill="#10B981"
            stroke="#0A0B0D"
            strokeWidth="2"
          />

          {timeline.map((pt, idx) => {
            const showLabel =
              idx === 0 ||
              idx === timeline.length - 1 ||
              idx === Math.floor(timeline.length / 2);
            if (!showLabel) return null;
            return (
              <text
                key={pt.month}
                x={getX(idx)}
                y={height - 8}
                textAnchor={
                  idx === 0
                    ? 'start'
                    : idx === timeline.length - 1
                    ? 'end'
                    : 'middle'
                }
                fill="#9499A3"
                fontSize="11"
                fontFamily="IBM Plex Mono, monospace"
              >
                Mês {pt.month}
              </text>
            );
          })}

          {timeline.map((pt, idx) => {
            const colWidth = plotWidth / Math.max(1, timeline.length - 1);
            const xStart = Math.max(0, getX(idx) - colWidth / 2);
            return (
              <rect
                key={pt.month}
                x={xStart}
                y={0}
                width={colWidth}
                height={height}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => setSelectedIndex(idx)}
                onTouchStart={() => setSelectedIndex(idx)}
              />
            );
          })}
        </svg>
      </div>

      <div className="pt-1 flex items-center gap-3">
        <label htmlFor="chart-month-slider" className="text-xs text-[#9499A3] whitespace-nowrap">
          Inspecionar mês:
        </label>
        <div className="relative flex-1 h-5 flex items-center">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.16]" />
          <div
            className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[#10B981]"
            style={{
              width: `${(safeIdx / Math.max(1, timeline.length - 1)) * 100}%`,
            }}
          />
          <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 flex items-center justify-between pointer-events-none">
            {timeline.map((pt, idx) => (
              <span
                key={pt.month}
                className={`rounded-full transition-all ${
                  idx === safeIdx
                    ? 'h-2.5 w-2.5 bg-[#10B981] shadow-[0_0_0_3px_rgba(16,185,129,0.14)]'
                    : 'h-1 w-1 bg-[#646973]'
                }`}
              />
            ))}
          </div>
          <input
            id="chart-month-slider"
            type="range"
            min={0}
            max={timeline.length - 1}
            value={safeIdx}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            aria-label="Selecionar mês da projeção"
            className="relative z-10 w-full appearance-none bg-transparent cursor-pointer h-5 accent-[#10B981] [&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#10B981] [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(16,185,129,0.14)] [&::-webkit-slider-thumb]:-mt-[6px] [&::-moz-range-track]:h-px [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#10B981]"
          />
        </div>
      </div>
    </section>
  );
};
