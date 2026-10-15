import React from 'react';
import {
  Trophy,
  TrendingUp,
  Percent,
  Sparkles,
  Shield,
  Activity,
  Award,
  ChevronRight,
  Info,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Flame,
} from 'lucide-react';
import { NflPredictionsModelData } from '../types';

interface NflPredictionsModelProps {
  data: NflPredictionsModelData;
  onSelectProps?: () => void;
  onSelectPoints?: () => void;
}

export const NflPredictionsModel: React.FC<NflPredictionsModelProps> = ({
  data,
  onSelectProps,
  onSelectPoints,
}) => {
  return (
    <div id="nfl-predictions-model-container" className="space-y-6">
      {/* Top Banner: Score Prediction Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-900 uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-blue-700" />
                <span>Computer Score Predictions</span>
              </span>
              <span className="text-xs font-bold text-stone-500">
                10,000 Monte Carlo Iterations
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#03045e] mt-1 tracking-tight">
              Projected Final Outcome: {data.awayTeam.city} at {data.homeTeam.city}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Consensus point spread cover probabilities, moneyline win likelihoods, margin of victory distribution, and multi-platform consensus signals.
            </p>
          </div>

          {/* Spread Pick Star Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#03045e] to-[#0077b6] text-white shadow-xs text-center shrink-0 self-start lg:self-center min-w-[170px]">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#90e0ef]">
              Model Spread Recommendation
            </div>
            <div className="text-xl font-black tracking-tight mt-0.5">
              {data.spreadPick}
            </div>
            <div className="text-xs font-bold text-amber-300 mt-0.5">
              {'★'.repeat(data.spreadConfidenceStars)} ({data.homeCoverProbability > data.awayCoverProbability ? data.homeCoverProbability : data.awayCoverProbability}% Cover Prob)
            </div>
          </div>
        </div>

        {/* Projected Final Scoreboard */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-stone-900 text-white shadow-md">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#90e0ef] text-center mb-3">
            Algorithmic Mean Final Score (Simulated Median)
          </div>

          <div className="grid grid-cols-5 items-center max-w-xl mx-auto">
            {/* Away Team */}
            <div className="col-span-2 text-center">
              <div className="text-xs sm:text-sm font-bold text-stone-400">
                {data.awayTeam.city}
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {data.awayTeam.name}
              </div>
              <div className="text-3xl sm:text-5xl font-black font-mono text-[#00d4ff] mt-1">
                {Math.round(data.projectedScoreAway)}
              </div>
              <div className="text-[11px] font-mono text-stone-400 mt-1">
                Raw mean: {data.projectedScoreAway.toFixed(1)}
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
                {data.homeTeam.city}
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {data.homeTeam.name}
              </div>
              <div className="text-3xl sm:text-5xl font-black font-mono text-[#00d4ff] mt-1">
                {Math.round(data.projectedScoreHome)}
              </div>
              <div className="text-[11px] font-mono text-stone-400 mt-1">
                Raw mean: {data.projectedScoreHome.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Spread & Moneyline Cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Spread Analysis Card */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800">Point Spread Value</span>
              <span className="font-mono text-stone-500">Market: {data.spreadConsensus}</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-black text-[#03045e] font-mono">
                Model: {data.spreadModel}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                (+{data.spreadCoverEdge.toFixed(1)} pt edge)
              </span>
            </div>
            <div className="text-xs text-stone-600 flex items-center justify-between pt-1 border-t border-stone-200">
              <span>{data.awayTeam.code} Cover: {data.awayCoverProbability.toFixed(1)}%</span>
              <span>{data.homeTeam.code} Cover: {data.homeCoverProbability.toFixed(1)}%</span>
            </div>
          </div>

          {/* Moneyline Win Prob Card */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800">Moneyline Win Likelihood</span>
              <span className="font-mono text-stone-500">
                Away: {data.moneylineAway} | Home: {data.moneylineHome}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-black text-[#03045e] font-mono">
                {data.homeTeam.code}: {data.moneylineWinProbHome.toFixed(1)}%
              </span>
              <span className="text-xs font-bold text-stone-600">
                ({data.awayTeam.code}: {data.moneylineWinProbAway.toFixed(1)}%)
              </span>
            </div>
            <div className="text-xs text-stone-600 flex items-center justify-between pt-1 border-t border-stone-200">
              <span>
                {data.homeTeam.code} EV Edge: {data.moneylineEdgeHome > 0 ? `+${data.moneylineEdgeHome.toFixed(1)}%` : `${data.moneylineEdgeHome.toFixed(1)}%`}
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                Simulated 10,000 times
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Margin of Victory Distribution */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <h4 className="text-sm sm:text-base font-black text-[#03045e]">
          Simulated Margin of Victory Distribution
        </h4>
        <p className="text-xs text-stone-500">
          Probability brackets showing the spread of final score differentials across 10,000 computer simulations.
        </p>

        <div className="space-y-2.5 pt-2">
          {data.keyOutcomeDistributions.map((dist, idx) => (
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

      {/* Cross-Industry Consensus Signal Matrix */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#0077b6]" />
            <h4 className="text-sm sm:text-base font-black text-[#03045e]">
              Composite Benchmark Signals &amp; Market Flow
            </h4>
          </div>
          <span className="text-[11px] font-bold text-stone-400 uppercase">Multi-Model</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {data.consensusSignals.map((signal, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  {signal.source}
                </div>
                <div className="text-sm font-black text-[#03045e] mt-0.5">
                  {signal.pick}
                </div>
              </div>
              <div className="text-[11px] font-mono font-bold text-emerald-700 mt-2">
                {signal.confidence}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
