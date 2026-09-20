import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  Clock,
  ShieldCheck,
  BarChart2,
  ArrowUpRight,
  Info,
  Download,
} from 'lucide-react';
import { WebhookDeliveryRecord } from '../types';

interface WebhookTelemetrySparklineProps {
  logs: WebhookDeliveryRecord[];
  className?: string;
  compact?: boolean;
  onDownloadLogs?: () => void;
}

export const WebhookTelemetrySparkline: React.FC<WebhookTelemetrySparklineProps> = ({
  logs,
  className = '',
  compact = false,
  onDownloadLogs,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take the last 10 webhook events (logs are stored newest first)
  const recent10Logs = logs.slice(0, 10);
  // Chronological order (oldest to newest, left to right)
  const chronologicalLogs = [...recent10Logs].reverse();

  const totalEvents = recent10Logs.length;
  const successCount = recent10Logs.filter((l) => l.success).length;
  const failureCount = totalEvents - successCount;
  const successRatePercent = totalEvents > 0 ? Math.round((successCount / totalEvents) * 100) : 100;

  // Latencies array in chronological order
  const latencies = chronologicalLogs.map((l) => l.latencyMs || 0);
  const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;
  const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
  const latestLatency = latencies.length > 0 ? latencies[latencies.length - 1] : 0;

  // SVG Sparkline Geometry
  const svgWidth = 320;
  const svgHeight = 68;
  const padX = 14;
  const padY = 12;
  const plotW = svgWidth - padX * 2;
  const plotH = svgHeight - padY * 2;

  // Compute normalized points
  const points = chronologicalLogs.map((log, idx) => {
    const x =
      latencies.length <= 1
        ? svgWidth / 2
        : padX + (idx / (latencies.length - 1)) * plotW;
    
    // Y-coordinate: scale between minLatency and maxLatency with safety padding
    const yRange = Math.max(maxLatency - minLatency, 10);
    const yVal = log.latencyMs || 0;
    const y = padY + plotH - ((yVal - minLatency) / yRange) * plotH;
    return { x, y, log, idx };
  });

  // Generate SVG path commands
  const pathD = points.length > 0
    ? points.reduce((acc, pt, i) => {
        return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
      }, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x},${svgHeight} L ${points[0].x},${svgHeight} Z`
    : '';

  // Active hovered point details
  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  if (compact) {
    return (
      <div
        id="telemetry-sparkline-compact"
        className={`bg-stone-900/90 border border-white/10 rounded-xl p-3 text-white backdrop-blur-xs ${className}`}
      >
        <div className="flex items-center justify-between gap-2 text-xs mb-2">
          <div className="flex items-center space-x-1.5 font-bold">
            <Activity className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span className="text-stone-200">Last 10 Events Telemetry:</span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span className="text-emerald-400 font-black">{successRatePercent}% Success</span>
            <span className="text-stone-400">|</span>
            <span className="text-[#00d4ff] font-bold">Avg {avgLatency}ms</span>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              successRatePercent >= 95
                ? 'bg-emerald-400'
                : successRatePercent >= 80
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
            style={{ width: `${successRatePercent}%` }}
          />
        </div>

        {/* Mini 10-dot indicators */}
        <div className="flex items-center justify-between px-0.5">
          {Array.from({ length: 10 }).map((_, i) => {
            const record = recent10Logs[9 - i]; // Oldest to newest
            return (
              <div
                key={i}
                title={
                  record
                    ? `${record.eventType}: ${record.latencyMs}ms (${record.statusCode})`
                    : 'Awaiting dispatch'
                }
                className={`w-2 h-2 rounded-full transition-all ${
                  !record
                    ? 'bg-stone-700'
                    : record.success
                    ? 'bg-emerald-400'
                    : 'bg-rose-500'
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      id="telemetry-sparkline-card"
      className={`bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-stone-50 via-white to-stone-50 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#caf0f8] text-[#03045e]">
            <Activity className="w-4 h-4 text-[#0077b6]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Telemetry &amp; SLA Performance Monitor
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
                Last {totalEvents} Webhook Events
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Live delivery success probability tracking &amp; round-trip ping latency sparkline
            </p>
          </div>
        </div>

        {/* Status Chip & Audit Actions */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          {onDownloadLogs && totalEvents > 0 && (
            <button
              type="button"
              id="sparkline-download-logs-btn"
              onClick={onDownloadLogs}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white hover:bg-stone-100 text-[#03045e] border border-stone-200 hover:border-[#90e0ef] transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Download delivery logs and latency metrics as CSV"
            >
              <Download className="w-3 h-3 text-[#0077b6]" />
              <span>Export CSV</span>
            </button>
          )}

          <span
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-tight ${
              successRatePercent >= 95
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : successRatePercent >= 80
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                successRatePercent >= 95 ? 'bg-emerald-500' : successRatePercent >= 80 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
            <span>{successRatePercent >= 95 ? 'SLA Compliant' : successRatePercent >= 80 ? 'Degraded SLA' : 'SLA Breach'}</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Success Rate Progress Bar (Left) & Ping Latency Sparkline (Right) */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Delivery Success Rate & Progress Bar (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4 border-b md:border-b-0 md:border-r border-stone-100 md:pr-6 pb-4 md:pb-0">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-600 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Delivery Success Rate</span>
              </span>
              <span className="font-mono text-xs font-black text-stone-900">
                {successCount} / {totalEvents} Passed
              </span>
            </div>

            {/* Percentage Display */}
            <div className="flex items-baseline space-x-2 my-2">
              <span
                className={`text-3xl font-black font-mono tracking-tight ${
                  successRatePercent >= 95
                    ? 'text-emerald-600'
                    : successRatePercent >= 80
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {successRatePercent}%
              </span>
              <span className="text-xs font-semibold text-stone-500">
                {failureCount === 0 ? 'Zero failures detected' : `${failureCount} failed transmission${failureCount > 1 ? 's' : ''}`}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden border border-stone-200/80 p-0.5 relative shadow-2xs">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  successRatePercent >= 95
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-[#00b4d8]'
                    : successRatePercent >= 80
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                    : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
                style={{ width: `${Math.max(successRatePercent, 2)}%` }}
              />
            </div>
          </div>

          {/* 10-Event Pill Breakdown */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold">
              <span>Event Window (Last 10 Dispatches)</span>
              <span className="font-mono text-[10px] text-stone-400">Oldest &rarr; Newest</span>
            </div>

            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }).map((_, idx) => {
                const item = chronologicalLogs[idx];
                const isSelected = hoveredIndex === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`h-7 rounded-lg text-[10px] font-mono font-bold flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      !item
                        ? 'bg-stone-50 text-stone-300 border-dashed border-stone-200'
                        : item.success
                        ? isSelected
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs scale-105'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : isSelected
                        ? 'bg-rose-500 text-white border-rose-600 shadow-xs scale-105'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                    title={
                      item
                        ? `#${idx + 1}: ${item.eventType} (${item.latencyMs}ms) - ${item.statusCode} ${item.statusText}`
                        : 'Slot awaiting event'
                    }
                  >
                    <span>{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Ping Latency Sparkline (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-[#0077b6]" />
              <span className="text-xs font-bold text-stone-800">Recent Ping Latency Sparkline</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                P95 SLA &lt; 80ms
              </span>
            </div>

            {/* Quick Summary Latency */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-stone-400">Latest:</span>
              <span className="font-bold text-[#03045e] bg-[#caf0f8] px-2 py-0.5 rounded text-[11px]">
                {latestLatency}ms
              </span>
            </div>
          </div>

          {/* SVG Sparkline Area */}
          <div className="relative bg-stone-50/80 rounded-xl border border-stone-200/90 p-2.5 overflow-hidden">
            {totalEvents === 0 ? (
              <div className="h-[68px] flex items-center justify-center text-xs text-stone-400 space-x-1.5">
                <Clock className="w-4 h-4 text-stone-300" />
                <span>No ping latency records captured yet</span>
              </div>
            ) : (
              <>
                {/* Active Hover Tooltip Bar */}
                {activePoint && (
                  <div className="absolute top-1.5 left-2 right-2 flex items-center justify-between text-[10px] font-mono bg-stone-900 text-white px-2.5 py-1 rounded-lg shadow-sm z-10 animate-in fade-in duration-100">
                    <span className="font-bold text-[#00d4ff] truncate max-w-[150px]">
                      #{activePoint.idx + 1} {activePoint.log.eventType}
                    </span>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-stone-300">{activePoint.log.timestamp}</span>
                      <span className="font-black text-amber-300">{activePoint.log.latencyMs}ms</span>
                      <span className={activePoint.log.success ? 'text-emerald-400' : 'text-rose-400'}>
                        {activePoint.log.statusCode}
                      </span>
                    </div>
                  </div>
                )}

                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-[68px] overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="latencySparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0077b6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guide Reference Lines */}
                  <line
                    x1={padX}
                    y1={svgHeight / 2}
                    x2={svgWidth - padX}
                    y2={svgHeight / 2}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />

                  {/* Area fill */}
                  {areaD && (
                    <path
                      d={areaD}
                      fill="url(#latencySparklineGrad)"
                    />
                  )}

                  {/* Sparkline curve */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#0077b6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Interactive node points */}
                  {points.map((pt) => {
                    const isHovered = hoveredIndex === pt.idx;
                    return (
                      <g key={pt.idx} className="cursor-pointer">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 6 : 3.5}
                          fill={pt.log.success ? (isHovered ? '#0077b6' : '#03045e') : '#ef4444'}
                          stroke="#ffffff"
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          onMouseEnter={() => setHoveredIndex(pt.idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Micro baseline indicators */}
                <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 mt-1 px-1">
                  <span>Earliest: {chronologicalLogs[0]?.latencyMs ?? 0}ms</span>
                  <span className="text-stone-500 font-bold">Sparkline Trend</span>
                  <span>Latest: {latestLatency}ms</span>
                </div>
              </>
            )}
          </div>

          {/* Stats Bar (Avg, Min, Max, SLA) */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-stone-50 rounded-xl p-2 border border-stone-200/80">
              <div className="text-[10px] text-stone-500 uppercase font-sans font-bold">Avg Ping</div>
              <div className="text-stone-900 font-black text-sm mt-0.5">{avgLatency}ms</div>
            </div>

            <div className="bg-stone-50 rounded-xl p-2 border border-stone-200/80">
              <div className="text-[10px] text-stone-500 uppercase font-sans font-bold">Min Ping</div>
              <div className="text-emerald-700 font-black text-sm mt-0.5">{minLatency}ms</div>
            </div>

            <div className="bg-stone-50 rounded-xl p-2 border border-stone-200/80">
              <div className="text-[10px] text-stone-500 uppercase font-sans font-bold">Max Ping</div>
              <div className="text-amber-700 font-black text-sm mt-0.5">{maxLatency}ms</div>
            </div>

            <div className="bg-[#caf0f8]/50 rounded-xl p-2 border border-[#90e0ef]/70">
              <div className="text-[10px] text-[#0077b6] uppercase font-sans font-bold">Throughput</div>
              <div className="text-[#03045e] font-black text-sm mt-0.5">
                {totalEvents > 0 ? `${(1000 / Math.max(avgLatency, 1)).toFixed(1)}/s` : '0/s'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
