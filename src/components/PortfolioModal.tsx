import React, { useState } from 'react';
import { PaperTradePosition, ProbabilityAnalysisResult } from '../types';
import { X, Briefcase, TrendingUp, TrendingDown, CheckCircle, RefreshCw, PlusCircle, Trash2, ArrowUpRight } from 'lucide-react';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankroll: number;
  positions: PaperTradePosition[];
  activeAnalysis: ProbabilityAnalysisResult | null;
  tradeSideToPreload?: 'YES' | 'NO' | null;
  onPlaceTrade: (
    analysis: ProbabilityAnalysisResult,
    contractType: 'YES' | 'NO',
    contractsCount: number
  ) => void;
  onResolvePosition: (positionId: string, outcome: 'WIN' | 'LOSS') => void;
  onResetBankroll: () => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  bankroll,
  positions,
  activeAnalysis,
  tradeSideToPreload,
  onPlaceTrade,
  onResolvePosition,
  onResetBankroll,
}) => {
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO'>(tradeSideToPreload || 'YES');
  const [contractsCount, setContractsCount] = useState<number>(25);

  if (!isOpen) return null;

  // Compute portfolio stats
  const totalCostInvested = positions
    .filter((p) => p.status === 'OPEN')
    .reduce((acc, p) => acc + p.totalCostDollars, 0);

  const realizedPnL = positions
    .filter((p) => p.status !== 'OPEN')
    .reduce((acc, p) => acc + p.unrealizedPnLDollars, 0);

  const winCount = positions.filter((p) => p.status === 'RESOLVED_WIN').length;
  const resolvedCount = positions.filter((p) => p.status !== 'OPEN').length;
  const winRate = resolvedCount > 0 ? (winCount / resolvedCount) * 100 : 0;

  // Active analysis contract cost calculation
  const currentPriceCents = activeAnalysis
    ? selectedSide === 'YES'
      ? activeAnalysis.marketEconomics.marketPriceCents
      : 100 - activeAnalysis.marketEconomics.marketPriceCents
    : 50;

  const tradeCostDollars = (currentPriceCents / 100) * contractsCount;
  const potentialPayoutDollars = 1.00 * contractsCount;
  const potentialProfitDollars = potentialPayoutDollars - tradeCostDollars;

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAnalysis) return;
    if (tradeCostDollars > bankroll) {
      alert('Insufficient funds in simulated bankroll.');
      return;
    }
    onPlaceTrade(activeAnalysis, selectedSide, contractsCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-3xl w-full p-6 space-y-6 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#03045e]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#03045e]">
                Simulated Paper Portfolio & Trade Engine
              </h3>
              <p className="text-xs text-stone-500">
                Test prediction market strategies with a zero-risk $1,000.00 bankroll
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bankroll Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase block">Cash Balance</span>
            <span className="text-lg font-bold text-[#03045e] font-mono">
              ${bankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase block">Open Capital</span>
            <span className="text-lg font-bold text-[#03045e] font-mono">
              ${totalCostInvested.toFixed(2)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase block">Realized P&L</span>
            <span className={`text-lg font-bold font-mono ${realizedPnL >= 0 ? 'text-[#0077b6]' : 'text-[#03045e]'}`}>
              {realizedPnL >= 0 ? `+$${realizedPnL.toFixed(2)}` : `-$${Math.abs(realizedPnL).toFixed(2)}`}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase block">Win Rate</span>
            <span className="text-lg font-bold text-[#03045e] font-mono">
              {resolvedCount > 0 ? `${winRate.toFixed(0)}% (${winCount}/${resolvedCount})` : '0 trades'}
            </span>
          </div>
        </div>

        {/* Execute Trade from Current Analysis */}
        {activeAnalysis && (
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#03045e] uppercase tracking-wide flex items-center space-x-1.5">
                <PlusCircle className="w-4 h-4 text-[#0077b6]" />
                <span>Execute Paper Trade for Current Event</span>
              </span>
              <span className="text-xs text-stone-500 truncate max-w-xs">{activeAnalysis.eventTitle}</span>
            </div>

            <form onSubmit={handleExecuteTrade} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Side Selection */}
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Contract Side</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedSide('YES')}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        selectedSide === 'YES'
                          ? 'bg-[#0077b6] text-white border-[#0077b6]'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      YES ({activeAnalysis.marketEconomics.marketPriceCents}¢)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSide('NO')}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        selectedSide === 'NO'
                          ? 'bg-[#03045e] text-white border-[#03045e]'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      NO ({100 - activeAnalysis.marketEconomics.marketPriceCents}¢)
                    </button>
                  </div>
                </div>

                {/* Contract Quantity */}
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Contracts Count</label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={contractsCount}
                      onChange={(e) => setContractsCount(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
                    />
                  </div>
                </div>

                {/* Payout & Cost preview */}
                <div className="flex flex-col justify-end">
                  <div className="text-[11px] text-stone-500 mb-1 flex justify-between">
                    <span>Total Cost: <strong className="text-[#03045e]">${tradeCostDollars.toFixed(2)}</strong></span>
                    <span>Max Profit: <strong className="text-[#0077b6]">+${potentialProfitDollars.toFixed(2)}</strong></span>
                  </div>
                  <button
                    id="confirm-paper-trade-btn"
                    type="submit"
                    disabled={tradeCostDollars > bankroll}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-[#03045e] hover:bg-[#0077b6] text-white transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                  >
                    Confirm Paper Trade (${tradeCostDollars.toFixed(2)})
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Active & Resolved Positions List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#03045e] uppercase tracking-wide">
              Position Ledger ({positions.length})
            </span>
            <button
              onClick={onResetBankroll}
              className="text-[11px] text-stone-400 hover:text-[#03045e] flex items-center space-x-1 transition-colors cursor-pointer"
              title="Reset portfolio to starting $1,000"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Bankroll</span>
            </button>
          </div>

          {positions.length === 0 ? (
            <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-xs">
              No paper trades executed yet. Run an analysis above and click "Paper Buy YES" or "Paper Buy NO" to test your forecasting edge!
            </div>
          ) : (
            <div className="space-y-2">
              {positions.map((pos) => {
                const isOpen = pos.status === 'OPEN';
                const isWin = pos.status === 'RESOLVED_WIN';

                return (
                  <div
                    key={pos.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isOpen
                        ? 'bg-white border-stone-200'
                        : isWin
                        ? 'bg-[#caf0f8]/30 border-[#90e0ef]'
                        : 'bg-stone-50/70 border-stone-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono border ${
                          pos.contractType === 'YES' ? 'bg-[#caf0f8] text-[#0077b6] border-[#00b4d8]' : 'bg-[#03045e] text-white border-[#03045e]'
                        }`}>
                          {pos.contractType}
                        </span>
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {pos.eventTitle}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center space-x-3">
                        <span>{pos.contractsCount} contracts @ {pos.purchasePriceCents}¢</span>
                        <span>Stake: ${pos.totalCostDollars.toFixed(2)}</span>
                        <span>Time: {new Date(pos.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Outcome Action / Result */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {isOpen ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[11px] font-medium text-stone-500 mr-1">Simulate Resolution:</span>
                          <button
                            onClick={() => onResolvePosition(pos.id, 'WIN')}
                            className="px-2.5 py-1 rounded text-xs font-bold bg-[#0077b6] hover:bg-[#00b4d8] text-white transition-colors shadow-xs cursor-pointer"
                            title="Simulate contract settling in your favor ($1.00 payout)"
                          >
                            Outcome: WIN
                          </button>
                          <button
                            onClick={() => onResolvePosition(pos.id, 'LOSS')}
                            className="px-2.5 py-1 rounded text-xs font-bold bg-[#03045e] hover:bg-[#0077b6] text-white transition-colors shadow-xs cursor-pointer"
                            title="Simulate contract settling against you ($0.00 payout)"
                          >
                            Outcome: LOSS
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className={`text-xs font-mono font-bold block ${
                            isWin ? 'text-[#0077b6]' : 'text-[#03045e]'
                          }`}>
                            {isWin ? `+${pos.unrealizedPnLDollars.toFixed(2)}` : `-${Math.abs(pos.unrealizedPnLDollars).toFixed(2)}`}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-stone-400">
                            {pos.status.replace('RESOLVED_', '')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
