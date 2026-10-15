import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Sun,
  Wind,
  CloudRain,
  Flame,
  Activity,
  Award,
  ChevronRight,
  Info,
  SlidersHorizontal,
  BarChart3,
  Percent,
} from 'lucide-react';
import { NflPointsModelData } from '../types';

interface NflPointsModelProps {
  data: NflPointsModelData;
  onSelectPredictions?: () => void;
  onSelectMatchup?: () => void;
}

export const NflPointsModel: React.FC<NflPointsModelProps> = ({
  data,
  onSelectPredictions,
  onSelectMatchup,
}) => {
  const isOver = data.modelRecommendation === 'OVER';

  return (
    <div id="nfl-points-model-container" className="space-y-6">
      {/* Primary Points Matrix Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-emerald-700" />
                <span>Points &amp; Over/Under Engine</span>
              </span>
              <span className="text-xs font-bold text-stone-500">
                Pace of Play &amp; Drive Simulator
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#03045e] mt-1 tracking-tight">
              Game Total Projections: {data.awayTeam.city} at {data.homeTeam.city}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Monte Carlo drive-by-drive point modeling, weather aerodynamic drag calibration, neutral-situation snap pacing, and implied team scoring baselines.
            </p>
          </div>

          {/* Model Edge Badge */}
          <div className="flex items-center space-x-3 shrink-0 self-start lg:self-center">
            <div
              className={`p-4 rounded-2xl border text-center shadow-xs ${
                isOver
                  ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white border-emerald-300'
                  : 'bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white border-rose-300'
              }`}
            >
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                Model Recommendation
              </div>
              <div className="flex items-center justify-center space-x-1.5 mt-0.5">
                {isOver ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                )}
                <span
                  className={`text-lg font-black tracking-tight ${
                    isOver ? 'text-emerald-800' : 'text-rose-800'
                  }`}
                >
                  {data.modelRecommendation} {data.consensusTotal}
                </span>
              </div>
              <div className="text-[11px] font-bold text-stone-600 mt-0.5">
                Edge: +{data.edgePercent.toFixed(1)}% &bull; {'★'.repeat(data.confidenceStars)}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Numbers Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3 pt-5 border-t border-stone-100">
          {/* Consensus Market Total */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Sportsbook Consensus Total
            </div>
            <div className="text-2xl font-black font-mono text-stone-900 mt-1">
              {data.consensusTotal} pts
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Opening consensus line across books
            </div>
          </div>

          {/* Model Projected Total */}
          <div className="p-3.5 rounded-xl bg-[#caf0f8]/50 border border-[#90e0ef]">
            <div className="text-[10px] font-bold text-[#0077b6] uppercase tracking-wider">
              CloudboyX Projected Total
            </div>
            <div className="text-2xl font-black font-mono text-[#03045e] mt-1">
              {data.modelProjectedTotal} pts
            </div>
            <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
              Diff: {data.totalDifferential > 0 ? `+${data.totalDifferential}` : data.totalDifferential} pts ({data.modelRecommendation})
            </div>
          </div>

          {/* Away Team Implied Total */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              {data.awayTeam.code} Implied Total
            </div>
            <div className="text-2xl font-black font-mono text-stone-900 mt-1">
              {data.impliedTeamTotals.awayImplied} pts
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Away implied scoring floor
            </div>
          </div>

          {/* Home Team Implied Total */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              {data.homeTeam.code} Implied Total
            </div>
            <div className="text-2xl font-black font-mono text-stone-900 mt-1">
              {data.impliedTeamTotals.homeImplied} pts
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Home implied scoring baseline
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Pace Pacing & Weather Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pace & Tempo Engine */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#03045e] uppercase tracking-wider">
            <Clock className="w-4 h-4 text-[#0077b6]" />
            <span>Pace of Play &amp; Tempo Metrics</span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Neutral situation snap speed dictates total offensive plays and scoring opportunities per team.
          </p>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700">Pace Profile:</span>
              <span className="font-bold text-[#03045e] text-right max-w-[60%]">
                {data.paceMetrics.paceStyle}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-200/60">
              <span className="text-stone-600">{data.awayTeam.code} Neutral Sec / Snap:</span>
              <span className="font-mono font-bold text-stone-900">
                {data.paceMetrics.awaySecondsPerPlay}s (Rank #{data.paceMetrics.paceRankAway})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-200/60">
              <span className="text-stone-600">{data.homeTeam.code} Neutral Sec / Snap:</span>
              <span className="font-mono font-bold text-stone-900">
                {data.paceMetrics.homeSecondsPerPlay}s (Rank #{data.paceMetrics.paceRankHome})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-200/60">
              <span className="text-stone-600">Projected Combined Plays:</span>
              <span className="font-mono font-extrabold text-[#03045e]">
                {data.paceMetrics.projectedTotalPlays} Offensive Plays
              </span>
            </div>
          </div>
        </div>

        {/* Weather Aerodynamics & Stadium Factor */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#03045e] uppercase tracking-wider">
            <Wind className="w-4 h-4 text-[#0077b6]" />
            <span>Weather &amp; Aerodynamic Adjustments</span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Sustained crosswinds over 12 mph reduce deep passing yards and 45+ yard field goal accuracy.
          </p>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-600 flex items-center space-x-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Forecast Temperature:</span>
              </span>
              <span className="font-mono font-bold text-stone-900">
                {data.weatherFactor.temperature}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-200/60">
              <span className="text-stone-600 flex items-center space-x-1">
                <Wind className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>Sustained Wind Speed:</span>
              </span>
              <span className="font-mono font-bold text-stone-900">
                {data.weatherFactor.windSpeedMph} mph
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-200/60">
              <span className="text-stone-600 flex items-center space-x-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                <span>Precipitation Chance:</span>
              </span>
              <span className="font-mono font-bold text-stone-900">
                {data.weatherFactor.precipitationChance}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-200/60">
              <span className="text-stone-600">Model Total Adjustment:</span>
              <span className="font-mono font-extrabold text-emerald-700">
                {data.weatherFactor.totalPointAdjustment > 0
                  ? `+${data.weatherFactor.totalPointAdjustment}`
                  : data.weatherFactor.totalPointAdjustment}{' '}
                pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 10,000 Game Scoring Distribution Curve */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm sm:text-base font-black text-[#03045e]">
              10,000 Game Monte Carlo Scoring Distribution
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Probability breakdown across simulated total point brackets.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-stone-100 text-stone-700">
            10,000 Iterations
          </span>
        </div>

        <div className="space-y-3">
          {data.scoringDistribution.map((dist, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">{dist.range}</span>
                <span className="font-mono font-bold text-[#03045e]">{dist.probability.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0077b6] to-[#00b4d8] transition-all duration-500"
                  style={{ width: `${Math.min(dist.probability * 2.5, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Insights Callout */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
        <div className="text-xs font-bold text-[#03045e] uppercase tracking-wider flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-[#0077b6]" />
          <span>Points Model Simulation Notes</span>
        </div>
        <div className="space-y-1 text-xs text-stone-600">
          {data.simulationNotes.map((note, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-[#0077b6] font-bold">&bull;</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
