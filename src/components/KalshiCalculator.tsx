import React, { useState } from 'react';
import { MarketEconomics, ProbabilityMetrics, ProbabilityAnalysisResult } from '../types';
import { Calculator, DollarSign, Percent, TrendingUp, AlertCircle, Shield, Sliders } from 'lucide-react';
import { RiskAttributionBreakdown } from './RiskAttributionBreakdown';

interface ProbabilityCalculatorProps {
  marketEconomics: MarketEconomics;
  probabilities: ProbabilityMetrics;
  analysis?: ProbabilityAnalysisResult;
}

export type KalshiCalculatorProps = ProbabilityCalculatorProps;

export const ProbabilityCalculator: React.FC<ProbabilityCalculatorProps> = ({
  marketEconomics,
  probabilities,
  analysis,
}) => {
  const [customPrice, setCustomPrice] = useState<number>(marketEconomics.marketPriceCents);
  const [positionContracts, setPositionContracts] = useState<number>(50);

  // Recalculate dynamic figures based on interactive slider
  const pYes = probabilities.calibratedYesPercent / 100;
  const pNo = 1 - pYes;

  const simYesCost = customPrice / 100;
  const simYesProfit = 1.00 - simYesCost;
  const simYesEV = (pYes * simYesProfit) - (pNo * simYesCost);
  const simYesTotalCost = simYesCost * positionContracts;
  const simYesTotalProfit = simYesProfit * positionContracts;
  const simYesTotalEV = simYesEV * positionContracts;

  const simNoCost = (100 - customPrice) / 100;
  const simNoProfit = 1.00 - simNoCost;
  const simNoEV = (pNo * simNoProfit) - (pYes * simNoCost);
  const simNoTotalCost = simNoCost * positionContracts;
  const simNoTotalProfit = simNoProfit * positionContracts;
  const simNoTotalEV = simNoEV * positionContracts;

  const simEdge = probabilities.calibratedYesPercent - customPrice;

  // Fee calculation: 1.5 cents taker fee
  const feePerContract = 0.015;
  const totalFees = feePerContract * positionContracts;

  return (
    <div
      id="kalshi-calculator-card"
      data-testid="probability-calculator-card"
      className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-7 space-y-6"
    >
      {/* Title & Concept */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#03045e]">
              Can You Make Money on Event Predictions? Expected Value &amp; Sizing Engine
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Analyzing mathematical edge, contract payout economics, exchange fee hurdles, and Kelly risk sizing
          </p>
        </div>

        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#caf0f8]/60 text-[#03045e] border border-[#90e0ef]">
          <span>Formula: EV = P(Win)&times;Profit &minus; P(Lose)&times;Cost</span>
        </span>
      </div>

      {/* Contract Payout Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BUY YES Breakdown */}
        <div className={`rounded-xl p-4 sm:p-5 border transition-all ${
          simEdge > 2 ? 'bg-[#caf0f8]/80 border-[#0077b6]' : 'bg-[#caf0f8]/20 border-[#90e0ef]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0077b6] flex items-center space-x-1.5">
              <span>BUY YES Contract @ {customPrice}¢</span>
              {simEdge > 2 && <span className="px-1.5 py-0.2 rounded bg-[#0077b6] text-white text-[10px] font-bold">+EV Play</span>}
            </span>
            <span className="text-xs font-mono font-bold text-stone-700">
              Win Rate: {probabilities.calibratedYesPercent}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2.5 bg-white/90 rounded-lg border border-[#90e0ef] text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Cost</span>
              <span className="font-bold text-stone-900">${simYesCost.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Payout</span>
              <span className="font-bold text-[#0077b6]">$1.00</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Net Profit</span>
              <span className="font-bold text-[#0077b6]">+${simYesProfit.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">Expected Value (1 contract):</span>
              <span className={`font-mono font-bold ${simYesEV >= 0 ? 'text-[#0077b6]' : 'text-[#03045e]'}`}>
                {simYesEV >= 0 ? `+$${simYesEV.toFixed(3)}` : `-$${Math.abs(simYesEV).toFixed(3)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">For {positionContracts} contracts:</span>
              <span className={`font-mono font-bold ${simYesTotalEV >= 0 ? 'text-[#0077b6]' : 'text-[#03045e]'}`}>
                {simYesTotalEV >= 0 ? `+$${simYesTotalEV.toFixed(2)} EV` : `-$${Math.abs(simYesTotalEV).toFixed(2)} EV`}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-stone-200/50">
              <span className="text-stone-500">Potential Return on Investment:</span>
              <span className="font-bold text-[#03045e]">
                +{((simYesProfit / simYesCost) * 100).toFixed(0)}% ROI
              </span>
            </div>
          </div>
        </div>

        {/* BUY NO Breakdown */}
        <div className={`rounded-xl p-4 sm:p-5 border transition-all ${
          simEdge < -2 ? 'bg-[#caf0f8]/80 border-[#03045e]' : 'bg-[#caf0f8]/20 border-[#90e0ef]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#03045e] flex items-center space-x-1.5">
              <span>BUY NO Contract @ {100 - customPrice}¢</span>
              {simEdge < -2 && <span className="px-1.5 py-0.2 rounded bg-[#03045e] text-white text-[10px] font-bold">+EV Play</span>}
            </span>
            <span className="text-xs font-mono font-bold text-stone-700">
              Win Rate: {probabilities.calibratedNoPercent}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2.5 bg-white/90 rounded-lg border border-[#90e0ef] text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Cost</span>
              <span className="font-bold text-stone-900">${simNoCost.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Payout</span>
              <span className="font-bold text-[#03045e]">$1.00</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Net Profit</span>
              <span className="font-bold text-[#03045e]">+${simNoProfit.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">Expected Value (1 contract):</span>
              <span className={`font-mono font-bold ${simNoEV >= 0 ? 'text-[#03045e]' : 'text-stone-600'}`}>
                {simNoEV >= 0 ? `+$${simNoEV.toFixed(3)}` : `-$${Math.abs(simNoEV).toFixed(3)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">For {positionContracts} contracts:</span>
              <span className={`font-mono font-bold ${simNoTotalEV >= 0 ? 'text-[#03045e]' : 'text-stone-600'}`}>
                {simNoTotalEV >= 0 ? `+$${simNoTotalEV.toFixed(2)} EV` : `-$${Math.abs(simNoTotalEV).toFixed(2)} EV`}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-stone-200/50">
              <span className="text-stone-500">Potential Return on Investment:</span>
              <span className="font-bold text-[#03045e]">
                +{((simNoProfit / simNoCost) * 100).toFixed(0)}% ROI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Price & Position Simulator */}
      <div className="p-4 sm:p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-stone-800">
          <span className="flex items-center space-x-1.5">
            <Sliders className="w-4 h-4 text-[#0077b6]" />
            <span>Interactive Market Price &amp; Position Sensitivity Slider</span>
          </span>
          <span className="font-mono text-stone-600">
            Current Simulated Price: <strong className="text-[#03045e]">{customPrice}¢</strong>
          </span>
        </div>

        <div className="space-y-2">
          <input
            id="price-sensitivity-slider"
            type="range"
            min={1}
            max={99}
            value={customPrice}
            onChange={(e) => setCustomPrice(Number(e.target.value))}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#0077b6]"
          />
          <div className="flex justify-between text-[11px] text-stone-400 font-mono">
            <span>1¢ (Deep Bargain YES)</span>
            <span className="text-[#0077b6] font-semibold">Fair Odds: {probabilities.calibratedYesPercent}¢</span>
            <span>99¢ (Deep Bargain NO)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-200 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-stone-600">Simulate Contract Quantity:</span>
            {[10, 50, 100, 250].map((qty) => (
              <button
                key={qty}
                onClick={() => setPositionContracts(qty)}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                  positionContracts === qty
                    ? 'bg-[#03045e] text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-[#caf0f8]/50 hover:text-[#03045e]'
                }`}
              >
                {qty}
              </button>
            ))}
          </div>

          <div className="text-stone-500">
            Total Stake: <strong className="text-[#03045e]">${((customPrice / 100) * positionContracts).toFixed(2)}</strong> &bull; Max Payout: <strong className="text-[#03045e]">${positionContracts}.00</strong>
          </div>
        </div>
      </div>

      {/* Kelly Criterion & The 3 Critical Rules to Make Money */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Kelly Sizing Box */}
        <div className="p-4 rounded-xl border border-[#90e0ef] bg-white space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#03045e]">
            <Shield className="w-4 h-4 text-[#0077b6]" />
            <span>Optimal Bankroll Sizing (Kelly Criterion)</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Prediction markets are non-linear: betting too much on a single event causes bankroll ruin. Quantitative desks use <strong>Half-Kelly</strong> to protect against model uncertainty.
          </p>
          <div className="p-3 bg-[#caf0f8]/30 rounded-lg border border-[#90e0ef] text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-500">Full Kelly (Theoretical):</span>
              <span className="font-mono font-bold text-stone-800">{(marketEconomics.fullKellyFraction * 100).toFixed(1)}% of bankroll</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Recommended Half-Kelly:</span>
              <span className="font-mono font-bold text-[#0077b6]">{(marketEconomics.halfKellyFraction * 100).toFixed(1)}% of bankroll</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#90e0ef] text-stone-700 font-medium">
              <span>On a $1,000.00 bankroll:</span>
              <span className="font-bold text-[#03045e]">
                ${(1000 * marketEconomics.halfKellyFraction).toFixed(2)} ({marketEconomics.recommendedContractsOn1000Bankroll} contracts)
              </span>
            </div>
          </div>
        </div>

        {/* The Friction Box (Fees, Spreads, Liquidity) */}
        <div className="p-4 rounded-xl border border-[#90e0ef] bg-[#caf0f8]/30 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#03045e]">
            <AlertCircle className="w-4 h-4 text-[#0077b6]" />
            <span>The Reality of Making Money: Fees &amp; Slippage</span>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            In prediction markets, winning requires more than just being "right"—your edge must overcome three mathematical hurdles:
          </p>
          <ul className="space-y-1.5 text-xs text-stone-700">
            <li className="flex items-start space-x-2">
              <span className="text-[#0077b6] font-bold">1. Exchange &amp; Platform Fees:</span>
              <span>Trading platforms charge ~1.5¢ to 3.5¢ per contract. Any statistical edge under 3% is erased by transaction fees.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#0077b6] font-bold">2. Bid-Ask Spread:</span>
              <span>Crossing the spread (e.g. buying at 52¢ ask vs 50¢ bid) immediately loses 2% slippage.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#0077b6] font-bold">3. Capital Opportunity Cost:</span>
              <span>Contracts lock your dollars until the expiration date with zero interest earned.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Risk Attribution & Factor Variance Decomposition (Recharts Pie Chart) */}
      <RiskAttributionBreakdown
        analysis={analysis}
        marketEconomics={marketEconomics}
        probabilities={probabilities}
      />
    </div>
  );
};

export const KalshiCalculator = ProbabilityCalculator;
