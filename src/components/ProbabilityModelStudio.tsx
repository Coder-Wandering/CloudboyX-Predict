import React, { useState, useEffect } from 'react';
import {
  StructuredFeatures,
  ModelStage,
  LinearModelPrediction,
  LogisticModelPrediction,
  GeminiModelPrediction,
} from '../types';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  Activity,
  Percent,
  CheckCircle2,
  RefreshCw,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Database,
  BarChart2,
  Trophy,
  Wind,
  ShieldAlert,
} from 'lucide-react';

interface ProbabilityModelStudioProps {
  ingestedFeatures?: StructuredFeatures | null;
  onOpenIngestionHub: () => void;
  onOpenPythonScript: () => void;
}

export const ProbabilityModelStudio: React.FC<ProbabilityModelStudioProps> = ({
  ingestedFeatures,
  onOpenIngestionHub,
  onOpenPythonScript,
}) => {
  const [stage, setStage] = useState<ModelStage>('linear');
  const [eventQuery, setEventQuery] = useState<string>(
    'Will the Federal Reserve cut interest rates at the next FOMC meeting?'
  );
  const [nflMode, setNflMode] = useState<boolean>(false);

  // Structured feature inputs state
  const [features, setFeatures] = useState<StructuredFeatures>({
    news_sentiment_score: ingestedFeatures?.news_sentiment_score ?? 0.25,
    news_article_count: ingestedFeatures?.news_article_count ?? 8,
    macro_momentum_percent: ingestedFeatures?.macro_momentum_percent ?? 0.40,
    market_volatility_vix: ingestedFeatures?.market_volatility_vix ?? 15.3,
    treasury_10y_yield: ingestedFeatures?.treasury_10y_yield ?? 4.12,
    market_implied_prior: ingestedFeatures?.market_implied_prior ?? 54.0,
    days_to_resolution: ingestedFeatures?.days_to_resolution ?? 14,
    nfl_offensive_epa: ingestedFeatures?.nfl_offensive_epa ?? 0.12,
    nfl_starting_qb_dvoa: ingestedFeatures?.nfl_starting_qb_dvoa ?? 18.5,
    nfl_injury_impact_index: ingestedFeatures?.nfl_injury_impact_index ?? 0.08,
    nfl_home_field_advantage: ingestedFeatures?.nfl_home_field_advantage ?? 2.0,
    nfl_weather_wind_mph: ingestedFeatures?.nfl_weather_wind_mph ?? 8.0,
  });

  // Custom weights for linear regression
  const [intercept, setIntercept] = useState<number>(18.50);
  const [weights, setWeights] = useState<Record<string, number>>({
    news_sentiment_score: 24.0,
    macro_momentum_percent: 3.2,
    market_volatility_vix: -0.45,
    treasury_10y_yield: -2.10,
    market_implied_prior: 0.58,
    nfl_offensive_epa: 45.0,
    nfl_starting_qb_dvoa: 0.35,
    nfl_injury_impact_index: 15.0,
    nfl_home_field_advantage: 2.2,
    nfl_weather_wind_mph: -0.15,
  });

  // Prediction states
  const [linearResult, setLinearResult] = useState<LinearModelPrediction | null>(null);
  const [logisticResult, setLogisticResult] = useState<LogisticModelPrediction | null>(null);
  const [geminiResult, setGeminiResult] = useState<GeminiModelPrediction | null>(null);
  const [isComputing, setIsComputing] = useState<boolean>(false);

  // Sync ingested features if they update
  useEffect(() => {
    if (ingestedFeatures) {
      setFeatures(ingestedFeatures);
    }
  }, [ingestedFeatures]);

  // Compute probability whenever features, stage, or weights change
  const runInference = async (targetStage: ModelStage = stage) => {
    setIsComputing(true);
    try {
      const res = await fetch('/api/model/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelType: targetStage,
          features,
          customWeights: weights,
          customIntercept: intercept,
          query: eventQuery,
        }),
      });

      const data = await res.json();
      if (data.result) {
        if (targetStage === 'linear') {
          setLinearResult(data.result);
        } else if (targetStage === 'logistic') {
          setLogisticResult(data.result);
        } else if (targetStage === 'gemini') {
          setGeminiResult(data.result);
        }
      }
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setIsComputing(false);
    }
  };

  // Run on mount or stage change
  useEffect(() => {
    runInference(stage);
  }, [stage, features, intercept, weights]);

  // Reset to calibrated baseline weights
  const handleResetWeights = () => {
    setIntercept(18.50);
    setWeights({
      news_sentiment_score: 24.0,
      macro_momentum_percent: 3.2,
      market_volatility_vix: -0.45,
      treasury_10y_yield: -2.10,
      market_implied_prior: 0.58,
      nfl_offensive_epa: 45.0,
      nfl_starting_qb_dvoa: 0.35,
      nfl_injury_impact_index: 15.0,
      nfl_home_field_advantage: 2.2,
      nfl_weather_wind_mph: -0.15,
    });
  };

  const handleApplyPreset = (type: 'chiefs' | 'lions' | 'bills' | 'fed') => {
    if (type === 'chiefs') {
      setNflMode(true);
      setEventQuery('Will Kansas City Chiefs defeat Baltimore Ravens?');
      setFeatures((prev) => ({
        ...prev,
        news_sentiment_score: 0.35,
        macro_momentum_percent: 0.20,
        market_volatility_vix: 14.8,
        market_implied_prior: 58.0,
        nfl_offensive_epa: 0.14,
        nfl_starting_qb_dvoa: 22.4,
        nfl_injury_impact_index: 0.12,
        nfl_home_field_advantage: 2.1,
        nfl_weather_wind_mph: 9.0,
      }));
    } else if (type === 'lions') {
      setNflMode(true);
      setEventQuery('Will Detroit Lions cover -3.5 point spread vs Green Bay Packers?');
      setFeatures((prev) => ({
        ...prev,
        news_sentiment_score: 0.28,
        macro_momentum_percent: 0.10,
        market_volatility_vix: 15.0,
        market_implied_prior: 53.0,
        nfl_offensive_epa: 0.18,
        nfl_starting_qb_dvoa: 24.8,
        nfl_injury_impact_index: 0.05,
        nfl_home_field_advantage: 2.4,
        nfl_weather_wind_mph: 0.0,
      }));
    } else if (type === 'bills') {
      setNflMode(true);
      setEventQuery('Will Buffalo Bills defeat Miami Dolphins in Week 9?');
      setFeatures((prev) => ({
        ...prev,
        news_sentiment_score: 0.30,
        macro_momentum_percent: 0.0,
        market_volatility_vix: 16.2,
        market_implied_prior: 61.0,
        nfl_offensive_epa: 0.11,
        nfl_starting_qb_dvoa: 16.2,
        nfl_injury_impact_index: 0.15,
        nfl_home_field_advantage: 2.0,
        nfl_weather_wind_mph: 17.0,
      }));
    } else {
      setNflMode(false);
      setEventQuery('Will the Federal Reserve cut interest rates at the next FOMC meeting?');
      setFeatures((prev) => ({
        ...prev,
        news_sentiment_score: 0.25,
        macro_momentum_percent: 0.40,
        market_volatility_vix: 15.3,
        treasury_10y_yield: 4.12,
        market_implied_prior: 54.0,
      }));
    }
  };

  const handleApplyIngested = () => {
    if (ingestedFeatures) {
      setFeatures({ ...ingestedFeatures });
    }
  };

  // Calculate active probability
  let activeProbability = 50;
  if (stage === 'linear' && linearResult) activeProbability = linearResult.probability_percent;
  if (stage === 'logistic' && logisticResult) activeProbability = logisticResult.probability_percent;
  if (stage === 'gemini' && geminiResult) activeProbability = geminiResult.probability_percent;

  return (
    <div id="probability-model-studio-root" className="space-y-6">
      {/* Header Banner & Model Progression Roadmap */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] uppercase tracking-wide">
                Probability Modeling Architecture
              </span>
              <span className="text-xs text-stone-400 font-mono">v1.2 OLS &rarr; Logit &rarr; Gemini</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#03045e]">
              Structured Data Probability Model Studio
            </h2>
            <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
              Takes structured quantitative features (sentiment, macro momentum, market implied priors, volatility) and outputs calibrated probability percentages. Start with simple linear regression, iterate to logistic odds, and scale with Google AI Studio Gemini.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              id="view-ingested-data-btn"
              onClick={onOpenIngestionHub}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-stone-600" />
              <span>Ingested Data Feeds</span>
            </button>
            <button
              id="view-python-script-btn"
              onClick={onOpenPythonScript}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#03045e] hover:bg-[#0077b6] text-white transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-[#00b4d8]" />
              <span>Python Script (.py)</span>
            </button>
          </div>
        </div>

        {/* Model Stage Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Stage 1 Tab */}
          <button
            id="model-stage-linear-btn"
            onClick={() => setStage('linear')}
            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
              stage === 'linear'
                ? 'bg-[#caf0f8]/50 border-[#00b4d8] ring-1 ring-[#00b4d8]/40 shadow-xs'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100/80 text-stone-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                stage === 'linear' ? 'bg-[#caf0f8] text-[#0077b6] border-[#00b4d8]' : 'bg-stone-200 text-stone-700 border-stone-300'
              }`}>
                Stage 1 &bull; Baseline
              </span>
              <span className="text-xs font-mono font-bold text-[#03045e]">
                {linearResult ? `${linearResult.probability_percent}%` : '--'}
              </span>
            </div>
            <div className="font-bold text-sm text-[#03045e] mb-1">
              Simple Linear Regression
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              Ordinary Least Squares formulation: P = &beta;₀ + &sum; &beta;ᵢXᵢ clamped to [0%, 100%]. High transparency and direct feature weights.
            </p>
          </button>

          {/* Stage 2 Tab */}
          <button
            id="model-stage-logistic-btn"
            onClick={() => setStage('logistic')}
            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
              stage === 'logistic'
                ? 'bg-[#caf0f8]/50 border-[#0077b6] ring-1 ring-[#0077b6]/40 shadow-xs'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100/80 text-stone-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                stage === 'logistic' ? 'bg-[#caf0f8] text-[#03045e] border-[#0077b6]' : 'bg-stone-200 text-stone-700 border-stone-300'
              }`}>
                Stage 2 &bull; Sigmoid Odds
              </span>
              <span className="text-xs font-mono font-bold text-[#03045e]">
                {logisticResult ? `${logisticResult.probability_percent}%` : '--'}
              </span>
            </div>
            <div className="font-bold text-sm text-[#03045e] mb-1">
              Regularized Logistic Model
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              Sigmoid odds transformation: P = 1 / (1 + e⁻ᶻ). Solves linear boundary clipping with monotonic asymptotic bounds and Brier calibration.
            </p>
          </button>

          {/* Stage 3 Tab */}
          <button
            id="model-stage-gemini-btn"
            onClick={() => setStage('gemini')}
            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
              stage === 'gemini'
                ? 'bg-[#caf0f8]/60 border-[#03045e] ring-1 ring-[#03045e]/30 shadow-xs'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100/80 text-stone-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                stage === 'gemini' ? 'bg-[#03045e] text-white' : 'bg-stone-200 text-stone-700'
              }`}>
                Stage 3 &bull; AI Studio Engine
              </span>
              <span className="text-xs font-mono font-bold text-[#03045e]">
                {geminiResult ? `${geminiResult.probability_percent}%` : '--'}
              </span>
            </div>
            <div className="font-bold text-sm text-[#03045e] mb-1 flex items-center space-x-1">
              <span>Google AI Studio Gemini</span>
              <Sparkles className="w-3.5 h-3.5 text-[#0077b6]" />
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              Structured Bayesian reasoning on multi-source feature vectors with non-linear macroeconomic cross-correlations and confidence bounds.
            </p>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Feature Inputs (Left) & Model Output + Equation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Structured Feature Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#0077b6]" />
                <h3 className="text-sm font-bold text-[#03045e]">
                  Structured Feature Vector Inputs (X)
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleApplyIngested}
                  className="text-xs font-semibold text-[#0077b6] hover:text-[#03045e] flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Load real-time features from API ingestion"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync Ingested Feeds</span>
                </button>
              </div>
            </div>

            {/* Target Query Input & Quick Domain Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 block">
                  Target Event Description
                </label>
                <div className="flex items-center space-x-1 text-[11px]">
                  <span className="text-stone-400 text-[10px] mr-1">Presets:</span>
                  <button
                    onClick={() => handleApplyPreset('chiefs')}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-[#caf0f8] hover:text-[#0077b6] text-stone-700 font-medium transition-colors cursor-pointer"
                  >
                    Chiefs vs Ravens
                  </button>
                  <button
                    onClick={() => handleApplyPreset('lions')}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-[#caf0f8] hover:text-[#0077b6] text-stone-700 font-medium transition-colors cursor-pointer"
                  >
                    Lions -3.5
                  </button>
                  <button
                    onClick={() => handleApplyPreset('bills')}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-[#caf0f8] hover:text-[#0077b6] text-stone-700 font-medium transition-colors cursor-pointer"
                  >
                    Bills vs MIA
                  </button>
                  <button
                    onClick={() => handleApplyPreset('fed')}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
                  >
                    Fed FOMC
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={eventQuery}
                onChange={(e) => {
                  setEventQuery(e.target.value);
                  const q = e.target.value.toLowerCase();
                  if (q.includes('nfl') || q.includes('football') || q.includes('chiefs') || q.includes('lions') || q.includes('bills')) {
                    setNflMode(true);
                  }
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
                placeholder="Describe the event to predict..."
              />
            </div>

            {/* NFL Domain Mode Toggle Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#caf0f8]/30 border border-[#90e0ef]">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-[#0077b6]" />
                <div>
                  <span className="text-xs font-bold text-[#03045e] block">
                    NFL Football Quantitative Analytics Engine
                  </span>
                  <span className="text-[10px] text-stone-500">
                    Expected Points Added (EPA), DVOA, injury index, and stadium weather vectors
                  </span>
                </div>
              </div>
              <button
                onClick={() => setNflMode(!nflMode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  nflMode
                    ? 'bg-[#03045e] text-white'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {nflMode ? 'NFL Mode Active' : 'Enable NFL Mode'}
              </button>
            </div>

            {/* Feature 1: News Sentiment */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-800">
                  X₁: News Headline Polarity Sentiment
                </span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] border ${
                  features.news_sentiment_score > 0
                    ? 'bg-[#caf0f8] text-[#0077b6] border-[#00b4d8]'
                    : features.news_sentiment_score < 0
                    ? 'bg-[#caf0f8]/60 text-[#03045e] border-[#90e0ef]'
                    : 'bg-stone-200 text-stone-800 border-stone-300'
                }`}>
                  {features.news_sentiment_score > 0 ? `+${features.news_sentiment_score}` : features.news_sentiment_score}
                </span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={features.news_sentiment_score}
                onChange={(e) => setFeatures({ ...features, news_sentiment_score: parseFloat(e.target.value) })}
                className="w-full accent-[#0077b6]"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>-1.0 (Strong Bearish / Hawkish)</span>
                <span>0.0 (Neutral)</span>
                <span>+1.0 (Strong Bullish / Easing)</span>
              </div>
            </div>

            {/* Feature 2: Macro Momentum */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-800">
                  X₂: Benchmark Equity Momentum (24h % Return)
                </span>
                <span className="font-mono font-bold text-[#03045e] text-[11px]">
                  {features.macro_momentum_percent > 0 ? `+${features.macro_momentum_percent}%` : `${features.macro_momentum_percent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-4"
                max="4"
                step="0.1"
                value={features.macro_momentum_percent}
                onChange={(e) => setFeatures({ ...features, macro_momentum_percent: parseFloat(e.target.value) })}
                className="w-full accent-[#0077b6]"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>-4.0% (Selloff)</span>
                <span>0.0% (Flat)</span>
                <span>+4.0% (Risk-on Rally)</span>
              </div>
            </div>

            {/* Feature 3: Market Volatility VIX */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-800">
                  X₃: CBOE Volatility Index (VIX)
                </span>
                <span className="font-mono font-bold text-[#03045e] text-[11px]">
                  {features.market_volatility_vix.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="0.5"
                value={features.market_volatility_vix}
                onChange={(e) => setFeatures({ ...features, market_volatility_vix: parseFloat(e.target.value) })}
                className="w-full accent-[#0077b6]"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>10.0 (Calm)</span>
                <span>20.0 (Elevated)</span>
                <span>45.0 (Extreme Panic)</span>
              </div>
            </div>

            {/* Feature 4: 10-Year Treasury Yield */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-800">
                  X₄: US 10-Year Treasury Yield (%)
                </span>
                <span className="font-mono font-bold text-[#03045e] text-[11px]">
                  {features.treasury_10y_yield.toFixed(2)}%
                </span>
              </div>
              <input
                type="range"
                min="2.5"
                max="6.0"
                step="0.05"
                value={features.treasury_10y_yield}
                onChange={(e) => setFeatures({ ...features, treasury_10y_yield: parseFloat(e.target.value) })}
                className="w-full accent-[#0077b6]"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>2.50% (Accommodative)</span>
                <span>4.25% (Neutral)</span>
                <span>6.00% (Restrictive)</span>
              </div>
            </div>

            {/* Feature 5: Market Implied Prior */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-800">
                  X₅: Market Orderbook Implied Prior Odds (e.g. Kalshi)
                </span>
                <span className="font-mono font-bold text-[#0077b6] text-[11px]">
                  {features.market_implied_prior}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="99"
                step="1"
                value={features.market_implied_prior}
                onChange={(e) => setFeatures({ ...features, market_implied_prior: parseFloat(e.target.value) })}
                className="w-full accent-[#0077b6]"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>1¢ / 1% (Low)</span>
                <span>50¢ / 50% (Coinflip)</span>
                <span>99¢ / 99% (Consensus)</span>
              </div>
            </div>

            {/* NFL Football Analytics Quantitative Features */}
            {nflMode && (
              <div className="space-y-4 pt-4 border-t border-[#90e0ef]/60">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-[#0077b6]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#03045e]">
                    NFL Quantitative Features (Stage 1 & 2 Vector)
                  </span>
                </div>

                {/* Feature 6: Offensive EPA per Play */}
                <div className="p-3.5 rounded-xl bg-[#caf0f8]/20 border border-[#90e0ef] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-800 flex items-center space-x-1.5">
                      <span>X₆: Expected Points Added (EPA / Play)</span>
                    </span>
                    <span className="font-mono font-bold text-[#0077b6] text-[11px] px-2 py-0.5 rounded bg-white border border-[#90e0ef]">
                      {(features.nfl_offensive_epa ?? 0.12) > 0 ? `+${(features.nfl_offensive_epa ?? 0.12).toFixed(2)}` : (features.nfl_offensive_epa ?? 0.12).toFixed(2)} EPA
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-0.30"
                    max="0.35"
                    step="0.01"
                    value={features.nfl_offensive_epa ?? 0.12}
                    onChange={(e) => setFeatures({ ...features, nfl_offensive_epa: parseFloat(e.target.value) })}
                    className="w-full accent-[#0077b6]"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>-0.30 (Bottom Offense)</span>
                    <span>0.00 (League Avg)</span>
                    <span>+0.35 (Elite Mahomes/Lamar)</span>
                  </div>
                </div>

                {/* Feature 7: Starting QB DVOA */}
                <div className="p-3.5 rounded-xl bg-[#caf0f8]/20 border border-[#90e0ef] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-800">
                      X₇: Starting Quarterback DVOA Rating (%)
                    </span>
                    <span className="font-mono font-bold text-[#03045e] text-[11px] px-2 py-0.5 rounded bg-white border border-[#90e0ef]">
                      {(features.nfl_starting_qb_dvoa ?? 18.5) > 0 ? `+${(features.nfl_starting_qb_dvoa ?? 18.5).toFixed(1)}%` : `${(features.nfl_starting_qb_dvoa ?? 18.5).toFixed(1)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="50"
                    step="0.5"
                    value={features.nfl_starting_qb_dvoa ?? 18.5}
                    onChange={(e) => setFeatures({ ...features, nfl_starting_qb_dvoa: parseFloat(e.target.value) })}
                    className="w-full accent-[#0077b6]"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>-40.0% (Backup Tier)</span>
                    <span>0.0% (Average)</span>
                    <span>+50.0% (MVP Caliber)</span>
                  </div>
                </div>

                {/* Feature 8: Net Injury Impact Index */}
                <div className="p-3.5 rounded-xl bg-[#caf0f8]/20 border border-[#90e0ef] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-800 flex items-center space-x-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#0077b6]" />
                      <span>X₈: Net Injury Differential Index</span>
                    </span>
                    <span className="font-mono font-bold text-[#03045e] text-[11px] px-2 py-0.5 rounded bg-white border border-[#90e0ef]">
                      {(features.nfl_injury_impact_index ?? 0.08) > 0 ? `+${(features.nfl_injury_impact_index ?? 0.08).toFixed(2)}` : (features.nfl_injury_impact_index ?? 0.08).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-0.50"
                    max="0.50"
                    step="0.02"
                    value={features.nfl_injury_impact_index ?? 0.08}
                    onChange={(e) => setFeatures({ ...features, nfl_injury_impact_index: parseFloat(e.target.value) })}
                    className="w-full accent-[#0077b6]"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>-0.50 (Star QB/Tackle Out)</span>
                    <span>0.00 (Even Health)</span>
                    <span>+0.50 (Opponent Depleted)</span>
                  </div>
                </div>

                {/* Feature 9: Home Field Advantage Points */}
                <div className="p-3.5 rounded-xl bg-[#caf0f8]/20 border border-[#90e0ef] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-800">
                      X₉: Home Field Advantage Spread Adjustment (pts)
                    </span>
                    <span className="font-mono font-bold text-[#0077b6] text-[11px] px-2 py-0.5 rounded bg-white border border-[#90e0ef]">
                      {(features.nfl_home_field_advantage ?? 2.0).toFixed(1)} pts
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3.5"
                    step="0.1"
                    value={features.nfl_home_field_advantage ?? 2.0}
                    onChange={(e) => setFeatures({ ...features, nfl_home_field_advantage: parseFloat(e.target.value) })}
                    className="w-full accent-[#0077b6]"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>0.0 pts (Neutral Site/Super Bowl)</span>
                    <span>1.8 pts (NFL Avg)</span>
                    <span>3.5 pts (Arrowhead/Lambeau)</span>
                  </div>
                </div>

                {/* Feature 10: Weather Wind Speed */}
                <div className="p-3.5 rounded-xl bg-[#caf0f8]/20 border border-[#90e0ef] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-800 flex items-center space-x-1">
                      <Wind className="w-3.5 h-3.5 text-[#0077b6]" />
                      <span>X₁₀: Stadium Weather Wind Velocity (mph)</span>
                    </span>
                    <span className="font-mono font-bold text-[#03045e] text-[11px] px-2 py-0.5 rounded bg-white border border-[#90e0ef]">
                      {(features.nfl_weather_wind_mph ?? 8.0).toFixed(0)} mph
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="35"
                    step="1"
                    value={features.nfl_weather_wind_mph ?? 8.0}
                    onChange={(e) => setFeatures({ ...features, nfl_weather_wind_mph: parseFloat(e.target.value) })}
                    className="w-full accent-[#0077b6]"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>0 mph (Dome / Indoor)</span>
                    <span>12 mph (Moderate)</span>
                    <span>35 mph (Extreme Blustery)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Model Weights Adjuster (For Stage 1 OLS) */}
          {stage === 'linear' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#0077b6]" />
                  <h4 className="text-xs font-bold text-[#03045e] uppercase">
                    Stage 1 &bull; OLS Regression Parameters (&beta;)
                  </h4>
                </div>
                <button
                  onClick={handleResetWeights}
                  className="text-[11px] text-stone-400 hover:text-[#03045e] transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Intercept &beta;₀</span>
                  <input
                    type="number"
                    step="0.5"
                    value={intercept}
                    onChange={(e) => setIntercept(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 text-xs font-bold text-[#03045e]"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">&beta;₁ (Sentiment)</span>
                  <input
                    type="number"
                    step="1"
                    value={weights.news_sentiment_score}
                    onChange={(e) => setWeights({ ...weights, news_sentiment_score: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 text-xs font-bold text-[#03045e]"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">&beta;₂ (Momentum)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={weights.macro_momentum_percent}
                    onChange={(e) => setWeights({ ...weights, macro_momentum_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 text-xs font-bold text-[#03045e]"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">&beta;₃ (VIX Vol)</span>
                  <input
                    type="number"
                    step="0.05"
                    value={weights.market_volatility_vix}
                    onChange={(e) => setWeights({ ...weights, market_volatility_vix: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 text-xs font-bold text-[#03045e]"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">&beta;₄ (10Y Yield)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={weights.treasury_10y_yield}
                    onChange={(e) => setWeights({ ...weights, treasury_10y_yield: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 text-xs font-bold text-[#03045e]"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">&beta;₅ (Prior Weight)</span>
                  <input
                    type="number"
                    step="0.05"
                    value={weights.market_implied_prior}
                    onChange={(e) => setWeights({ ...weights, market_implied_prior: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 text-xs font-bold text-[#03045e]"
                  />
                </div>
                {nflMode && (
                  <>
                    <div className="p-2.5 rounded-lg bg-[#caf0f8]/40 border border-[#90e0ef]">
                      <span className="text-[10px] text-stone-600 block">&beta;₆ (Offensive EPA)</span>
                      <input
                        type="number"
                        step="1"
                        value={weights.nfl_offensive_epa ?? 45.0}
                        onChange={(e) => setWeights({ ...weights, nfl_offensive_epa: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 text-xs font-bold text-[#0077b6]"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#caf0f8]/40 border border-[#90e0ef]">
                      <span className="text-[10px] text-stone-600 block">&beta;₇ (QB DVOA)</span>
                      <input
                        type="number"
                        step="0.05"
                        value={weights.nfl_starting_qb_dvoa ?? 0.35}
                        onChange={(e) => setWeights({ ...weights, nfl_starting_qb_dvoa: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 text-xs font-bold text-[#0077b6]"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#caf0f8]/40 border border-[#90e0ef]">
                      <span className="text-[10px] text-stone-600 block">&beta;₈ (Injury Index)</span>
                      <input
                        type="number"
                        step="1"
                        value={weights.nfl_injury_impact_index ?? 15.0}
                        onChange={(e) => setWeights({ ...weights, nfl_injury_impact_index: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 text-xs font-bold text-[#0077b6]"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#caf0f8]/40 border border-[#90e0ef]">
                      <span className="text-[10px] text-stone-600 block">&beta;₉ (Home Advantage)</span>
                      <input
                        type="number"
                        step="0.1"
                        value={weights.nfl_home_field_advantage ?? 2.2}
                        onChange={(e) => setWeights({ ...weights, nfl_home_field_advantage: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 text-xs font-bold text-[#0077b6]"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#caf0f8]/40 border border-[#90e0ef]">
                      <span className="text-[10px] text-stone-600 block">&beta;₁₀ (Wind mph)</span>
                      <input
                        type="number"
                        step="0.05"
                        value={weights.nfl_weather_wind_mph ?? -0.15}
                        onChange={(e) => setWeights({ ...weights, nfl_weather_wind_mph: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 text-xs font-bold text-[#0077b6]"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Model Output, Mathematical Formulation & Attribution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Primary Probability Output Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Predicted Probability Output
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
                {stage.toUpperCase()} MODEL
              </span>
            </div>

            {/* Giant Probability Gauge */}
            <div className="text-center py-4 space-y-2 bg-[#caf0f8]/20 rounded-2xl border border-[#90e0ef]/60">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Probability of Target Event Occurrence
              </div>
              <div className="text-5xl sm:text-6xl font-black text-[#03045e] font-mono tracking-tight flex items-center justify-center">
                <span>{activeProbability.toFixed(1)}</span>
                <span className="text-2xl sm:text-3xl text-[#0077b6] font-normal ml-0.5">%</span>
              </div>
              <div className="flex items-center justify-center space-x-2 pt-1">
                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  activeProbability >= 55
                    ? 'bg-[#caf0f8] text-[#0077b6] border-[#00b4d8]'
                    : activeProbability <= 45
                    ? 'bg-[#caf0f8]/60 text-[#03045e] border-[#90e0ef]'
                    : 'bg-stone-200 text-stone-800 border-stone-300'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {activeProbability >= 55 ? 'Likely Affirmative' : activeProbability <= 45 ? 'Unlikely / Bearish' : 'Toss-Up Range'}
                  </span>
                </span>
                <span className="text-xs text-stone-400">
                  vs {features.market_implied_prior}% market prior
                </span>
              </div>
            </div>

            {/* Mathematical Formulation Card */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#03045e] block">
                Mathematical Model Specification
              </span>
              <div className="p-3 bg-[#03045e] text-[#caf0f8] rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#0077b6]">
                {stage === 'linear' && (
                  <div>
                    <span className="text-[#90e0ef] block mb-1">
                      # Ordinary Least Squares Linear Formula{nflMode ? ' (NFL Football Enhanced)' : ''}:
                    </span>
                    P(E) = clamp({intercept} + ({weights.news_sentiment_score} &times; {features.news_sentiment_score}) + ({weights.macro_momentum_percent} &times; {features.macro_momentum_percent}) - ({Math.abs(weights.market_volatility_vix)} &times; {features.market_volatility_vix}) - ({Math.abs(weights.treasury_10y_yield)} &times; {features.treasury_10y_yield}) + ({weights.market_implied_prior} &times; {features.market_implied_prior})
                    {nflMode && (
                      <>
                        {' '}+ ({weights.nfl_offensive_epa ?? 45.0} &times; {features.nfl_offensive_epa ?? 0.12} EPA)
                        {' '}+ ({weights.nfl_starting_qb_dvoa ?? 0.35} &times; {features.nfl_starting_qb_dvoa ?? 18.5}% DVOA)
                        {' '}+ ({weights.nfl_injury_impact_index ?? 15.0} &times; {features.nfl_injury_impact_index ?? 0.08} Inj)
                        {' '}+ ({weights.nfl_home_field_advantage ?? 2.2} &times; {features.nfl_home_field_advantage ?? 2.0} HFA)
                        {' '}- ({Math.abs(weights.nfl_weather_wind_mph ?? 0.15)} &times; {features.nfl_weather_wind_mph ?? 8.0} Wind)
                      </>
                    )}, 0, 100)
                  </div>
                )}
                {stage === 'logistic' && (
                  <div>
                    <span className="text-[#90e0ef] block mb-1"># Logistic Sigmoid Transformation:</span>
                    P(E) = 1 / (1 + e^(-z)) &times; 100%
                    <br />
                    <span className="text-[#90e0ef]">z = {logisticResult?.log_odds_z ?? 0.086} | Odds Ratio: {logisticResult?.odds_ratio ?? 1.09}</span>
                  </div>
                )}
                {stage === 'gemini' && (
                  <div>
                    <span className="text-[#90e0ef] block mb-1"># Google AI Studio Gemini Structured Posterior:</span>
                    E[P | X] ~ Gemini 3.8 Flash Bayesian Reasoning
                    <br />
                    <span className="text-[#90e0ef]">Priors: {geminiResult?.bayesian_prior ?? 54}% &bull; 95% CI: [{geminiResult?.confidence_interval.low}% - {geminiResult?.confidence_interval.high}%]</span>
                  </div>
                )}
              </div>
            </div>

            {/* Feature Attribution Breakdown (Stage 1 / 2) */}
            {linearResult && stage === 'linear' && (
              <div className="space-y-2.5 pt-2 border-t border-stone-100">
                <span className="text-xs font-bold text-[#03045e] block">
                  Feature Delta Attribution (&Delta; Probability)
                </span>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(linearResult.feature_contributions).map(([key, val]) => {
                    const numVal = Number(val);
                    return (
                      <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                        <span className="text-stone-600 font-mono text-[11px] capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className={`font-mono font-bold text-xs ${
                          numVal > 0 ? 'text-[#0077b6]' : numVal < 0 ? 'text-[#03045e]' : 'text-stone-500'
                        }`}>
                          {numVal > 0 ? `+${numVal.toFixed(2)}%` : `${numVal.toFixed(2)}%`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gemini Insights (Stage 3) */}
            {stage === 'gemini' && geminiResult && (
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <span className="text-xs font-bold text-[#03045e] block">
                  Gemini Key Economic Drivers
                </span>
                <div className="space-y-1.5">
                  {geminiResult.key_drivers.map((driver, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-[#caf0f8]/30 border border-[#90e0ef] text-xs text-[#03045e] flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-[#caf0f8] text-[#0077b6] text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold border border-[#00b4d8]">
                        {idx + 1}
                      </span>
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 leading-relaxed">
                  <strong className="text-[#03045e] block mb-0.5">Model Rationale:</strong>
                  {geminiResult.rationale}
                </div>
              </div>
            )}
          </div>

          {/* Model Progression Summary Card */}
          <div className="p-4 rounded-2xl bg-[#caf0f8]/40 border border-[#90e0ef] space-y-2 text-xs text-[#03045e]">
            <div className="flex items-center space-x-1.5 font-bold uppercase text-[11px] text-[#03045e]">
              <Info className="w-3.5 h-3.5 text-[#0077b6]" />
              <span>Model Iteration Architecture</span>
            </div>
            <p className="leading-relaxed text-stone-700">
              <strong>Iterative Progression:</strong> Start by fitting structured data into an intuitive <strong>Linear Regression (Stage 1)</strong> to understand transparent feature sensitivities and &beta; coefficients. Move to <strong>Logistic Regression (Stage 2)</strong> to avoid boundary clipping at 0% and 100%, and scale to <strong>Google AI Studio (Stage 3)</strong> to absorb unstructured narrative signals alongside econometric tables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
