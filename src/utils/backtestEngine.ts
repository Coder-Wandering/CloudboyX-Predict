import {
  MarketCategory,
  BacktestStrategySettings,
  BacktestDayRecord,
  BacktestPerformanceMetrics,
  BacktestExecutionResult,
  ProbabilityAnalysisResult,
} from '../types';
import { HISTORICAL_30D_MARKETS, RawHistoricalDayMarket } from './historicalBacktestData';

export function runHistoricalBacktest(
  category: MarketCategory,
  analysis: ProbabilityAnalysisResult | null | undefined,
  customSettings?: Partial<BacktestStrategySettings>
): BacktestExecutionResult {
  const settings: BacktestStrategySettings = {
    category,
    initialBankroll: customSettings?.initialBankroll ?? 1000,
    minEdgeThreshold: customSettings?.minEdgeThreshold ?? 4,
    sizingMethod: customSettings?.sizingMethod ?? 'half_kelly',
    fixedStakeAmount: customSettings?.fixedStakeAmount ?? 100,
    fixedContractsCount: customSettings?.fixedContractsCount ?? 50,
    includeFees: customSettings?.includeFees ?? true,
  };

  const rawMarkets = HISTORICAL_30D_MARKETS[category] || HISTORICAL_30D_MARKETS['Economics'];

  // Current model parameters
  const modelCalibratedProb = analysis?.probabilities.calibratedYesPercent ?? 62;
  const modelHalfKelly = analysis?.marketEconomics.halfKellyFraction ?? 0.18;

  let currentEquity = settings.initialBankroll;
  let benchmarkEquity = settings.initialBankroll;
  let peakEquity = settings.initialBankroll;

  let winningTrades = 0;
  let losingTrades = 0;
  let passedDays = 0;
  let totalGrossWins = 0;
  let totalGrossLosses = 0;
  let maxDrawdownDollars = 0;
  let maxDrawdownPercent = 0;
  let bestTradeDollars = -Infinity;
  let worstTradeDollars = Infinity;

  let currentConsecutiveWins = 0;
  let maxConsecutiveWins = 0;
  let currentConsecutiveLosses = 0;
  let maxConsecutiveLosses = 0;

  const dailyReturns: number[] = [];
  const brierErrors: number[] = [];

  const days: BacktestDayRecord[] = [];

  rawMarkets.forEach((market: RawHistoricalDayMarket, index: number) => {
    // Determine the simulated model probability for this specific contract
    // Blending current model's calibration with historical base rate
    const modelBias = (modelCalibratedProb - 50) * 0.25;
    let simulatedModelProb = Math.round(market.historicalBaseRatePercent + modelBias);
    // Boundary checks
    simulatedModelProb = Math.max(5, Math.min(95, simulatedModelProb));

    const marketPrice = market.closePriceCents;
    const edgePercent = simulatedModelProb - marketPrice;

    let signal: 'BUY YES' | 'BUY NO' | 'PASS' = 'PASS';
    if (edgePercent >= settings.minEdgeThreshold) {
      signal = 'BUY YES';
    } else if (edgePercent <= -settings.minEdgeThreshold) {
      signal = 'BUY NO';
    }

    let contractsCount = 0;
    let positionCostDollars = 0;
    let feeDollars = 0;
    let tradePnLDollars = 0;
    let tradeReturnPercent = 0;
    let isWin: boolean | null = null;

    const feePerContract = settings.includeFees ? 0.015 : 0; // Market exchange taker fee: 1.5 cents

    if (signal === 'BUY YES') {
      const pricePerContract = marketPrice / 100;
      let targetStake = 0;

      if (settings.sizingMethod === 'half_kelly') {
        const p = simulatedModelProb / 100;
        const b = (1 - pricePerContract) / pricePerContract;
        const fullKelly = b > 0 ? (p * b - (1 - p)) / b : 0;
        const fraction = Math.max(0, Math.min(0.25, fullKelly * 0.5));
        targetStake = currentEquity * (fraction > 0 ? fraction : modelHalfKelly);
      } else if (settings.sizingMethod === 'full_kelly') {
        const p = simulatedModelProb / 100;
        const b = (1 - pricePerContract) / pricePerContract;
        const fullKelly = b > 0 ? (p * b - (1 - p)) / b : 0;
        const fraction = Math.max(0, Math.min(0.35, fullKelly));
        targetStake = currentEquity * (fraction > 0 ? fraction : modelHalfKelly * 2);
      } else if (settings.sizingMethod === 'fixed_stake') {
        targetStake = Math.min(settings.fixedStakeAmount, currentEquity * 0.3);
      } else {
        targetStake = settings.fixedContractsCount * pricePerContract;
      }

      targetStake = Math.max(10, Math.min(currentEquity * 0.4, targetStake));
      contractsCount = Math.max(1, Math.floor(targetStake / (pricePerContract + feePerContract)));
      positionCostDollars = Number((contractsCount * pricePerContract).toFixed(2));
      feeDollars = Number((contractsCount * feePerContract).toFixed(2));

      // Outcome resolution: YES wins payout 100¢ ($1.00), NO wins payout 0¢ ($0.00)
      if (market.actualOutcome === 'YES') {
        isWin = true;
        const payout = contractsCount * 1.0;
        tradePnLDollars = Number((payout - positionCostDollars - feeDollars).toFixed(2));
      } else {
        isWin = false;
        tradePnLDollars = Number((-positionCostDollars - feeDollars).toFixed(2));
      }
    } else if (signal === 'BUY NO') {
      const pricePerContract = (100 - marketPrice) / 100;
      let targetStake = 0;

      if (settings.sizingMethod === 'half_kelly') {
        const q = (100 - simulatedModelProb) / 100;
        const b = (1 - pricePerContract) / pricePerContract;
        const fullKelly = b > 0 ? (q * b - (1 - q)) / b : 0;
        const fraction = Math.max(0, Math.min(0.25, fullKelly * 0.5));
        targetStake = currentEquity * (fraction > 0 ? fraction : modelHalfKelly);
      } else if (settings.sizingMethod === 'full_kelly') {
        const q = (100 - simulatedModelProb) / 100;
        const b = (1 - pricePerContract) / pricePerContract;
        const fullKelly = b > 0 ? (q * b - (1 - q)) / b : 0;
        const fraction = Math.max(0, Math.min(0.35, fullKelly));
        targetStake = currentEquity * (fraction > 0 ? fraction : modelHalfKelly * 2);
      } else if (settings.sizingMethod === 'fixed_stake') {
        targetStake = Math.min(settings.fixedStakeAmount, currentEquity * 0.3);
      } else {
        targetStake = settings.fixedContractsCount * pricePerContract;
      }

      targetStake = Math.max(10, Math.min(currentEquity * 0.4, targetStake));
      contractsCount = Math.max(1, Math.floor(targetStake / (pricePerContract + feePerContract)));
      positionCostDollars = Number((contractsCount * pricePerContract).toFixed(2));
      feeDollars = Number((contractsCount * feePerContract).toFixed(2));

      if (market.actualOutcome === 'NO') {
        isWin = true;
        const payout = contractsCount * 1.0;
        tradePnLDollars = Number((payout - positionCostDollars - feeDollars).toFixed(2));
      } else {
        isWin = false;
        tradePnLDollars = Number((-positionCostDollars - feeDollars).toFixed(2));
      }
    } else {
      passedDays += 1;
    }

    if (positionCostDollars > 0) {
      tradeReturnPercent = Number(((tradePnLDollars / positionCostDollars) * 100).toFixed(1));
    }

    currentEquity = Number((currentEquity + tradePnLDollars).toFixed(2));
    const previousEquity = currentEquity - tradePnLDollars;
    const dailyReturnPct = previousEquity > 0 ? tradePnLDollars / previousEquity : 0;
    dailyReturns.push(dailyReturnPct);

    // Passive benchmark: holding equal 50% baseline or market consensus
    const benchmarkOutcomeWin = market.actualOutcome === 'YES';
    const benchmarkReturn = benchmarkOutcomeWin ? 0.008 : -0.006;
    benchmarkEquity = Number((benchmarkEquity * (1 + benchmarkReturn)).toFixed(2));

    if (currentEquity > peakEquity) {
      peakEquity = currentEquity;
    }

    const currentDrawdownDollars = peakEquity - currentEquity;
    const currentDrawdownPercent = peakEquity > 0 ? Number(((currentDrawdownDollars / peakEquity) * 100).toFixed(1)) : 0;

    if (currentDrawdownDollars > maxDrawdownDollars) {
      maxDrawdownDollars = currentDrawdownDollars;
    }
    if (currentDrawdownPercent > maxDrawdownPercent) {
      maxDrawdownPercent = currentDrawdownPercent;
    }

    if (isWin === true) {
      winningTrades += 1;
      totalGrossWins += tradePnLDollars;
      currentConsecutiveWins += 1;
      currentConsecutiveLosses = 0;
      if (currentConsecutiveWins > maxConsecutiveWins) {
        maxConsecutiveWins = currentConsecutiveWins;
      }
      if (tradePnLDollars > bestTradeDollars) {
        bestTradeDollars = tradePnLDollars;
      }
    } else if (isWin === false) {
      losingTrades += 1;
      totalGrossLosses += Math.abs(tradePnLDollars);
      currentConsecutiveLosses += 1;
      currentConsecutiveWins = 0;
      if (currentConsecutiveLosses > maxConsecutiveLosses) {
        maxConsecutiveLosses = currentConsecutiveLosses;
      }
      if (tradePnLDollars < worstTradeDollars) {
        worstTradeDollars = tradePnLDollars;
      }
    }

    // Brier Score calculation for model calibration
    const outcomeBinary = market.actualOutcome === 'YES' ? 1 : 0;
    const forecastProbDecimal = simulatedModelProb / 100;
    brierErrors.push(Math.pow(forecastProbDecimal - outcomeBinary, 2));

    days.push({
      day: market.day,
      date: market.date,
      fullDate: market.fullDate,
      contractTicker: market.contractTicker,
      contractTitle: market.contractTitle,
      category: market.category,
      openPriceCents: market.openPriceCents,
      highPriceCents: market.highPriceCents,
      lowPriceCents: market.lowPriceCents,
      closePriceCents: market.closePriceCents,
      spreadCents: market.spreadCents,
      volume: market.volume,
      eventHeadline: market.eventHeadline,
      actualOutcome: market.actualOutcome,
      modelProbPercent: simulatedModelProb,
      modelSignal: signal,
      edgePercent,
      contractsCount,
      positionCostDollars,
      feeDollars,
      tradePnLDollars,
      tradeReturnPercent,
      cumulativePnLDollars: Number((currentEquity - settings.initialBankroll).toFixed(2)),
      cumulativeEquityDollars: currentEquity,
      benchmarkEquityDollars: benchmarkEquity,
      drawdownPercent: currentDrawdownPercent,
      isWin,
    });
  });

  const totalTrades = winningTrades + losingTrades;
  const netProfitDollars = Number((currentEquity - settings.initialBankroll).toFixed(2));
  const totalRoiPercent = Number(((netProfitDollars / settings.initialBankroll) * 100).toFixed(1));
  const winRatePercent = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;
  const profitFactor = totalGrossLosses > 0 ? Number((totalGrossWins / totalGrossLosses).toFixed(2)) : totalGrossWins > 0 ? 99.9 : 1.0;

  // Annualized Sharpe Ratio calculation (assume 252 trading days/yr, 4.5% annual risk-free rate)
  const rfDaily = 0.045 / 252;
  const meanDailyReturn = dailyReturns.reduce((acc, r) => acc + r, 0) / (dailyReturns.length || 1);
  const variance = dailyReturns.reduce((acc, r) => acc + Math.pow(r - meanDailyReturn, 2), 0) / (dailyReturns.length || 1);
  const stdDailyReturn = Math.sqrt(variance);
  const sharpeRatio = stdDailyReturn > 0 ? Number((((meanDailyReturn - rfDaily) / stdDailyReturn) * Math.sqrt(252)).toFixed(2)) : 0;

  // Sortino Ratio (downside deviation only)
  const downsideVariance = dailyReturns.reduce((acc, r) => (r < rfDaily ? acc + Math.pow(r - rfDaily, 2) : acc), 0) / (dailyReturns.length || 1);
  const downsideDeviation = Math.sqrt(downsideVariance);
  const sortinoRatio = downsideDeviation > 0 ? Number((((meanDailyReturn - rfDaily) / downsideDeviation) * Math.sqrt(252)).toFixed(2)) : 0;

  // Brier Calibration Score (lower is better, 0 is perfect, 0.25 is random coin flip)
  const brierScore = Number((brierErrors.reduce((a, b) => a + b, 0) / (brierErrors.length || 1)).toFixed(3));

  // Alpha vs passive holding
  const passiveTotalReturn = Number((((benchmarkEquity - settings.initialBankroll) / settings.initialBankroll) * 100).toFixed(1));
  const alphaVsPassivePercent = Number((totalRoiPercent - passiveTotalReturn).toFixed(1));

  const avgTradePnLDollars = totalTrades > 0 ? Number((netProfitDollars / totalTrades).toFixed(2)) : 0;

  const metrics: BacktestPerformanceMetrics = {
    category,
    initialBankroll: settings.initialBankroll,
    finalEquity: currentEquity,
    netProfitDollars,
    totalRoiPercent,
    totalTrades,
    winningTrades,
    losingTrades,
    passedDays,
    winRatePercent,
    profitFactor,
    sharpeRatio,
    sortinoRatio,
    maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(1)),
    maxDrawdownDollars: Number(maxDrawdownDollars.toFixed(2)),
    avgTradePnLDollars,
    brierScore,
    alphaVsPassivePercent,
    bestTradeDollars: bestTradeDollars === -Infinity ? 0 : bestTradeDollars,
    worstTradeDollars: worstTradeDollars === Infinity ? 0 : worstTradeDollars,
    consecutiveWinsMax: maxConsecutiveWins,
    consecutiveLossesMax: maxConsecutiveLosses,
  };

  return {
    settings,
    metrics,
    days,
    category,
    timestamp: new Date().toISOString(),
  };
}
