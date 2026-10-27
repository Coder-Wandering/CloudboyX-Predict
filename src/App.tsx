import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import { LandingPage } from './components/LandingPage';
import { PRESET_EVENTS } from './data/presetEvents';
import {
  AlertCircle,
  CheckCircle,
  Download,
  X,
  Copy,
  Check,
  FileText,
  Pause,
  Play,
  Trophy,
  Target,
  User,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Activity,
  AlertTriangle,
  Bell,
  BellRing,
  BellOff,
  Volume2,
} from 'lucide-react';
import { exportAnalysisAsJson } from './utils/exportUtils';
import { AccessGateModal, UserSession } from './components/AccessGateModal';
import { PlayerPropsModal } from './components/PlayerPropsModal';
import { PlayerPropsAnalyzerView } from './components/PlayerPropsAnalyzerView';
import { NflHubView } from './components/NflHubView';
import { NflScheduleTab } from './components/NflScheduleTab';
import { NflPlayerPropsResponse, ActiveWorkspaceView } from './types';
import { getMockPlayerPropsResponse } from './data/nflPlayerProps';

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

  // Marketing Landing Page vs Enterprise Module state
  const [isLandingPage, setIsLandingPage] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'enterprise') return false;
      if (params.get('view') === 'landing') return true;
      const saved = localStorage.getItem('cloudboyx_view_mode');
      if (saved === 'enterprise') return false;
      return true; // Default to Landing Page so users immediately see the marketing presentation
    } catch {
      return true;
    }
  });

  const handleLaunchEnterprise = (targetView?: ActiveWorkspaceView) => {
    setIsLandingPage(false);
    if (targetView) {
      setActiveView(targetView);
    }
    if (!userSession) {
      const defaultSession: UserSession = {
        username: 'Enterprise Desk',
        role: 'Institutional Analyst',
        accessKey: 'PREDICT-ENTERPRISE-PASS',
        authenticatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('cloudboy_user_session', JSON.stringify(defaultSession));
      } catch {}
      setUserSession(defaultSession);
    }
    try {
      localStorage.setItem('cloudboyx_view_mode', 'enterprise');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLandingPage = () => {
    setIsLandingPage(true);
    try {
      localStorage.setItem('cloudboyx_view_mode', 'landing');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [activeView, setActiveView] = useState<ActiveWorkspaceView>('model_studio');
  const [marketAnalyzerSubTab, setMarketAnalyzerSubTab] = useState<'analysis' | 'nfl_schedule'>('analysis');
  const [activeAnalysis, setActiveAnalysis] = useState<ProbabilityAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [marketAnalyzerNflMode, setMarketAnalyzerNflMode] = useState<boolean>(false);
  const [isPlayerPropsModalOpen, setIsPlayerPropsModalOpen] = useState<boolean>(false);
  const [playerPropsData, setPlayerPropsData] = useState<NflPlayerPropsResponse | null>(null);
  const [isPlayerPropsLoading, setIsPlayerPropsLoading] = useState<boolean>(false);
  const [selectedPlayerPropsMatchup, setSelectedPlayerPropsMatchup] = useState<string>('ALL');

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
  const [isSimulatedSpikeActive, setIsSimulatedSpikeActive] = useState<boolean>(false);

  // Mode Bar Custom Price Alert states (saved threshold retained even when toggled off)
  const [modeBarAlertThreshold, setModeBarAlertThreshold] = useState<string>(() => {
    try {
      return localStorage.getItem('cloudboyx_modebar_alert_threshold') || '55';
    } catch {
      return '55';
    }
  });
  const [isModeBarAlertEnabled, setIsModeBarAlertEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cloudboyx_modebar_alert_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isPriceAlertHighlightActive, setIsPriceAlertHighlightActive] = useState<boolean>(false);
  const [, setLastTriggeredAlertPrice] = useState<number | null>(null);
  const lastAlertEvaluatedPriceRef = useRef<number | null>(null);
  const alertHighlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        const lowerQ = `${query} ${data.result.eventTitle || ''}`.toLowerCase();
        if (
          lowerQ.includes('nfl') ||
          lowerQ.includes('football') ||
          lowerQ.includes('chiefs') ||
          lowerQ.includes('ravens') ||
          lowerQ.includes('lions') ||
          lowerQ.includes('packers') ||
          lowerQ.includes('bills') ||
          lowerQ.includes('dolphins') ||
          lowerQ.includes('eagles') ||
          lowerQ.includes('cowboys') ||
          lowerQ.includes('super bowl')
        ) {
          setMarketAnalyzerNflMode(true);
        }
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

  // Fetch live NFL player props via mock API
  const handleFetchPlayerProps = async (matchup?: string) => {
    setIsPlayerPropsLoading(true);
    const targetMatchup = matchup !== undefined ? matchup : selectedPlayerPropsMatchup;
    try {
      const url =
        targetMatchup && targetMatchup !== 'ALL'
          ? `/api/nfl/player-props?matchup=${encodeURIComponent(targetMatchup)}`
          : '/api/nfl/player-props';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPlayerPropsData(data);
      } else {
        setPlayerPropsData(getMockPlayerPropsResponse(targetMatchup));
      }
    } catch (err) {
      console.warn('Failed to fetch player props from API, using fallback:', err);
      setPlayerPropsData(getMockPlayerPropsResponse(targetMatchup));
    } finally {
      setIsPlayerPropsLoading(false);
    }
  };

  // Auto-fetch player props when switching to player_props view
  useEffect(() => {
    if (activeView === 'player_props' && !playerPropsData) {
      handleFetchPlayerProps(selectedPlayerPropsMatchup);
    }
  }, [activeView, playerPropsData, selectedPlayerPropsMatchup]);

  // Handle simulated paper bet from Player Props modal
  const handlePlacePlayerPropBet = (
    playerName: string,
    propType: string,
    side: 'OVER' | 'UNDER',
    line: number
  ) => {
    const cost = 50; // standard 50c paper contract
    const shares = 10;
    const totalCost = (cost * shares) / 100;
    if (bankroll >= totalCost) {
      setBankroll((b) => Number((b - totalCost).toFixed(2)));
      const newPos: PaperTradePosition = {
        id: `prop-pos-${Date.now()}`,
        analysisId: 'nfl-prop-feed',
        eventTitle: `${playerName} - ${propType} ${side} ${line}`,
        contractType: side === 'OVER' ? 'YES' : 'NO',
        purchasePriceCents: cost,
        contractsCount: shares,
        totalCostDollars: totalCost,
        currentProbability: side === 'OVER' ? 62 : 38,
        unrealizedPnLDollars: 0,
        status: 'OPEN',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setPositions((prev) => [newPos, ...prev]);
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

  // 5-minute rolling window price range fluctuation calculation & spike detection (>10% in under 5 minutes)
  const fiveMinuteVolatility = useMemo(() => {
    const checks = currentEventChecks;
    if (!checks || checks.length < 2) {
      return {
        hasSpike: false,
        rangeCents: 0,
        fluctuationPercent: 0,
        minPrice: activeAnalysis?.marketEconomics.marketPriceCents ?? 50,
        maxPrice: activeAnalysis?.marketEconomics.marketPriceCents ?? 50,
        checksCount: checks?.length ?? 0,
      };
    }

    const now = Date.now();
    const parseCheckTime = (check: PriceCheckRecord, index: number, total: number): number => {
      if (check.id) {
        const m = check.id.match(/check-(\d{12,})/);
        if (m) return Number(m[1]);
      }
      if (check.timestamp) {
        const parsed = Date.parse(check.timestamp);
        if (!isNaN(parsed)) return parsed;
        const timeMatch = check.timestamp.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
        if (timeMatch) {
          const d = new Date();
          let h = parseInt(timeMatch[1], 10);
          const min = parseInt(timeMatch[2], 10);
          const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
          const ampm = timeMatch[4] ? timeMatch[4].toUpperCase() : null;
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          d.setHours(h, min, s, 0);
          return d.getTime();
        }
      }
      return now - (total - 1 - index) * 60000;
    };

    const checksWithTime = checks.map((c, i) => ({
      ...c,
      timeMs: parseCheckTime(c, i, checks.length),
    }));

    // Find latest check timestamp
    const latestTime = Math.max(...checksWithTime.map((c) => c.timeMs), now);
    const windowStart = latestTime - 5 * 60 * 1000;

    const windowChecks = checksWithTime.filter((c) => c.timeMs >= windowStart);
    const evalChecks = windowChecks.length >= 2 ? windowChecks : checksWithTime.slice(-3);

    const prices = evalChecks.map((c) => c.priceCents);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const rangeCents = maxPrice - minPrice;

    // Relative percentage fluctuation relative to minimum price
    const relPercent = minPrice > 0 ? ((maxPrice - minPrice) / minPrice) * 100 : 0;
    // Absolute points on binary contract scale (100 cents = 100%)
    const absPointsPercent = rangeCents;

    // Max step percentage between consecutive ticks
    let maxStepPct = 0;
    for (let i = 1; i < evalChecks.length; i++) {
      const prev = evalChecks[i - 1].priceCents;
      const curr = evalChecks[i].priceCents;
      if (prev > 0) {
        const step = (Math.abs(curr - prev) / prev) * 100;
        if (step > maxStepPct) maxStepPct = step;
      }
    }

    const maxObservedPct = Math.max(relPercent, absPointsPercent, maxStepPct);
    const hasSpike = maxObservedPct >= 10;

    return {
      hasSpike,
      rangeCents,
      fluctuationPercent: Number(maxObservedPct.toFixed(1)),
      minPrice,
      maxPrice,
      checksCount: evalChecks.length,
    };
  }, [currentEventChecks, activeAnalysis]);

  const isSpikeActive = isSimulatedSpikeActive || fiveMinuteVolatility.hasSpike;
  const displayFluctuation = isSimulatedSpikeActive
    ? Math.max(14.2, fiveMinuteVolatility.fluctuationPercent || 14.2)
    : fiveMinuteVolatility.fluctuationPercent;

  const handleTriggerSpikeTest = () => {
    setIsSimulatedSpikeActive(true);
    if (activeAnalysis) {
      const currentPrice = activeAnalysis.marketEconomics.marketPriceCents;
      const spikedPrice = currentPrice >= 80 ? Math.max(5, currentPrice - 15) : Math.min(95, currentPrice + 14);
      handleRecordPriceCheck(spikedPrice, 'Tick Update');
    }
  };

  const displayVolatilitySummary = currentVolatilitySummary || {
    level: (isSpikeActive ? 'HIGH' : 'LOW') as 'HIGH' | 'MODERATE' | 'LOW',
    rangeCents: isSpikeActive ? Math.max(10, fiveMinuteVolatility.rangeCents || 10) : 1,
    deltaNet: 0,
  };

  // Directional trend calculation: latest tick vs previous average (Up/Down/Neutral)
  const directionalTickTrend = useMemo(() => {
    let latestTick: number;
    let prevAverage: number;
    let priorChecksCount: number;

    if (currentEventChecks && currentEventChecks.length >= 2) {
      const latestCheck = currentEventChecks[currentEventChecks.length - 1];
      latestTick = latestCheck.priceCents;
      const priorChecks = currentEventChecks.slice(0, -1);
      const sum = priorChecks.reduce((acc, c) => acc + c.priceCents, 0);
      prevAverage = sum / priorChecks.length;
      priorChecksCount = priorChecks.length;
    } else if (currentEventChecks && currentEventChecks.length === 1) {
      latestTick = currentEventChecks[0].priceCents;
      const basePrice = activeAnalysis?.marketEconomics.marketPriceCents ?? 50;
      prevAverage = basePrice;
      priorChecksCount = 1;
    } else {
      const basePrice = activeAnalysis?.marketEconomics.marketPriceCents ?? 50;
      const p1 = Math.max(1, Math.min(99, basePrice - 2));
      const p2 = Math.max(1, Math.min(99, basePrice + 1));
      const p3 = basePrice;
      latestTick = p3;
      prevAverage = (p1 + p2) / 2;
      priorChecksCount = 2;
    }

    const delta = latestTick - prevAverage;
    const roundedDelta = Number(delta.toFixed(1));

    let direction: 'Up' | 'Down' | 'Neutral' = 'Neutral';
    if (roundedDelta > 0.05) {
      direction = 'Up';
    } else if (roundedDelta < -0.05) {
      direction = 'Down';
    } else {
      direction = 'Neutral';
    }

    return {
      direction,
      latestTick,
      previousAverage: Number(prevAverage.toFixed(1)),
      delta: roundedDelta,
      priorChecksCount,
    };
  }, [currentEventChecks, activeAnalysis]);

  const handleSimulateDirectionalTick = (target: 'UP' | 'DOWN' | 'NEUTRAL') => {
    if (!activeAnalysis) return;
    const prevAvg = directionalTickTrend.previousAverage;
    let targetPrice = Math.round(prevAvg);
    if (target === 'UP') {
      targetPrice = Math.min(99, Math.round(prevAvg + 3));
    } else if (target === 'DOWN') {
      targetPrice = Math.max(1, Math.round(prevAvg - 3));
    }
    handleRecordPriceCheck(targetPrice, 'Tick Update');
  };

  // Web Audio API harmonic chime for Price Alerts
  const playPriceAlertNotificationSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // Harmonic bell chime 1 (F#5 - 739.99 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(739.99, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Harmonic bell chime 2 (C#6 - 1108.73 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1108.73, now + 0.12);
      gain2.gain.setValueAtTime(0.25, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch (err) {
      console.warn('Price alert chime sound error:', err);
    }
  }, []);

  // Trigger alert highlight animation and audio chime
  const triggerPriceAlert = useCallback(
    (currentPrice: number) => {
      setLastTriggeredAlertPrice(currentPrice);
      setIsPriceAlertHighlightActive(true);
      playPriceAlertNotificationSound();

      if (alertHighlightTimeoutRef.current) {
        clearTimeout(alertHighlightTimeoutRef.current);
      }
      alertHighlightTimeoutRef.current = setTimeout(() => {
        setIsPriceAlertHighlightActive(false);
      }, 4500);
    },
    [playPriceAlertNotificationSound]
  );

  // Monitor live market price crossing the custom threshold
  useEffect(() => {
    const currentPrice =
      currentEventChecks && currentEventChecks.length > 0
        ? currentEventChecks[currentEventChecks.length - 1].priceCents
        : (activeAnalysis?.marketEconomics.marketPriceCents ?? null);

    if (currentPrice === null) return;

    const prevPrice = lastAlertEvaluatedPriceRef.current;
    lastAlertEvaluatedPriceRef.current = currentPrice;

    // Only trigger if alerts are enabled by the toggle switch and a valid threshold exists
    if (!isModeBarAlertEnabled) return;
    const threshold = parseFloat(modeBarAlertThreshold);
    if (isNaN(threshold) || threshold <= 0) return;

    if (prevPrice !== null && prevPrice !== currentPrice) {
      const crossed =
        (prevPrice < threshold && currentPrice >= threshold) ||
        (prevPrice > threshold && currentPrice <= threshold) ||
        currentPrice === threshold;

      if (crossed) {
        triggerPriceAlert(currentPrice);
      }
    }
  }, [
    currentEventChecks,
    activeAnalysis?.marketEconomics.marketPriceCents,
    isModeBarAlertEnabled,
    modeBarAlertThreshold,
    triggerPriceAlert,
  ]);

  // Test button handler to verify notification sound and visual highlight animation
  const handleTestPriceAlert = () => {
    const threshold = parseFloat(modeBarAlertThreshold) || 55;
    triggerPriceAlert(threshold);
  };

  // If Marketing Landing Page is active, render the high-converting CloudboyX Predict marketing page
  if (isLandingPage) {
    return (
      <LandingPage
        onLaunchEnterprise={handleLaunchEnterprise}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

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
        onOpenLandingPage={handleOpenLandingPage}
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
        onOpenLandingPage={handleOpenLandingPage}
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
            {/* Conditional UI Toggle: Market Analyzer View Parameters Mode */}
            <div
              id="market-analyzer-view-mode-bar"
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-hidden"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    marketAnalyzerNflMode
                      ? 'bg-[#03045e] text-[#caf0f8] shadow-xs'
                      : 'bg-[#caf0f8] text-[#0077b6]'
                  }`}
                >
                  {marketAnalyzerNflMode ? (
                    <Trophy className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#90e0ef]" />
                  ) : (
                    <Target className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0077b6]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-xs font-extrabold text-[#03045e] uppercase tracking-wider">
                      <span className="hidden sm:inline">Analysis </span>Parameters Mode:
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                        marketAnalyzerNflMode
                          ? 'bg-[#caf0f8] text-[#0077b6] border border-[#00b4d8]'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {marketAnalyzerNflMode ? '🏈 NFL FOOTBALL ACTIVE' : '📊 GENERIC CONTRACT'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 md:line-clamp-none">
                    {marketAnalyzerNflMode
                      ? 'Sport-specific analysis parameters active: showing Game Spread, Over/Under, and Team Depth Chart in place of generic market contract fields.'
                      : 'Standard market contract parameters active: showing Kalshi orderbook, Yes/No contract prices, and binary resolution.'}
                  </p>
                </div>
              </div>

              {/* Volatility Summary within the Mode Bar */}
              <div
                id="mode-bar-volatility-summary"
                data-testid="mode-bar-volatility-summary"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 shrink-0 self-stretch md:self-auto overflow-x-auto no-scrollbar"
              >
                <div className="flex items-center space-x-1.5 shrink-0">
                  <Activity className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider whitespace-nowrap">
                    <span className="hidden sm:inline">Market </span>Volatility:
                  </span>
                  <span
                    id="mode-bar-volatility-level-badge"
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase whitespace-nowrap border ${
                      isSpikeActive || displayVolatilitySummary.level === 'HIGH'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : displayVolatilitySummary.level === 'MODERATE'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    }`}
                  >
                    {isSpikeActive ? 'HIGH (SPIKE)' : displayVolatilitySummary.level}
                  </span>
                  <span id="mode-bar-volatility-price-range" className="text-[11px] font-mono text-stone-600 whitespace-nowrap">
                    ({displayVolatilitySummary.rangeCents}&cent; range)
                  </span>

                  {/* Directional trend arrows (Up/Down/Neutral) next to the price range, based on latest tick vs previous average */}
                  <div
                    id="mode-bar-volatility-trend-indicator"
                    data-testid="mode-bar-volatility-trend-indicator"
                    data-direction={directionalTickTrend.direction}
                    className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0 transition-all ${
                      directionalTickTrend.direction === 'Up'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : directionalTickTrend.direction === 'Down'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                    title={`Directional trend: ${directionalTickTrend.direction} | Latest tick: ${directionalTickTrend.latestTick}¢ vs previous average: ${directionalTickTrend.previousAverage}¢ (${directionalTickTrend.delta > 0 ? '+' : ''}${directionalTickTrend.delta}¢)`}
                  >
                    {directionalTickTrend.direction === 'Up' && (
                      <ArrowUp className="w-3 h-3 text-emerald-600 stroke-[2.8]" />
                    )}
                    {directionalTickTrend.direction === 'Down' && (
                      <ArrowDown className="w-3 h-3 text-rose-600 stroke-[2.8]" />
                    )}
                    {directionalTickTrend.direction === 'Neutral' && (
                      <Minus className="w-3 h-3 text-stone-400 stroke-[2.8]" />
                    )}
                    <span className="font-extrabold">{directionalTickTrend.direction}</span>
                    <span className="text-[9px] font-mono opacity-75">
                      ({directionalTickTrend.delta > 0 ? `+${directionalTickTrend.delta}` : directionalTickTrend.delta}&cent;)
                    </span>
                  </div>

                  {/* Custom Price Alert Input Field & Enable/Disable Toggle Switch */}
                  <div
                    id="mode-bar-price-alert-container"
                    data-testid="mode-bar-price-alert-container"
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs transition-all shrink-0 ${
                      isPriceAlertHighlightActive
                        ? 'bg-amber-100/95 border-amber-500 ring-2 ring-amber-400 ring-offset-1 text-amber-950 shadow-md shadow-amber-300 animate-pulse'
                        : isModeBarAlertEnabled
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-stone-100/80 border-stone-200 text-stone-500'
                    }`}
                    title={
                      isModeBarAlertEnabled
                        ? `Custom Price Alert Active at ${modeBarAlertThreshold || '--'}¢. Plays chime & triggers visual highlight animation when live market price crosses threshold.`
                        : `Custom Price Alert Disabled (saved threshold ${modeBarAlertThreshold || '--'}¢ retained). Click toggle to enable.`
                    }
                  >
                    {/* Checkbox / Toggle switch to quickly enable or disable price alert without clearing saved threshold */}
                    <label
                      htmlFor="mode-bar-price-alert-toggle"
                      id="mode-bar-price-alert-toggle-label"
                      className="inline-flex items-center gap-1 cursor-pointer select-none group"
                      title={
                        isModeBarAlertEnabled
                          ? 'Click to disable price alert (saved threshold will be preserved)'
                          : 'Click to enable price alert with saved threshold'
                      }
                    >
                      <input
                        type="checkbox"
                        id="mode-bar-price-alert-toggle"
                        data-testid="mode-bar-price-alert-toggle"
                        checked={isModeBarAlertEnabled}
                        onChange={(e) => {
                          const nextVal = e.target.checked;
                          setIsModeBarAlertEnabled(nextVal);
                          try {
                            localStorage.setItem('cloudboyx_modebar_alert_enabled', String(nextVal));
                          } catch {}
                        }}
                        className="sr-only"
                      />
                      {/* Visual toggle switch slider */}
                      <span
                        className={`w-6 h-3.5 rounded-full transition-colors duration-200 ease-in-out p-0.5 flex items-center ${
                          isModeBarAlertEnabled ? 'bg-amber-500' : 'bg-stone-300 group-hover:bg-stone-400'
                        }`}
                        aria-hidden="true"
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full bg-white shadow-2xs transform transition-transform duration-200 ease-in-out ${
                            isModeBarAlertEnabled ? 'translate-x-2.5' : 'translate-x-0'
                          }`}
                        />
                      </span>

                      {isModeBarAlertEnabled ? (
                        <Bell className={`w-3 h-3 text-amber-600 shrink-0 ${isPriceAlertHighlightActive ? 'animate-bounce' : ''}`} />
                      ) : (
                        <BellOff className="w-3 h-3 text-stone-400 shrink-0" />
                      )}
                      <span className="text-[10px] font-bold tracking-tight">
                        {isModeBarAlertEnabled ? 'Alert' : 'Off'}
                      </span>
                    </label>

                    {/* Price Alert Custom Threshold Input Field */}
                    <div className="inline-flex items-center gap-0.5">
                      <span className="text-[10px] font-mono text-stone-400">&ge;</span>
                      <input
                        type="number"
                        id="mode-bar-price-alert-input"
                        data-testid="mode-bar-price-alert-input"
                        min={1}
                        max={99}
                        value={modeBarAlertThreshold}
                        onChange={(e) => {
                          const val = e.target.value;
                          setModeBarAlertThreshold(val);
                          try {
                            localStorage.setItem('cloudboyx_modebar_alert_threshold', val);
                          } catch {}
                        }}
                        placeholder="55"
                        className={`w-9 h-5 px-1 text-[11px] font-mono font-bold text-center rounded border transition-all ${
                          isModeBarAlertEnabled
                            ? 'bg-white text-stone-900 border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500'
                            : 'bg-stone-100 text-stone-500 border-stone-200 cursor-default'
                        }`}
                        title={
                          isModeBarAlertEnabled
                            ? `Custom price alert threshold in cents (currently ${modeBarAlertThreshold}¢)`
                            : `Saved threshold is ${modeBarAlertThreshold}¢ (Alert currently disabled via toggle)`
                        }
                      />
                      <span className={`text-[10.5px] font-mono font-bold ${isModeBarAlertEnabled ? 'text-amber-800' : 'text-stone-400'}`}>
                        &cent;
                      </span>
                    </div>

                    {/* Triggered Badge Animation */}
                    {isPriceAlertHighlightActive && (
                      <span
                        id="mode-bar-price-alert-triggered-badge"
                        className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-600 text-white text-[9.5px] font-extrabold animate-pulse whitespace-nowrap shadow-xs"
                        title="Alert threshold crossed! Browser notification sound played."
                      >
                        <BellRing className="w-2.5 h-2.5 animate-spin" />
                        <span>Triggered!</span>
                        <Volume2 className="w-2.5 h-2.5" />
                      </span>
                    )}

                    {/* Test Alert Button */}
                    <button
                      type="button"
                      id="mode-bar-test-price-alert-btn"
                      onClick={handleTestPriceAlert}
                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-0.5 ${
                        isPriceAlertHighlightActive
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-white hover:bg-amber-100 text-amber-800 border-amber-200 hover:border-amber-300'
                      }`}
                      title="Test browser notification sound and visual highlight animation"
                    >
                      <Volume2 className="w-2.5 h-2.5" />
                      <span>Test</span>
                    </button>
                  </div>
                </div>

                {/* Visual Alert or Spike Indicator that triggers when price range fluctuates >10% in under 5 minutes */}
                {isSpikeActive ? (
                  <div
                    id="volatility-spike-indicator"
                    data-testid="volatility-spike-indicator"
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[10.5px] shadow-xs animate-pulse shrink-0 border border-amber-600"
                    title={`Price range fluctuated ±${displayFluctuation}% in under 5 minutes (>10% threshold exceeded)`}
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-90"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <Zap className="w-3.5 h-3.5 text-amber-100 fill-amber-200 shrink-0" />
                    <span className="tracking-tight whitespace-nowrap">
                      SPIKE ALERT: &plusmn;{displayFluctuation}% (&lt;5m)
                    </span>
                    {isSimulatedSpikeActive && (
                      <button
                        type="button"
                        id="mode-bar-reset-spike-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSimulatedSpikeActive(false);
                        }}
                        className="ml-1 px-1.5 py-0.2 rounded bg-amber-700 hover:bg-amber-800 text-[9px] text-white cursor-pointer"
                        title="Reset spike test"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      id="mode-bar-simulate-spike-btn"
                      onClick={handleTriggerSpikeTest}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-stone-500 hover:text-amber-800 hover:bg-amber-100/60 transition-colors border border-dashed border-stone-300 hover:border-amber-400 cursor-pointer shrink-0 whitespace-nowrap"
                      title="Simulate a >10% price range spike in under 5 minutes to trigger the spike indicator"
                    >
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="hidden sm:inline">Test Spike Alert</span>
                      <span className="sm:hidden">Spike Test</span>
                    </button>

                    {/* Quick Trend Simulators: Up / Down / Neutral */}
                    <div
                      id="mode-bar-trend-sim-buttons"
                      className="inline-flex items-center rounded-lg border border-stone-200 bg-white p-0.5 shadow-2xs shrink-0"
                      title="Simulate price ticks to test directional trend arrows (Up/Down/Neutral)"
                    >
                      <button
                        type="button"
                        id="mode-bar-test-trend-up-btn"
                        onClick={() => handleSimulateDirectionalTick('UP')}
                        className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 hover:bg-emerald-50 rounded transition-colors flex items-center space-x-0.5 cursor-pointer"
                        title="Simulate tick above previous average (+3¢)"
                      >
                        <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>Up</span>
                      </button>
                      <button
                        type="button"
                        id="mode-bar-test-trend-down-btn"
                        onClick={() => handleSimulateDirectionalTick('DOWN')}
                        className="px-1.5 py-0.5 text-[9px] font-bold text-rose-700 hover:bg-rose-50 rounded transition-colors flex items-center space-x-0.5 cursor-pointer"
                        title="Simulate tick below previous average (-3¢)"
                      >
                        <ArrowDown className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>Down</span>
                      </button>
                      <button
                        type="button"
                        id="mode-bar-test-trend-neutral-btn"
                        onClick={() => handleSimulateDirectionalTick('NEUTRAL')}
                        className="px-1.5 py-0.5 text-[9px] font-bold text-stone-600 hover:bg-stone-100 rounded transition-colors flex items-center space-x-0.5 cursor-pointer"
                        title="Simulate tick matching previous average (=)"
                      >
                        <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>Flat</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions & Conditional Toggle Controls: horizontal scroll and collapsed compact states for tablet / mobile screens */}
              <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto overflow-x-auto no-scrollbar py-0.5 max-w-full">
                {/* Player Props button that navigates directly to standalone Player Props Analyzer */}
                {marketAnalyzerNflMode && (
                  <button
                    type="button"
                    id="player-props-btn"
                    onClick={() => {
                      if (!playerPropsData) {
                        handleFetchPlayerProps(selectedPlayerPropsMatchup);
                      }
                      setActiveView('player_props');
                    }}
                    disabled={isPlayerPropsLoading}
                    className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0077b6] hover:bg-[#0096c7] text-white shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-95 border border-[#90e0ef]/40 shrink-0 whitespace-nowrap"
                    title="Open standalone Player Props Analyzer"
                  >
                    <User className="w-3.5 h-3.5 text-[#caf0f8] shrink-0" />
                    <span className="hidden lg:inline">Player Props Analyzer</span>
                    <span className="hidden sm:inline lg:hidden">Player Props</span>
                    <span className="sm:hidden">Props</span>
                    <span className="hidden md:inline px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#03045e] text-[#caf0f8] uppercase tracking-wider shrink-0">
                      Standalone &rarr;
                    </span>
                    <span className="md:hidden text-[10px] text-[#caf0f8] font-bold">&rarr;</span>
                  </button>
                )}

                {/* Conditional Toggle Control with collapsible labels on compact / tablet screens */}
                <div className="inline-flex p-1 bg-stone-100 border border-stone-200 rounded-xl shrink-0">
                  <button
                    type="button"
                    id="view-toggle-generic-contract-btn"
                    onClick={() => setMarketAnalyzerNflMode(false)}
                    className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      !marketAnalyzerNflMode
                        ? 'bg-white text-[#03045e] shadow-2xs border border-stone-200'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Switch to Generic Contract mode"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">Generic Contract</span>
                    <span className="sm:hidden">Generic</span>
                  </button>
                  <button
                    type="button"
                    id="view-toggle-nfl-football-btn"
                    onClick={() => setMarketAnalyzerNflMode(true)}
                    className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      marketAnalyzerNflMode
                        ? 'bg-[#03045e] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Switch to NFL Football mode"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#90e0ef] shrink-0" />
                    <span className="hidden sm:inline">NFL Football</span>
                    <span className="sm:hidden">NFL</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Market Analyzer Sub-Navigation Bar */}
            <div
              id="market-analyzer-sub-nav"
              className="flex items-center space-x-2 border-b border-stone-200 pb-3"
            >
              <button
                type="button"
                id="market-analyzer-subnav-analysis-tab"
                onClick={() => setMarketAnalyzerSubTab('analysis')}
                className={`inline-flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  marketAnalyzerSubTab === 'analysis'
                    ? 'bg-[#03045e] text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:text-[#03045e] hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Contract Analysis</span>
              </button>

              <button
                type="button"
                id="market-analyzer-subnav-nfl-schedule-tab"
                onClick={() => setMarketAnalyzerSubTab('nfl_schedule')}
                className={`inline-flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  marketAnalyzerSubTab === 'nfl_schedule'
                    ? 'bg-[#03045e] text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:text-[#03045e] hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#00b4d8]" />
                <span>NFL Schedule</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                    marketAnalyzerSubTab === 'nfl_schedule'
                      ? 'bg-[#00d4ff] text-[#03045e]'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  Weekly Slate
                </span>
              </button>
            </div>

            {/* Sub-Tab 1: NFL Schedule */}
            {marketAnalyzerSubTab === 'nfl_schedule' ? (
              <NflScheduleTab
                onAnalyzeGame={(matchupQuery) => {
                  setMarketAnalyzerSubTab('analysis');
                  setMarketAnalyzerNflMode(true);
                  handleAnalyze(matchupQuery, 50, 'Culture & Sports');
                }}
                onNavigateToPlayerProps={(matchupQuery) => {
                  if (matchupQuery) {
                    setSelectedPlayerPropsMatchup(matchupQuery);
                    handleFetchPlayerProps(matchupQuery);
                  }
                  setActiveView('player_props');
                }}
              />
            ) : (
              /* Sub-Tab 2: Standard Contract Analysis Pipeline */
              <>
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
                      isNflMode={marketAnalyzerNflMode}
                      onToggleNflMode={setMarketAnalyzerNflMode}
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
              </>
            )}
          </div>
        )}

        {/* VIEW 3: COMPREHENSIVE NFL MODELS & ANALYTICS HUB */}
        {activeView === 'player_props' && (
          <NflHubView
            playerPropsData={playerPropsData}
            isLoadingProps={isPlayerPropsLoading}
            onRefreshProps={() => handleFetchPlayerProps(selectedPlayerPropsMatchup)}
            selectedMatchup={selectedPlayerPropsMatchup}
            onSelectMatchup={(m) => {
              setSelectedPlayerPropsMatchup(m);
              handleFetchPlayerProps(m);
            }}
          />
        )}

        {/* VIEW 4: ENTERPRISE WEBHOOK & ERP CONNECTOR STUDIO */}
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

      {/* NFL Live Player Props & Yardage Projections Modal */}
      <PlayerPropsModal
        isOpen={isPlayerPropsModalOpen}
        onClose={() => setIsPlayerPropsModalOpen(false)}
        data={playerPropsData}
        isLoading={isPlayerPropsLoading}
        onRefresh={handleFetchPlayerProps}
        onPlacePaperBet={handlePlacePlayerPropBet}
      />
    </div>
  );
}
