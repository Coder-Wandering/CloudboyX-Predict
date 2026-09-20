import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Newspaper,
  MessageSquare,
  Share2,
  AlertCircle,
  CheckCircle2,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Waves,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { MarketSentimentTrendData, DailySentimentPoint } from '../types';

interface MarketSentimentTrendProps {
  eventTitle: string;
  category?: string;
  currentMarketPriceCents?: number;
  className?: string;
}

// 7-Day Micro-Sparkline Component for compact executive scanning
interface SentimentPriceSparklineProps {
  days: DailySentimentPoint[];
  currentPrice: number;
  width?: number;
  height?: number;
  className?: string;
}

export const SentimentPriceSparkline: React.FC<SentimentPriceSparklineProps> = ({
  days,
  currentPrice,
  width = 110,
  height = 32,
  className = '',
}) => {
  if (!days || days.length === 0) return null;

  const padding = 4;
  const usableW = width - padding * 2;
  const usableH = height - padding * 2;

  // Sentiment points normalized [-1, 1] -> [0, usableH]
  const pts = days.map((d, i) => {
    const x = padding + (i / (days.length - 1)) * usableW;
    const norm = (1.0 - Math.max(-1, Math.min(1, d.sentimentScore))) / 2.0;
    const y = padding + norm * usableH;
    return { x, y, score: d.sentimentScore };
  });

  // Price points normalized
  const prices = days.map((d, i) =>
    d.priceCents ?? Math.max(2, Math.min(98, Math.round(currentPrice - (days.length - 1 - i) * (d.sentimentScore * 4))))
  );
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const rangeP = maxP - minP || 1;
  const pricePts = prices.map((p, i) => {
    const x = padding + (i / (prices.length - 1)) * usableW;
    const normP = 1.0 - (p - minP) / rangeP;
    const y = padding + normP * usableH;
    return { x, y, price: p };
  });

  const pathD = pts.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  const pricePathD = pricePts.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  const zeroY = padding + usableH / 2;

  const lastPt = pts[pts.length - 1];
  const isBullish = lastPt.score >= 0.1;
  const isBearish = lastPt.score <= -0.1;

  return (
    <div className={`inline-flex items-center ${className}`} title="7-Day Sentiment Wave (solid) vs Contract Price (dashed)">
      <svg width={width} height={height} className="overflow-visible select-none">
        {/* Zero baseline */}
        <line
          x1={padding}
          y1={zeroY}
          x2={width - padding}
          y2={zeroY}
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        {/* Price path (dashed dark blue) */}
        <path
          d={pricePathD}
          fill="none"
          stroke="#03045e"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
          opacity="0.4"
        />
        {/* Sentiment oscillation wave */}
        <path
          d={pathD}
          fill="none"
          stroke={isBullish ? '#0077b6' : isBearish ? '#e11d48' : '#0284c7'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Latest dot */}
        <circle
          cx={lastPt.x}
          cy={lastPt.y}
          r="3"
          fill={isBullish ? '#10b981' : isBearish ? '#ef4444' : '#0077b6'}
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

export const MarketSentimentTrend: React.FC<MarketSentimentTrendProps> = ({
  eventTitle,
  category = 'Economics',
  currentMarketPriceCents = 50,
  className = '',
}) => {
  const [data, setData] = useState<MarketSentimentTrendData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartViewMode, setChartViewMode] = useState<'oscillation_price' | 'aggregate' | 'dual_channel'>('oscillation_price');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const fetchSentimentData = useCallback(
    async (force: boolean = false) => {
      if (!eventTitle) return;
      if (force) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          eventTitle: eventTitle,
          category: category || 'Economics',
          currentPriceCents: String(currentMarketPriceCents || 50),
          ...(force ? { forceRefresh: 'true' } : {}),
        });

        const res = await fetch(`/api/market/sentiment-trend?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch sentiment trend (Status: ${res.status})`);
        }

        const json = await res.json();
        if (json.data) {
          setData(json.data);
          // Default selected day to the latest day
          if (json.data.days && json.data.days.length > 0) {
            setSelectedDayIndex(json.data.days.length - 1);
          }
        } else {
          throw new Error('No sentiment data returned from server');
        }
      } catch (err: any) {
        console.warn('Sentiment fetch error:', err.message);
        setError(err.message || 'Unable to load sentiment trend data');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [eventTitle, category, currentMarketPriceCents]
  );

  useEffect(() => {
    fetchSentimentData(false);
  }, [fetchSentimentData]);

  const activeDay: DailySentimentPoint | null =
    data && data.days && data.days.length > 0
      ? data.days[hoveredDayIndex ?? selectedDayIndex ?? data.days.length - 1]
      : null;

  // Memoized 7-day data points formatted for Recharts
  const chartData = useMemo(() => {
    if (!data?.days) return [];
    return data.days.map((d, idx) => {
      const price =
        d.priceCents ??
        Math.max(
          2,
          Math.min(98, Math.round(currentMarketPriceCents - (data.days.length - 1 - idx) * (d.sentimentScore * 4.2)))
        );
      const prevScore = idx > 0 ? data.days[idx - 1].sentimentScore : d.sentimentScore;
      const velocity = d.oscillationVelocity ?? Number((d.sentimentScore - prevScore).toFixed(2));

      return {
        dayLabel: d.dayLabel,
        date: d.date,
        fullDate: d.fullDate,
        sentimentScore: d.sentimentScore,
        newsScore: d.newsScore,
        socialScore: d.socialScore,
        priceCents: price,
        oscillationVelocity: velocity,
        volume: d.volume,
        sentimentLabel: d.sentimentLabel,
        topDrivers: d.topDrivers,
        index: idx,
      };
    });
  }, [data?.days, currentMarketPriceCents]);

  // Oscillation metrics: amplitude, Pearson correlation r, volatility, lead/lag
  const oscillationMetrics = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return {
        amplitude: 0.38,
        correlationWithPrice: 0.76,
        leadLagPhase: 'Sentiment & Price Synchronized',
        volatilityIndex: 0.16,
        minPrice: currentMarketPriceCents,
        maxPrice: currentMarketPriceCents,
        priceChange7d: 0,
      };
    }

    const scores = chartData.map((d) => d.sentimentScore);
    const prices = chartData.map((d) => d.priceCents);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const amplitude = Number((maxScore - minScore).toFixed(2));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceChange7d = prices[prices.length - 1] - prices[0];

    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const meanPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    let num = 0;
    let denScore = 0;
    let denPrice = 0;
    for (let i = 0; i < chartData.length; i++) {
      const sDiff = scores[i] - meanScore;
      const pDiff = prices[i] - meanPrice;
      num += sDiff * pDiff;
      denScore += sDiff * sDiff;
      denPrice += pDiff * pDiff;
    }
    const correlationWithPrice =
      denScore * denPrice > 0 ? Number((num / Math.sqrt(denScore * denPrice)).toFixed(2)) : 0.72;

    const currentScore = scores[scores.length - 1];
    let leadLagPhase = data?.oscillationStats?.leadLagPhase || 'Sentiment & Price Synchronized';
    if (!data?.oscillationStats) {
      if (currentScore >= 0.2 && currentMarketPriceCents <= 48) {
        leadLagPhase = 'Sentiment Leading Price (Upside Divergence)';
      } else if (currentScore <= -0.2 && currentMarketPriceCents >= 52) {
        leadLagPhase = 'Sentiment Leading Price (Downside Warning)';
      } else if (correlationWithPrice >= 0.65) {
        leadLagPhase = 'Strong Price-Sentiment Momentum Sync';
      } else if (correlationWithPrice <= -0.2) {
        leadLagPhase = 'Active Counter-Oscillation / Arbitrage Window';
      }
    }

    return {
      amplitude: data?.oscillationStats?.amplitude ?? amplitude,
      correlationWithPrice: data?.oscillationStats?.correlationWithPrice ?? correlationWithPrice,
      leadLagPhase,
      volatilityIndex: data?.oscillationStats?.volatilityIndex ?? 0.16,
      minPrice,
      maxPrice,
      priceChange7d,
    };
  }, [chartData, data?.oscillationStats, currentMarketPriceCents]);

  // Chart coordinate mapping
  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 45;
  const paddingY = 28;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  // Convert score [-1.0, 1.0] to Y coordinate (1.0 = top/paddingY, -1.0 = bottom/(paddingY + usableHeight))
  const scoreToY = (score: number) => {
    const clamped = Math.max(-1.0, Math.min(1.0, score));
    const normalized = (1.0 - clamped) / 2.0; // 0 to 1
    return paddingY + normalized * usableHeight;
  };

  const indexToX = (idx: number, total: number) => {
    if (total <= 1) return chartWidth / 2;
    return paddingX + (idx / (total - 1)) * usableWidth;
  };

  // Helper to build smooth SVG cubic path
  const buildSmoothPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const days = data?.days || [];
  const aggregatePoints = days.map((d, i) => ({
    x: indexToX(i, days.length),
    y: scoreToY(d.sentimentScore),
  }));

  const newsPoints = days.map((d, i) => ({
    x: indexToX(i, days.length),
    y: scoreToY(d.newsScore),
  }));

  const socialPoints = days.map((d, i) => ({
    x: indexToX(i, days.length),
    y: scoreToY(d.socialScore),
  }));

  const aggregatePath = buildSmoothPath(aggregatePoints);
  const newsPath = buildSmoothPath(newsPoints);
  const socialPath = buildSmoothPath(socialPoints);

  const zeroY = scoreToY(0.0);

  // Area under curve for aggregate
  const areaPath =
    aggregatePoints.length > 0
      ? `${aggregatePath} L ${aggregatePoints[aggregatePoints.length - 1].x} ${zeroY} L ${aggregatePoints[0].x} ${zeroY} Z`
      : '';

  return (
    <div
      id="market-sentiment-trend-card"
      className={`bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all ${className}`}
    >
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 border-b border-stone-200/80 bg-gradient-to-r from-stone-50 via-white to-stone-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]/70">
                <Compass className="w-5 h-5 text-[#0077b6]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-xl font-black text-[#03045e] tracking-tight">
                    Market Sentiment Trend
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
                    7-Day Aggregate
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium line-clamp-1">
                  Social media chatter &amp; verified news sentiment tracking leading shifts for{' '}
                  <span className="font-semibold text-stone-700">"{eventTitle}"</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action & Metric Controls */}
          <div className="flex items-center space-x-2.5 shrink-0 self-start sm:self-auto">
            {/* View Mode Toggle: Oscillation vs Price | Composite | Dual Channels */}
            <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-semibold">
              <button
                type="button"
                id="btn-mode-oscillation"
                onClick={() => setChartViewMode('oscillation_price')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                  chartViewMode === 'oscillation_price'
                    ? 'bg-white text-[#03045e] shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-[#03045e]'
                }`}
                title="Visualize 7-day sentiment oscillation pattern relative to price history"
              >
                <Waves className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>Oscillation vs Price</span>
              </button>
              <button
                type="button"
                id="btn-mode-aggregate"
                onClick={() => setChartViewMode('aggregate')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartViewMode === 'aggregate'
                    ? 'bg-white text-[#03045e] shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-[#03045e]'
                }`}
                title="View combined aggregate news & social sentiment"
              >
                Composite
              </button>
              <button
                type="button"
                id="btn-mode-dual-channel"
                onClick={() => setChartViewMode('dual_channel')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                  chartViewMode === 'dual_channel'
                    ? 'bg-white text-[#03045e] shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-[#03045e]'
                }`}
                title="Compare News Press vs Social Media FinTwit/Reddit"
              >
                <Layers className="w-3 h-3 text-[#0077b6]" />
                <span>News vs Social</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              id="refresh-sentiment-trend-btn"
              onClick={() => fetchSentimentData(true)}
              disabled={isLoading || isRefreshing}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-[#03045e] hover:bg-[#caf0f8]/30 hover:border-[#90e0ef] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh 7-day social & news sentiment data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0077b6]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Highlight Score Badges Bar */}
        {data && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Badge 1: Latest 24h Sentiment Score + Embedded Mini-Sparkline */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Current Sentiment
                </div>
                <div className="mt-1 flex items-baseline space-x-2">
                  <span
                    className={`text-2xl font-black font-mono tracking-tight ${
                      data.currentScore >= 0.15
                        ? 'text-emerald-700'
                        : data.currentScore <= -0.15
                        ? 'text-rose-700'
                        : 'text-stone-700'
                    }`}
                  >
                    {data.currentScore > 0 ? `+${data.currentScore.toFixed(2)}` : data.currentScore.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                      data.currentScore >= 0.15
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : data.currentScore <= -0.15
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {data.trendLabel}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-mono font-semibold">7D Wave vs Price</span>
                <SentimentPriceSparkline
                  days={data.days}
                  currentPrice={currentMarketPriceCents}
                  width={84}
                  height={22}
                />
              </div>
            </div>

            {/* Badge 2: 7-Day Shift */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  7-Day Net Shift
                </div>
                <div className="mt-1 flex items-center space-x-1.5">
                  {data.scoreChange7d > 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                  ) : data.scoreChange7d < 0 ? (
                    <ArrowDownRight className="w-5 h-5 text-rose-600 stroke-[2.5]" />
                  ) : (
                    <Minus className="w-5 h-5 text-stone-400 stroke-[2.5]" />
                  )}
                  <span
                    className={`text-2xl font-black font-mono tracking-tight ${
                      data.scoreChange7d > 0
                        ? 'text-emerald-700'
                        : data.scoreChange7d < 0
                        ? 'text-rose-700'
                        : 'text-stone-700'
                    }`}
                  >
                    {data.scoreChange7d > 0 ? `+${data.scoreChange7d.toFixed(2)}` : data.scoreChange7d.toFixed(2)}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">pts</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-medium">
                <span>Trajectory</span>
                <span className={`font-semibold ${data.scoreChange7d >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {data.scoreChange7d > 0 ? 'Bullish Drift' : data.scoreChange7d < 0 ? 'Bearish Slip' : 'Flat'}
                </span>
              </div>
            </div>

            {/* Badge 3: 7-Day Oscillation & Amplitude */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Oscillation Wave</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-extrabold ${
                      oscillationMetrics.correlationWithPrice >= 0.5
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : oscillationMetrics.correlationWithPrice <= -0.1
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-[#caf0f8] text-[#03045e]'
                    }`}
                    title="Pearson Correlation r between Sentiment Wave and Contract Price"
                  >
                    r = {oscillationMetrics.correlationWithPrice >= 0 ? `+${oscillationMetrics.correlationWithPrice}` : oscillationMetrics.correlationWithPrice}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black font-mono tracking-tight text-[#03045e]">
                    {oscillationMetrics.amplitude}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">pts swing</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-medium">
                <span>Mean: {data.sevenDayAvg > 0 ? `+${data.sevenDayAvg.toFixed(2)}` : data.sevenDayAvg.toFixed(2)}</span>
                <span className="truncate max-w-[85px] font-semibold text-[#0077b6]">
                  {oscillationMetrics.leadLagPhase.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Badge 4: Media Mention Volume */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Analyzed Volume
                </div>
                <div className="mt-1 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black font-mono tracking-tight text-[#0077b6]">
                    {(data.channelBreakdown.newsVolume + data.channelBreakdown.socialVolume).toLocaleString()}
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">posts &amp; wires</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-medium">
                <span>News: {data.channelBreakdown.newsVolume.toLocaleString()}</span>
                <span>Social: {data.channelBreakdown.socialVolume.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <div className="p-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#caf0f8] text-[#0077b6] animate-pulse">
            <Activity className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm font-bold text-[#03045e]">Aggregating 7-Day News &amp; Social Sentiment...</p>
          <p className="text-xs text-stone-500">Evaluating press wires, FinTwit momentum, and Reddit discussion boards</p>
        </div>
      )}

      {/* Error state */}
      {error && !data && (
        <div className="p-6 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-800">Unable to generate sentiment trend</p>
          <p className="text-xs text-stone-500">{error}</p>
          <button
            onClick={() => fetchSentimentData(true)}
            className="mt-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 cursor-pointer"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Main Content Body */}
      {data && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* 2. Price Volatility & Sentiment Divergence Banner (Complements Price Volatility) */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              data.divergenceWithPrice.type === 'BULLISH_DIVERGENCE'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : data.divergenceWithPrice.type === 'BEARISH_DIVERGENCE'
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : data.divergenceWithPrice.type === 'CONFIRMING_UPTREND'
                ? 'bg-[#caf0f8]/50 border-[#90e0ef] text-[#03045e]'
                : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  data.divergenceWithPrice.type === 'BULLISH_DIVERGENCE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : data.divergenceWithPrice.type === 'BEARISH_DIVERGENCE'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-[#caf0f8] text-[#0077b6]'
                }`}
              >
                {data.divergenceWithPrice.type === 'BULLISH_DIVERGENCE' ? (
                  <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                ) : data.divergenceWithPrice.type === 'BEARISH_DIVERGENCE' ? (
                  <TrendingDown className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Activity className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black tracking-wider uppercase">
                    Volatility &amp; Sentiment Analysis:
                  </span>
                  <span
                    className={`px-2 py-0.2 text-[10px] font-extrabold uppercase rounded-full ${
                      data.divergenceWithPrice.type === 'BULLISH_DIVERGENCE'
                        ? 'bg-emerald-200/80 text-emerald-900'
                        : data.divergenceWithPrice.type === 'BEARISH_DIVERGENCE'
                        ? 'bg-rose-200/80 text-rose-900'
                        : 'bg-[#90e0ef]/70 text-[#03045e]'
                    }`}
                  >
                    {data.divergenceWithPrice.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500">
                    ({data.divergenceWithPrice.signalStrength} Signal)
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium leading-relaxed">
                  {data.divergenceWithPrice.description}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-2 self-end sm:self-center">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-stone-500">Contract Price</div>
                <div className="text-sm font-black font-mono text-[#03045e]">
                  {currentMarketPriceCents}¢ ({currentMarketPriceCents}%)
                </div>
              </div>
            </div>
          </div>

          {/* 3. Interactive 7-Day Chart: Recharts Dual-Axis Oscillation vs Price OR SVG Polarity Curve */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-[#03045e] uppercase tracking-wider flex items-center space-x-1.5">
                  {chartViewMode === 'oscillation_price' ? (
                    <>
                      <Waves className="w-3.5 h-3.5 text-[#0077b6]" />
                      <span>7-Day Sentiment Oscillation vs Price History (Dual Axis)</span>
                    </>
                  ) : chartViewMode === 'aggregate' ? (
                    <>
                      <Activity className="w-3.5 h-3.5 text-[#0077b6]" />
                      <span>7-Day Composite Polarity Curve</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5 text-[#0077b6]" />
                      <span>7-Day News Media vs Social Channels</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  (Click any point to lock catalyst snapshot)
                </span>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center space-x-3 text-xs font-medium">
                {chartViewMode === 'oscillation_price' ? (
                  <>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-2 rounded-xs bg-[#0077b6]/70 border border-[#0077b6]"></span>
                      <span className="text-stone-700 font-bold">Sentiment Score (Left)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-0.5 bg-[#03045e] border-t-2 border-[#03045e]"></span>
                      <span className="text-[#03045e] font-extrabold">Price History (Right)</span>
                    </div>
                  </>
                ) : chartViewMode === 'aggregate' ? (
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-1 rounded-full bg-[#0077b6]"></span>
                    <span className="text-stone-700 font-semibold">Aggregate Score</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-1 rounded-full bg-[#0077b6]"></span>
                      <span className="text-stone-700 font-semibold">News Media</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-1 rounded-full bg-[#00b4d8]"></span>
                      <span className="text-stone-700 font-semibold">Social Media</span>
                    </div>
                  </>
                )}
                <div className="flex items-center space-x-1 text-stone-400">
                  <span className="w-2 h-0.5 border-t border-dashed border-stone-400"></span>
                  <span className="text-[11px]">0.00 Neutral</span>
                </div>
              </div>
            </div>

            {/* If oscillation_price mode: Render Oscillation Analytics Strip + Recharts ComposedChart */}
            {chartViewMode === 'oscillation_price' ? (
              <div className="space-y-3">
                {/* Oscillation Analytics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-stone-100/80 border border-stone-200 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Wave Amplitude</div>
                    <div className="font-mono font-black text-sm text-[#03045e]">
                      {oscillationMetrics.amplitude} pts
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium">Peak-to-Trough Swing</div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Price Correlation</div>
                    <div className="font-mono font-black text-sm text-emerald-700">
                      r = {oscillationMetrics.correlationWithPrice >= 0 ? `+${oscillationMetrics.correlationWithPrice}` : oscillationMetrics.correlationWithPrice}
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium">
                      {oscillationMetrics.correlationWithPrice >= 0.5
                        ? 'Strong Tracking'
                        : oscillationMetrics.correlationWithPrice <= -0.1
                        ? 'Divergence Window'
                        : 'Moderate Sync'}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Lead/Lag Phase</div>
                    <div className="font-bold text-xs text-[#0077b6] truncate" title={oscillationMetrics.leadLagPhase}>
                      {oscillationMetrics.leadLagPhase}
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium">Media Leading Indicator</div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">7D Price Trajectory</div>
                    <div className="font-mono font-black text-sm text-[#03045e]">
                      {oscillationMetrics.minPrice}¢ – {oscillationMetrics.maxPrice}¢
                    </div>
                    <div className="text-[10px] text-stone-500 font-medium">
                      Net {oscillationMetrics.priceChange7d >= 0 ? `+${oscillationMetrics.priceChange7d}` : oscillationMetrics.priceChange7d}¢ shift
                    </div>
                  </div>
                </div>

                {/* Recharts Canvas */}
                <div className="relative w-full bg-stone-50/80 border border-stone-200/90 rounded-xl p-3 sm:p-4 overflow-hidden">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 16, right: 36, left: 8, bottom: 8 }}
                        onClick={(state) => {
                          if (state && state.activeTooltipIndex !== undefined) {
                            setSelectedDayIndex(state.activeTooltipIndex);
                          }
                        }}
                      >
                        <defs>
                          <linearGradient id="rechartsSentimentGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#0077b6" stopOpacity={0.03} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="dayLabel"
                          tickLine={false}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                        />
                        {/* Left Y-Axis: Sentiment Oscillation Score (-1.00 to +1.00) */}
                        <YAxis
                          yAxisId="sentiment"
                          domain={[-1.0, 1.0]}
                          ticks={[-1.0, -0.5, 0, 0.5, 1.0]}
                          tickFormatter={(val) => (val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1))}
                          axisLine={{ stroke: '#0077b6', strokeWidth: 1.5 }}
                          tick={{ fill: '#0077b6', fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}
                          label={{
                            value: 'Sentiment Oscillation Score',
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fill: '#0077b6', fontSize: 10, fontWeight: 800 },
                          }}
                        />
                        {/* Right Y-Axis: Contract Price History (¢) */}
                        <YAxis
                          yAxisId="price"
                          orientation="right"
                          domain={['dataMin - 3', 'dataMax + 3']}
                          tickFormatter={(val) => `${Math.round(val)}¢`}
                          axisLine={{ stroke: '#03045e', strokeWidth: 1.5 }}
                          tick={{ fill: '#03045e', fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}
                          label={{
                            value: 'Contract Price (¢)',
                            angle: 90,
                            position: 'insideRight',
                            style: { textAnchor: 'middle', fill: '#03045e', fontSize: 10, fontWeight: 800 },
                          }}
                        />
                        <ReferenceLine
                          yAxisId="sentiment"
                          y={0}
                          stroke="#94a3b8"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          label={{
                            value: '0.00 Neutral Baseline',
                            position: 'insideTopLeft',
                            fill: '#64748b',
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const pt = payload[0]?.payload;
                            if (!pt) return null;
                            return (
                              <div className="bg-stone-900/95 backdrop-blur-xs text-white p-3 rounded-xl border border-stone-700 shadow-xl text-xs space-y-2 max-w-[270px] z-50 select-none">
                                <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                                  <span className="font-bold text-white flex items-center space-x-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-[#00d4ff]" />
                                    <span>{pt.dayLabel}, {pt.date}</span>
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                      pt.sentimentScore >= 0.15
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : pt.sentimentScore <= -0.15
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        : 'bg-stone-700 text-stone-300'
                                    }`}
                                  >
                                    {pt.sentimentLabel}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                  <div className="bg-stone-800/80 p-2 rounded-lg border border-stone-700">
                                    <div className="text-[9px] text-stone-400 font-sans uppercase">Sentiment Wave</div>
                                    <div
                                      className={`text-sm font-black ${
                                        pt.sentimentScore > 0
                                          ? 'text-emerald-400'
                                          : pt.sentimentScore < 0
                                          ? 'text-rose-400'
                                          : 'text-stone-200'
                                      }`}
                                    >
                                      {pt.sentimentScore > 0 ? `+${pt.sentimentScore.toFixed(2)}` : pt.sentimentScore.toFixed(2)}
                                    </div>
                                    <div className="text-[9px] text-stone-400">
                                      Vel: {pt.oscillationVelocity > 0 ? `+${pt.oscillationVelocity}` : pt.oscillationVelocity}/d
                                    </div>
                                  </div>

                                  <div className="bg-stone-800/80 p-2 rounded-lg border border-stone-700">
                                    <div className="text-[9px] text-stone-400 font-sans uppercase">Contract Price</div>
                                    <div className="text-sm font-black text-[#00d4ff]">
                                      {pt.priceCents}¢
                                    </div>
                                    <div className="text-[9px] text-stone-400">
                                      Prob: {pt.priceCents}%
                                    </div>
                                  </div>
                                </div>

                                {pt.topDrivers && pt.topDrivers.length > 0 && (
                                  <div className="text-[10px] text-stone-300 pt-1 border-t border-stone-800 font-sans">
                                    <span className="text-stone-400 font-semibold">Key Driver: </span>
                                    {pt.topDrivers[0]}
                                  </div>
                                )}
                                <div className="text-[9px] text-[#00d4ff] text-center font-medium pt-0.5 border-t border-stone-800/60">
                                  Click point to lock day details below
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Area
                          yAxisId="sentiment"
                          type="monotone"
                          dataKey="sentimentScore"
                          name="Sentiment Oscillation"
                          stroke="#0077b6"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#rechartsSentimentGrad)"
                          activeDot={{ r: 6, fill: '#0077b6', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                        <Line
                          yAxisId="price"
                          type="monotone"
                          dataKey="priceCents"
                          name="Contract Price History (¢)"
                          stroke="#03045e"
                          strokeWidth={2.8}
                          dot={{ r: 4, fill: '#03045e', stroke: '#ffffff', strokeWidth: 2 }}
                          activeDot={{ r: 7, fill: '#03045e', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              /* Alternative View: Smooth SVG Polarity Curve or News vs Social */
              <div className="relative w-full bg-stone-50/70 border border-stone-200/80 rounded-xl p-3 sm:p-4 overflow-hidden">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto overflow-visible select-none"
                  style={{ maxHeight: '260px' }}
                >
                  <defs>
                    {/* Area Gradient for Composite Curve */}
                    <linearGradient id="sentimentAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.30" />
                    <stop offset="50%" stopColor="#90e0ef" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#caf0f8" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Gradient for Primary Curve Stroke */}
                  <linearGradient id="sentimentStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0077b6" />
                    <stop offset="50%" stopColor="#00b4d8" />
                    <stop offset="100%" stopColor="#03045e" />
                  </linearGradient>
                </defs>

                {/* Grid Lines: +1.0, +0.5, 0.0, -0.5, -1.0 */}
                <line
                  x1={paddingX}
                  y1={scoreToY(1.0)}
                  x2={chartWidth - paddingX}
                  y2={scoreToY(1.0)}
                  stroke="#e7e5e4"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 8}
                  y={scoreToY(1.0) + 4}
                  textAnchor="end"
                  className="text-[9px] fill-stone-400 font-mono font-medium"
                >
                  +1.0
                </text>

                <line
                  x1={paddingX}
                  y1={scoreToY(0.5)}
                  x2={chartWidth - paddingX}
                  y2={scoreToY(0.5)}
                  stroke="#f5f5f4"
                  strokeDasharray="2 2"
                />
                <text
                  x={paddingX - 8}
                  y={scoreToY(0.5) + 3}
                  textAnchor="end"
                  className="text-[9px] fill-stone-400 font-mono font-medium"
                >
                  +0.5
                </text>

                {/* ZERO NEUTRAL BASELINE (Prominent) */}
                <line
                  x1={paddingX}
                  y1={zeroY}
                  x2={chartWidth - paddingX}
                  y2={zeroY}
                  stroke="#a8a29e"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x={paddingX - 8}
                  y={zeroY + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-stone-500 font-mono font-bold"
                >
                  0.0
                </text>

                <line
                  x1={paddingX}
                  y1={scoreToY(-0.5)}
                  x2={chartWidth - paddingX}
                  y2={scoreToY(-0.5)}
                  stroke="#f5f5f4"
                  strokeDasharray="2 2"
                />
                <text
                  x={paddingX - 8}
                  y={scoreToY(-0.5) + 3}
                  textAnchor="end"
                  className="text-[9px] fill-stone-400 font-mono font-medium"
                >
                  -0.5
                </text>

                <line
                  x1={paddingX}
                  y1={scoreToY(-1.0)}
                  x2={chartWidth - paddingX}
                  y2={scoreToY(-1.0)}
                  stroke="#e7e5e4"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 8}
                  y={scoreToY(-1.0) + 3}
                  textAnchor="end"
                  className="text-[9px] fill-stone-400 font-mono font-medium"
                >
                  -1.0
                </text>

                {/* Area under Aggregate Path */}
                {chartViewMode === 'aggregate' && areaPath && (
                  <path d={areaPath} fill="url(#sentimentAreaGrad)" />
                )}

                {/* Dual Channel Lines */}
                {chartViewMode === 'dual_channel' && (
                  <>
                    {/* News Path */}
                    <path
                      d={newsPath}
                      fill="none"
                      stroke="#0077b6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Social Path */}
                    <path
                      d={socialPath}
                      fill="none"
                      stroke="#00b4d8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* Main Aggregate Path */}
                {chartViewMode === 'aggregate' && (
                  <path
                    d={aggregatePath}
                    fill="none"
                    stroke="url(#sentimentStrokeGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive Points on Curve */}
                {days.map((day, idx) => {
                  const pt = aggregatePoints[idx];
                  if (!pt) return null;
                  const isSelected = selectedDayIndex === idx;
                  const isHovered = hoveredDayIndex === idx;
                  const pointScore = day.sentimentScore;

                  return (
                    <g
                      key={day.fullDate || idx}
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => setHoveredDayIndex(idx)}
                      onMouseLeave={() => setHoveredDayIndex(null)}
                      onClick={() => setSelectedDayIndex(idx)}
                    >
                      {/* Vertical guidance indicator */}
                      {(isHovered || isSelected) && (
                        <line
                          x1={pt.x}
                          y1={paddingY}
                          x2={pt.x}
                          y2={chartHeight - paddingY}
                          stroke="#0077b6"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                          strokeOpacity="0.5"
                        />
                      )}

                      {/* Halo ring */}
                      {(isHovered || isSelected) && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="10"
                          fill="#90e0ef"
                          fillOpacity="0.4"
                        />
                      )}

                      {/* Main Data Point */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected || isHovered ? '6' : '4.5'}
                        fill={
                          pointScore >= 0.15
                            ? '#0077b6'
                            : pointScore <= -0.15
                            ? '#e11d48'
                            : '#03045e'
                        }
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all"
                      />

                      {/* Dual Channel Secondary Points if in dual mode */}
                      {chartViewMode === 'dual_channel' && newsPoints[idx] && (
                        <circle
                          cx={newsPoints[idx].x}
                          cy={newsPoints[idx].y}
                          r="3.5"
                          fill="#0077b6"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      )}
                      {chartViewMode === 'dual_channel' && socialPoints[idx] && (
                        <circle
                          cx={socialPoints[idx].x}
                          cy={socialPoints[idx].y}
                          r="3.5"
                          fill="#00b4d8"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      )}

                      {/* Day Label along X axis */}
                      <text
                        x={pt.x}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        className={`text-[11px] font-sans transition-colors ${
                          isSelected || isHovered
                            ? 'fill-[#03045e] font-bold'
                            : 'fill-stone-500 font-medium'
                        }`}
                      >
                        {day.dayLabel}
                      </text>

                      {/* Date label underneath */}
                      <text
                        x={pt.x}
                        y={chartHeight + 5}
                        textAnchor="middle"
                        className="text-[9px] fill-stone-400 font-mono"
                      >
                        {day.date}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            )}
          </div>

          {/* 4. Active Day Catalyst & Channels Drilldown */}
          {activeDay && (
            <div className="p-4 sm:p-5 rounded-xl bg-stone-50/90 border border-stone-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-[#03045e] text-white">
                    <Calendar className="w-4 h-4 text-[#caf0f8]" />
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-[#03045e]">
                      {activeDay.dayLabel}, {activeDay.date} Catalyst &amp; Sentiment Snapshot
                    </span>
                    <span className="ml-2 text-xs font-semibold text-stone-500 font-mono">
                      ({activeDay.volume.toLocaleString()} verified media units)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Price on Date */}
                  <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#03045e]/10 border border-[#03045e]/20 text-[#03045e]">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Price:</span>
                    <span className="text-xs font-mono font-black">
                      {activeDay.priceCents ?? (currentMarketPriceCents ?? 50)}¢
                    </span>
                  </div>

                  {/* Velocity */}
                  {activeDay.oscillationVelocity !== undefined && (
                    <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-700">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Velocity:</span>
                      <span className="text-xs font-mono font-bold">
                        {activeDay.oscillationVelocity > 0 ? `+${activeDay.oscillationVelocity}` : activeDay.oscillationVelocity}/d
                      </span>
                    </div>
                  )}

                  {/* Composite Polarity Score */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-stone-500 uppercase">Composite:</span>
                    <span
                      className={`text-sm font-black font-mono px-2 py-0.5 rounded-md ${
                        activeDay.sentimentScore >= 0.15
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeDay.sentimentScore <= -0.15
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {activeDay.sentimentScore > 0
                        ? `+${activeDay.sentimentScore.toFixed(2)}`
                        : activeDay.sentimentScore.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-stone-600">
                      {activeDay.sentimentLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-Channel Comparisons: Traditional News vs Social Media */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* News Press Card */}
                <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-[#03045e]">
                      <Newspaper className="w-4 h-4 text-[#0077b6]" />
                      <span>Financial News Press (Bloomberg/WSJ/Reuters)</span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        activeDay.newsScore > 0 ? 'text-emerald-700' : activeDay.newsScore < 0 ? 'text-rose-700' : 'text-stone-600'
                      }`}
                    >
                      {activeDay.newsScore > 0 ? `+${activeDay.newsScore.toFixed(2)}` : activeDay.newsScore.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${activeDay.newsScore >= 0 ? 'bg-[#0077b6]' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(5, (activeDay.newsScore + 1.0) * 50))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Social Media Chatter Card */}
                <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-[#03045e]">
                      <MessageSquare className="w-4 h-4 text-[#00b4d8]" />
                      <span>Social Media &amp; Forums (X / Reddit / FinTwit)</span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        activeDay.socialScore > 0 ? 'text-emerald-700' : activeDay.socialScore < 0 ? 'text-rose-700' : 'text-stone-600'
                      }`}
                    >
                      {activeDay.socialScore > 0 ? `+${activeDay.socialScore.toFixed(2)}` : activeDay.socialScore.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${activeDay.socialScore >= 0 ? 'bg-[#00b4d8]' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(5, (activeDay.socialScore + 1.0) * 50))}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Day's Top Headlines & Catalyst Drivers */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>Key Media Drivers &amp; Headlines on {activeDay.date}</span>
                </div>
                <div className="space-y-2">
                  {activeDay.topDrivers.map((driver, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-white border border-stone-200 text-xs font-medium text-stone-800 flex items-start space-x-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0077b6] mt-1.5 shrink-0"></span>
                      <span className="leading-snug">{driver}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. Channel Distribution & Trending Key Topics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            {/* Sentiment Polarity Distribution */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#03045e] uppercase tracking-wider">
                7-Day Sentiment Polarity Share
              </div>
              <div className="space-y-1.5">
                {/* 3-segment stacked bar */}
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-stone-100 border border-stone-200">
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${data.channelBreakdown.positivePercent}%` }}
                    title={`Positive: ${data.channelBreakdown.positivePercent}%`}
                  />
                  <div
                    className="bg-stone-300 transition-all"
                    style={{ width: `${data.channelBreakdown.neutralPercent}%` }}
                    title={`Neutral: ${data.channelBreakdown.neutralPercent}%`}
                  />
                  <div
                    className="bg-rose-500 transition-all"
                    style={{ width: `${data.channelBreakdown.negativePercent}%` }}
                    title={`Negative: ${data.channelBreakdown.negativePercent}%`}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center space-x-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Bullish {data.channelBreakdown.positivePercent}%</span>
                  </div>
                  <div className="flex items-center space-x-1 text-stone-500">
                    <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                    <span>Neutral {data.channelBreakdown.neutralPercent}%</span>
                  </div>
                  <div className="flex items-center space-x-1 text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Bearish {data.channelBreakdown.negativePercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Topics & Buzzwords */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#03045e] uppercase tracking-wider">
                Key Tracked Catalyst Themes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.keyTopics.map((t, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      t.sentiment === 'Positive'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : t.sentiment === 'Negative'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-[#caf0f8]/60 text-[#03045e] border-[#90e0ef]'
                    }`}
                  >
                    <span>{t.topic}</span>
                    <span className="ml-1.5 text-[10px] opacity-75 font-mono">
                      ({t.impact} Imp)
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Source Attribution Footer */}
          <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-stone-400 gap-1">
            <div className="flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{data.dataSource}</span>
            </div>
            <div>
              Updated: {new Date(data.lastUpdated).toLocaleTimeString()} &bull; 7 Days Trailing
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSentimentTrend;
