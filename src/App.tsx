import React, { useState, useEffect, useRef } from 'react';
import {
  ProbabilityAnalysisResult,
  PaperTradePosition,
  MarketCategory,
  IngestedPayload,
  StructuredFeatures,
  PriceCheckRecord,
} from './types';
import { Header } from './components/Header';
import { QuickActionToolbar } from './components/QuickActionToolbar';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { SearchPipelineInput } from './components/SearchPipelineInput';
import { PipelineProgress } from './components/PipelineProgress';
import { OddsOverviewCard } from './components/OddsOverviewCard';
import { MarketPriceVolatilityCard } from './components/MarketPriceVolatilityCard';
import { MarketSentimentTrend } from './components/MarketSentimentTrend';
import { ResolutionCriteriaCard } from './components/ResolutionCriteriaCard';
import { DebateArena } from './components/DebateArena';
import { ProbabilityCalculator } from './components/KalshiCalculator';
import { HistoricalBacktestPerformance } from './components/HistoricalBacktestPerformance';
import { CatalystsTimeline } from './components/CatalystsTimeline';
import { Eli6Modal } from './components/Eli6Modal';
import { MechanicsModal } from './components/MechanicsModal';
import { PortfolioModal } from './components/PortfolioModal';
import { ProbabilityModelStudio } from './components/ProbabilityModelStudio';
import { DataIngestionHub } from './components/DataIngestionHub';
import { PythonScriptModal } from './components/PythonScriptModal';
import { LeftNavigationDrawer } from './components/LeftNavigationDrawer';
import { TrainingInstructionModal } from './components/TrainingInstructionModal';
import { WalkthroughBot } from './components/WalkthroughBot';
import { CloudboyXSuiteModal } from './components/CloudboyXSuiteModal';
import { EnterpriseWebhookStudio } from './components/EnterpriseWebhookStudio';
import { ShareModal } from './components/ShareModal';
import { PRESET_EVENTS } from './data/presetEvents';
import { AlertCircle, CheckCircle, Download, X, Copy, Check, FileText, Pause, Play } from 'lucide-react';
import { exportAnalysisAsJson } from './utils/exportUtils';
import { AccessGateModal, UserSession } from './components/AccessGateModal';

