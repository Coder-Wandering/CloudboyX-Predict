import React, { useState, useMemo } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Percent,
  Sparkles,
  Shield,
  Activity,
  Award,
  ChevronRight,
  Info,
  CheckCircle,
  SlidersHorizontal,
  BarChart3,
  Flame,
  Zap,
  DollarSign,
  Layers,
  ArrowUpRight,
  Bookmark,
  Check,
  Trash2,
  Scale,
  Clock,
  Wind,
} from 'lucide-react';
import {
  NflPredictionsModelData,
  NflPointsModelData,
  NflPowerRatingsData,
} from '../types';

export interface UnifiedBetSlipItem {
  id: string;
  modelType: 'SPREAD' | 'TOTAL' | 'MONEYLINE';
  matchupTitle: string;
  selection: string;
  marketLine: string;
  modelProjection: string;
  winProbability: number;
  edgePercent: number;
  odds: string;
  units: number;
  addedAt: string;
}

interface NflPredictionsDashboardProps {
  predictionsData: NflPredictionsModelData;
  pointsData?: NflPointsModelData;
  powerRatingsData?: NflPowerRatingsData;
  onSelectProps?: () => void;
  onSelectMatchup?: () => void;
}

export const NflPredictionsDashboard: React.FC<NflPredictionsDashboardProps> = ({
  predictionsData,
  pointsData,
  powerRatingsData,
  onSelectProps,
  onSelectMatchup,
}) => {
  // Model focus filter: ALL, SPREAD, TOTALS, MONEYLINE
  const [activeModelFilter, setActiveModelFilter] = useState<
    'ALL' | 'SPREAD' | 'TOTALS' | 'MONEYLINE'
  >('ALL');

  // Tracked Predictions Paper Slip
  const [trackedPredictions, setTrackedPredictions] = useState<UnifiedBetSlipItem[]>(() => {
    try {
      const saved = localStorage.getItem('nfl_tracked_predictions_slip');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSlipDrawerOpen, setIsSlipDrawerOpen] = useState<boolean>(false);

  const saveTrackedPredictions = (items: UnifiedBetSlipItem[]) => {
    setTrackedPredictions(items);
    try {
      localStorage.setItem('nfl_tracked_predictions_slip', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const handleAddToSlip = (item: Omit<UnifiedBetSlipItem, 'id' | 'addedAt'>) => {
    const existingIndex = trackedPredictions.findIndex(
      (p) => p.selection === item.selection && p.matchupTitle === item.matchupTitle
    );
    if (existingIndex >= 0) {
      setToastMessage(`"${item.selection}" is already in your predictions slip.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const newItem: UnifiedBetSlipItem = {
      ...item,
      id: `pred-slip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newItem, ...trackedPredictions];
    saveTrackedPredictions(updated);
    setToastMessage(`Added "${item.selection}" (${item.modelType}) to simulated predictions slip.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveFromSlip = (id: string) => {
    const updated = trackedPredictions.filter((item) => item.id !== id);
    saveTrackedPredictions(updated);
  };

  const handleClearSlip = () => {
    saveTrackedPredictions([]);
    setToastMessage('Cleared all tracked predictions.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Calculations for Moneyline Expected Value & Kelly
  // Decimal odds conversion helper
  const parseAmericanOdds = (oddsStr: string): number => {
    const num = parseInt(oddsStr.replace('+', ''), 10);
    if (isNaN(num)) return 1.91;
    if (num > 0) return 1 + num / 100;
    return 1 + 100 / Math.abs(num);
  };

  const awayDecimal = parseAmericanOdds(predictionsData.moneylineAway);
  const homeDecimal = parseAmericanOdds(predictionsData.moneylineHome);

  const awayWinProb = predictionsData.moneylineWinProbAway / 100;
  const homeWinProb = predictionsData.moneylineWinProbHome / 100;

  // EV = (WinProb * (Decimal - 1)) - (1 - WinProb)
  const awayEV = awayWinProb * (awayDecimal - 1) - (1 - awayWinProb);
  const homeEV = homeWinProb * (homeDecimal - 1) - (1 - homeWinProb);

  // Kelly Fraction: f* = (p*b - q) / b where b = decimal - 1
  const calculateQuarterKelly = (prob: number, decimal: number): number => {
    const b = decimal - 1;
    if (b <= 0) return 0;
    const fullKelly = (prob * b - (1 - prob)) / b;
    return Math.max(0, fullKelly * 0.25); // Quarter Kelly
  };

  const homeQuarterKelly = calculateQuarterKelly(homeWinProb, homeDecimal);
  const awayQuarterKelly = calculateQuarterKelly(awayWinProb, awayDecimal);

  return (
    <div id="nfl-unified-predictions-dashboard" className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-stone-900 text-white shadow-2xl flex items-center space-x-3 border border-stone-700 animate-in fade-in duration-200 max-w-md">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Master Unified Predictions Hub */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-900 uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-blue-700" />
                <span>Unified Predictions Aggregator</span>
              </span>
              <span className="text-xs font-bold text-stone-500">
                10,000 Monte Carlo Iterations &bull; Multi-Model Synthesis
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#03045e] mt-1 tracking-tight">
              Aggregate Predictions Dashboard: {predictionsData.awayTeam.city} at {predictionsData.homeTeam.city}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Consolidates three core econometric betting models into a single comparative command center: the Point Spread Model, the Over/Under Totals Model, and the Moneyline Win Projections Model.
            </p>
          </div>

          {/* Paper Predictions Slip Status */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsSlipDrawerOpen(!isSlipDrawerOpen)}
              className="p-3.5 rounded-xl bg-stone-50 hover:bg-[#caf0f8]/40 border border-stone-200 hover:border-[#0077b6] text-stone-800 transition-all cursor-pointer flex items-center space-x-2.5 shadow-2xs"
            >
              <Bookmark className="w-4 h-4 text-[#0077b6]" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-stone-500">Tracked Picks Slip</div>
                <div className="text-xs font-black text-[#03045e]">
                  {trackedPredictions.length} {trackedPredictions.length === 1 ? 'Pick' : 'Picks'} Saved
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Projected Final Scoreboard */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-stone-900 text-white shadow-md">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#90e0ef] text-center mb-3">
            Algorithmic Mean Final Score (Simulated Median Outcome)
          </div>

          <div className="grid grid-cols-5 items-center max-w-xl mx-auto">
            {/* Away Team */}
            <div className="col-span-2 text-center">
              <div className="text-xs sm:text-sm font-bold text-stone-400">
                {predictionsData.awayTeam.city}
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {predictionsData.awayTeam.name}
              </div>
              <div className="text-3xl sm:text-5xl font-black font-mono text-[#00d4ff] mt-1">
                {Math.round(predictionsData.projectedScoreAway)}
              </div>
              <div className="text-[11px] font-mono text-stone-400 mt-1">
                Raw Mean: {predictionsData.projectedScoreAway.toFixed(1)} pts
              </div>
            </div>

            {/* Final / VS Divider */}
            <div className="text-center">
              <div className="text-xs font-black text-stone-500 uppercase">FINAL</div>
              <div className="text-sm font-mono font-bold text-stone-400 my-1">&ndash;</div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-[#90e0ef] border border-stone-700">
                SIM
              </span>
            </div>

            {/* Home Team */}
            <div className="col-span-2 text-center">
              <div className="text-xs sm:text-sm font-bold text-stone-400">
                {predictionsData.homeTeam.city}
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {predictionsData.homeTeam.name}
              </div>
              <div className="text-3xl sm:text-5xl font-black font-mono text-[#00d4ff] mt-1">
                {Math.round(predictionsData.projectedScoreHome)}
              </div>
              <div className="text-[11px] font-mono text-stone-400 mt-1">
                Raw Mean: {predictionsData.projectedScoreHome.toFixed(1)} pts
              </div>
            </div>
          </div>
        </div>

        {/* Executive Multi-Model Summary Cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Spread Executive Pill */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  Point Spread Model
                </span>
                <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                  <Flame className="w-2.5 h-2.5 text-rose-600 fill-rose-600 animate-pulse" />
                  <span>HOT</span>
                </span>
              </div>
              <span className="text-xs font-bold text-amber-500">
                {'★'.repeat(predictionsData.spreadConfidenceStars)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-black text-[#03045e]">
                {predictionsData.spreadPick}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                +{predictionsData.spreadCoverEdge.toFixed(1)} pt edge
              </span>
            </div>
            <div className="text-[11px] text-stone-500">
              Model: {predictionsData.spreadModel} vs Consensus: {predictionsData.spreadConsensus}
            </div>
          </div>

          {/* 2. Over/Under Totals Executive Pill */}
          {pointsData && (
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                    Over/Under Totals Model
                  </span>
                  <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <TrendingUp className="w-2.5 h-2.5 text-emerald-700" />
                    <span>TRENDING</span>
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-500">
                  {'★'.repeat(pointsData.confidenceStars)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-black text-[#03045e]">
                  {pointsData.modelRecommendation} {pointsData.consensusTotal}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  +{pointsData.edgePercent.toFixed(1)}% edge
                </span>
              </div>
              <div className="text-[11px] text-stone-500">
                Projected Total: {pointsData.modelProjectedTotal} pts ({pointsData.totalDifferential > 0 ? `+${pointsData.totalDifferential}` : pointsData.totalDifferential})
              </div>
            </div>
          )}

          {/* 3. Moneyline Executive Pill */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  Moneyline Projections Model
                </span>
                <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  <Flame className="w-2.5 h-2.5 text-purple-600 fill-purple-600" />
                  <span>HOT</span>
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                +EV
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-black text-[#03045e]">
                {predictionsData.homeTeam.code} Win: {predictionsData.moneylineWinProbHome.toFixed(1)}%
              </span>
              <span className="text-xs font-bold text-stone-600">
                {predictionsData.moneylineHome}
              </span>
            </div>
            <div className="text-[11px] text-stone-500">
              Away: {predictionsData.awayTeam.code} {predictionsData.moneylineWinProbAway.toFixed(1)}% ({predictionsData.moneylineAway})
            </div>
          </div>
        </div>

        {/* 24-Hour High Activity Shifts Ticker */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/80 via-rose-50/70 to-blue-50/80 border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5 shadow-2xs">
              <Flame className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-2xs">
                  24h Market Activity Alert
                </span>
                <span className="text-xs font-black text-stone-900">
                  Sharp Line Compression &amp; Probability Swings Detected
                </span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {predictionsData.recentActivityShift?.headline || 'Significant Spread Compression (+1.5 pts)'} &bull;{' '}
                {pointsData?.recentActivityShift?.headline || 'Heavy Sharp Over Flow (+2.0 pts)'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
            <span className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-[11px] font-mono font-bold text-stone-600">
              {predictionsData.recentActivityShift?.timestamp24h || '24h Monitor Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Model Focus Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0077b6]" />
            <span className="text-xs font-bold text-[#03045e] uppercase tracking-wider">
              Focus Predictive Model View:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveModelFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeModelFilter === 'ALL'
                  ? 'bg-[#03045e] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Unified Models (Dashboard)
            </button>
            <button
              type="button"
              onClick={() => setActiveModelFilter('SPREAD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeModelFilter === 'SPREAD'
                  ? 'bg-[#03045e] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Point Spread Model</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-500 text-white">
                HOT
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModelFilter('TOTALS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeModelFilter === 'TOTALS'
                  ? 'bg-[#03045e] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Over/Under Totals Model</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-600 text-white">
                TRENDING
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModelFilter('MONEYLINE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeModelFilter === 'MONEYLINE'
                  ? 'bg-[#03045e] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Moneyline Projections</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-600 text-white">
                HOT
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: POINT SPREAD MODEL */}
      {(activeModelFilter === 'ALL' || activeModelFilter === 'SPREAD') && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-blue-100 text-[#03045e]">
                <Scale className="w-4 h-4 text-[#0077b6]" />
              </span>
              <div>
                <h4 className="text-base font-black text-[#03045e]">
                  1. Point Spread Model (Against The Spread &bull; ATS)
                </h4>
                <p className="text-xs text-stone-500">
                  Calculates true spread differential against market consensus using possession efficiency &amp; margin decay.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleAddToSlip({
                  modelType: 'SPREAD',
                  matchupTitle: predictionsData.matchupTitle,
                  selection: predictionsData.spreadPick,
                  marketLine: predictionsData.spreadConsensus,
                  modelProjection: predictionsData.spreadModel,
                  winProbability:
                    predictionsData.homeCoverProbability > predictionsData.awayCoverProbability
                      ? predictionsData.homeCoverProbability
                      : predictionsData.awayCoverProbability,
                  edgePercent: predictionsData.spreadCoverEdge * 10,
                  odds: '-110',
                  units: predictionsData.spreadConfidenceStars,
                })
              }
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#caf0f8] hover:bg-[#90e0ef] text-[#03045e] transition-colors cursor-pointer shrink-0"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#0077b6]" />
              <span>Track Spread Pick</span>
            </button>
          </div>

          {/* 24h Spread Activity Shift Callout */}
          {predictionsData.spreadActivityShift && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-2xs shrink-0">
                  <Flame className="w-2.5 h-2.5 fill-amber-300 text-amber-300 animate-pulse" />
                  <span>HOT: 24h Shift</span>
                </span>
                <span className="text-xs font-black text-rose-950">
                  {predictionsData.spreadActivityShift.headline}: {predictionsData.spreadActivityShift.shiftValue}
                </span>
              </div>
              <div className="text-[11px] text-rose-800 font-medium flex items-center space-x-2">
                <span>{predictionsData.spreadActivityShift.volumeNote}</span>
                <span className="text-rose-300">&bull;</span>
                <span className="font-semibold">{predictionsData.spreadActivityShift.timestamp24h}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Model Spread vs Market */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Consensus Market Spread
              </div>
              <div className="text-2xl font-black font-mono text-stone-900">
                {predictionsData.spreadConsensus}
              </div>
              <div className="text-xs text-stone-500">
                Opening consensus across major sportsbooks
              </div>
            </div>

            {/* Model Projected Spread */}
            <div className="p-4 rounded-xl bg-[#caf0f8]/50 border border-[#90e0ef] space-y-1">
              <div className="text-[10px] font-bold text-[#0077b6] uppercase tracking-wider">
                CloudboyX Projected Spread
              </div>
              <div className="text-2xl font-black font-mono text-[#03045e]">
                {predictionsData.spreadModel}
              </div>
              <div className="text-xs font-bold text-emerald-700">
                Spread Edge: +{predictionsData.spreadCoverEdge.toFixed(1)} points
              </div>
            </div>

            {/* Cover Probability Comparison */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Cover Probability (10k Sims)
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-bold text-stone-800">{predictionsData.awayTeam.code}:</span>
                <span className="font-mono font-black text-stone-900">
                  {predictionsData.awayCoverProbability.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full bg-[#0077b6]"
                  style={{ width: `${predictionsData.awayCoverProbability}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">{predictionsData.homeTeam.code}:</span>
                <span className="font-mono font-black text-[#03045e]">
                  {predictionsData.homeCoverProbability.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-[#0077b6] shrink-0" />
              <span>
                <strong>Key Number Impact:</strong> The model spread sits through the critical 3-point margin hook ({predictionsData.spreadModel} vs {predictionsData.spreadConsensus}), maximizing cover equity in one-possession outcomes.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: OVER/UNDER TOTALS MODEL */}
      {pointsData && (activeModelFilter === 'ALL' || activeModelFilter === 'TOTALS') && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-900">
                <Activity className="w-4 h-4 text-emerald-700" />
              </span>
              <div>
                <h4 className="text-base font-black text-[#03045e]">
                  2. Over/Under Totals Model (Pace &amp; Possession Pacing)
                </h4>
                <p className="text-xs text-stone-500">
                  Simulates drive-by-drive point expected values calibrated by neutral-situation tempo and weather aerodynamics.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleAddToSlip({
                  modelType: 'TOTAL',
                  matchupTitle: pointsData.matchupTitle,
                  selection: `${pointsData.modelRecommendation} ${pointsData.consensusTotal}`,
                  marketLine: `${pointsData.consensusTotal} pts`,
                  modelProjection: `${pointsData.modelProjectedTotal} pts`,
                  winProbability:
                    pointsData.modelRecommendation === 'OVER'
                      ? pointsData.overProbability
                      : pointsData.underProbability,
                  edgePercent: pointsData.edgePercent,
                  odds: '-110',
                  units: pointsData.confidenceStars,
                })
              }
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors cursor-pointer shrink-0"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
              <span>Track Totals Pick</span>
            </button>
          </div>

          {/* 24h Totals Activity Shift Callout */}
          {pointsData.recentActivityShift && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs shrink-0">
                  <TrendingUp className="w-2.5 h-2.5 text-white" />
                  <span>TRENDING: 24h Shift</span>
                </span>
                <span className="text-xs font-black text-emerald-950">
                  {pointsData.recentActivityShift.headline}: {pointsData.recentActivityShift.shiftValue}
                </span>
              </div>
              <div className="text-[11px] text-emerald-800 font-medium flex items-center space-x-2">
                <span>{pointsData.recentActivityShift.volumeNote}</span>
                <span className="text-emerald-300">&bull;</span>
                <span className="font-semibold">{pointsData.recentActivityShift.timestamp24h}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Consensus Line */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Consensus Total Line
              </div>
              <div className="text-2xl font-black font-mono text-stone-900">
                {pointsData.consensusTotal} pts
              </div>
              <div className="text-xs text-stone-500">
                Over/Under Market Standard
              </div>
            </div>

            {/* Model Projected Line */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
              <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                Projected Game Total
              </div>
              <div className="text-2xl font-black font-mono text-emerald-900">
                {pointsData.modelProjectedTotal} pts
              </div>
              <div className="text-xs font-bold text-emerald-700">
                Differential: {pointsData.totalDifferential > 0 ? `+${pointsData.totalDifferential}` : pointsData.totalDifferential} pts ({pointsData.modelRecommendation})
              </div>
            </div>

            {/* Implied Team Scores */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Implied Team Scores
              </div>
              <div className="text-xs font-mono font-bold text-[#03045e] space-y-1 mt-1">
                <div>{pointsData.awayTeam.code}: {pointsData.impliedTeamTotals.awayImplied} pts</div>
                <div>{pointsData.homeTeam.code}: {pointsData.impliedTeamTotals.homeImplied} pts</div>
              </div>
              <div className="text-[10px] text-stone-500 pt-1">
                Derived from market spread &amp; total
              </div>
            </div>

            {/* Pace & Tempo Profile */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Snap Tempo &amp; Weather
              </div>
              <div className="text-xs font-bold text-stone-800">
                {pointsData.paceMetrics.projectedTotalPlays} Total Offensive Plays
              </div>
              <div className="text-[11px] text-stone-600 flex items-center space-x-1 mt-1">
                <Wind className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>{pointsData.weatherFactor.windSpeedMph} mph wind &bull; {pointsData.weatherFactor.temperature}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MONEYLINE PROJECTIONS MODEL */}
      {(activeModelFilter === 'ALL' || activeModelFilter === 'MONEYLINE') && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-900">
                <DollarSign className="w-4 h-4 text-purple-700" />
              </span>
              <div>
                <h4 className="text-base font-black text-[#03045e]">
                  3. Moneyline Projections Model (Expected Value &amp; Kelly Sizing)
                </h4>
                <p className="text-xs text-stone-500">
                  Compares true mathematical win likelihood against sportsbook breakeven odds to detect +EV edges.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleAddToSlip({
                  modelType: 'MONEYLINE',
                  matchupTitle: predictionsData.matchupTitle,
                  selection: `${predictionsData.homeTeam.city} ${predictionsData.homeTeam.name} Moneyline`,
                  marketLine: predictionsData.moneylineHome,
                  modelProjection: `${predictionsData.moneylineWinProbHome.toFixed(1)}% Win Prob`,
                  winProbability: predictionsData.moneylineWinProbHome,
                  edgePercent: predictionsData.moneylineEdgeHome,
                  odds: predictionsData.moneylineHome,
                  units: 1,
                })
              }
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors cursor-pointer shrink-0"
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-700" />
              <span>Track Moneyline Pick</span>
            </button>
          </div>

          {/* 24h Moneyline Activity Shift Callout */}
          {predictionsData.moneylineActivityShift && (
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-2xs shrink-0">
                  <Flame className="w-2.5 h-2.5 fill-amber-200 text-amber-200" />
                  <span>HOT: 24h Surge</span>
                </span>
                <span className="text-xs font-black text-purple-950">
                  {predictionsData.moneylineActivityShift.headline}: {predictionsData.moneylineActivityShift.shiftValue}
                </span>
              </div>
              <div className="text-[11px] text-purple-800 font-medium flex items-center space-x-2">
                <span>{predictionsData.moneylineActivityShift.volumeNote}</span>
                <span className="text-purple-300">&bull;</span>
                <span className="font-semibold">{predictionsData.moneylineActivityShift.timestamp24h}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Away Team Moneyline Box */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-800 uppercase">
                  {predictionsData.awayTeam.city} {predictionsData.awayTeam.name} ({predictionsData.awayTeam.code})
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-stone-200 text-stone-800">
                  Market: {predictionsData.moneylineAway}
                </span>
              </div>

              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black font-mono text-[#03045e]">
                  {predictionsData.moneylineWinProbAway.toFixed(1)}%
                </span>
                <span className="text-xs text-stone-500 font-semibold">
                  Model Win Probability
                </span>
              </div>

              <div className="text-xs text-stone-600 pt-2 border-t border-stone-200 space-y-1">
                <div className="flex justify-between">
                  <span>Expected Value (+EV):</span>
                  <span className={`font-mono font-bold ${awayEV > 0 ? 'text-emerald-700' : 'text-stone-500'}`}>
                    {(awayEV * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Quarter Kelly Fraction:</span>
                  <span className="font-mono font-bold text-stone-700">
                    {(awayQuarterKelly * 100).toFixed(2)}% Bankroll
                  </span>
                </div>
              </div>
            </div>

            {/* Home Team Moneyline Box */}
            <div className="p-4 rounded-xl bg-[#caf0f8]/40 border border-[#90e0ef] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#03045e] uppercase">
                  {predictionsData.homeTeam.city} {predictionsData.homeTeam.name} ({predictionsData.homeTeam.code})
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#0077b6] text-white">
                  Market: {predictionsData.moneylineHome}
                </span>
              </div>

              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black font-mono text-[#03045e]">
                  {predictionsData.moneylineWinProbHome.toFixed(1)}%
                </span>
                <span className="text-xs text-[#0077b6] font-semibold">
                  Model Win Probability
                </span>
              </div>

              <div className="text-xs text-stone-600 pt-2 border-t border-stone-200/60 space-y-1">
                <div className="flex justify-between">
                  <span>Expected Value (+EV):</span>
                  <span className={`font-mono font-bold ${homeEV > 0 ? 'text-emerald-700' : 'text-stone-500'}`}>
                    {(homeEV * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Quarter Kelly Fraction:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {(homeQuarterKelly * 100).toFixed(2)}% Bankroll
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: UNIFIED COMPARATIVE MODEL BOARD & SIGNALS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#0077b6]" />
            <h4 className="text-base font-black text-[#03045e]">
              Cross-Platform Consensus Signals Matrix
            </h4>
          </div>
          <span className="text-[11px] font-bold text-stone-400 uppercase">
            Model Validation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {predictionsData.consensusSignals.map((signal, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  {signal.source}
                </div>
                <div className="text-sm font-black text-[#03045e] mt-1">
                  {signal.pick}
                </div>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-700 mt-2">
                {signal.confidence}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: SIMULATED MARGIN OF VICTORY DISTRIBUTION */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <h4 className="text-sm sm:text-base font-black text-[#03045e]">
          10,000 Monte Carlo Simulations: Margin of Victory Distribution
        </h4>
        <p className="text-xs text-stone-500">
          Probability curve across final score point differentials.
        </p>

        <div className="space-y-2.5 pt-2">
          {predictionsData.keyOutcomeDistributions.map((dist, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">{dist.marginRange}</span>
                <span className="font-mono font-bold text-[#03045e]">{dist.probability.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#03045e] to-[#0077b6]"
                  style={{ width: `${Math.min(dist.probability * 3.5, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracked Picks Drawer Modal / Expandable Panel */}
      {isSlipDrawerOpen && (
        <div className="p-5 rounded-2xl bg-stone-900 text-white shadow-xl space-y-4 border border-stone-700">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm font-black tracking-tight text-white">
                Simulated Predictions Paper Slip ({trackedPredictions.length})
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {trackedPredictions.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSlip}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSlipDrawerOpen(false)}
                className="text-xs text-stone-400 hover:text-white font-bold transition-colors cursor-pointer"
              >
                Close &times;
              </button>
            </div>
          </div>

          {trackedPredictions.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-400">
              No picks tracked yet. Click "Track Spread Pick", "Track Totals Pick", or "Track Moneyline Pick" above to simulate a betting slip.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
              {trackedPredictions.map((pick) => (
                <div
                  key={pick.id}
                  className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-[#0077b6] text-white">
                        {pick.modelType}
                      </span>
                      <span className="font-bold text-white">{pick.selection}</span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Line: {pick.marketLine} &bull; Model: {pick.modelProjection} &bull; Prob: {pick.winProbability.toFixed(1)}%
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-[#00d4ff]">{pick.odds}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromSlip(pick.id)}
                      className="p-1 rounded text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
