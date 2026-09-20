import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  ShieldAlert,
  Sliders,
  TrendingUp,
  Scale,
  Activity,
  Zap,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ProbabilityAnalysisResult, MarketEconomics, ProbabilityMetrics } from '../types';

export interface RiskFactorItem {
  id: string;
  name: string;
  category: 'Macroeconomic' | 'Liquidity & Execution' | 'Settlement & Legal' | 'Information & Sentiment' | 'Discrete Event';
  variancePercent: number;
  estDeviationCents: number;
  color: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  description: string;
  variableKey: string;
  sensitivityBeta: number;
}

interface RiskAttributionBreakdownProps {
  analysis?: ProbabilityAnalysisResult;
  marketEconomics: MarketEconomics;
  probabilities: ProbabilityMetrics;
}

export const RiskAttributionBreakdown: React.FC<RiskAttributionBreakdownProps> = ({
  analysis,
  marketEconomics,
  probabilities,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'systematic' | 'stress'>('all');

  // Compute econometric risk factors derived dynamically from the active contract analysis
  const rawFactors: RiskFactorItem[] = useMemo(() => {
    const category = analysis?.category || 'Economics';
    const spread = marketEconomics.spreadCents || 2;
    const brier = probabilities.brierUncertaintyIndex || 0.25;
    const ciSpread = Math.max(
      4,
      (probabilities.confidenceInterval?.high || 65) - (probabilities.confidenceInterval?.low || 45)
    );
    const edgeCasesCount = analysis?.resolutionCriteria?.edgeCases?.length || 1;
    const catalystsCount = analysis?.catalysts?.length || 2;

    // Weight coefficients by contract category
    let macroWeight = 32;
    let liquidityWeight = 16 + spread * 2.5;
    let settlementWeight = 12 + edgeCasesCount * 3.5;
    let sentimentWeight = 18;
    let catalystWeight = 14 + catalystsCount * 2;
    let modelErrorWeight = 8 + brier * 18 + (ciSpread > 15 ? 4 : 0);

    if (category === 'Economics') {
      macroWeight += 12;
      sentimentWeight -= 4;
      catalystWeight += 2;
    } else if (category === 'Politics') {
      sentimentWeight += 12;
      settlementWeight += 6;
      macroWeight -= 10;
    } else if (category === 'Finance') {
      macroWeight += 8;
      liquidityWeight += 6;
      settlementWeight -= 4;
    } else if (category === 'Technology & AI') {
      sentimentWeight += 8;
      catalystWeight += 8;
      macroWeight -= 6;
    } else if (category === 'Weather & Climate') {
      catalystWeight += 14;
      sentimentWeight -= 8;
      macroWeight -= 12;
      settlementWeight += 6;
    }

    const totalWeight =
      macroWeight +
      liquidityWeight +
      settlementWeight +
      sentimentWeight +
      catalystWeight +
      modelErrorWeight;

    // Normalize to exact 100%
    const p1 = Math.round((macroWeight / totalWeight) * 1000) / 10;
    const p2 = Math.round((liquidityWeight / totalWeight) * 1000) / 10;
    const p3 = Math.round((settlementWeight / totalWeight) * 1000) / 10;
    const p4 = Math.round((sentimentWeight / totalWeight) * 1000) / 10;
    const p5 = Math.round((catalystWeight / totalWeight) * 1000) / 10;
    // Remainder to guarantee sum = 100
    const p6 = Math.round((100 - (p1 + p2 + p3 + p4 + p5)) * 10) / 10;

    const baseStdDev = Math.max(1.8, Math.round(ciSpread * 0.4 * 10) / 10);

    return [
      {
        id: 'macro-policy',
        name: 'Macro & Policy Variance',
        category: 'Macroeconomic',
        variancePercent: p1,
        estDeviationCents: Math.round(((p1 / 100) * baseStdDev * 2.2) * 10) / 10,
        color: '#0077b6', // Classic deep blue
        impactLevel: p1 >= 25 ? 'High' : 'Medium',
        description: 'Interest rate yield curves, inflation benchmarks, and central bank guidance driving systemic outcome probabilities.',
        variableKey: 'FedFunds_CPI_Delta',
        sensitivityBeta: 1.18,
      },
      {
        id: 'orderbook-liquidity',
        name: 'Orderbook Depth & Slippage',
        category: 'Liquidity & Execution',
        variancePercent: p2,
        estDeviationCents: Math.round(((p2 / 100) * baseStdDev * 1.8) * 10) / 10,
        color: '#00b4d8', // Vivid cyan
        impactLevel: p2 >= 20 ? 'High' : p2 >= 12 ? 'Medium' : 'Low',
        description: `Market maker quote spacing, ${spread}¢ bid-ask friction, and taker price impact across size orders.`,
        variableKey: 'Spread_Depth_Ratio',
        sensitivityBeta: 0.84,
      },
      {
        id: 'settlement-criteria',
        name: 'CFTC Settlement Ambiguity',
        category: 'Settlement & Legal',
        variancePercent: p3,
        estDeviationCents: Math.round(((p3 / 100) * baseStdDev * 1.6) * 10) / 10,
        color: '#f59e0b', // Amber
        impactLevel: p3 >= 18 ? 'High' : 'Medium',
        description: `Reporting agency timestamp cutoffs, statistical revision lag, and ${edgeCasesCount} documented settlement edge cases.`,
        variableKey: 'CFTC_Rulebook_Dispute',
        sensitivityBeta: 0.62,
      },
      {
        id: 'sentiment-momentum',
        name: 'Media & Social Momentum',
        category: 'Information & Sentiment',
        variancePercent: p4,
        estDeviationCents: Math.round(((p4 / 100) * baseStdDev * 1.5) * 10) / 10,
        color: '#06d6a0', // Emerald/Teal
        impactLevel: p4 >= 20 ? 'High' : 'Medium',
        description: 'Retail forum chatter (X/FinTwit, Reddit) divergence against institutional news wires (Bloomberg/WSJ).',
        variableKey: 'Sentiment_Polarity_Spread',
        sensitivityBeta: 0.95,
      },
      {
        id: 'discrete-catalysts',
        name: 'Catalyst & Tail-Risk Shocks',
        category: 'Discrete Event',
        variancePercent: p5,
        estDeviationCents: Math.round(((p5 / 100) * baseStdDev * 2.0) * 10) / 10,
        color: '#ef4444', // Red/Rose
        impactLevel: p5 >= 18 ? 'High' : 'Medium',
        description: `Unscheduled press conferences, geopolitical surprises, and ${catalystsCount} calendar milestone releases.`,
        variableKey: 'Catalyst_Schedule_Shock',
        sensitivityBeta: 1.34,
      },
      {
        id: 'model-estimation',
        name: 'Model Estimation Uncertainty',
        category: 'Macroeconomic',
        variancePercent: p6,
        estDeviationCents: Math.round(((p6 / 100) * baseStdDev * 1.2) * 10) / 10,
        color: '#8b5cf6', // Purple
        impactLevel: p6 >= 15 ? 'Medium' : 'Low',
        description: `Bayesian parameter distribution width and econometric regression residual noise (Brier: ${brier.toFixed(2)}).`,
        variableKey: 'Residual_Regression_SE',
        sensitivityBeta: 0.45,
      },
    ].sort((a, b) => b.variancePercent - a.variancePercent);
  }, [analysis, marketEconomics.spreadCents, probabilities]);

  // Filter factors if user selects specific view
  const displayFactors = useMemo(() => {
    if (viewFilter === 'systematic') {
      return rawFactors.filter(
        (f) => f.category === 'Macroeconomic' || f.category === 'Liquidity & Execution'
      );
    }
    if (viewFilter === 'stress') {
      return rawFactors.filter(
        (f) => f.impactLevel === 'High' || f.category === 'Discrete Event' || f.category === 'Settlement & Legal'
      );
    }
    return rawFactors;
  }, [rawFactors, viewFilter]);

  // Active highlighted factor
  const selectedFactor = activeIndex !== null ? rawFactors[activeIndex] : rawFactors[0];

  // Primary driver
  const topFactor = rawFactors[0];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: RiskFactorItem = payload[0].payload;
      return (
        <div className="bg-[#03045e] text-white p-3 rounded-xl shadow-xl border border-[#0077b6] text-xs space-y-1.5 max-w-[240px]">
          <div className="flex items-center justify-between border-b border-white/20 pb-1">
            <span className="font-bold text-[#caf0f8]">{item.name}</span>
            <span
              className="px-1.5 py-0.2 rounded text-[10px] font-bold"
              style={{ backgroundColor: `${item.color}33`, color: item.color }}
            >
              {item.impactLevel} Impact
            </span>
          </div>
          <div className="flex justify-between text-stone-300">
            <span>Variance Share:</span>
            <strong className="text-white font-mono">{item.variancePercent.toFixed(1)}%</strong>
          </div>
          <div className="flex justify-between text-stone-300">
            <span>Est. Volatility Shock:</span>
            <strong className="text-[#caf0f8] font-mono">&plusmn;{item.estDeviationCents}&cent;</strong>
          </div>
          <div className="flex justify-between text-stone-300">
            <span>Sensitivity Beta:</span>
            <strong className="text-stone-100 font-mono">{item.sensitivityBeta.toFixed(2)}x</strong>
          </div>
          <p className="text-[11px] text-stone-300 pt-1 border-t border-white/10 leading-snug">
            {item.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="kalshi-risk-attribution-card"
      className="p-5 sm:p-6 rounded-2xl border border-stone-200 bg-gradient-to-b from-stone-50/70 to-white shadow-xs space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#0077b6] text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-[#03045e] tracking-tight">
              Risk Attribution &amp; Variance Decomposition
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef]">
              ANOVA Model
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Decomposing the primary external factors and market variables contributing to contract price variance
          </p>
        </div>

        {/* View Filter Pills */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              viewFilter === 'all'
                ? 'bg-white text-[#03045e] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Factors
          </button>
          <button
            onClick={() => setViewFilter('systematic')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              viewFilter === 'systematic'
                ? 'bg-white text-[#03045e] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Systematic
          </button>
          <button
            onClick={() => setViewFilter('stress')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              viewFilter === 'stress'
                ? 'bg-white text-[#03045e] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Tail Risks
          </button>
        </div>
      </div>

      {/* Primary Driver Summary Banner */}
      <div className="p-3 bg-[#caf0f8]/30 rounded-xl border border-[#90e0ef] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#0077b6] shrink-0" />
          <div>
            <span className="text-stone-500">Dominant Variance Driver:</span>{' '}
            <strong className="text-[#03045e] font-bold">{topFactor.name}</strong>{' '}
            <span className="px-1.5 py-0.2 rounded bg-[#0077b6] text-white font-mono font-bold text-[10px]">
              {topFactor.variancePercent.toFixed(1)}% of total variance
            </span>
          </div>
        </div>
        <div className="text-stone-600 text-[11px] sm:text-right font-medium">
          Estimated 1&sigma; price dispersion:{' '}
          <strong className="text-[#03045e] font-mono">&plusmn;{topFactor.estDeviationCents}&cent;</strong>
        </div>
      </div>

      {/* Main Grid: Recharts Pie Chart (Left) & Factor Breakdown List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Recharts Pie Chart & Donut Center */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="w-full h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={displayFactors}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="variancePercent"
                  nameKey="name"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  cursor="pointer"
                  animationDuration={600}
                >
                  {displayFactors.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={entry.color}
                      stroke={activeIndex === index ? '#03045e' : '#ffffff'}
                      strokeWidth={activeIndex === index ? 2.5 : 1.5}
                      className="transition-all duration-200"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                {selectedFactor ? selectedFactor.category : 'Total'}
              </span>
              <span className="text-xl font-black text-[#03045e] font-mono tracking-tight">
                {selectedFactor ? `${selectedFactor.variancePercent.toFixed(1)}%` : '100%'}
              </span>
              <span className="text-[9px] text-stone-500 max-w-[90px] text-center truncate">
                {selectedFactor ? selectedFactor.name : 'Variance'}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 text-center mt-1 flex items-center space-x-1 justify-center">
            <Info className="w-3 h-3 text-[#0077b6]" />
            <span>Hover slices or cards to inspect volatility parameters</span>
          </div>
        </div>

        {/* Right: Dynamic Factor Cards List */}
        <div className="lg:col-span-7 space-y-2.5">
          {displayFactors.map((factor, idx) => {
            const isHovered = activeIndex === idx || (activeIndex === null && idx === 0);
            return (
              <div
                key={factor.id}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-white border-[#0077b6] shadow-sm ring-1 ring-[#0077b6]/20'
                    : 'bg-white/80 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: factor.color }}
                    />
                    <span className="text-xs font-bold text-stone-900">{factor.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-medium">
                      {factor.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-stone-500">
                      1&sigma;: &plusmn;{factor.estDeviationCents}&cent;
                    </span>
                    <span
                      className="text-xs font-extrabold font-mono px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${factor.color}15`, color: factor.color }}
                    >
                      {factor.variancePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${factor.variancePercent}%`,
                      backgroundColor: factor.color,
                    }}
                  />
                </div>

                {/* Analytical Description */}
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span className="truncate pr-2">{factor.description}</span>
                  <span className="shrink-0 font-mono text-[10px] text-stone-400">
                    &beta;: {factor.sensitivityBeta.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practical Quantitative Hedging Advisory */}
      <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5 text-stone-900 font-bold">
            <Scale className="w-3.5 h-3.5 text-[#0077b6]" />
            <span>Optimal Kelly Risk-Mitigation Strategy:</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            With <strong>{topFactor.name}</strong> as the primary variance contributor ({topFactor.variancePercent}%), avoid sizing above <strong>Half-Kelly</strong> until major event milestones clear.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 font-mono font-bold text-[11px]">
            Beta: {topFactor.sensitivityBeta.toFixed(2)}x
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#caf0f8] text-[#0077b6] font-mono font-bold text-[11px] border border-[#90e0ef]">
            Target Sizing: Half-Kelly
          </span>
        </div>
      </div>
    </div>
  );
};
