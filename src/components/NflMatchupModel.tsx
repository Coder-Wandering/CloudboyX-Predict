import React, { useState } from 'react';
import {
  Shield,
  Zap,
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Swords,
  Layers,
} from 'lucide-react';
import { NflMatchupModelData, NflMatchupMetric } from '../types';

interface NflMatchupModelProps {
  data: NflMatchupModelData;
  onSelectProps?: () => void;
  onSelectPredictions?: () => void;
}

export const NflMatchupModel: React.FC<NflMatchupModelProps> = ({
  data,
  onSelectProps,
  onSelectPredictions,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredMetrics = data.metrics.filter((m) => {
    if (selectedCategory === 'ALL') return true;
    return m.category.toUpperCase() === selectedCategory.toUpperCase();
  });

  const getAdvantageBadge = (adv: 'AWAY' | 'HOME' | 'EVEN', label: string) => {
    if (adv === 'AWAY') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-stone-100 text-stone-900 border border-stone-300">
          <span>{data.awayTeam.code} Edge</span>
        </span>
      );
    }
    if (adv === 'HOME') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
          <span>{data.homeTeam.code} Edge</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
        <span>Even Matchup</span>
      </span>
    );
  };

  return (
    <div id="nfl-matchup-model-container" className="space-y-6">
      {/* Top Banner: Matchup Strategic High Ground */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-900 uppercase tracking-wider">
                <Swords className="w-3.5 h-3.5 text-purple-700" />
                <span>Head-to-Head Tale of the Tape</span>
              </span>
              <span className="text-xs font-bold text-stone-500">
                NextGen &amp; EPA Scheme Analytics
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#03045e] mt-1 tracking-tight">
              {data.awayTeam.city} {data.awayTeam.name} vs {data.homeTeam.city} {data.homeTeam.name}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Granular trench line-play, offensive pass/rush EPA per play, defensive pressure rate differentials, and situational down-and-distance conversion leverage.
            </p>
          </div>

          {/* Quick Matchup Advantage Summary */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Trench Pass Pro</div>
              <div className="text-xs font-black text-[#03045e] mt-0.5">
                {data.offensiveLineAdvantage === 'AWAY' ? data.awayTeam.code : data.homeTeam.code} Advantage
              </div>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Pass Rush Edge</div>
              <div className="text-xs font-black text-[#03045e] mt-0.5">
                {data.defensivePressureAdvantage === 'HOME' ? data.homeTeam.code : data.awayTeam.code} Advantage
              </div>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Red Zone TD%</div>
              <div className="text-xs font-black text-[#03045e] mt-0.5">
                {data.redZoneAdvantage === 'AWAY' ? data.awayTeam.code : data.homeTeam.code} Advantage
              </div>
            </div>
          </div>
        </div>

        {/* 5 Core Battleground Indicators */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-5 border-t border-stone-100">
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="text-[10px] font-bold text-stone-500 uppercase">Passing EPA</div>
            <div className="text-xs font-black text-[#03045e] mt-0.5 flex items-center justify-between">
              <span>{data.passingEfficiencyAdvantage}</span>
              <Zap className="w-3 h-3 text-[#0077b6]" />
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="text-[10px] font-bold text-stone-500 uppercase">Rushing Success</div>
            <div className="text-xs font-black text-[#03045e] mt-0.5 flex items-center justify-between">
              <span>{data.rushingEfficiencyAdvantage}</span>
              <Activity className="w-3 h-3 text-emerald-600" />
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="text-[10px] font-bold text-stone-500 uppercase">Pressure Gen</div>
            <div className="text-xs font-black text-[#03045e] mt-0.5 flex items-center justify-between">
              <span>{data.defensivePressureAdvantage}</span>
              <Flame className="w-3 h-3 text-rose-600" />
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="text-[10px] font-bold text-stone-500 uppercase">Pass Blocking</div>
            <div className="text-xs font-black text-[#03045e] mt-0.5 flex items-center justify-between">
              <span>{data.offensiveLineAdvantage}</span>
              <Shield className="w-3 h-3 text-[#03045e]" />
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold text-stone-500 uppercase">Red Zone %</div>
            <div className="text-xs font-black text-[#03045e] mt-0.5 flex items-center justify-between">
              <span>{data.redZoneAdvantage}</span>
              <Award className="w-3 h-3 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Scheme Takeaways Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-900 to-[#03045e] text-white shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#90e0ef] uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4" />
          <span>Strategic Matchup Keys &amp; Scheme Battles</span>
        </div>
        <div className="space-y-2 text-xs sm:text-sm text-stone-200">
          {data.strategicKeyTakeaways.map((takeaway, idx) => (
            <div key={idx} className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-[#0077b6] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{takeaway}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Breakdown Toolbar & Category Filters */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0077b6]" />
            <span className="text-xs font-bold text-[#03045e] uppercase tracking-wider">
              Filter Matchup Metrics by Category:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'Efficiency', 'Passing', 'Rushing', 'Trench', 'Defense'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory.toUpperCase() === cat.toUpperCase()
                    ? 'bg-[#03045e] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                }`}
              >
                {cat === 'ALL' ? 'All Metrics (8)' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tale of the Tape Metrics Comparison List */}
      <div className="space-y-3">
        {filteredMetrics.map((metric, idx) => {
          const isAwayAdv = metric.advantageTeam === 'AWAY';
          const isHomeAdv = metric.advantageTeam === 'HOME';

          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-[#90e0ef] transition-all"
            >
              {/* Header: Metric Name & Category Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-[#03045e] sm:text-sm">
                    {metric.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600 uppercase">
                    {metric.category}
                  </span>
                </div>
                <div>{getAdvantageBadge(metric.advantageTeam, metric.name)}</div>
              </div>

              {/* Head-to-head comparison row */}
              <div className="grid grid-cols-2 gap-4 py-3.5 items-center">
                {/* Away Team Metric */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    isAwayAdv
                      ? 'bg-stone-100/90 border-stone-300 shadow-2xs'
                      : 'bg-stone-50/50 border-stone-100 text-stone-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">
                      {data.awayTeam.city} {data.awayTeam.name}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      NFL Rank #{metric.awayRank}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-[#03045e] mt-1">
                    {metric.awayValue}
                  </div>
                </div>

                {/* Home Team Metric */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    isHomeAdv
                      ? 'bg-[#caf0f8]/50 border-[#90e0ef] shadow-2xs'
                      : 'bg-stone-50/50 border-stone-100 text-stone-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">
                      {data.homeTeam.city} {data.homeTeam.name}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      NFL Rank #{metric.homeRank}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-[#03045e] mt-1">
                    {metric.homeValue}
                  </div>
                </div>
              </div>

              {/* Edge Note explanation */}
              <div className="pt-2 flex items-center space-x-1.5 text-xs text-stone-600">
                <Info className="w-3.5 h-3.5 text-[#0077b6] shrink-0" />
                <span className="leading-snug">{metric.edgeNote}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Cross-Model Navigation */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-stone-600">
          Tale of the Tape metrics calibrate individual player yardage expectations and game totals.
        </div>
        <div className="flex items-center space-x-2">
          {onSelectProps && (
            <button
              type="button"
              onClick={onSelectProps}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-stone-100 text-[#03045e] border border-stone-300 transition-colors cursor-pointer"
            >
              Examine Player Props &rarr;
            </button>
          )}
          {onSelectPredictions && (
            <button
              type="button"
              onClick={onSelectPredictions}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#03045e] hover:bg-[#0077b6] text-white shadow-2xs transition-colors cursor-pointer"
            >
              View Predictions &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
