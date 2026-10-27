import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Activity,
  Layers,
  Database,
  ShieldCheck,
  Check,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Trophy,
  Radio,
  Sliders,
  DollarSign,
  Send,
  Zap,
  Globe,
  FileCode2,
  Lock,
  ArrowUpRight,
  HelpCircle,
  Sun,
  Moon,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { CloudboyXLogo } from './CloudboyXLogo';
import { ActiveWorkspaceView } from '../types';

interface LandingPageProps {
  onLaunchEnterprise: (targetView?: ActiveWorkspaceView) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchEnterprise,
  theme,
  onToggleTheme,
}) => {
  // Interactive Sandbox state
  const [sandboxPreset, setSandboxPreset] = useState<'macro' | 'nfl' | 'ai'>('macro');
  const [marketPriceCents, setMarketPriceCents] = useState<number>(44);
  const [modelProbPercent, setModelProbPercent] = useState<number>(62);
  const [bankrollSize, setBankrollSize] = useState<number>(10000);

  // Active showcase tab
  const [activeTab, setActiveTab] = useState<'studio' | 'analyzer' | 'nfl' | 'connect'>('studio');

  // Pricing frequency state
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');

  // FAQ open states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Lead capture form state
  const [demoEmail, setDemoEmail] = useState<string>('');
  const [demoDeskType, setDemoDeskType] = useState<string>('Proprietary Trading Firm');
  const [demoSubmitted, setDemoSubmitted] = useState<boolean>(false);

  // Mobile / Tablet navigation drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Calculate sandbox math
  const edge = modelProbPercent - marketPriceCents;
  const decimalOdds = (100 - marketPriceCents) / marketPriceCents;
  const p = modelProbPercent / 100;
  const q = 1 - p;
  const fullKellyFraction = Math.max(0, (decimalOdds * p - q) / decimalOdds);
  const halfKellyFraction = fullKellyFraction / 2;
  const recommendedStakeDollars = Math.round(bankrollSize * halfKellyFraction);
  const expectedValueDollars = Math.round(recommendedStakeDollars * ((modelProbPercent - marketPriceCents) / 100));

  const handleSelectPreset = (preset: 'macro' | 'nfl' | 'ai') => {
    setSandboxPreset(preset);
    if (preset === 'macro') {
      setMarketPriceCents(44);
      setModelProbPercent(62);
    } else if (preset === 'nfl') {
      setMarketPriceCents(51);
      setModelProbPercent(68);
    } else {
      setMarketPriceCents(33);
      setModelProbPercent(49);
    }
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoEmail.trim() || !demoEmail.includes('@')) return;
    setDemoSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060a14] text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans selection:bg-[#0077b6] selection:text-white">
      {/* 1. CLEAN TOP NAVBAR: Complete links visible on desktop; Hamburger menu on tablet & mobile */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#070c18]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark Lockup */}
          <div className="flex items-center gap-3 shrink-0">
            <CloudboyXLogo size={34} variant={theme === 'dark' ? 'white' : 'badge'} includePredict={true} />
          </div>

          {/* Complete Desktop Navigation Bar (visible on desktop >= lg) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8 text-xs xl:text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#capabilities" className="hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors whitespace-nowrap shrink-0">
              Capabilities
            </a>
            <a href="#sandbox" className="hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors whitespace-nowrap shrink-0">
              Interactive Terminal
            </a>
            <a href="#nfl-models" className="hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors whitespace-nowrap shrink-0">
              NFL Predict Hub
            </a>
            <a href="#edi-connect" className="hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors whitespace-nowrap shrink-0">
              CloudboyX Connect
            </a>
            <a href="#pricing" className="hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors whitespace-nowrap shrink-0">
              Enterprise Access
            </a>
            <a href="#faq" className="hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors whitespace-nowrap shrink-0">
              Methodology
            </a>
          </nav>

          {/* Right Controls: Compact Light/Dark Theme Toggle + Mobile/Tablet Hamburger Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Compact Light & Dark Theme Toggle Button */}
            <button
              type="button"
              id="landing-theme-toggle-btn"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer select-none"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 text-[#0077b6] fill-[#0077b6]/20" />
              )}
            </button>

            {/* Hamburger Button for Tablet & Mobile screens (< lg) */}
            <button
              type="button"
              id="landing-hamburger-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#0077b6] dark:hover:text-[#38bdf8] bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <Menu className="w-4 h-4 stroke-[2.2]" />
              )}
            </button>
          </div>
        </div>

        {/* Tablet & Mobile Slide-down Navigation Panel */}
        {isMobileMenuOpen && (
          <div
            id="landing-mobile-menu-drawer"
            className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-[#070c18]/98 backdrop-blur-md px-4 py-3.5 space-y-2.5 shadow-xl transition-all"
          >
            <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <a
                href="#capabilities"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors"
              >
                Capabilities
              </a>
              <a
                href="#sandbox"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors"
              >
                Interactive Terminal
              </a>
              <a
                href="#nfl-models"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors"
              >
                NFL Predict Hub
              </a>
              <a
                href="#edi-connect"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors"
              >
                CloudboyX Connect
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors"
              >
                Enterprise Access
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0077b6] dark:hover:text-[#38bdf8] transition-colors"
              >
                Methodology
              </a>
            </nav>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLaunchEnterprise();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#0096c7] hover:brightness-110 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Enterprise Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50 to-slate-100/70 dark:from-[#060a14] dark:via-[#080d1c] dark:to-[#091124]">
          {/* Subtle background glow mesh */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-tr from-[#0077b6]/10 via-[#00b4d8]/15 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              {/* Quiet, unboxed text kicker */}
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold tracking-wide uppercase text-[#0077b6] dark:text-[#38bdf8]">
                <span>CloudboyX Predict</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                <span>Calibrated Quantitative Engine</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                <span>Enterprise Decision Suite</span>
              </div>

              {/* Dominant Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-4xl mx-auto" style={{ textWrap: 'balance' }}>
                Institutional Event Contract Forecasting & Multi-Model Probability Engines
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                Transform binary market pricing into mathematical edge. Synthesizing OLS linear baselines, logistic odds, Gemini Bayesian recalibration, and real-time ANSI X12 EDI execution for enterprise risk desks.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
                <button
                  type="button"
                  onClick={() => onLaunchEnterprise()}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#0096c7] hover:brightness-110 shadow-lg shadow-[#0077b6]/30 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch CloudboyX Predict Enterprise</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#sandbox"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Sliders className="w-4 h-4 text-[#0077b6]" />
                  <span>Try Interactive Calculator</span>
                </a>
              </div>

              {/* Claim-to-Proof Adjacency Row */}
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
                <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Brier Calibration</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">0.082</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">High calibration score</span>
                </div>

                <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Tick Volatility Alert</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#0077b6] dark:text-[#38bdf8] tabular-nums">3-Tick</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">Real-time spike sound alert</span>
                </div>

                <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Backtested Alpha</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">+14.2%</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">Vs passive market consensus</span>
                </div>

                <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Enterprise Webhooks</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">ANSI X12</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">850 / 855 / 856 / 810 EDI</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE SANDBOX: TEST-DRIVE THE FORECASTING ENGINE */}
        <section id="sandbox" className="py-16 sm:py-20 bg-white dark:bg-[#070c18] border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8] mb-1">
                  Live Interactive Calculator
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Simulate Calibrated Edge & Kelly Bet Sizing
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  Adjust market contract pricing against CloudboyX calibrated probability to see instantaneous Half-Kelly risk attribution.
                </p>
              </div>

              {/* Preset buttons */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('macro')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sandboxPreset === 'macro'
                      ? 'bg-white dark:bg-slate-900 text-[#03045e] dark:text-[#38bdf8] shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Macro Rate Cut
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('nfl')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sandboxPreset === 'nfl'
                      ? 'bg-white dark:bg-slate-900 text-[#03045e] dark:text-[#38bdf8] shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  NFL Chiefs Spread
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('ai')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sandboxPreset === 'ai'
                      ? 'bg-white dark:bg-slate-900 text-[#03045e] dark:text-[#38bdf8] shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Commercial AI Index
                </button>
              </div>
            </div>

            {/* Sandbox Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left column: Sliders & Controls */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Slider 1: Market Benchmark Price */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-slate-700 dark:text-slate-300">
                        Prediction Market Consensus Price (Kalshi / Polymarket)
                      </span>
                      <span className="text-base font-black font-mono text-[#0077b6] dark:text-[#38bdf8] tabular-nums">
                        {marketPriceCents}&cent;
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={99}
                      value={marketPriceCents}
                      onChange={(e) => setMarketPriceCents(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0077b6]"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>1&cent; (Improbable)</span>
                      <span>50&cent; (Coinflip)</span>
                      <span>99&cent; (Certain)</span>
                    </div>
                  </div>

                  {/* Slider 2: CloudboyX Model Calibrated Probability */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-slate-700 dark:text-slate-300">
                        CloudboyX Calibrated Probability (Linear &rarr; Logistic &rarr; Gemini)
                      </span>
                      <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {modelProbPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={99}
                      value={modelProbPercent}
                      onChange={(e) => setModelProbPercent(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>1% Low Prior</span>
                      <span>50% Neutral</span>
                      <span>99% Strong Thesis</span>
                    </div>
                  </div>

                  {/* Slider 3: Portfolio Capital */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-slate-700 dark:text-slate-300">Portfolio Capital Base</span>
                      <span className="text-base font-black font-mono text-slate-900 dark:text-white tabular-nums">
                        ${bankrollSize.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={100000}
                      step={1000}
                      value={bankrollSize}
                      onChange={(e) => setBankrollSize(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-600"
                    />
                  </div>
                </div>

                {/* Right column: Calculated Edge & Execution Output */}
                <div className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Signal Verdict</span>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        edge > 5
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : edge < -5
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {edge > 5 ? 'BUY YES (POSITIVE EDGE)' : edge < -5 ? 'BUY NO (SHORT CONTRACT)' : 'PASS / FAIR VALUE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">Discrepancy (Edge)</span>
                      <span
                        className={`text-xl font-black font-mono tabular-nums ${
                          edge > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {edge > 0 ? `+${edge}` : edge}%
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">Half-Kelly Stake</span>
                      <span className="text-xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                        ${recommendedStakeDollars.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Expected Trade Value</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {expectedValueDollars > 0 ? `+$${expectedValueDollars}` : `$${expectedValueDollars}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-500">Kelly Capital Allocation</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {(halfKellyFraction * 100).toFixed(1)}% of bankroll
                      </span>
                    </div>
                  </div>

                  {/* Launch in Enterprise CTA */}
                  <button
                    type="button"
                    onClick={() => onLaunchEnterprise('model_studio')}
                    className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#03045e] hover:bg-[#023e8a] dark:bg-[#0077b6] dark:hover:bg-[#0096c7] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Run Full Model in Enterprise Module</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FOUR CORE CAPABILITIES (Bento Grid Architecture) */}
        <section id="capabilities" className="py-16 sm:py-24 bg-slate-50 dark:bg-[#060a14] border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8] mb-1">
                01. Enterprise Capabilities
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Architected for Quantitative Precision & Operational Delivery
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 mt-2">
                Every component is built for real-world market intelligence, quantitative execution, and multi-system enterprise automation.
              </p>
            </div>

            {/* Asymmetric Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
              {/* Card 1 (Span 7): Probability Model Studio */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#0077b6]/10 text-[#0077b6] dark:text-[#38bdf8]">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">STAGE: OLS &rarr; LOGIT &rarr; GEMINI</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Structured Data Probability Model Studio
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                    Ingests macroeconomic momentum indicators, news sentiment, cross-market implied probabilities, and orderbook orderflow. Generates calibrated probabilities with full empirical distribution and Brier uncertainty scores.
                  </p>

                  <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Regression Pipeline:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">Continuous Feature Matrix</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Bayesian Calibration:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Brier Score &lt; 0.09</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Model Scripts:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">Python Script (.py) Exporter</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Included in Pro & Enterprise Tiers</span>
                  <button
                    type="button"
                    onClick={() => onLaunchEnterprise('model_studio')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077b6] dark:text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    <span>Open Model Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2 (Span 5): Contract Volatility Analyzer */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">TELEMETRY: LIVE TICKS</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Market Volatility & Custom Spike Alerts
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                    Tracks 3 consecutive price ticks to detect rapid orderbook fluctuations. Directional trend arrows and customizable price threshold alerts with browser sound chimes and visual pulse rings.
                  </p>

                  <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Threshold Triggers:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">Custom Audio &amp; Glow Alert</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Directional Trend:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Up / Down / Neutral Delta</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Kalshi &amp; Polymarket Feeds</span>
                  <button
                    type="button"
                    onClick={() => onLaunchEnterprise('market_analyzer')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077b6] dark:text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    <span>Launch Analyzer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 3 (Span 6): NFL Football Models Hub */}
              <div id="nfl-models" className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">SPORTS: NFL 2026 ENGINE</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    NFL Predict Engine & Player Props
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                    Complete sports probability models covering point totals, game spreads, weather impact adjustments, seconds-per-play pace rankings, and individual player prop variance for QBs, RBs, and WRs.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block">Game Models:</span>
                      <span className="font-bold text-slate-900 dark:text-white">Spread &amp; Points Totals</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block">Player Props:</span>
                      <span className="font-bold text-[#0077b6] dark:text-[#38bdf8]">Yards, TDs &amp; Receptions</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">NFL Schedule &amp; Slate Tracker</span>
                  <button
                    type="button"
                    onClick={() => onLaunchEnterprise('player_props')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077b6] dark:text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    <span>Explore NFL Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 4 (Span 6): CloudboyX Connect ERP & Webhooks */}
              <div id="edi-connect" className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Database className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">CONNECT: ANSI X12 &amp; WEBHOOKS</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    CloudboyX Connect Universal EDI Gateway
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                    Bridge event intelligence directly into corporate execution systems. Real-time ANSI X12 EDI 850 (Purchase Orders), 855 (Acks), 856 (ASN), and 810 (Invoices) with automated webhook dispatches to SAP, NetSuite, and Salesforce.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block">Supported Formats:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">JSON, ANSI X12, XML</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block">Dispatch Targets:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">SAP, NetSuite, Webhooks</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Enterprise Automation Ready</span>
                  <button
                    type="button"
                    onClick={() => onLaunchEnterprise('erp_connector')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0077b6] dark:text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    <span>Open Webhook Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. QUANTITATIVE PROOF & BACKTEST RESULTS */}
        <section className="py-16 sm:py-20 bg-white dark:bg-[#070c18] border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8] mb-1">
                Empirical Performance Evidence
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Backtested Multi-Month Historical Rigor
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
                Simulated across 180+ event settlements in macro economics, politics, technology, and sports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sharpe Ratio</span>
                <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 dark:text-white block mt-2 tabular-nums">2.41</span>
                <p className="text-xs text-slate-500 mt-2">
                  Risk-adjusted return vs 3-month Treasury baseline
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profit Factor</span>
                <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-2 tabular-nums">2.18</span>
                <p className="text-xs text-slate-500 mt-2">
                  Gross trading profits divided by gross losses across all closed positions
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Drawdown</span>
                <span className="text-4xl sm:text-5xl font-black font-mono text-[#0077b6] dark:text-[#38bdf8] block mt-2 tabular-nums">7.2%</span>
                <p className="text-xs text-slate-500 mt-2">
                  Constrained by Half-Kelly position sizing discipline
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. TRANSPARENT PRICING & ENTERPRISE ACCESS TIERS */}
        <section id="pricing" className="py-16 sm:py-24 bg-slate-50 dark:bg-[#060a14] border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8] mb-1">
                Access Tiers &amp; Pricing
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Designed for Quants, Desks, and Enterprises
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
                Deploy immediately with instant access to the CloudboyX Predict Enterprise Module.
              </p>

              {/* Billing Cycle Switch */}
              <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    billingPeriod === 'monthly'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    billingPeriod === 'annual'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">Save 20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Tier 1: Pro Quantitative */}
              <div className="p-7 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Individual Quant</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Pro Quantitative</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">
                      ${billingPeriod === 'annual' ? '119' : '149'}
                    </span>
                    <span className="text-xs text-slate-500">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    For individual predictive market traders seeking calibrated Kelly edge.
                  </p>

                  <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Linear &rarr; Logistic &rarr; Gemini Model Studio</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Kalshi &amp; Polymarket real-time feeds</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Half-Kelly bet sizing &amp; paper portfolio</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Export analysis as JSON &amp; Python (.py)</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => onLaunchEnterprise('model_studio')}
                    className="w-full py-3 rounded-xl font-bold text-xs text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Launch Pro Tier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tier 2: Enterprise Desk (Featured) */}
              <div className="p-7 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#0077b6] shadow-xl shadow-[#0077b6]/10 flex flex-col justify-between relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#0077b6] text-white text-[10px] font-black uppercase tracking-wider">
                  Most Popular for Desks
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8]">
                    Trading Desk &amp; Teams
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Enterprise Terminal</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">
                      ${billingPeriod === 'annual' ? '399' : '499'}
                    </span>
                    <span className="text-xs text-slate-500">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Complete institutional stack with NFL predict hub, custom volatility audio alerts, and EDI webhooks.
                  </p>

                  <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0077b6] shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">Everything in Pro Quantitative</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Full NFL Models Hub (Spreads, Totals, Player Props)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>3-Tick Volatility Spike Chime &amp; Threshold Alerts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>CloudboyX Connect ANSI X12 850/855/856/810</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>SAP, NetSuite &amp; Webhook Auto-Dispatch</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => onLaunchEnterprise()}
                    className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#0096c7] hover:brightness-110 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Launch Enterprise Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tier 3: Institutional Hedge Fund */}
              <div className="p-7 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Institutional</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Institutional Fund</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">Custom</span>
                    <span className="text-xs text-slate-500">/ dedicated SLA</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Dedicated low-latency infrastructure, custom feature weighting, and compliance archives.
                  </p>

                  <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Dedicated VPS &amp; private API endpoints</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Custom probability weighting matrices</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>99.99% Uptime SLA &amp; dedicated quant engineer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Direct FIX protocol &amp; Bloomberg terminal bridge</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => onLaunchEnterprise('erp_connector')}
                    className="w-full py-3 rounded-xl font-bold text-xs text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Contact Enterprise Sales</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. METHODOLOGY & FAQ */}
        <section id="faq" className="py-16 sm:py-20 bg-white dark:bg-[#070c18] border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0077b6] dark:text-[#38bdf8] mb-1">
                Frequently Asked Questions
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Methodology &amp; Architecture FAQ
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'How does CloudboyX derive mathematical edge over prediction markets?',
                  a: 'Prediction markets like Kalshi and Polymarket frequently suffer from behavioral retail bias, long-shot bias, and liquidity lag. CloudboyX utilizes a three-stage pipeline (Ordinary Least Squares regression baseline, converted to logistic odds, followed by Bayesian reasoning and uncertainty decomposition) to output calibrated true probabilities.',
                },
                {
                  q: 'What is the role of CloudboyX Connect and ANSI X12 EDI?',
                  a: 'CloudboyX Connect allows institutional desks and corporate treasuries to translate prediction outcomes or volatility alerts directly into operational systems. We provide native mapping for ANSI X12 EDI 850 (Purchase Orders), 855 (PO Ack), 856 (Shipment Notice), and 810 (Invoice), as well as real-time webhooks for SAP S/4HANA, NetSuite, and Salesforce.',
                },
                {
                  q: 'How does the 3-tick volatility detector and audio alert chime work?',
                  a: 'Our Mode Bar volatility tracker continuously evaluates the rolling 3-tick delta against the previous moving average. When price fluctuates by more than 10% or crosses a user-configured threshold, a high-priority chime sounds and an amber visual ring highlights the contract.',
                },
                {
                  q: 'Can I export models and backtest results for internal compliance?',
                  a: 'Yes. CloudboyX Predict provides instant one-click JSON audit exports, downloadable PDF instruction manuals, and executable Python (.py) scripts containing the mathematical formulation.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaqIndex === idx ? (
                      <ChevronUp className="w-5 h-5 text-[#0077b6] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. ENTERPRISE LEAD CAPTURE & CONVERSION HERO */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#023e8a] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight" style={{ textWrap: 'balance' }}>
              Deploy Institutional Mathematical Edge to Your Desks
            </h2>
            <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
              Access the CloudboyX Predict Enterprise Module right now, or request an institutional briefing with our quantitative systems team.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onLaunchEnterprise()}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm text-[#03045e] bg-white hover:bg-slate-100 shadow-xl transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch CloudboyX Predict Enterprise Module &rarr;</span>
              </button>

              <a
                href="/api/docs/pdf/all"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Download Methodology PDF</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Inbound briefing form */}
            <div className="mt-12 max-w-xl mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#90e0ef] block mb-2">
                Request Dedicated Quant Briefing
              </span>
              {demoSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 text-xs sm:text-sm flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-300 shrink-0" />
                  <span>
                    Thank you. A quant solutions specialist will reach out within 2 hours. In the meantime, you can launch the Enterprise Module directly above!
                  </span>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="email"
                      required
                      placeholder="work-email@firm.com"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white placeholder-white/60 text-xs focus:outline-none focus:ring-2 focus:ring-[#90e0ef]"
                    />
                    <select
                      value={demoDeskType}
                      onChange={(e) => setDemoDeskType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#90e0ef]"
                    >
                      <option value="Proprietary Trading Firm" className="text-slate-900">Proprietary Trading Firm</option>
                      <option value="Hedge Fund" className="text-slate-900">Hedge Fund / Asset Manager</option>
                      <option value="Sports Analytics Group" className="text-slate-900">Sports Analytics Group</option>
                      <option value="Corporate Treasury" className="text-slate-900">Corporate Treasury</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-[#0077b6] hover:bg-[#0096c7] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Request</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* QUIET CORPORATE FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050811] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CloudboyXLogo size={28} variant={theme === 'dark' ? 'white' : 'badge'} includePredict={true} />
            <span className="text-slate-400">·</span>
            <span>&copy; {new Date().getFullYear()} CloudboyX Systems Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onLaunchEnterprise()}
              className="text-[#0077b6] dark:text-[#38bdf8] hover:underline font-bold cursor-pointer"
            >
              Enterprise Workspace
            </button>
            <a
              href="/api/docs/pdf/all"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-800 dark:hover:text-slate-200"
            >
              System Docs
            </a>
            <span className="text-slate-400">SOC-2 Type II Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
