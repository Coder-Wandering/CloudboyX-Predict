import React from 'react';
import {
  Zap,
  Shield,
  Plane,
  Clock,
  Award,
  TrendingUp,
  Activity,
  ChevronRight,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { NflPowerRatingsData } from '../types';

interface NflPowerRatingsModelProps {
  data: NflPowerRatingsData;
  onSelectPredictions?: () => void;
  onSelectMatchup?: () => void;
}

export const NflPowerRatingsModel: React.FC<NflPowerRatingsModelProps> = ({
  data,
  onSelectPredictions,
  onSelectMatchup,
}) => {
  return (
    <div id="nfl-power-ratings-model-container" className="space-y-6">
      {/* Top Banner: Power Rating Comparison */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-700" />
                <span>Situational &amp; Power Ratings</span>
              </span>
              <span className="text-xs font-bold text-stone-500">
                Composite Net Efficiency + Situational Adjustments
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#03045e] mt-1 tracking-tight">
              Power Matrix: {data.awayTeam.city} at {data.homeTeam.city}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Composite efficiency ratings, quarterback replacement value (WAR points), travel/rest fatigue differentials, and historical situational betting angles.
            </p>
          </div>

          {/* Net Power Differential */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center shrink-0 self-start lg:self-center min-w-[170px]">
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-500">
              Net Power Differential
            </div>
            <div className="text-2xl font-black font-mono text-[#03045e] mt-0.5">
              +{data.netPowerDiff.toFixed(1)} pts
            </div>
            <div className="text-xs font-bold text-[#0077b6] mt-0.5">
              Favors {data.homePowerRating > data.awayPowerRating ? data.homeTeam.code : data.awayTeam.code}
            </div>
          </div>
        </div>

        {/* 2 Team Power Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-stone-100">
          {/* Away Team Rating Card */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-800 uppercase tracking-wider">
                {data.awayTeam.city} {data.awayTeam.name} ({data.awayTeam.code})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-200 text-stone-800">
                Power Rank #{data.awayRank}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-[#03045e]">
                {data.awayPowerRating.toFixed(1)}
              </span>
              <span className="text-xs text-stone-500 font-semibold">/ 100 Index</span>
            </div>
            <div className="text-xs text-stone-600 pt-2 border-t border-stone-200 space-y-1">
              <div className="flex justify-between">
                <span>QB WAR Value:</span>
                <span className="font-mono font-bold text-[#03045e]">
                  {data.qbReplacementValuePts.awayQb}: +{data.qbReplacementValuePts.awayQbWar.toFixed(1)} pts
                </span>
              </div>
            </div>
          </div>

          {/* Home Team Rating Card */}
          <div className="p-4 rounded-2xl bg-[#caf0f8]/50 border border-[#90e0ef] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#03045e] uppercase tracking-wider">
                {data.homeTeam.city} {data.homeTeam.name} ({data.homeTeam.code})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0077b6] text-white">
                Power Rank #{data.homeRank}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-[#03045e]">
                {data.homePowerRating.toFixed(1)}
              </span>
              <span className="text-xs text-stone-500 font-semibold">/ 100 Index</span>
            </div>
            <div className="text-xs text-stone-600 pt-2 border-t border-stone-200/60 space-y-1">
              <div className="flex justify-between">
                <span>QB WAR Value:</span>
                <span className="font-mono font-bold text-[#03045e]">
                  {data.qbReplacementValuePts.homeQb}: +{data.qbReplacementValuePts.homeQbWar.toFixed(1)} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Situational Variables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Home Field Advantage */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-[#0077b6]" />
            <span>Home Field Advantage</span>
          </div>
          <div className="text-xl font-black font-mono text-[#03045e]">
            +{data.homeFieldAdvantagePts.toFixed(1)} pts
          </div>
          <div className="text-xs text-stone-500">
            Arrowhead Stadium crowd noise index (+2.1 pts)
          </div>
        </div>

        {/* Rest Differential */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rest Days Differential</span>
          </div>
          <div className="text-xl font-black font-mono text-[#03045e]">
            {data.restDifferentialDays === 0 ? 'Even Rest (0 days)' : `${data.restDifferentialDays} days`}
          </div>
          <div className="text-xs text-stone-500">
            Both squads enter with full off-season preparation
          </div>
        </div>

        {/* Travel & Time Zone Impact */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center space-x-1">
            <Plane className="w-3.5 h-3.5 text-purple-600" />
            <span>Travel Fatigue Impact</span>
          </div>
          <div className="text-xs font-bold text-[#03045e]">
            {data.travelMilesImpact}
          </div>
          <div className="text-xs text-stone-500">
            Estimated flight duration &amp; circadian shift
          </div>
        </div>
      </div>

      {/* Historical Situational Angles & Systems */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#0077b6]" />
          <h4 className="text-sm sm:text-base font-black text-[#03045e]">
            Backtested Situational Trends &amp; Angles
          </h4>
        </div>
        <p className="text-xs text-stone-500">
          Historical angle database matching coaching records, underdog margins, and primetime performance.
        </p>

        <div className="space-y-2 pt-1">
          {data.situationalTrends.map((trend, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start space-x-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-[#0077b6] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{trend}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