export default function App() {
  // Gatekeeper authentication state
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('cloudboy_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleSignOut = () => {
    try {
      localStorage.removeItem('cloudboy_user_session');
    } catch {
      // ignore
    }
    setUserSession(null);
  };

  // Theme state (Light / Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('cloudboy_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cloudboy_theme', theme);
    } catch {
      // ignore
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [activeView, setActiveView] = useState<'model_studio' | 'market_analyzer' | 'erp_connector'>('model_studio');
  const [activeAnalysis, setActiveAnalysis] = useState<ProbabilityAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ingestion & Model states
  const [ingestedData, setIngestedData] = useState<IngestedPayload | null>(null);
  const [isIngestionLoading, setIsIngestionLoading] = useState<boolean>(false);
  const [isIngestionHubOpen, setIsIngestionHubOpen] = useState<boolean>(false);
  const [isPythonScriptOpen, setIsPythonScriptOpen] = useState<boolean>(false);
  const [selectedModelFeatures, setSelectedModelFeatures] = useState<StructuredFeatures | null>(null);

  // Paper trading portfolio state
  const [bankroll, setBankroll] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('market_sim_bankroll') || localStorage.getItem('kalshi_sim_bankroll');
      return saved ? Number(saved) : 1000.0;
    } catch {
      return 1000.0;
    }
  });

  const [positions, setPositions] = useState<PaperTradePosition[]>(() => {
    try {
      const saved = localStorage.getItem('market_sim_positions') || localStorage.getItem('kalshi_sim_positions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal dialog states
  const [isLeftNavOpen, setIsLeftNavOpen] = useState<boolean>(false);
  const [isSuiteSwitcherOpen, setIsSuiteSwitcherOpen] = useState<boolean>(false);
  const [isEli6Open, setIsEli6Open] = useState<boolean>(false);
  const [isMechanicsOpen, setIsMechanicsOpen] = useState<boolean>(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState<boolean>(false);
  const [isTrainingDocsOpen, setIsTrainingDocsOpen] = useState<boolean>(false);
  const [tradeSideToPreload, setTradeSideToPreload] = useState<'YES' | 'NO' | null>(null);

  // Market Price Volatility checks state (rolling history per event)
  const [priceChecksMap, setPriceChecksMap] = useState<Record<string, PriceCheckRecord[]>>(() => {
    try {
      const saved = localStorage.getItem('market_price_checks_map') || localStorage.getItem('kalshi_price_checks_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isPriceCheckLoading, setIsPriceCheckLoading] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<{
    filename: string;
    jsonContent?: string;
    isError?: boolean;
    message?: string;
    durationMs: number;
    timestamp: number;
  } | null>(null);
  const [exportCopyMode, setExportCopyMode] = useState<'contents' | 'filename' | 'all'>('contents');
  const [copiedStatus, setCopiedStatus] = useState<'contents' | 'filename' | 'all' | null>(null);
  const [isToastPaused, setIsToastPaused] = useState<boolean>(false);
  const exportToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastStartTimeRef = useRef<number>(0);
  const toastRemainingMsRef = useRef<number>(0);
  const [isGlobalShareOpen, setIsGlobalShareOpen] = useState<boolean>(false);

  // Handle export analysis object as JSON file
  const handleExportAnalysisData = () => {
    if (exportToastTimeoutRef.current) {
      clearTimeout(exportToastTimeoutRef.current);
    }
    if (!activeAnalysis) {
      const durationMs = 4000;
      setIsToastPaused(false);
      toastStartTimeRef.current = Date.now();
      toastRemainingMsRef.current = durationMs;
      setExportToast({
        filename: '',
        message: 'No analysis loaded to export yet. Please select an event or run a prediction first.',
        isError: true,
        durationMs,
        timestamp: Date.now(),
      });
      setCopiedStatus(null);
      exportToastTimeoutRef.current = setTimeout(() => {
        setExportToast(null);
        setIsToastPaused(false);
      }, durationMs);
      return;
    }
    const checks = priceChecksMap[activeAnalysis.eventTitle] || [];
    const result = exportAnalysisAsJson(activeAnalysis, checks);
    if (result.success) {
      const durationMs = 7000;
      setIsToastPaused(false);
      toastStartTimeRef.current = Date.now();
      toastRemainingMsRef.current = durationMs;
      setExportToast({
        filename: result.filename,
        jsonContent: result.jsonString,
        isError: false,
        durationMs,
        timestamp: Date.now(),
      });
      setCopiedStatus(null);
      exportToastTimeoutRef.current = setTimeout(() => {
        setExportToast(null);
        setIsToastPaused(false);
      }, durationMs);
    }
  };

  // Toggle Pause / Resume for toast countdown and progress bar animation
  const handleToggleToastPause = () => {
    if (!exportToast) return;
    if (isToastPaused) {
      // Resume timer
      setIsToastPaused(false);
      toastStartTimeRef.current = Date.now();
      if (exportToastTimeoutRef.current) {
        clearTimeout(exportToastTimeoutRef.current);
      }
      exportToastTimeoutRef.current = setTimeout(() => {
        setExportToast(null);
        setIsToastPaused(false);
      }, toastRemainingMsRef.current);
    } else {
      // Pause timer
      setIsToastPaused(true);
      const elapsed = Date.now() - toastStartTimeRef.current;
      toastRemainingMsRef.current = Math.max(500, toastRemainingMsRef.current - elapsed);
      if (exportToastTimeoutRef.current) {
        clearTimeout(exportToastTimeoutRef.current);
        exportToastTimeoutRef.current = null;
      }
    }
  };

  // Copy exported contents, filename, or both to clipboard
  const handleCopyExport = async (mode: 'contents' | 'filename' | 'all' = exportCopyMode) => {
    if (!exportToast) return;
    const textToCopy =
      mode === 'filename'
        ? exportToast.filename
        : mode === 'contents'
        ? (exportToast.jsonContent || exportToast.filename)
        : `Filename: ${exportToast.filename}\n\n${exportToast.jsonContent || ''}`;

    if (!textToCopy) return;

    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      }
    } catch {
      // fallback
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.warn('Clipboard copy failed:', err);
      }
    }

    setCopiedStatus(mode);
    setExportCopyMode(mode);

    // Keep toast open for 5 seconds after copying to let user verify
    if (exportToastTimeoutRef.current) {
      clearTimeout(exportToastTimeoutRef.current);
    }
    const durationMs = 5000;
    toastRemainingMsRef.current = durationMs;
    toastStartTimeRef.current = Date.now();
    setExportToast((prev) =>
      prev
        ? {
            ...prev,
            durationMs,
            timestamp: Date.now(),
          }
        : null
    );
    if (!isToastPaused) {
      exportToastTimeoutRef.current = setTimeout(() => {
        setExportToast(null);
        setCopiedStatus(null);
        setIsToastPaused(false);
      }, durationMs);
    }
  };

  const handleDismissExportToast = () => {
    if (exportToastTimeoutRef.current) {
      clearTimeout(exportToastTimeoutRef.current);
      exportToastTimeoutRef.current = null;
    }
    setExportToast(null);
    setCopiedStatus(null);
    setIsToastPaused(false);
  };

  // Persist price checks
  useEffect(() => {
    try {
      localStorage.setItem('market_price_checks_map', JSON.stringify(priceChecksMap));
      localStorage.setItem('kalshi_price_checks_map', JSON.stringify(priceChecksMap));
    } catch {
      // ignore
    }
  }, [priceChecksMap]);

  // Ensure current event has at least 3 baseline price checks
  useEffect(() => {
    if (!activeAnalysis) return;
    const key = activeAnalysis.eventTitle;
    const currentPrice = activeAnalysis.marketEconomics.marketPriceCents;

    setPriceChecksMap((prev) => {
      const existing = prev[key];
      if (existing && existing.length >= 3) {
        return prev;
      }
      const now = Date.now();
      const p1 = Math.max(1, Math.min(99, currentPrice - 2));
      const p2 = Math.max(1, Math.min(99, currentPrice + 1));
      const p3 = currentPrice;

      return {
        ...prev,
        [key]: [
          {
            id: `check-${now - 120000}`,
            checkIndex: 1,
            priceCents: p1,
            timestamp: new Date(now - 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            source: 'Initial Baseline',
          },
          {
            id: `check-${now - 60000}`,
            checkIndex: 2,
            priceCents: p2,
            timestamp: new Date(now - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            source: 'Initial Baseline',
          },
          {
            id: `check-${now}`,
            checkIndex: 3,
            priceCents: p3,
            timestamp: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            source: 'Live Consensus Feed',
          },
        ],
      };
    });
  }, [activeAnalysis?.eventTitle, activeAnalysis?.marketEconomics.marketPriceCents]);

  // Handler to record a new price check for the active event
  const handleRecordPriceCheck = async (newPrice?: number, source?: PriceCheckRecord['source']) => {
    if (!activeAnalysis) return;
    setIsPriceCheckLoading(true);

    try {
      const currentPrice = newPrice ?? activeAnalysis.marketEconomics.marketPriceCents;
      let finalPrice = currentPrice;
      let finalSource: PriceCheckRecord['source'] = source || 'Orderbook Polled';
      let yesBid: number | null = null;
      let yesAsk: number | null = null;

      if (newPrice === undefined) {
        try {
          const res = await fetch(
            `/api/markets/price-check?query=${encodeURIComponent(activeAnalysis.eventTitle)}&currentPriceCents=${currentPrice}`
          );
          if (res.ok) {
            const data = await res.json();
            if (typeof data.priceCents === 'number') {
              finalPrice = data.priceCents;
              finalSource = (data.source as PriceCheckRecord['source']) || 'Live Consensus Feed';
              yesBid = data.yesBid ?? null;
              yesAsk = data.yesAsk ?? null;
            }
          }
        } catch (e) {
          console.warn('Price check fetch failed, falling back:', e);
        }
      }

      const key = activeAnalysis.eventTitle;
      const existing = priceChecksMap[key] || [];
      const newCheck: PriceCheckRecord = {
        id: `check-${Date.now()}`,
        checkIndex: existing.length + 1,
        priceCents: finalPrice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: finalSource,
        yesBid,
        yesAsk,
      };

      setPriceChecksMap((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), newCheck],
      }));

      // If price moved, sync activeAnalysis market economics
      if (finalPrice !== activeAnalysis.marketEconomics.marketPriceCents) {
        setActiveAnalysis((prev) => {
          if (!prev) return prev;
          const impliedProb = finalPrice;
          const edge = prev.probabilities.calibratedYesPercent - impliedProb;
          const yesCost = finalPrice / 100;
          const noCost = (100 - finalPrice) / 100;
          const pWin = prev.probabilities.calibratedYesPercent / 100;
          const pLoss = 1 - pWin;
          const yesEV = pWin * (1.00 - yesCost) - pLoss * yesCost;
          const noEV = pLoss * (1.00 - noCost) - pWin * noCost;

          return {
            ...prev,
            marketEconomics: {
              ...prev.marketEconomics,
              marketPriceCents: finalPrice,
              impliedMarketProb: impliedProb,
              edgePercentage: Number(edge.toFixed(1)),
              yesCostPerContract: Number(yesCost.toFixed(2)),
              yesProfitPerContract: Number((1.00 - yesCost).toFixed(2)),
              yesExpectedValue: Number(yesEV.toFixed(3)),
              noCostPerContract: Number(noCost.toFixed(2)),
              noProfitPerContract: Number((1.00 - noCost).toFixed(2)),
              noExpectedValue: Number(noEV.toFixed(3)),
            },
          };
        });
      }
    } catch (err) {
      console.warn('Failed to record price check:', err);
    } finally {
      setIsPriceCheckLoading(false);
    }
  };

  // Sync bankroll and positions to local storage
  useEffect(() => {
    try {
      localStorage.setItem('market_sim_bankroll', String(bankroll));
      localStorage.setItem('kalshi_sim_bankroll', String(bankroll));
      localStorage.setItem('market_sim_positions', JSON.stringify(positions));
      localStorage.setItem('kalshi_sim_positions', JSON.stringify(positions));
    } catch {
      // ignore
    }
  }, [bankroll, positions]);

  // Load latest ingested data on initial mount
  useEffect(() => {
    fetch('/api/ingest/latest')
      .then((res) => res.json())
      .then((data) => {
        if (data.features) {
          setIngestedData(data);
          setSelectedModelFeatures(data.features);
        }
      })
      .catch((err) => console.warn('Could not load latest ingested data:', err));
  }, []);

  // Run Python Ingestion pipeline
  const handleRunIngestion = async (query?: string) => {
    setIsIngestionLoading(true);
    try {
      const res = await fetch('/api/ingest/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.features) {
        setIngestedData(data);
        setSelectedModelFeatures(data.features);
      }
    } catch (err) {
      console.error('Failed to trigger ingestion pipeline:', err);
    } finally {
      setIsIngestionLoading(false);
    }
  };

  // Execute research pipeline API call
  const handleAnalyze = async (query: string, marketPriceCents?: number, category?: MarketCategory) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-probability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, marketPriceCents, category }),
      });

      if (!res.ok) {
        throw new Error(`Server returned error: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.result) {
        setActiveAnalysis(data.result);
      } else {
        throw new Error(data.error || 'Failed to generate probability analysis');
      }
    } catch (err: any) {
      console.error('Failed to run probability analysis:', err);
      setError(err.message || 'Error executing forecasting pipeline.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run analysis on initial mount: check URL parameters (for shared links) or use first preset
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedQuery = urlParams.get('q');
      const sharedPrice = urlParams.get('price');
      const sharedCat = urlParams.get('category');

      if (sharedQuery && sharedQuery.trim()) {
        const parsedPrice = sharedPrice ? parseInt(sharedPrice, 10) : undefined;
        const validPrice = typeof parsedPrice === 'number' && !isNaN(parsedPrice) ? parsedPrice : undefined;
        handleAnalyze(sharedQuery.trim(), validPrice, (sharedCat as any) || undefined);
        return;
      }
    } catch {
      // ignore URL parsing failures
    }

    const firstPreset = PRESET_EVENTS[0];
    handleAnalyze(firstPreset.title, firstPreset.marketPriceCents, firstPreset.category);
  }, []);

  // Paper trading actions
  const handlePlaceTrade = (
    analysis: ProbabilityAnalysisResult,
    contractType: 'YES' | 'NO',
    contractsCount: number
  ) => {
    const costPerContract =
      contractType === 'YES'
        ? analysis.marketEconomics.yesCostPerContract
        : analysis.marketEconomics.noCostPerContract;

    const totalCost = Number((costPerContract * contractsCount).toFixed(2));
    if (totalCost > bankroll) {
      alert('Insufficient bankroll to execute trade.');
      return;
    }

    const newPosition: PaperTradePosition = {
      id: 'pos_' + Date.now(),
      analysisId: analysis.id,
      eventTitle: analysis.eventTitle,
      contractType,
      purchasePriceCents: Math.round(costPerContract * 100),
      contractsCount,
      totalCostDollars: totalCost,
      currentProbability:
        contractType === 'YES'
          ? analysis.probabilities.calibratedYesPercent
          : analysis.probabilities.calibratedNoPercent,
      unrealizedPnLDollars: 0,
      status: 'OPEN',
      timestamp: new Date().toISOString(),
    };

    setBankroll((prev) => Number((prev - totalCost).toFixed(2)));
    setPositions((prev) => [newPosition, ...prev]);
  };

  const handleResolvePosition = (positionId: string, outcome: 'WIN' | 'LOSS') => {
    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.id !== positionId || pos.status !== 'OPEN') return pos;

        if (outcome === 'WIN') {
          const payoutTotal = pos.contractsCount * 1.0;
          const netProfit = Number((payoutTotal - pos.totalCostDollars).toFixed(2));
          setBankroll((b) => Number((b + payoutTotal).toFixed(2)));
          return {
            ...pos,
            status: 'RESOLVED_WIN',
            unrealizedPnLDollars: netProfit,
          };
        } else {
          const netLoss = -pos.totalCostDollars;
          return {
            ...pos,
            status: 'RESOLVED_LOSS',
            unrealizedPnLDollars: netLoss,
          };
        }
      })
    );
  };

  const handleResetBankroll = () => {
    if (window.confirm('Reset simulated bankroll to starting balance of $1,000.00?')) {
      setBankroll(1000.0);
      setPositions([]);
    }
  };

  const handleTradeClick = (side: 'YES' | 'NO') => {
    setTradeSideToPreload(side);
    setIsPortfolioOpen(true);
  };

  const openPositionsCount = positions.filter((p) => p.status === 'OPEN').length;

  // Compute 3-check volatility comparison for active event
  const currentEventChecks = activeAnalysis ? (priceChecksMap[activeAnalysis.eventTitle] || []) : [];
  const last3Checks = currentEventChecks.slice(-3);
  const currentVolatilitySummary = last3Checks.length >= 3 ? (() => {
    const p1 = last3Checks[0].priceCents;
    const p2 = last3Checks[1].priceCents;
    const p3 = last3Checks[2].priceCents;
    const range = Math.max(p1, p2, p3) - Math.min(p1, p2, p3);
    const path = Math.abs(p2 - p1) + Math.abs(p3 - p2);
    let level: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
    if (range >= 5 || path >= 7) level = 'HIGH';
    else if (range >= 2 || path >= 3) level = 'MODERATE';
    return {
      level,
      rangeCents: range,
      deltaNet: p3 - p1,
    };
  })() : undefined;

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'dark bg-[#080d1a] text-slate-100' : 'bg-stone-100/70 text-stone-900'
      } flex flex-col font-sans selection:bg-[#caf0f8] selection:text-[#03045e] transition-colors duration-200`}
    >
      {/* Top Header with Universal Hamburger Menu, Mega Dropdown, Brand Logo, and Light/Dark Toggle */}
      <Header
        onToggleSidebar={() => setIsLeftNavOpen((prev) => !prev)}
        onOpenSuiteSwitcher={() => setIsSuiteSwitcherOpen(true)}
        activeView={activeView}
        onSelectView={setActiveView}
        bankroll={bankroll}
        openPositionsCount={openPositionsCount}
        onOpenPortfolio={() => {
          setTradeSideToPreload(null);
          setIsPortfolioOpen(true);
        }}
        onOpenIngestion={() => setIsIngestionHubOpen(true)}
        onOpenPythonScript={() => setIsPythonScriptOpen(true)}
        onOpenMechanics={() => setIsMechanicsOpen(true)}
        onOpenEli6={() => setIsEli6Open(true)}
        onOpenTrainingDocs={() => setIsTrainingDocsOpen(true)}
        hasActiveAnalysis={Boolean(activeAnalysis)}
        onExportAnalysisData={handleExportAnalysisData}
        onShareAnalysis={() => setIsGlobalShareOpen(true)}
        userSession={userSession}
        onSignOut={handleSignOut}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onResetBankroll={() => {
          setBankroll(1000.0);
          try {
            localStorage.setItem('market_sim_bankroll', '1000.0');
            localStorage.setItem('kalshi_sim_bankroll', '1000.0');
          } catch {
            // ignore
          }
        }}
        onAddBankrollFunds={(amount) => {
          setBankroll((prev) => {
            const next = prev + amount;
            try {
              localStorage.setItem('market_sim_bankroll', next.toString());
              localStorage.setItem('kalshi_sim_bankroll', next.toString());
            } catch {
              // ignore
            }
            return next;
          });
        }}
      />

      {/* Horizontal 'Quick Action' Floating Toolbar below Header on Desktop Views */}
      <QuickActionToolbar
        activeView={activeView}
        onSelectView={setActiveView}
        bankroll={bankroll}
        openPositionsCount={openPositionsCount}
        onOpenPortfolio={() => {
          setTradeSideToPreload(null);
          setIsPortfolioOpen(true);
        }}
        onOpenIngestion={() => setIsIngestionHubOpen(true)}
        onOpenTrainingDocs={() => setIsTrainingDocsOpen(true)}
        hasActiveAnalysis={Boolean(activeAnalysis)}
        onExportAnalysisData={handleExportAnalysisData}
        onShareAnalysis={() => setIsGlobalShareOpen(true)}
        onOpenSuiteSwitcher={() => setIsSuiteSwitcherOpen(true)}
      />

      {/* Responsive Left Navigation Drawer */}
      <LeftNavigationDrawer
        isOpen={isLeftNavOpen}
        onClose={() => setIsLeftNavOpen(false)}
        activeView={activeView}
        onSelectView={setActiveView}
        bankroll={bankroll}
        openPositionsCount={openPositionsCount}
        onOpenPortfolio={() => {
          setTradeSideToPreload(null);
          setIsPortfolioOpen(true);
        }}
        onOpenIngestion={() => setIsIngestionHubOpen(true)}
        onOpenPythonScript={() => setIsPythonScriptOpen(true)}
        onOpenMechanics={() => setIsMechanicsOpen(true)}
        onOpenEli6={() => setIsEli6Open(true)}
        onOpenTrainingDocs={() => setIsTrainingDocsOpen(true)}
        activeAnalysis={activeAnalysis}
        onExportAnalysisData={handleExportAnalysisData}
        onOpenSuiteSwitcher={() => setIsSuiteSwitcherOpen(true)}
        userSession={userSession}
        onSignOut={handleSignOut}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Workspace Utility Toolbar (Sub-Header Section for Tabs, Docs, Portfolio) */}
        <WorkspaceToolbar
          activeView={activeView}
          onSelectView={setActiveView}
          bankroll={bankroll}
          openPositionsCount={openPositionsCount}
          onOpenPortfolio={() => {
            setTradeSideToPreload(null);
            setIsPortfolioOpen(true);
          }}
          onOpenTrainingDocs={() => setIsTrainingDocsOpen(true)}
          hasActiveAnalysis={!!activeAnalysis}
          onExportAnalysisData={handleExportAnalysisData}
          onShareAnalysis={() => setIsGlobalShareOpen(true)}
          onOpenSuiteSwitcher={() => setIsSuiteSwitcherOpen(true)}
        />
        {/* VIEW 1: PROBABILITY MODEL STUDIO */}
        {activeView === 'model_studio' && (
          <ProbabilityModelStudio
            ingestedFeatures={selectedModelFeatures}
            onOpenIngestionHub={() => setIsIngestionHubOpen(true)}
            onOpenPythonScript={() => setIsPythonScriptOpen(true)}
          />
        )}

        {/* VIEW 2: MARKET CONTRACT ANALYZER */}
        {activeView === 'market_analyzer' && (
          <div className="space-y-6">
            {/* Research Pipeline Search Bar */}
            <SearchPipelineInput isLoading={isLoading} onAnalyze={handleAnalyze} />

            {/* Pipeline In-Progress Animation */}
            <PipelineProgress isLoading={isLoading} />

            {/* Error notification if any */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Analysis Results Display */}
            {activeAnalysis && !isLoading && (
              <div className="space-y-6">
                {/* 1. Primary Odds Matrix & Edge Overview */}
                <OddsOverviewCard
                  analysis={activeAnalysis}
                  onTradeClick={handleTradeClick}
                  onOpenEli6={() => setIsEli6Open(true)}
                  volatilitySummary={currentVolatilitySummary}
                  volatilityChecks={currentEventChecks}
                  onExportData={handleExportAnalysisData}
                />

                {/* 2. Market Price Volatility Tracker (Last 3 Consecutive Checks Comparison) */}
                <MarketPriceVolatilityCard
                  eventTitle={activeAnalysis.eventTitle}
                  currentMarketPrice={activeAnalysis.marketEconomics.marketPriceCents}
                  checks={currentEventChecks}
                  priceChecksMap={priceChecksMap}
                  onAddPriceCheck={handleRecordPriceCheck}
                  isLoadingCheck={isPriceCheckLoading}
                />

                {/* 3. Market Sentiment Trend Tracker (7-Day News & Social Media Aggregate) */}
                <MarketSentimentTrend
                  eventTitle={activeAnalysis.eventTitle}
                  category={activeAnalysis.category}
                  currentMarketPriceCents={activeAnalysis.marketEconomics.marketPriceCents}
                />

                {/* 4. Financial Analysis: Expected Value, Fees, Kelly Sizing & Risk Attribution */}
                <ProbabilityCalculator
                  marketEconomics={activeAnalysis.marketEconomics}
                  probabilities={activeAnalysis.probabilities}
                  analysis={activeAnalysis}
                />

                {/* 5. Historical Backtest Performance (Last 30 Days for Selected Category) */}
                <HistoricalBacktestPerformance
                  analysis={activeAnalysis}
                  category={activeAnalysis.category}
                />

                {/* 6. Multi-Agent Dialectic Debate Arena */}
                <DebateArena
                  bullAgent={activeAnalysis.bullAgent}
                  bearAgent={activeAnalysis.bearAgent}
                  synthesis={activeAnalysis.synthesis}
                />

                {/* 4. Contract Resolution Rulebook & Ambiguity Traps */}
                <ResolutionCriteriaCard criteria={activeAnalysis.resolutionCriteria} />

                {/* 5. Key Timeline Catalysts */}
                <CatalystsTimeline catalysts={activeAnalysis.catalysts} />
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: ENTERPRISE WEBHOOK & ERP CONNECTOR STUDIO */}
        {activeView === 'erp_connector' && (
          <EnterpriseWebhookStudio
            activeAnalysis={activeAnalysis}
            onOpenSuiteSwitcher={() => setIsSuiteSwitcherOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Google AI Studio Probability Modeling &bull; Multi-Source Ingestion &bull; Linear &rarr; Logistic &rarr; Gemini Engine
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsTrainingDocsOpen(true)}
              className="text-[#0077b6] hover:text-[#03045e] font-bold transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>Instruction &amp; Docs</span>
            </button>
            <a
              href="/api/docs/pdf/all"
              target="_blank"
              rel="noreferrer"
              className="text-[#0077b6] hover:text-[#03045e] font-bold transition-colors cursor-pointer"
              title="Download instructions PDF"
            >
              Download PDF
            </a>
            <button
              onClick={() => setIsPythonScriptOpen(true)}
              className="text-stone-700 hover:text-stone-900 font-semibold transition-colors cursor-pointer"
            >
              Python Script (.py)
            </button>
            <button
              onClick={() => setIsIngestionHubOpen(true)}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              API Feeds
            </button>
            <button
              onClick={() => setIsEli6Open(true)}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              Explain Like I'm 6
            </button>
            <button
              onClick={() => setIsMechanicsOpen(true)}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              How to Make Money
            </button>
            <button
              onClick={() => setIsPortfolioOpen(true)}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              Paper Portfolio
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <TrainingInstructionModal
        isOpen={isTrainingDocsOpen}
        onClose={() => setIsTrainingDocsOpen(false)}
        onNavigateToSection={(sectionId, view) => {
          if (view && view !== activeView) {
            setActiveView(view);
          }
          setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('ring-4', 'ring-[#0077b6]', 'ring-offset-4', 'transition-all', 'duration-500');
              setTimeout(() => {
                el.classList.remove('ring-4', 'ring-[#0077b6]', 'ring-offset-4');
              }, 2500);
            }
          }, 150);
        }}
      />

      <DataIngestionHub
        isOpen={isIngestionHubOpen}
        onClose={() => setIsIngestionHubOpen(false)}
        ingestedData={ingestedData}
        onRunIngestion={handleRunIngestion}
        onLoadIntoModel={(features) => setSelectedModelFeatures(features)}
        isLoading={isIngestionLoading}
      />

      <PythonScriptModal
        isOpen={isPythonScriptOpen}
        onClose={() => setIsPythonScriptOpen(false)}
      />

      {/* Interactive Modals */}
      {activeAnalysis && (
        <Eli6Modal
          isOpen={isEli6Open}
          onClose={() => setIsEli6Open(false)}
          eli6={activeAnalysis.eli6}
        />
      )}

      <MechanicsModal
        isOpen={isMechanicsOpen}
        onClose={() => setIsMechanicsOpen(false)}
      />

      <PortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        bankroll={bankroll}
        positions={positions}
        activeAnalysis={activeAnalysis}
        tradeSideToPreload={tradeSideToPreload}
        onPlaceTrade={handlePlaceTrade}
        onResolvePosition={handleResolvePosition}
        onResetBankroll={handleResetBankroll}
      />

      {/* CloudboyX Unified Suite Switcher Modal */}
      <CloudboyXSuiteModal
        isOpen={isSuiteSwitcherOpen}
        onClose={() => setIsSuiteSwitcherOpen(false)}
        onOpenWebhooksTab={() => setActiveView('erp_connector')}
      />

      {/* Global Share Analysis Modal */}
      {isGlobalShareOpen && activeAnalysis && (
        <ShareModal
          isOpen={isGlobalShareOpen}
          onClose={() => setIsGlobalShareOpen(false)}
          analysis={activeAnalysis}
        />
      )}

      {/* Interactive Walkthrough & Section Guide Bot */}
      <WalkthroughBot
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenTrainingDocs={() => setIsTrainingDocsOpen(true)}
        onOpenPortfolio={() => {
          setTradeSideToPreload(null);
          setIsPortfolioOpen(true);
        }}
        onOpenIngestion={() => setIsIngestionHubOpen(true)}
        onOpenPythonScript={() => setIsPythonScriptOpen(true)}
        activeEventTitle={activeAnalysis?.eventTitle}
      />

      {/* Export Success Toast Notification with Copy to Clipboard & Visual Progress Countdown */}
      {exportToast && (
        <div
          id="export-toast-notification"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3.5 bg-[#03045e]/95 text-white rounded-2xl shadow-2xl border border-[#0077b6] backdrop-blur-md animate-fade-in-up transition-all duration-300 ease-out max-w-[96vw] sm:max-w-2xl md:max-w-3xl select-none"
        >
          {/* Visual linear progress bar showing remaining time until auto-dismiss */}
          <div
            id="export-toast-progress-track"
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden"
            aria-hidden="true"
          >
            <div
              id="export-toast-progress-bar"
              key={exportToast.timestamp}
              className={`h-full origin-left ${
                exportToast.isError
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500'
                  : isToastPaused
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500'
                  : 'bg-gradient-to-r from-[#00b4d8] via-[#90e0ef] to-[#0077b6]'
              } ${isToastPaused ? 'shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'shadow-[0_0_8px_rgba(0,180,216,0.6)]'} transition-colors duration-300`}
              style={{
                animation: `toast-shrink ${exportToast.durationMs}ms linear forwards`,
                animationPlayState: isToastPaused ? 'paused' : 'running',
              }}
            />
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl ${
                exportToast.isError
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : isToastPaused
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : 'bg-[#caf0f8]/20 text-[#00b4d8] border border-[#00b4d8]/40'
              } flex items-center justify-center shrink-0`}
            >
              {exportToast.isError ? (
                <AlertCircle className="w-4 h-4" />
              ) : isToastPaused ? (
                <Pause className="w-4 h-4 text-amber-300" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </div>
            <div className="truncate flex-1 min-w-0">
              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>{exportToast.isError ? 'Export Notice' : 'Research Exported Successfully'}</span>
                {!exportToast.isError && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#0077b6] text-[#caf0f8] rounded font-mono font-medium">
                    JSON
                  </span>
                )}
                {isToastPaused && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/25 text-amber-300 border border-amber-400/40 rounded font-mono font-bold tracking-wider">
                    PAUSED
                  </span>
                )}
              </div>
              <div
                onClick={() => !exportToast.isError && handleCopyExport('filename')}
                title={exportToast.isError ? undefined : 'Click to copy filename to clipboard'}
                className={`text-[11px] ${
                  exportToast.isError
                    ? 'text-amber-200'
                    : 'text-[#caf0f8]/80 hover:text-white cursor-pointer transition-colors'
                } font-mono truncate`}
              >
                {exportToast.isError ? exportToast.message : exportToast.filename}
              </div>
            </div>
            {exportToast.isError && (
              <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                <button
                  type="button"
                  id="pause-countdown-error-btn"
                  onClick={handleToggleToastPause}
                  aria-label={isToastPaused ? 'Resume countdown' : 'Pause countdown'}
                  title={isToastPaused ? 'Resume countdown timer' : 'Pause countdown timer'}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  {isToastPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  type="button"
                  id="dismiss-export-toast-error-btn"
                  onClick={handleDismissExportToast}
                  className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {!exportToast.isError && (
            <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0 pl-10 sm:pl-0">
              {/* Copy to Clipboard Button */}
              <button
                type="button"
                id="copy-to-clipboard-btn"
                onClick={() => handleCopyExport(exportCopyMode)}
                aria-label="Copy to Clipboard"
                title={`Copy ${
                  exportCopyMode === 'contents'
                    ? 'exported research JSON contents'
                    : exportCopyMode === 'filename'
                    ? 'exported filename'
                    : 'both filename and full JSON content'
                } to clipboard`}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                  copiedStatus && copiedStatus !== 'all'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40'
                    : 'bg-[#0077b6] hover:bg-[#0096c7] text-white border border-[#90e0ef]/30'
                }`}
              >
                {copiedStatus && copiedStatus !== 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span className="text-[11px] font-bold">
                      {copiedStatus === 'contents' ? 'Copied JSON!' : 'Copied Name!'}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#caf0f8]" />
                    <span className="text-[11px] font-bold">Copy to Clipboard</span>
                  </>
                )}
              </button>

              {/* Copy All (Filename + JSON Content simultaneously) Button */}
              <button
                type="button"
                id="copy-all-to-clipboard-btn"
                data-testid="copy-all-btn"
                onClick={() => handleCopyExport('all')}
                aria-label="Copy both filename and full JSON content to clipboard"
                title="Copy both filename AND full JSON content simultaneously"
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                  copiedStatus === 'all'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : 'bg-[#023e8a] hover:bg-[#0077b6] text-white border border-[#90e0ef]/40'
                }`}
              >
                {copiedStatus === 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span className="text-[11px] font-bold">Copied All!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-[#caf0f8]" />
                    <span className="text-[11px] font-bold">Copy All</span>
                  </>
                )}
              </button>

              {/* Target Toggle: JSON Contents vs Filename vs All */}
              <div
                className="flex items-center bg-black/30 p-0.5 rounded-lg border border-white/15 text-[10px] font-mono"
                title="Choose what to copy to clipboard"
              >
                <button
                  type="button"
                  id="copy-export-json-target-btn"
                  onClick={() => handleCopyExport('contents')}
                  title="Copy full JSON research contents to clipboard"
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    exportCopyMode === 'contents' && !copiedStatus
                      ? 'bg-[#00b4d8] text-white font-bold shadow-2xs'
                      : copiedStatus === 'contents'
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'text-[#caf0f8]/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  JSON
                </button>
                <button
                  type="button"
                  id="copy-export-name-target-btn"
                  onClick={() => handleCopyExport('filename')}
                  title="Copy exported JSON filename to clipboard"
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    exportCopyMode === 'filename' && !copiedStatus
                      ? 'bg-[#00b4d8] text-white font-bold shadow-2xs'
                      : copiedStatus === 'filename'
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'text-[#caf0f8]/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Name
                </button>
                <button
                  type="button"
                  id="copy-export-all-target-btn"
                  onClick={() => handleCopyExport('all')}
                  title="Copy both filename and full JSON content to clipboard"
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    exportCopyMode === 'all' && !copiedStatus
                      ? 'bg-[#00b4d8] text-white font-bold shadow-2xs'
                      : copiedStatus === 'all'
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'text-[#caf0f8]/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  All
                </button>
              </div>

              {/* Pause / Resume Auto-Dismiss Timer Toggle Button */}
              <button
                type="button"
                id="pause-countdown-btn"
                data-testid="pause-toast-countdown-btn"
                onClick={handleToggleToastPause}
                aria-label={isToastPaused ? 'Resume auto-dismiss timer' : 'Pause auto-dismiss timer'}
                title={isToastPaused ? 'Resume countdown timer' : 'Pause auto-dismiss countdown timer'}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isToastPaused
                    ? 'bg-amber-500 hover:bg-amber-400 text-black border border-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'bg-white/10 hover:bg-white/20 text-[#caf0f8] hover:text-white border border-white/15'
                }`}
              >
                {isToastPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[11px] font-bold">Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">Pause</span>
                  </>
                )}
              </button>

              {/* Dismiss button */}
              <button
                type="button"
                id="dismiss-export-toast-btn"
                onClick={handleDismissExportToast}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-0.5"
                title="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Private VIP & Beta Gatekeeper Modal */}
      {!userSession && (
        <AccessGateModal
          onAuthenticate={(session) => setUserSession(session)}
        />
      )}
    </div>
  );
}
