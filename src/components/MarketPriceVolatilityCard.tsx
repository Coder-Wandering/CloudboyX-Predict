import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Sliders,
  ShieldAlert,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  History,
  ChevronDown,
  ChevronUp,
  Bell,
  BellRing,
  BellOff,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  X,
  Check,
  Tag,
  LineChart as LineChartIcon,
  Mail,
  Send,
  Smartphone,
  Sparkles,
  Inbox,
  Percent,
  Target,
  Play,
  Pause,
  Clock,
  Timer,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { PriceCheckRecord, VolatilityComparison, PriceAlert, PriceAlertCondition } from '../types';

export interface PriceAlertToast {
  id: string;
  alertId?: string;
  eventTitle: string;
  targetPriceCents: number;
  currentPriceCents: number;
  condition: PriceAlertCondition;
  conditionLabel: string;
  message: string;
  timestamp: string;
  note?: string;
  createdAtMs: number;
  isConfirmation?: boolean;
}

interface MarketPriceVolatilityCardProps {
  eventTitle: string;
  currentMarketPrice: number;
  checks: PriceCheckRecord[];
  onAddPriceCheck: (newPrice: number, source?: PriceCheckRecord['source']) => void;
  isLoadingCheck?: boolean;
  priceChecksMap?: Record<string, PriceCheckRecord[]>;
}

interface CheckTrendInfo {
  delta: number;
  direction: 'UP' | 'DOWN' | 'FLAT';
  label: string;
}

interface TriggeredNotification {
  alert: PriceAlert;
  triggeredPrice: number;
  timestamp: string;
  message: string;
  channels: {
    browser: boolean;
    email: boolean;
    emailAddress?: string;
  };
  isSignificantChange?: boolean;
  deltaCents?: number;
}

// Web Audio API synthesized notification chime
function playAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (D5: 587.33Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second higher tone (A5: 880.0Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.1);
    gain2.gain.setValueAtTime(0.25, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

// Desktop browser notification trigger
function triggerBrowserNotification(title: string, body: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch {
      // ignore
    }
  }
}

// Backend Email Notification Dispatcher
async function dispatchEmailAlertApi(payload: {
  recipientEmail: string;
  eventTitle: string;
  currentPrice: number;
  previousPrice?: number;
  delta?: number;
  triggerReason: string;
  condition?: string;
  targetPrice?: number;
  note?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/notifications/email-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.error || 'Failed to dispatch email' };
    }
    const data = await res.json();
    return { success: true, message: data.message || 'Email alert dispatched' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error' };
  }
}

// Recharts Custom Tooltip Component
interface CustomPriceTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      checkNumber: number;
      label: string;
      time: string;
      price: number;
      delta: number;
      source: string;
      dollarPrice: string;
      bid: number | null;
      ask: number | null;
    };
  }>;
  label?: string;
}

const CustomPriceTooltip: React.FC<CustomPriceTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-white/95 backdrop-blur-xs border border-stone-200 rounded-xl shadow-lg p-3 text-xs space-y-1.5 min-w-[170px] z-50 pointer-events-none">
      <div className="flex items-center justify-between border-b border-stone-100 pb-1 text-[11px] text-stone-500 font-mono">
        <span className="font-bold text-[#03045e]">Check {item.label}</span>
        <span>{item.time}</span>
      </div>
      <div className="flex items-baseline justify-between pt-0.5">
        <span className="text-stone-500 font-medium">Contract Price:</span>
        <div className="text-right">
          <span className="text-sm font-black font-mono text-[#0077b6]">{item.price}¢</span>
          <span className="text-[10px] text-stone-400 font-mono ml-1">(${item.dollarPrice})</span>
        </div>
      </div>
      {item.delta !== 0 && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-stone-500">Tick Drift:</span>
          <span
            className={`font-mono font-bold ${
              item.delta > 0 ? 'text-[#0077b6]' : 'text-[#03045e]'
            }`}
          >
            {item.delta > 0 ? `+${item.delta}¢ Up` : `${item.delta}¢ Down`}
          </span>
        </div>
      )}
      {item.bid !== null && item.ask !== null && (
        <div className="flex items-center justify-between text-[10.5px] text-stone-500 font-mono">
          <span>Bid / Ask:</span>
          <span>{item.bid}¢ / {item.ask}¢</span>
        </div>
      )}
      {item.source && (
        <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100 truncate">
          Source: {item.source}
        </div>
      )}
    </div>
  );
};

export const MarketPriceVolatilityCard: React.FC<MarketPriceVolatilityCardProps> = ({
  eventTitle,
  currentMarketPrice,
  checks,
  onAddPriceCheck,
  isLoadingCheck = false,
  priceChecksMap,
}) => {
  const [showFullHistory, setShowFullHistory] = useState<boolean>(false);

  // Line chart interactive filter state
  const [chartRangeFilter, setChartRangeFilter] = useState<'all' | '10' | '5'>('all');
  const [showChart50Ref, setShowChart50Ref] = useState<boolean>(true);
  const [showChartAlertRef, setShowChartAlertRef] = useState<boolean>(true);

  // Derive full price checks list for the current active analysis from priceChecksMap or checks
  const currentEventChecksList: PriceCheckRecord[] = useMemo(() => {
    if (priceChecksMap && priceChecksMap[eventTitle] && priceChecksMap[eventTitle].length > 0) {
      return priceChecksMap[eventTitle];
    }
    if (checks && checks.length > 0) {
      return checks;
    }
    return [];
  }, [priceChecksMap, checks, eventTitle]);

  // Price Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('market_price_alerts') || localStorage.getItem('kalshi_market_price_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('market_alert_sound_enabled') || localStorage.getItem('kalshi_alert_sound_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isAlertPanelOpen, setIsAlertPanelOpen] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<TriggeredNotification | null>(null);

  // Channel & Volatility Notification States
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('market_browser_alerts_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [browserPermission, setBrowserPermission] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  });

  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('market_email_alerts_enabled');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('market_notification_email');
      if (saved) return saved;
      const session = localStorage.getItem('cloudboy_user_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.email) return parsed.email;
      }
      return 'gocloudboy2@gmail.com';
    } catch {
      return 'gocloudboy2@gmail.com';
    }
  });

  const [significantVolatilityEnabled, setSignificantVolatilityEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('market_significant_volatility_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [significantVolatilityThreshold, setSignificantVolatilityThreshold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('market_significant_volatility_threshold');
      return saved ? JSON.parse(saved) : 3;
    } catch {
      return 3;
    }
  });

  // User-defined percentage threshold for volatility alert on trend chart
  const [volatilityAlertEnabled, setVolatilityAlertEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('market_volatility_percent_alert_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [volatilityPercentThreshold, setVolatilityPercentThreshold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('market_volatility_percent_threshold');
      return saved !== null ? JSON.parse(saved) : 5;
    } catch {
      return 5;
    }
  });

  const [showVolatilitySettings, setShowVolatilitySettings] = useState<boolean>(false);

  // Set Price Alert Modal & Floating Toast State
  const [isSetPriceAlertModalOpen, setIsSetPriceAlertModalOpen] = useState<boolean>(false);
  const [priceAlertToasts, setPriceAlertToasts] = useState<PriceAlertToast[]>([]);

  // Interval-Based Price Polling Mechanism State
  const [isPollingActive, setIsPollingActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('market_price_alert_polling_active');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [pollingIntervalSeconds, setPollingIntervalSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('market_price_alert_polling_interval');
      const parsed = saved ? parseInt(saved, 10) : 5;
      return [3, 5, 10].includes(parsed) ? parsed : 5;
    } catch {
      return 5;
    }
  });

  const [pollingCountdown, setPollingCountdown] = useState<number>(pollingIntervalSeconds);
  const [lastPolledTimestamp, setLastPolledTimestamp] = useState<string | null>(null);
  const [isPollingLoading, setIsPollingLoading] = useState<boolean>(false);
  const [totalPollsCount, setTotalPollsCount] = useState<number>(0);

  const [emailTestStatus, setEmailTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailTestMessage, setEmailTestMessage] = useState<string>('');

  // Form State for custom alert configuration
  const [inputTargetPrice, setInputTargetPrice] = useState<number>(() => Math.min(99, currentMarketPrice + 2));
  const [inputCondition, setInputCondition] = useState<PriceAlertCondition>('ABOVE_OR_EQUAL');
  const [inputNote, setInputNote] = useState<string>('');
  const [inputChannelBrowser, setInputChannelBrowser] = useState<boolean>(true);
  const [inputChannelEmail, setInputChannelEmail] = useState<boolean>(() => emailNotificationsEnabled);

  // Sync default input channel email with global toggle
  useEffect(() => {
    if (emailNotificationsEnabled) {
      setInputChannelEmail(true);
    }
  }, [emailNotificationsEnabled]);

  // Persist notification preferences
  useEffect(() => {
    try {
      localStorage.setItem('market_browser_alerts_enabled', JSON.stringify(browserNotificationsEnabled));
    } catch {
      // ignore
    }
  }, [browserNotificationsEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('market_email_alerts_enabled', JSON.stringify(emailNotificationsEnabled));
    } catch {
      // ignore
    }
  }, [emailNotificationsEnabled]);

  useEffect(() => {
    try {
      if (userEmail) {
        localStorage.setItem('market_notification_email', userEmail);
      }
    } catch {
      // ignore
    }
  }, [userEmail]);

  useEffect(() => {
    try {
      localStorage.setItem('market_significant_volatility_enabled', JSON.stringify(significantVolatilityEnabled));
    } catch {
      // ignore
    }
  }, [significantVolatilityEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('market_significant_volatility_threshold', JSON.stringify(significantVolatilityThreshold));
    } catch {
      // ignore
    }
  }, [significantVolatilityThreshold]);

  useEffect(() => {
    try {
      localStorage.setItem('market_volatility_percent_alert_enabled', JSON.stringify(volatilityAlertEnabled));
    } catch {
      // ignore
    }
  }, [volatilityAlertEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('market_volatility_percent_threshold', JSON.stringify(volatilityPercentThreshold));
    } catch {
      // ignore
    }
  }, [volatilityPercentThreshold]);

  // Persist alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('market_price_alerts', JSON.stringify(alerts));
      localStorage.setItem('kalshi_market_price_alerts', JSON.stringify(alerts));
    } catch {
      // ignore
    }
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem('market_alert_sound_enabled', JSON.stringify(soundEnabled));
      localStorage.setItem('kalshi_alert_sound_enabled', JSON.stringify(soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('market_price_alert_polling_active', JSON.stringify(isPollingActive));
    } catch {
      // ignore
    }
  }, [isPollingActive]);

  useEffect(() => {
    try {
      localStorage.setItem('market_price_alert_polling_interval', String(pollingIntervalSeconds));
    } catch {
      // ignore
    }
  }, [pollingIntervalSeconds]);

  // Auto-dismiss floating price alert toasts after 8 seconds
  useEffect(() => {
    if (priceAlertToasts.length === 0) return;
    const timer = setTimeout(() => {
      setPriceAlertToasts((prev) => prev.slice(0, -1));
    }, 8000);
    return () => clearTimeout(timer);
  }, [priceAlertToasts]);

  // Ensure we have at least 3 checks for comparison; if fewer, provide synthesized prior checks ending at current
  const validChecks: PriceCheckRecord[] = (() => {
    const activeList = currentEventChecksList.length > 0 ? currentEventChecksList : checks;
    if (activeList.length >= 3) {
      return activeList.slice(-3);
    }
    // Synthesize 3 checks ending at currentMarketPrice
    const now = Date.now();
    const c3Price = currentMarketPrice;
    const c2Price = Math.max(1, Math.min(99, c3Price - 1));
    const c1Price = Math.max(1, Math.min(99, c2Price - 1));

    const defaultChecks: PriceCheckRecord[] = [
      {
        id: 'c-synth-1',
        checkIndex: 1,
        priceCents: c1Price,
        timestamp: new Date(now - 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: 'Initial Baseline',
      },
      {
        id: 'c-synth-2',
        checkIndex: 2,
        priceCents: c2Price,
        timestamp: new Date(now - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: 'Initial Baseline',
      },
      {
        id: 'c-synth-3',
        checkIndex: 3,
        priceCents: c3Price,
        timestamp: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: 'Live Consensus Feed',
      },
    ];

    if (activeList.length === 2) {
      return [defaultChecks[0], activeList[0], activeList[1]];
    }
    if (activeList.length === 1) {
      return [defaultChecks[0], defaultChecks[1], activeList[0]];
    }
    return defaultChecks;
  })();

  // Historical price records for the Recharts line chart
  const fullHistoricalChecks: PriceCheckRecord[] = useMemo(() => {
    const list = currentEventChecksList.length > 0 ? currentEventChecksList : checks;
    if (list && list.length >= 3) {
      return list;
    }
    return validChecks;
  }, [currentEventChecksList, checks, validChecks]);

  // Filtered dataset for Recharts LineChart
  const chartData = useMemo(() => {
    let dataset = [...fullHistoricalChecks];
    if (chartRangeFilter === '5' && dataset.length > 5) {
      dataset = dataset.slice(-5);
    } else if (chartRangeFilter === '10' && dataset.length > 10) {
      dataset = dataset.slice(-10);
    }

    return dataset.map((chk, index) => {
      const origIndex = fullHistoricalChecks.findIndex((c) => c.id === chk.id);
      const effectiveIndex = origIndex >= 0 ? origIndex : index;
      const prev = effectiveIndex > 0 ? fullHistoricalChecks[effectiveIndex - 1] : null;
      const delta = prev ? chk.priceCents - prev.priceCents : 0;
      return {
        id: chk.id,
        checkNumber: chk.checkIndex || effectiveIndex + 1,
        label: `#${chk.checkIndex || effectiveIndex + 1}`,
        time: chk.timestamp,
        price: chk.priceCents,
        delta,
        source: chk.source || 'Orderbook Polled',
        dollarPrice: (chk.priceCents / 100).toFixed(2),
        bid: chk.yesBid ?? null,
        ask: chk.yesAsk ?? null,
      };
    });
  }, [fullHistoricalChecks, chartRangeFilter]);

  const chartMinPrice = chartData.length > 0 ? Math.min(...chartData.map((d) => d.price)) : currentMarketPrice;
  const chartMaxPrice = chartData.length > 0 ? Math.max(...chartData.map((d) => d.price)) : currentMarketPrice;
  const chartStartPrice = fullHistoricalChecks[0]?.priceCents ?? currentMarketPrice;
  const chartLatestPrice = fullHistoricalChecks[fullHistoricalChecks.length - 1]?.priceCents ?? currentMarketPrice;
  const totalHistoricalDriftCents = chartLatestPrice - chartStartPrice;
  const totalHistoricalDriftPercent = chartStartPrice > 0 ? (totalHistoricalDriftCents / chartStartPrice) * 100 : 0;

  const [c1, c2, c3] = validChecks;

  // Calculate 3-check comparisons
  const delta1To2 = c2.priceCents - c1.priceCents;
  const delta2To3 = c3.priceCents - c2.priceCents;
  const netShiftCents = c3.priceCents - c1.priceCents;
  const netShiftPercent = c1.priceCents > 0 ? (netShiftCents / c1.priceCents) * 100 : 0;

  // Find earlier check if available in historical checks
  const c1IndexInAll = checks.findIndex((c) => c.id === c1.id);
  const c0 = c1IndexInAll > 0 ? checks[c1IndexInAll - 1] : null;

  // Compute trend information for each check
  const getCheckTrendInfo = (currentPrice: number, prevPrice: number | null): CheckTrendInfo => {
    if (prevPrice !== null) {
      const delta = currentPrice - prevPrice;
      if (delta > 0) return { delta, direction: 'UP', label: `+${delta}¢ Up` };
      if (delta < 0) return { delta, direction: 'DOWN', label: `${delta}¢ Down` };
      return { delta: 0, direction: 'FLAT', label: '0¢ Flat' };
    }
    return { delta: 0, direction: 'FLAT', label: 'Baseline' };
  };

  // For Check 1: if c0 is present, use c0. Otherwise use delta1To2 inverse so initial direction is clear
  const c1PrevPrice = c0 ? c0.priceCents : (delta1To2 > 0 ? c1.priceCents - 1 : delta1To2 < 0 ? c1.priceCents + 1 : c1.priceCents);
  const trendC1 = getCheckTrendInfo(c1.priceCents, c1PrevPrice);
  const trendC2 = getCheckTrendInfo(c2.priceCents, c1.priceCents);
  const trendC3 = getCheckTrendInfo(c3.priceCents, c2.priceCents);

  const minPrice = Math.min(c1.priceCents, c2.priceCents, c3.priceCents);
  const maxPrice = Math.max(c1.priceCents, c2.priceCents, c3.priceCents);
  const rangeCents = maxPrice - minPrice;
  const pathLengthCents = Math.abs(delta1To2) + Math.abs(delta2To3);
  const avgStepCents = (pathLengthCents / 2).toFixed(1);

  // Volatility Level Classification
  let volatilityLevel: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
  if (rangeCents >= 5 || pathLengthCents >= 7) {
    volatilityLevel = 'HIGH';
  } else if (rangeCents >= 2 || pathLengthCents >= 3) {
    volatilityLevel = 'MODERATE';
  } else {
    volatilityLevel = 'LOW';
  }

  // Momentum Pattern
  let trendTitle = 'Consolidated Range';
  let trendDescription = 'Orderbook price is stable with negligible drift between checks.';
  if (delta1To2 > 0 && delta2To3 > 0) {
    trendTitle = 'Sustained Bullish Run';
    trendDescription = 'Consecutive upward price checks indicate strong buying demand or positive sentiment shift.';
  } else if (delta1To2 < 0 && delta2To3 < 0) {
    trendTitle = 'Sustained Bearish Drift';
    trendDescription = 'Consecutive downward price checks indicate selling pressure or fading event probability.';
  } else if ((delta1To2 > 1 && delta2To3 < -1) || (delta1To2 < -1 && delta2To3 > 1)) {
    trendTitle = 'Whipsaw Reversal';
    trendDescription = 'Price reversed direction rapidly between checks, signaling contested two-sided order flow.';
  }

  // Alerts Filtering for active event
  const eventAlerts = alerts.filter((a) => a.eventTitle === eventTitle);
  const activeEventAlerts = eventAlerts.filter((a) => a.isActive);
  const triggeredEventAlerts = eventAlerts.filter((a) => !a.isActive && a.triggeredAt);

  // Compute nearest active alert to current price
  const nearestActiveAlert = activeEventAlerts.length > 0
    ? [...activeEventAlerts].sort((a, b) => {
        const distA = Math.abs(a.targetPriceCents - c3.priceCents);
        const distB = Math.abs(b.targetPriceCents - c3.priceCents);
        return distA - distB;
      })[0]
    : null;

  // Recharts domain bounds
  const alertTargetCents = (showChartAlertRef && nearestActiveAlert) ? nearestActiveAlert.targetPriceCents : undefined;
  const chartFloor = alertTargetCents !== undefined ? Math.min(chartMinPrice, alertTargetCents) : chartMinPrice;
  const chartCeil = alertTargetCents !== undefined ? Math.max(chartMaxPrice, alertTargetCents) : chartMaxPrice;
  const yMinDomain = Math.max(0, chartFloor - 3);
  const yMaxDomain = Math.min(100, chartCeil + 3);

  // User-defined Percentage Fluctuation Metrics for the Trend Chart Volatility Alert
  const rangeFluctuationPercent = chartMinPrice > 0 ? ((chartMaxPrice - chartMinPrice) / chartMinPrice) * 100 : 0;
  
  const stepFluctuations = chartData.map((d, i) => {
    if (i === 0) return 0;
    const prev = chartData[i - 1];
    return prev.price > 0 ? (Math.abs(d.price - prev.price) / prev.price) * 100 : 0;
  });
  const maxStepFluctuationPercent = stepFluctuations.length > 0 ? Math.max(0, ...stepFluctuations) : 0;
  const totalDriftPercent = Math.abs(totalHistoricalDriftPercent);

  // Maximum observed fluctuation across the active trend checks
  const maxObservedVolatilityPercent = Math.max(rangeFluctuationPercent, maxStepFluctuationPercent, totalDriftPercent);

  // Volatility warning trigger state: true when observed fluctuations exceed user-defined percentage threshold
  const isVolatilityThresholdExceeded = volatilityAlertEnabled && maxObservedVolatilityPercent >= volatilityPercentThreshold;

  // Custom Dot Renderer for Recharts LineChart with subtle pulsing warning indicator when threshold is exceeded
  const renderChartDot = (dotProps: any) => {
    const { cx, cy, index, payload } = dotProps;
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;

    const isLatest = index === chartData.length - 1;
    const stepDelta = index > 0 && chartData[index - 1]?.price > 0
      ? (Math.abs(payload.price - chartData[index - 1].price) / chartData[index - 1].price) * 100
      : 0;

    const isPointBreached = volatilityAlertEnabled && (stepDelta >= volatilityPercentThreshold || (isLatest && isVolatilityThresholdExceeded));

    if (isPointBreached) {
      return (
        <g key={`dot-pulse-${index}`}>
          {/* Subtle outer pulsing ping aura */}
          <circle
            cx={cx}
            cy={cy}
            r={10}
            fill="#f59e0b"
            fillOpacity={0.28}
            className="animate-ping"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          {/* Solid amber warning dot */}
          <circle
            cx={cx}
            cy={cy}
            r={5.5}
            fill="#d97706"
            stroke="#ffffff"
            strokeWidth={2}
          />
        </g>
      );
    }

    return (
      <circle
        key={`dot-std-${index}`}
        cx={cx}
        cy={cy}
        r={4}
        fill="#0077b6"
        stroke="#ffffff"
        strokeWidth={2}
      />
    );
  };

  // Track previous price check to trigger alerts on transitions and calculate significant volatility swings
  const prevEvaluatedPriceRef = useRef<number>(c3.priceCents);
  const lastSignificantAlertSentRef = useRef<{ price: number; timestamp: number }>({ price: c3.priceCents, timestamp: 0 });

  // Alert Evaluation Effect: checks when c3.priceCents changes or new alert is created
  useEffect(() => {
    const currentPrice = c3.priceCents;
    const prevPrice = prevEvaluatedPriceRef.current;
    prevEvaluatedPriceRef.current = currentPrice;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 1. Check all active custom target alerts for this event
    const matchedAlerts: PriceAlert[] = [];

    activeEventAlerts.forEach((alert) => {
      let isTriggered = false;
      if (alert.condition === 'ABOVE_OR_EQUAL') {
        if (currentPrice >= alert.targetPriceCents) {
          isTriggered = true;
        }
      } else if (alert.condition === 'BELOW_OR_EQUAL') {
        if (currentPrice <= alert.targetPriceCents) {
          isTriggered = true;
        }
      } else if (alert.condition === 'EXACT') {
        if (currentPrice === alert.targetPriceCents) {
          isTriggered = true;
        }
      }

      if (isTriggered) {
        matchedAlerts.push(alert);
      }
    });

    if (matchedAlerts.length > 0) {
      // Mark matched alerts as triggered
      setAlerts((prev) =>
        prev.map((a) => {
          const match = matchedAlerts.find((m) => m.id === a.id);
          if (match) {
            return {
              ...a,
              isActive: false,
              triggeredAt: nowStr,
              triggeredPriceCents: currentPrice,
            };
          }
          return a;
        })
      );

      // Play audio chime if enabled
      if (soundEnabled) {
        playAlertChime();
      }

      // Track channels successfully dispatched
      let browserDispatched = false;
      let emailDispatched = false;

      matchedAlerts.forEach((a) => {
        const condLabel = a.condition === 'ABOVE_OR_EQUAL' ? '≥' : a.condition === 'BELOW_OR_EQUAL' ? '≤' : '=';

        // Trigger floating toast notification
        const toastId = `toast-${Date.now()}-${a.id}`;
        setPriceAlertToasts((prev) => [
          {
            id: toastId,
            alertId: a.id,
            eventTitle,
            targetPriceCents: a.targetPriceCents,
            currentPriceCents: currentPrice,
            condition: a.condition,
            conditionLabel: condLabel,
            message: `Target reached! Market traded at ${currentPrice}¢ (${condLabel} ${a.targetPriceCents}¢ target)`,
            timestamp: nowStr,
            note: a.note,
            createdAtMs: Date.now(),
          },
          ...prev.slice(0, 3),
        ]);

        // Trigger browser notification
        if (browserNotificationsEnabled && a.channelBrowser !== false && browserPermission === 'granted') {
          triggerBrowserNotification(
            `🔔 Price Alert Triggered: ${currentPrice}¢!`,
            `"${eventTitle}" reached ${currentPrice}¢ (Target was ${condLabel} ${a.targetPriceCents}¢)`
          );
          browserDispatched = true;
        }

        // Trigger email notification
        if (emailNotificationsEnabled && a.channelEmail !== false && userEmail) {
          dispatchEmailAlertApi({
            recipientEmail: userEmail,
            eventTitle,
            currentPrice,
            previousPrice: prevPrice,
            condition: condLabel,
            targetPrice: a.targetPriceCents,
            triggerReason: `Target price condition met: orderbook reached ${currentPrice}¢ (threshold was ${condLabel} ${a.targetPriceCents}¢)`,
            note: a.note,
          });
          emailDispatched = true;
        }
      });

      // Show in-card prominent banner
      const primaryAlert = matchedAlerts[0];
      const condLabel = primaryAlert.condition === 'ABOVE_OR_EQUAL' ? '≥' : primaryAlert.condition === 'BELOW_OR_EQUAL' ? '≤' : '=';
      setActiveNotification({
        alert: primaryAlert,
        triggeredPrice: currentPrice,
        timestamp: nowStr,
        message: `Market price reached ${currentPrice}¢ (Target was ${condLabel} ${primaryAlert.targetPriceCents}¢)${matchedAlerts.length > 1 ? ` & ${matchedAlerts.length - 1} other alert(s)` : ''}`,
        channels: {
          browser: browserDispatched,
          email: emailDispatched,
          emailAddress: emailDispatched ? userEmail : undefined,
        },
        isSignificantChange: false,
      });

      return; // Handled target alert
    }

    // 2. Check for Significant Price Change / Volatility Spike
    const tickDelta = currentPrice - prevPrice;
    const rollingDelta = c3.priceCents - c2.priceCents;
    const hasSignificantTick = Math.abs(tickDelta) >= significantVolatilityThreshold && prevPrice > 0;
    const hasSignificantRolling = Math.abs(rollingDelta) >= significantVolatilityThreshold;

    if (significantVolatilityEnabled && (hasSignificantTick || hasSignificantRolling)) {
      const deltaToReport = hasSignificantTick ? tickDelta : rollingDelta;
      const nowMs = Date.now();
      const lastAlert = lastSignificantAlertSentRef.current;
      const priceShiftedFromLastAlert = Math.abs(currentPrice - lastAlert.price) >= 1;
      const cooldownExpired = (nowMs - lastAlert.timestamp) > 6000;

      if (cooldownExpired || priceShiftedFromLastAlert) {
        lastSignificantAlertSentRef.current = { price: currentPrice, timestamp: nowMs };

        if (soundEnabled) {
          playAlertChime();
        }

        let browserSent = false;
        if (browserNotificationsEnabled && browserPermission === 'granted') {
          const deltaSign = deltaToReport > 0 ? `+${deltaToReport}` : `${deltaToReport}`;
          triggerBrowserNotification(
            `⚡ Significant Price Shift: ${deltaSign}¢ (${currentPrice}¢)`,
            `"${eventTitle}" moved ${deltaSign}¢ to ${currentPrice}¢ (Significant change threshold: ±${significantVolatilityThreshold}¢)`
          );
          browserSent = true;
        }

        let emailSent = false;
        if (emailNotificationsEnabled && userEmail) {
          const deltaSign = deltaToReport > 0 ? `+${deltaToReport}` : `${deltaToReport}`;
          dispatchEmailAlertApi({
            recipientEmail: userEmail,
            eventTitle,
            currentPrice,
            previousPrice: prevPrice,
            delta: deltaToReport,
            triggerReason: `Significant price volatility move of ${deltaSign}¢ (now ${currentPrice}¢)`,
            note: `Triggered by active market volatility radar (Threshold: ±${significantVolatilityThreshold}¢)`,
          });
          emailSent = true;
        }

        const deltaSign = deltaToReport > 0 ? `+${deltaToReport}` : `${deltaToReport}`;
        setActiveNotification({
          alert: {
            id: `sig-${Date.now()}`,
            eventTitle,
            targetPriceCents: currentPrice,
            condition: deltaToReport > 0 ? 'ABOVE_OR_EQUAL' : 'BELOW_OR_EQUAL',
            createdAt: nowStr,
            isActive: false,
            note: `Significant price volatility spike: ${deltaSign}¢ shift`,
            alertType: 'SIGNIFICANT_VOLATILITY',
            significantThresholdCents: significantVolatilityThreshold,
          },
          triggeredPrice: currentPrice,
          timestamp: nowStr,
          message: `Significant Price Change Detected: ${deltaSign}¢ swing to ${currentPrice}¢!`,
          channels: {
            browser: browserSent,
            email: emailSent,
            emailAddress: emailSent ? userEmail : undefined,
          },
          isSignificantChange: true,
          deltaCents: deltaToReport,
        });
      }
    }
  }, [
    c3.priceCents,
    c2.priceCents,
    activeEventAlerts,
    eventTitle,
    soundEnabled,
    browserNotificationsEnabled,
    browserPermission,
    emailNotificationsEnabled,
    userEmail,
    significantVolatilityEnabled,
    significantVolatilityThreshold,
  ]);

  // Alert Handlers
  const handleAddAlert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputTargetPrice < 1 || inputTargetPrice > 99) return;

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      eventTitle,
      targetPriceCents: inputTargetPrice,
      condition: inputCondition,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isActive: true,
      note: inputNote.trim() || undefined,
      channelBrowser: inputChannelBrowser,
      channelEmail: inputChannelEmail && !!userEmail,
      emailAddress: inputChannelEmail && userEmail ? userEmail : undefined,
      alertType: 'TARGET_PRICE',
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setInputNote('');

    if (soundEnabled) {
      playAlertChime();
    }
  };

  const handleToggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleRearmAlert = (id: string, newTarget?: number) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              isActive: true,
              triggeredAt: undefined,
              triggeredPriceCents: undefined,
              targetPriceCents: newTarget !== undefined ? newTarget : a.targetPriceCents,
            }
          : a
      )
    );
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearTriggered = () => {
    setAlerts((prev) => prev.filter((a) => a.eventTitle !== eventTitle || a.isActive));
  };

  // Interval-Based Price Polling Execution
  const executePricePoll = useCallback(
    async (isSimulatedJump?: boolean, targetOverridePrice?: number) => {
      if (isPollingLoading) return;
      setIsPollingLoading(true);
      try {
        let nextPrice = c3.priceCents;
        let nextSource: PriceCheckRecord['source'] = 'Orderbook Polled';

        if (targetOverridePrice !== undefined) {
          nextPrice = targetOverridePrice;
          nextSource = 'Live Consensus Feed';
        } else if (isSimulatedJump) {
          // Jump towards or across nearest target to simulate triggering condition
          if (nearestActiveAlert) {
            if (nearestActiveAlert.condition === 'ABOVE_OR_EQUAL') {
              nextPrice = Math.min(99, nearestActiveAlert.targetPriceCents + (c3.priceCents >= nearestActiveAlert.targetPriceCents ? 1 : 0));
              if (nextPrice < nearestActiveAlert.targetPriceCents) {
                nextPrice = nearestActiveAlert.targetPriceCents;
              }
            } else if (nearestActiveAlert.condition === 'BELOW_OR_EQUAL') {
              nextPrice = Math.max(1, nearestActiveAlert.targetPriceCents - (c3.priceCents <= nearestActiveAlert.targetPriceCents ? 1 : 0));
              if (nextPrice > nearestActiveAlert.targetPriceCents) {
                nextPrice = nearestActiveAlert.targetPriceCents;
              }
            } else {
              nextPrice = nearestActiveAlert.targetPriceCents;
            }
          } else {
            const shift = Math.random() > 0.5 ? 1 : -1;
            nextPrice = Math.max(1, Math.min(99, c3.priceCents + shift));
          }
          nextSource = 'Live Consensus Feed';
        } else {
          // Poll real or simulated orderbook endpoint
          try {
            const res = await fetch(
              `/api/markets/price-check?query=${encodeURIComponent(eventTitle)}&currentPriceCents=${c3.priceCents}`
            );
            if (res.ok) {
              const data = await res.json();
              if (typeof data.priceCents === 'number') {
                nextPrice = data.priceCents;
                nextSource = (data.source as PriceCheckRecord['source']) || 'Orderbook Polled';
              }
            }
          } catch (e) {
            // Realistic micro oscillation fallback
            const shift = Math.random() > 0.5 ? 1 : -1;
            nextPrice = Math.max(1, Math.min(99, c3.priceCents + shift));
          }
        }

        onAddPriceCheck(nextPrice, nextSource);
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastPolledTimestamp(nowStr);
        setTotalPollsCount((prev) => prev + 1);
      } catch (err) {
        console.warn('Interval price poll notice:', err);
      } finally {
        setIsPollingLoading(false);
        setPollingCountdown(pollingIntervalSeconds);
      }
    },
    [c3.priceCents, eventTitle, isPollingLoading, nearestActiveAlert, onAddPriceCheck, pollingIntervalSeconds]
  );

  // Interval timer ticker for price polling
  useEffect(() => {
    if (!isPollingActive) return;

    const timer = setInterval(() => {
      setPollingCountdown((prev) => {
        if (prev <= 1) {
          executePricePoll();
          return pollingIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPollingActive, pollingIntervalSeconds, executePricePoll]);

  // Toast actions & re-arm
  const handleToastRearm = (toast: PriceAlertToast, delta: number) => {
    if (toast.alertId) {
      const newTarget = Math.max(1, Math.min(99, toast.currentPriceCents + delta));
      handleRearmAlert(toast.alertId, newTarget);
    }
    setPriceAlertToasts((prev) => prev.filter((t) => t.id !== toast.id));
  };

  const triggerTestToast = () => {
    const condLabel = inputCondition === 'ABOVE_OR_EQUAL' ? '≥' : inputCondition === 'BELOW_OR_EQUAL' ? '≤' : '=';
    const testToast: PriceAlertToast = {
      id: `toast-test-${Date.now()}`,
      alertId: 'test-preview',
      eventTitle,
      targetPriceCents: inputTargetPrice,
      currentPriceCents: inputTargetPrice,
      condition: inputCondition,
      conditionLabel: condLabel,
      message: `Test Toast: Orderbook reached target price ${inputTargetPrice}¢ (${condLabel} threshold)!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      note: inputNote.trim() || 'Simulated interval-based threshold trigger',
      createdAtMs: Date.now(),
    };
    setPriceAlertToasts((prev) => [testToast, ...prev.slice(0, 2)]);
    if (soundEnabled) {
      playAlertChime();
    }
  };

  const handleSaveModalAlert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputTargetPrice < 1 || inputTargetPrice > 99) return;

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      eventTitle,
      targetPriceCents: inputTargetPrice,
      condition: inputCondition,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isActive: true,
      note: inputNote.trim() || undefined,
      channelBrowser: inputChannelBrowser,
      channelEmail: inputChannelEmail && !!userEmail,
      emailAddress: inputChannelEmail && userEmail ? userEmail : undefined,
      alertType: 'TARGET_PRICE',
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setIsPollingActive(true);
    setPollingCountdown(pollingIntervalSeconds);
    setIsSetPriceAlertModalOpen(false);

    const condLabel = inputCondition === 'ABOVE_OR_EQUAL' ? '≥' : inputCondition === 'BELOW_OR_EQUAL' ? '≤' : '=';
    const confToast: PriceAlertToast = {
      id: `toast-conf-${Date.now()}`,
      alertId: newAlert.id,
      eventTitle,
      targetPriceCents: inputTargetPrice,
      currentPriceCents: c3.priceCents,
      condition: inputCondition,
      conditionLabel: condLabel,
      message: `Price Alert Armed: Monitoring orderbook every ${pollingIntervalSeconds}s for ${condLabel} ${inputTargetPrice}¢.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      note: inputNote.trim() || undefined,
      createdAtMs: Date.now(),
      isConfirmation: true,
    };
    setPriceAlertToasts((prev) => [confToast, ...prev.slice(0, 2)]);

    if (soundEnabled) {
      playAlertChime();
    }
  };

  // Dispatch live test email notification
  const handleSendTestEmail = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      setEmailTestStatus('error');
      setEmailTestMessage('Please enter a valid recipient email address.');
      return;
    }

    setEmailTestStatus('sending');
    setEmailTestMessage('Dispatching test alert notification...');

    try {
      const res = await fetch('/api/notifications/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: userEmail,
          eventTitle,
          currentPrice: c3.priceCents,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailTestStatus('success');
        setEmailTestMessage(`Notification sent to ${userEmail}! Check your inbox.`);
        setTimeout(() => {
          setEmailTestStatus('idle');
          setEmailTestMessage('');
        }, 5000);
      } else {
        setEmailTestStatus('error');
        setEmailTestMessage(data.error || 'Failed to dispatch test notification.');
      }
    } catch (err: any) {
      setEmailTestStatus('error');
      setEmailTestMessage(err.message || 'Connection error to notification service.');
    }
  };

  const handleTestAlertTrigger = () => {
    if (soundEnabled) {
      playAlertChime();
    }

    let browserFired = false;
    if (browserNotificationsEnabled && browserPermission === 'granted') {
      triggerBrowserNotification(
        `🔔 Test Price Alert: ${c3.priceCents}¢`,
        `Notification test for "${eventTitle}" at ${c3.priceCents}¢`
      );
      browserFired = true;
    }

    let emailFired = false;
    if (emailNotificationsEnabled && userEmail) {
      dispatchEmailAlertApi({
        recipientEmail: userEmail,
        eventTitle,
        currentPrice: c3.priceCents,
        triggerReason: `Test price alert notification verification at ${c3.priceCents}¢`,
        note: 'Manual notification test',
      });
      emailFired = true;
    }

    const testAlert: PriceAlert = {
      id: `test-${Date.now()}`,
      eventTitle,
      targetPriceCents: c3.priceCents,
      condition: 'EXACT',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isActive: false,
      triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      triggeredPriceCents: c3.priceCents,
      note: 'Demo Notification Test',
      channelBrowser: browserFired,
      channelEmail: emailFired,
      emailAddress: emailFired ? userEmail : undefined,
    };

    setActiveNotification({
      alert: testAlert,
      triggeredPrice: c3.priceCents,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: `Demo Notification: Orderbook price is at ${c3.priceCents}¢ (Channels Verified)`,
      channels: {
        browser: browserFired,
        email: emailFired,
        emailAddress: emailFired ? userEmail : undefined,
      },
      isSignificantChange: false,
    });
  };

  const handleRequestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setBrowserPermission(result);
        if (result === 'granted') {
          setBrowserNotificationsEnabled(true);
          triggerBrowserNotification(
            '🔔 Market Price Alerts Enabled',
            'You will now receive desktop notifications when market price hits your threshold or undergoes significant volatility.'
          );
        }
      } catch (err) {
        console.warn('Notification permission request error:', err);
      }
    }
  };

  // Formatting helpers
  const formatDelta = (delta: number) => {
    if (delta > 0) return `+${delta}¢`;
    if (delta < 0) return `${delta}¢`;
    return '0¢';
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-[#0077b6] bg-[#caf0f8] border-[#90e0ef]';
    if (delta < 0) return 'text-[#03045e] bg-[#caf0f8]/60 border-[#90e0ef]';
    return 'text-stone-700 bg-stone-100 border-stone-200';
  };

  const handleSimulateTick = (diff: number) => {
    const nextPrice = Math.max(1, Math.min(99, c3.priceCents + diff));
    onAddPriceCheck(nextPrice, 'Tick Update');
  };

  // Helper to render visual trend badge
  const renderTrendBadge = (trend: CheckTrendInfo) => {
    if (trend.direction === 'UP') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#caf0f8] text-[#0077b6] border border-[#00b4d8] shadow-2xs">
          <TrendingUp className="w-3.5 h-3.5 text-[#0077b6] stroke-[2.5]" />
          <span>{trend.label}</span>
        </span>
      );
    }
    if (trend.direction === 'DOWN') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] shadow-2xs">
          <TrendingDown className="w-3.5 h-3.5 text-[#03045e] stroke-[2.5]" />
          <span>{trend.label}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
        <Minus className="w-3.5 h-3.5 text-stone-400 stroke-[2.5]" />
        <span>{trend.label}</span>
      </span>
    );
  };

  // Helper to render the prominent arrow icon box beside the price
  const renderPriceArrowBox = (trend: CheckTrendInfo) => {
    if (trend.direction === 'UP') {
      return (
        <div
          className="p-1.5 sm:p-2 rounded-xl bg-[#caf0f8] text-[#0077b6] border-2 border-[#00b4d8] flex items-center justify-center shadow-xs"
          title="Market price trending UP"
        >
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#0077b6] stroke-[2.8]" />
        </div>
      );
    }
    if (trend.direction === 'DOWN') {
      return (
        <div
          className="p-1.5 sm:p-2 rounded-xl bg-[#caf0f8]/60 text-[#03045e] border-2 border-[#90e0ef] flex items-center justify-center shadow-xs"
          title="Market price trending DOWN"
        >
          <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#03045e] stroke-[2.8]" />
        </div>
      );
    }
    return (
      <div
        className="p-1.5 sm:p-2 rounded-xl bg-stone-100 text-stone-500 border border-stone-200 flex items-center justify-center"
        title="Market price flat / consolidated"
      >
        <Minus className="w-5 h-5 sm:w-6 sm:h-6 text-stone-400 stroke-[2.5]" />
      </div>
    );
  };

  return (
    <div
      id="market-price-volatility-card"
      className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-7 space-y-6 transition-all"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
              <Activity className="w-3.5 h-3.5 text-[#0077b6]" />
              <span>Real-Time Market Volatility</span>
            </span>
            <span className="text-xs text-stone-400 font-mono">
              3-Check Rolling Window
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#03045e] leading-tight">
            Orderbook Volatility &amp; Price Trajectory
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Compares consecutive price checks for <strong className="text-[#03045e]">{eventTitle}</strong>. Each check visually displays directional momentum and orderbook drift.
          </p>
        </div>

        {/* Volatility Badge Pill & Price Alert Controls */}
        <div className="shrink-0 flex flex-wrap items-center gap-2.5">
          {/* Sound Toggle Button */}
          <button
            id="toggle-alert-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
              soundEnabled
                ? 'bg-[#caf0f8] text-[#0077b6] border-[#90e0ef] hover:bg-[#90e0ef]/60'
                : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
            }`}
            title={soundEnabled ? 'Alert chime sound is ON (click to mute)' : 'Alert chime sound is MUTED (click to enable)'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Email Notifications Quick Toggle */}
          <button
            id="toggle-email-alerts-quick-btn"
            onClick={() => {
              if (!emailNotificationsEnabled && !userEmail) {
                setIsAlertPanelOpen(true);
              } else {
                setEmailNotificationsEnabled(!emailNotificationsEnabled);
              }
            }}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
              emailNotificationsEnabled
                ? 'bg-[#caf0f8] text-[#0077b6] border-[#90e0ef] hover:bg-[#90e0ef]/60'
                : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
            }`}
            title={emailNotificationsEnabled ? `Email alerts enabled for ${userEmail}` : 'Click to enable email notifications'}
          >
            <Mail className={`w-3.5 h-3.5 ${emailNotificationsEnabled ? 'text-[#0077b6]' : 'text-stone-400'}`} />
            <span className="hidden sm:inline">{emailNotificationsEnabled ? 'Email ON' : 'Email Alerts'}</span>
            {emailNotificationsEnabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0077b6] animate-pulse"></span>
            )}
          </button>

          {/* Price Alerts Drawer Toggle Button */}
          <button
            id="toggle-price-alerts-panel-btn"
            onClick={() => setIsAlertPanelOpen(!isAlertPanelOpen)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              activeEventAlerts.length > 0 || significantVolatilityEnabled
                ? 'bg-[#03045e] text-white border-[#03045e] hover:bg-[#0077b6]'
                : isAlertPanelOpen
                ? 'bg-[#caf0f8] text-[#03045e] border-[#00b4d8]'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
            title="Configure custom price alert thresholds, email delivery, and volatility radar"
          >
            {activeEventAlerts.length > 0 ? (
              <BellRing className="w-3.5 h-3.5 text-[#caf0f8] animate-pulse" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-[#caf0f8]" />
            )}
            <span>Alerts &amp; Radar</span>
            {activeEventAlerts.length > 0 ? (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#00b4d8] text-white text-[10px] font-mono font-black">
                {activeEventAlerts.length}
              </span>
            ) : (
              <span className="text-[10px] font-normal opacity-70">
                {isAlertPanelOpen ? '▲' : '+ Set'}
              </span>
            )}
          </button>

          {/* Primary 'Set Price Alert' Modal Trigger Button */}
          <button
            type="button"
            id="set-price-alert-btn"
            onClick={() => {
              setInputTargetPrice((prev) => (prev > 0 ? prev : Math.min(99, c3.priceCents + 2)));
              setIsSetPriceAlertModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#03045e] to-[#0077b6] hover:from-[#0077b6] hover:to-[#0096c7] text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-98"
            title="Set a target price alert threshold with interval-based orderbook polling"
          >
            <Target className="w-3.5 h-3.5 text-[#caf0f8]" />
            <span>Set Price Alert</span>
            {activeEventAlerts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#00b4d8] text-white text-[10px] font-mono font-black">
                {activeEventAlerts.length}
              </span>
            )}
          </button>

          {volatilityLevel === 'HIGH' && (
            <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#caf0f8] text-[#03045e] border border-[#0077b6] font-bold text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0077b6] animate-ping"></span>
              <AlertTriangle className="w-4 h-4 text-[#0077b6] shrink-0" />
              <div>
                <span className="font-extrabold uppercase">High Volatility</span>
                <span className="text-[11px] block font-normal text-[#0077b6] font-mono">
                  {rangeCents}¢ Range (&plusmn;{pathLengthCents}¢ Path)
                </span>
              </div>
            </div>
          )}
          {volatilityLevel === 'MODERATE' && (
            <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] font-bold text-xs sm:text-sm">
              <Zap className="w-4 h-4 text-[#0077b6] shrink-0" />
              <div>
                <span className="font-extrabold uppercase">Moderate Volatility</span>
                <span className="text-[11px] block font-normal text-[#0077b6] font-mono">
                  {rangeCents}¢ Range (Active Trading)
                </span>
              </div>
            </div>
          )}
          {volatilityLevel === 'LOW' && (
            <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#caf0f8]/50 text-[#0077b6] border border-[#90e0ef] font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#0077b6] shrink-0" />
              <div>
                <span className="font-extrabold uppercase">Low / Stable</span>
                <span className="text-[11px] block font-normal text-[#0077b6] font-mono">
                  {rangeCents}¢ Range (Consolidated)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PROMINENT TRIGGERED NOTIFICATION BANNER */}
      {activeNotification && (
        <div
          id="triggered-price-alert-banner"
          className={`p-4 rounded-2xl border-2 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
            activeNotification.isSignificantChange
              ? 'bg-gradient-to-r from-[#caf0f8] via-[#e0f2fe] to-[#caf0f8] border-[#0077b6]'
              : 'bg-gradient-to-r from-[#caf0f8] via-white to-[#caf0f8]/60 border-[#00b4d8]'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-xl shadow-xs shrink-0 mt-0.5 ${
              activeNotification.isSignificantChange ? 'bg-[#0077b6] text-white' : 'bg-[#03045e] text-[#caf0f8]'
            }`}>
              {activeNotification.isSignificantChange ? (
                <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
              ) : (
                <BellRing className="w-5 h-5 text-[#00b4d8] animate-bounce" />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-mono text-white ${
                  activeNotification.isSignificantChange ? 'bg-[#0077b6]' : 'bg-[#03045e]'
                }`}>
                  {activeNotification.isSignificantChange ? '⚡ Significant Volatility Spike' : 'Price Alert Triggered'}
                </span>
                <span className="text-xs text-stone-500 font-mono font-semibold">
                  {activeNotification.timestamp}
                </span>

                {/* Delivery Channel Feedback Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeNotification.channels?.browser && (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#caf0f8] text-[#0077b6] border border-[#00b4d8]">
                      <Bell className="w-2.5 h-2.5" />
                      <span>Browser Push Sent</span>
                    </span>
                  )}
                  {activeNotification.channels?.email && (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#03045e] text-[#caf0f8] border border-[#0077b6]">
                      <Mail className="w-2.5 h-2.5 text-sky-300" />
                      <span>Email Dispatched ({activeNotification.channels.emailAddress || userEmail})</span>
                    </span>
                  )}
                  {soundEnabled && (
                    <span className="inline-flex items-center space-x-1 text-[10px] text-[#0077b6] font-medium">
                      <Volume2 className="w-3 h-3" />
                      <span>Chime Sounded</span>
                    </span>
                  )}
                </div>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-[#03045e] leading-snug">
                {activeNotification.message}
              </h4>

              {activeNotification.isSignificantChange ? (
                <p className="text-xs text-stone-600">
                  Active orderbook shifted by <strong className="text-[#03045e] font-mono">{formatDelta(activeNotification.deltaCents || 0)}</strong>. Volatility threshold: &plusmn;{significantVolatilityThreshold}¢.
                </p>
              ) : (
                <p className="text-xs text-stone-600">
                  Target threshold was{' '}
                  <strong className="text-[#03045e]">
                    {activeNotification.alert.condition === 'ABOVE_OR_EQUAL'
                      ? '≥ '
                      : activeNotification.alert.condition === 'BELOW_OR_EQUAL'
                      ? '≤ '
                      : '= '}
                    {activeNotification.alert.targetPriceCents}¢
                  </strong>
                  {activeNotification.alert.note && (
                    <span> &bull; Note: &ldquo;{activeNotification.alert.note}&rdquo;</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions on Triggered Notification */}
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
            <button
              id="rearm-plus3-alert-btn"
              onClick={() => {
                handleRearmAlert(activeNotification.alert.id, Math.min(99, c3.priceCents + 3));
                setActiveNotification(null);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#90e0ef] text-xs font-semibold text-[#03045e] hover:bg-[#caf0f8]/50 transition-colors cursor-pointer shadow-2xs"
              title="Re-arm threshold 3¢ above current price"
            >
              Re-arm (+3¢ Target)
            </button>
            <button
              id="rearm-minus3-alert-btn"
              onClick={() => {
                handleRearmAlert(activeNotification.alert.id, Math.max(1, c3.priceCents - 3));
                setActiveNotification(null);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#90e0ef] text-xs font-semibold text-[#03045e] hover:bg-[#caf0f8]/50 transition-colors cursor-pointer shadow-2xs"
              title="Re-arm threshold 3¢ below current price"
            >
              Re-arm (-3¢ Target)
            </button>
            <button
              id="dismiss-price-alert-banner-btn"
              onClick={() => setActiveNotification(null)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Dismiss notification banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM PRICE ALERT THRESHOLD CONFIGURATOR & MANAGEMENT DRAWER */}
      {isAlertPanelOpen && (
        <div
          id="price-alert-threshold-configurator"
          className="p-5 rounded-2xl bg-stone-50 border border-[#90e0ef] space-y-5 animate-in fade-in duration-150"
        >
          {/* Top Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-xl bg-[#caf0f8] text-[#0077b6] border border-[#00b4d8]">
                <BellRing className="w-4 h-4 text-[#0077b6]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#03045e]">
                  Price Alerts &amp; Volatility Notification Engine
                </h4>
                <p className="text-xs text-stone-500">
                  Configure browser push, sound chimes, email dispatch, and auto-detection for significant price moves on <strong className="text-[#03045e]">{eventTitle}</strong>.
                </p>
              </div>
            </div>

            {/* Notification Utilities */}
            <div className="flex items-center space-x-2">
              <button
                id="test-sound-and-alert-btn"
                onClick={handleTestAlertTrigger}
                className="inline-flex items-center space-x-1 px-2.5 py-1.2 rounded-lg bg-white border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shadow-2xs"
                title="Test notification sound chime and banner"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>Test Alert</span>
              </button>

              {typeof window !== 'undefined' &&
                'Notification' in window &&
                browserPermission !== 'granted' && (
                  <button
                    id="enable-browser-notifications-btn"
                    onClick={handleRequestNotificationPermission}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.2 rounded-lg bg-[#03045e] text-white text-xs font-semibold hover:bg-[#0077b6] transition-colors cursor-pointer shadow-2xs"
                    title="Allow desktop browser push notifications"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Enable Desktop Alerts</span>
                  </button>
                )}

              <button
                onClick={() => setIsAlertPanelOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition-colors cursor-pointer"
                title="Close alert panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* NOTIFICATION CHANNELS & VOLATILITY RADAR SECTION */}
          <div className="p-4 rounded-xl bg-white border border-[#90e0ef] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-lg bg-[#caf0f8] text-[#0077b6]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h5 className="text-xs font-black uppercase tracking-wider text-[#03045e]">
                  Notification Channels &amp; Volatility Radar
                </h5>
              </div>
              <span className="text-[11px] text-stone-500 font-mono">
                Orderbook: <strong className="text-[#03045e]">{c3.priceCents}¢</strong> (Check 3 of 3)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Channel 1: Desktop Browser Push */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#03045e]">
                      <Bell className="w-4 h-4 text-[#0077b6]" />
                      <span>Browser Push</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={browserNotificationsEnabled}
                        onChange={(e) => setBrowserNotificationsEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0077b6]"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    Instant system notifications delivered to your screen even when browsing another tab.
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium">
                    {browserPermission === 'granted' ? (
                      <span className="text-[#0077b6] flex items-center gap-1 font-bold">
                        <Check className="w-3 h-3" /> Push Granted
                      </span>
                    ) : browserPermission === 'denied' ? (
                      <span className="text-amber-600 font-bold">Blocked in Browser</span>
                    ) : (
                      <span className="text-stone-500">Permission Required</span>
                    )}
                  </span>
                  {browserPermission !== 'granted' ? (
                    <button
                      type="button"
                      onClick={handleRequestNotificationPermission}
                      className="px-2 py-1 rounded-md bg-[#03045e] text-white text-[10px] font-bold hover:bg-[#0077b6] cursor-pointer"
                    >
                      Enable
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleTestAlertTrigger}
                      className="px-2 py-1 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-semibold cursor-pointer"
                    >
                      Test Push
                    </button>
                  )}
                </div>
              </div>

              {/* Channel 2: Email Alert Dispatch */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#03045e]">
                      <Mail className="w-4 h-4 text-[#0077b6]" />
                      <span>Email Delivery</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotificationsEnabled}
                        onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0077b6]"></div>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider block">
                      Recipient Email:
                    </label>
                    <input
                      id="notification-recipient-email-input"
                      type="email"
                      placeholder="e.g., trader@domain.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:border-[#0077b6]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                  <div className="text-[10px] truncate max-w-[130px]">
                    {emailTestStatus === 'sending' && (
                      <span className="text-[#0077b6] flex items-center gap-1 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#0077b6] animate-ping"></span> Sending...
                      </span>
                    )}
                    {emailTestStatus === 'success' && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Dispatched!
                      </span>
                    )}
                    {emailTestStatus === 'error' && (
                      <span className="text-rose-600 font-bold truncate block" title={emailTestMessage}>
                        {emailTestMessage}
                      </span>
                    )}
                    {emailTestStatus === 'idle' && (
                      <span className="text-stone-400 text-[10px]">CloudboyX Mailer</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={emailTestStatus === 'sending'}
                    className="shrink-0 px-2.5 py-1 rounded-md bg-[#caf0f8] hover:bg-[#90e0ef] text-[#0077b6] text-[10px] font-bold border border-[#00b4d8] cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Test</span>
                  </button>
                </div>
              </div>

              {/* Module 3: Significant Price Change Detector */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#03045e]">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Significant Movement Detector</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={significantVolatilityEnabled}
                        onChange={(e) => setSignificantVolatilityEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0077b6]"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    Dispatches browser &amp; email notifications immediately if price shifts rapidly by this threshold or more.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-200/60">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase tracking-wider">
                      Tick Volatility:
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      {[2, 3, 5, 10].map((th) => (
                        <button
                          key={th}
                          type="button"
                          onClick={() => setSignificantVolatilityThreshold(th)}
                          className={`py-1 text-center rounded-lg text-xs font-mono font-bold border cursor-pointer transition-colors ${
                            significantVolatilityThreshold === th
                              ? 'bg-[#03045e] text-white border-[#03045e]'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          &plusmn;{th}¢
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-stone-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                        Chart Volatility Alert:
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#0077b6]">
                        &gt;{volatilityPercentThreshold}%
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[3, 5, 8, 12].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setVolatilityPercentThreshold(pct)}
                          className={`py-1 text-center rounded-lg text-xs font-mono font-bold border cursor-pointer transition-colors ${
                            volatilityPercentThreshold === pct
                              ? 'bg-[#0077b6] text-white border-[#0077b6]'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form & List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Set Custom Price Alert Form (7 cols) */}
            <form
              onSubmit={handleAddAlert}
              className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-xl border border-stone-200 space-y-4 shadow-2xs"
            >
              <div className="text-xs font-bold text-[#03045e] uppercase tracking-wider flex items-center justify-between">
                <span>Set New Price Alert Threshold</span>
                <span className="font-mono text-stone-500 font-normal">
                  Current: <strong className="text-[#03045e] font-bold">{c3.priceCents}¢</strong>
                </span>
              </div>

              {/* Threshold Condition Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  Alert Trigger Condition:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInputCondition('ABOVE_OR_EQUAL');
                      if (inputTargetPrice <= c3.priceCents) {
                        setInputTargetPrice(Math.min(99, c3.priceCents + 2));
                      }
                    }}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                      inputCondition === 'ABOVE_OR_EQUAL'
                        ? 'bg-[#caf0f8] text-[#0077b6] border-[#00b4d8] ring-2 ring-[#00b4d8]/30 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span className="font-mono text-sm font-extrabold">&ge; (Rises To)</span>
                    <span className="text-[10px] font-normal opacity-80">Rises &ge; Target</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInputCondition('BELOW_OR_EQUAL');
                      if (inputTargetPrice >= c3.priceCents) {
                        setInputTargetPrice(Math.max(1, c3.priceCents - 2));
                      }
                    }}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                      inputCondition === 'BELOW_OR_EQUAL'
                        ? 'bg-[#caf0f8] text-[#03045e] border-[#90e0ef] ring-2 ring-[#90e0ef]/30 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span className="font-mono text-sm font-extrabold">&le; (Drops To)</span>
                    <span className="text-[10px] font-normal opacity-80">Drops &le; Target</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputCondition('EXACT')}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                      inputCondition === 'EXACT'
                        ? 'bg-[#caf0f8] text-[#03045e] border-[#0077b6] ring-2 ring-[#0077b6]/30 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span className="font-mono text-sm font-extrabold">= (Hits Exact)</span>
                    <span className="text-[10px] font-normal opacity-80">Hits Exact Price</span>
                  </button>
                </div>
              </div>

              {/* Target Price Numeric Stepper */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                  <span>Custom Threshold Price (1¢ - 99¢):</span>
                  <span className="text-stone-400 font-mono text-[11px]">
                    ${(inputTargetPrice / 100).toFixed(2)} / contract
                  </span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setInputTargetPrice((prev) => Math.max(1, prev - 5))}
                    className="px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono font-bold text-xs cursor-pointer border border-stone-200"
                    title="-5¢"
                  >
                    -5¢
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputTargetPrice((prev) => Math.max(1, prev - 1))}
                    className="px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono font-bold text-xs cursor-pointer border border-stone-200"
                    title="-1¢"
                  >
                    -1¢
                  </button>

                  <div className="relative flex-1">
                    <input
                      id="custom-price-alert-input"
                      type="number"
                      min={1}
                      max={99}
                      value={inputTargetPrice}
                      onChange={(e) => setInputTargetPrice(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                      className="w-full text-center text-xl font-mono font-black py-1.5 px-3 rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0077b6] focus:ring-2 focus:ring-[#0077b6]/20 bg-stone-50 text-[#03045e]"
                    />
                    <span className="absolute right-3 top-2.5 font-mono font-bold text-stone-400 text-sm pointer-events-none">
                      ¢
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInputTargetPrice((prev) => Math.min(99, prev + 1))}
                    className="px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono font-bold text-xs cursor-pointer border border-stone-200"
                    title="+1¢"
                  >
                    +1¢
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputTargetPrice((prev) => Math.min(99, prev + 5))}
                    className="px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono font-bold text-xs cursor-pointer border border-stone-200"
                    title="+5¢"
                  >
                    +5¢
                  </button>
                </div>
              </div>

              {/* Fast Preset Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInputCondition('ABOVE_OR_EQUAL');
                      setInputTargetPrice(Math.min(99, c3.priceCents + 2));
                    }}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-[#caf0f8] text-[#0077b6] hover:bg-[#90e0ef] border border-[#00b4d8] cursor-pointer"
                  >
                    +2¢ ({Math.min(99, c3.priceCents + 2)}¢)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputCondition('ABOVE_OR_EQUAL');
                      setInputTargetPrice(Math.min(99, c3.priceCents + 5));
                    }}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-[#caf0f8] text-[#0077b6] hover:bg-[#90e0ef] border border-[#00b4d8] cursor-pointer"
                  >
                    +5¢ ({Math.min(99, c3.priceCents + 5)}¢)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputCondition('BELOW_OR_EQUAL');
                      setInputTargetPrice(Math.max(1, c3.priceCents - 2));
                    }}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-[#caf0f8]/60 text-[#03045e] hover:bg-[#caf0f8] border border-[#90e0ef] cursor-pointer"
                  >
                    -2¢ ({Math.max(1, c3.priceCents - 2)}¢)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputCondition('BELOW_OR_EQUAL');
                      setInputTargetPrice(Math.max(1, c3.priceCents - 5));
                    }}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-[#caf0f8]/60 text-[#03045e] hover:bg-[#caf0f8] border border-[#90e0ef] cursor-pointer"
                  >
                    -5¢ ({Math.max(1, c3.priceCents - 5)}¢)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputTargetPrice(50)}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 cursor-pointer"
                  >
                    50¢ Even Odds
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputTargetPrice(75)}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 cursor-pointer"
                  >
                    75¢ High Conviction
                  </button>
                </div>
              </div>

              {/* Optional Note / Execution Reason */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">
                  Custom Alert Label / Reason (Optional):
                </label>
                <input
                  id="custom-price-alert-note-input"
                  type="text"
                  placeholder="e.g., Take profit exit, Stop-loss threshold, Dip buy"
                  value={inputNote}
                  onChange={(e) => setInputNote(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0077b6] bg-stone-50"
                  maxLength={60}
                />
              </div>

              {/* Delivery Channels Selector for this Alert */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[11px] font-bold text-stone-700 block uppercase tracking-wider">
                  Deliver Alert Via:
                </span>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={inputChannelBrowser}
                      onChange={(e) => setInputChannelBrowser(e.target.checked)}
                      className="rounded text-[#0077b6] focus:ring-[#0077b6]"
                    />
                    <span className="inline-flex items-center space-x-1 font-semibold text-stone-700">
                      <Bell className="w-3.5 h-3.5 text-[#0077b6]" />
                      <span>Desktop Browser Push</span>
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={inputChannelEmail}
                      onChange={(e) => setInputChannelEmail(e.target.checked)}
                      className="rounded text-[#0077b6] focus:ring-[#0077b6]"
                    />
                    <span className="inline-flex items-center space-x-1 font-semibold text-stone-700">
                      <Mail className="w-3.5 h-3.5 text-[#0077b6]" />
                      <span>
                        Email Alert {userEmail ? `(${userEmail})` : ''}
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="arm-price-alert-submit-btn"
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#03045e] hover:bg-[#0077b6] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
              >
                <BellRing className="w-4 h-4 text-[#caf0f8]" />
                <span>
                  Arm Price Alert (at {inputCondition === 'ABOVE_OR_EQUAL' ? '≥ ' : inputCondition === 'BELOW_OR_EQUAL' ? '≤ ' : '= '}
                  {inputTargetPrice}¢)
                </span>
              </button>
            </form>

            {/* Right: Active & Triggered Alerts List (5 cols) */}
            <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-xl border border-stone-200 space-y-3 flex flex-col justify-between shadow-2xs">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
                  <span className="font-bold text-[#03045e] uppercase tracking-wider">
                    Configured Alerts ({eventAlerts.length})
                  </span>
                  {triggeredEventAlerts.length > 0 && (
                    <button
                      id="clear-triggered-alerts-btn"
                      onClick={handleClearTriggered}
                      className="text-[11px] text-stone-400 hover:text-stone-700 underline cursor-pointer"
                    >
                      Clear Triggered
                    </button>
                  )}
                </div>

                {eventAlerts.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                      <BellOff className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-stone-600">
                      No active alerts set for this contract
                    </p>
                    <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                      Use the threshold builder on the left to arm price notifications.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {eventAlerts.map((alert) => {
                      const dist =
                        alert.condition === 'ABOVE_OR_EQUAL'
                          ? alert.targetPriceCents - c3.priceCents
                          : alert.condition === 'BELOW_OR_EQUAL'
                          ? c3.priceCents - alert.targetPriceCents
                          : Math.abs(alert.targetPriceCents - c3.priceCents);

                      return (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-2 ${
                            alert.isActive
                              ? 'bg-[#caf0f8]/20 border-[#90e0ef]'
                              : 'bg-stone-50 border-stone-200 opacity-75'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-black text-sm text-[#03045e]">
                                {alert.condition === 'ABOVE_OR_EQUAL'
                                  ? '≥ '
                                  : alert.condition === 'BELOW_OR_EQUAL'
                                  ? '≤ '
                                  : '= '}
                                {alert.targetPriceCents}¢
                              </span>

                              {alert.isActive ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#caf0f8] text-[#0077b6] border border-[#00b4d8]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#0077b6] animate-ping"></span>
                                  <span>
                                    {dist > 0
                                      ? `${dist}¢ away`
                                      : 'Target reached'}
                                  </span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-600">
                                  <span>Hit at {alert.triggeredPriceCents}¢</span>
                                </span>
                              )}
                            </div>

                            {alert.note && (
                              <div className="text-[11px] text-stone-600 italic">
                                &ldquo;{alert.note}&rdquo;
                              </div>
                            )}

                            {/* Channels & Timestamp */}
                            <div className="flex items-center space-x-2 pt-0.5">
                              <span className="text-[10px] text-stone-400 font-mono">
                                {alert.isActive
                                  ? `Armed: ${alert.createdAt}`
                                  : `Triggered: ${alert.triggeredAt}`}
                              </span>
                              <div className="flex items-center space-x-1">
                                {alert.channels?.browser && (
                                  <span className="p-0.5 rounded bg-stone-100 text-[#0077b6]" title="Browser push alert enabled">
                                    <Bell className="w-2.5 h-2.5" />
                                  </span>
                                )}
                                {alert.channels?.email && (
                                  <span className="p-0.5 rounded bg-[#caf0f8] text-[#0077b6]" title={`Email alert enabled (${alert.channels.emailAddress || 'active recipient'})`}>
                                    <Mail className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Alert Actions */}
                          <div className="flex items-center space-x-1 shrink-0">
                            {!alert.isActive && (
                              <button
                                onClick={() => handleRearmAlert(alert.id)}
                                className="px-2 py-1 rounded text-[11px] font-bold bg-[#03045e] text-white hover:bg-[#0077b6] transition-colors cursor-pointer"
                                title="Re-arm this alert"
                              >
                                Re-arm
                              </button>
                            )}

                            {alert.isActive && (
                              <button
                                onClick={() => handleToggleAlert(alert.id)}
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer border border-stone-200"
                                title="Mute/Disarm this alert"
                              >
                                Mute
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                              title="Delete this alert"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom hint */}
              <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed">
                💡 <strong>Tip:</strong> Click <em>&ldquo;+3¢ Up&rdquo;</em> or <em>&ldquo;-3¢ Down&rdquo;</em> in the Volatility Simulator below to test your threshold in real time!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Direction Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs">
        <div className="flex items-center space-x-2 text-stone-600 font-medium">
          <span className="font-bold text-[#03045e]">Trend Indicators:</span>
          <span>Arrow icons show price direction on each check:</span>
        </div>
        <div className="flex items-center space-x-3 font-semibold">
          <span className="inline-flex items-center space-x-1.5 text-[#0077b6] bg-[#caf0f8] px-2 py-0.5 rounded-md border border-[#90e0ef]">
            <TrendingUp className="w-3.5 h-3.5 text-[#0077b6] stroke-[2.5]" />
            <span>Ocean Arrow = Price Trending UP</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 text-[#03045e] bg-[#caf0f8]/60 px-2 py-0.5 rounded-md border border-[#90e0ef]">
            <TrendingDown className="w-3.5 h-3.5 text-[#03045e] stroke-[2.5]" />
            <span>Navy Arrow = Price Trending DOWN</span>
          </span>
        </div>
      </div>

      {/* Historical Price Trend Line Chart (Recharts) */}
      <div
        id="historical-price-trend-chart-section"
        className="bg-stone-50/70 rounded-2xl p-4 sm:p-5 border border-stone-200/90 space-y-4 shadow-2xs"
      >
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/70">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-[#caf0f8] text-[#0077b6]">
                <LineChartIcon className="w-4 h-4" />
              </span>
              <h4 className="text-sm sm:text-base font-bold text-[#03045e]">
                Historical Price Trend
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef]">
                {fullHistoricalChecks.length} Checks Logged
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Interactive timeline trajectory for <strong className="text-[#03045e]">{eventTitle}</strong> based on continuous orderbook checks.
            </p>
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Range filter buttons if > 5 checks */}
            {fullHistoricalChecks.length > 5 && (
              <div className="inline-flex items-center rounded-xl bg-white border border-stone-200 p-0.5 shadow-2xs text-xs">
                <button
                  type="button"
                  id="chart-filter-all-btn"
                  onClick={() => setChartRangeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    chartRangeFilter === 'all'
                      ? 'bg-[#03045e] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All ({fullHistoricalChecks.length})
                </button>
                {fullHistoricalChecks.length > 10 && (
                  <button
                    type="button"
                    id="chart-filter-10-btn"
                    onClick={() => setChartRangeFilter('10')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      chartRangeFilter === '10'
                        ? 'bg-[#03045e] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Last 10
                  </button>
                )}
                <button
                  type="button"
                  id="chart-filter-5-btn"
                  onClick={() => setChartRangeFilter('5')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    chartRangeFilter === '5'
                      ? 'bg-[#03045e] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Last 5
                </button>
              </div>
            )}

            {/* Toggle 50c line */}
            <button
              type="button"
              id="chart-toggle-50c-btn"
              onClick={() => setShowChart50Ref(!showChart50Ref)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                showChart50Ref
                  ? 'bg-[#caf0f8] text-[#0077b6] border-[#90e0ef]'
                  : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'
              }`}
              title="Toggle 50¢ coinflip baseline reference line"
            >
              50¢ Baseline
            </button>

            {/* Toggle Alert Target line if alert exists */}
            {nearestActiveAlert && (
              <button
                type="button"
                id="chart-toggle-alert-line-btn"
                onClick={() => setShowChartAlertRef(!showChartAlertRef)}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                  showChartAlertRef
                    ? 'bg-[#03045e] text-white border-[#03045e]'
                    : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'
                }`}
                title="Toggle active alert target reference line"
              >
                <Bell className="w-3 h-3" />
                <span>Target ({nearestActiveAlert.targetPriceCents}¢)</span>
              </button>
            )}

            {/* Volatility Alert Threshold Setting Trigger */}
            <div className="relative">
              <button
                type="button"
                id="chart-volatility-alert-setting-btn"
                onClick={() => setShowVolatilitySettings(!showVolatilitySettings)}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                  isVolatilityThresholdExceeded
                    ? 'bg-amber-100/95 text-amber-900 border-amber-300 ring-2 ring-amber-400/40 hover:bg-amber-200/90'
                    : volatilityAlertEnabled
                    ? 'bg-[#caf0f8] text-[#0077b6] border-[#90e0ef] hover:bg-[#90e0ef]/60'
                    : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'
                }`}
                title="Configure price fluctuation volatility alert percentage threshold"
              >
                <Zap className={`w-3.5 h-3.5 ${isVolatilityThresholdExceeded ? 'text-amber-600 animate-pulse' : volatilityAlertEnabled ? 'text-[#0077b6]' : 'text-stone-400'}`} />
                <span>Volatility Alert ({volatilityPercentThreshold}%)</span>
                {isVolatilityThresholdExceeded && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                )}
              </button>

              {/* Volatility Alert Threshold Setting Popover Panel */}
              {showVolatilitySettings && (
                <div
                  id="chart-volatility-settings-popover"
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-stone-200 shadow-xl p-4 z-50 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                        <Zap className="w-4 h-4" />
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-[#03045e] leading-tight">
                          Volatility Alert Threshold
                        </h5>
                        <p className="text-[10.5px] text-stone-500">
                          Pulsing warning indicator triggers when fluctuations exceed this limit.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVolatilitySettings(false)}
                      className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Master Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-stone-800 block">
                        Enable Volatility Warning
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Shows subtle pulsing warning indicator on trend chart
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="toggle-volatility-alert-enabled"
                        checked={volatilityAlertEnabled}
                        onChange={(e) => setVolatilityAlertEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0077b6]"></div>
                    </label>
                  </div>

                  {/* Current Observed Fluctuation vs Limit */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    isVolatilityThresholdExceeded
                      ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                      : 'bg-[#caf0f8]/40 border-[#90e0ef] text-[#03045e]'
                  }`}>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                        Current Max Fluctuation
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-mono font-black">
                          &plusmn;{maxObservedVolatilityPercent.toFixed(1)}%
                        </span>
                        <span className="text-[10.5px] opacity-75">
                          (Range: {rangeFluctuationPercent.toFixed(1)}%, Drift: {totalDriftPercent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {isVolatilityThresholdExceeded ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Exceeded</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                          <Check className="w-3 h-3" />
                          <span>Normal</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Threshold Quick Presets */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Threshold Percentage (% of Contract Price):
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[2, 3, 5, 8, 12].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setVolatilityPercentThreshold(pct)}
                          className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer text-center ${
                            volatilityPercentThreshold === pct
                              ? 'bg-[#03045e] text-white border-[#03045e] shadow-2xs'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Input Slider & Number */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600 font-medium">Custom Threshold:</span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="0.5"
                          max="50"
                          step="0.5"
                          value={volatilityPercentThreshold}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              setVolatilityPercentThreshold(val);
                            }
                          }}
                          className="w-16 py-1 px-2 text-right rounded-lg border border-stone-300 font-mono font-bold text-xs focus:outline-hidden focus:border-[#0077b6]"
                        />
                        <span className="text-stone-500 font-mono font-bold">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      step="0.5"
                      value={Math.min(25, Math.max(1, volatilityPercentThreshold))}
                      onChange={(e) => setVolatilityPercentThreshold(parseFloat(e.target.value))}
                      className="w-full accent-[#0077b6] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                      <span>1% (Ultra-sensitive)</span>
                      <span>10% (Balanced)</span>
                      <span>25% (Wide range)</span>
                    </div>
                  </div>

                  {/* Done Button */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setVolatilityPercentThreshold(5)}
                      className="text-[11px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
                    >
                      Reset to default (5%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVolatilitySettings(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#03045e] hover:bg-[#0077b6] text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-2xs">
            <span className="text-[10.5px] text-stone-400 uppercase tracking-wider block font-semibold">
              Current Contract Price
            </span>
            <span className="text-base font-black font-mono text-[#0077b6]">
              {c3.priceCents}¢
            </span>
            <span className="text-[10px] text-stone-400 font-mono block">
              ${(c3.priceCents / 100).toFixed(2)} / YES
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-2xs">
            <span className="text-[10.5px] text-stone-400 uppercase tracking-wider block font-semibold">
              Historical Range
            </span>
            <span className="text-base font-black font-mono text-[#03045e]">
              {chartMinPrice}¢ &ndash; {chartMaxPrice}¢
            </span>
            <span className="text-[10px] text-stone-400 font-mono block">
              Spread: {chartMaxPrice - chartMinPrice}¢
            </span>
          </div>

          {/* Volatility Fluctuation Card */}
          <div className={`p-2.5 rounded-xl border shadow-2xs transition-all ${
            isVolatilityThresholdExceeded
              ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/30'
              : 'bg-white border-stone-200/80'
          }`}>
            <span className="text-[10.5px] text-stone-400 uppercase tracking-wider block font-semibold">
              Max Fluctuation
            </span>
            <div className="flex items-baseline space-x-1">
              <span className={`text-base font-black font-mono ${
                isVolatilityThresholdExceeded ? 'text-amber-900' : 'text-[#0077b6]'
              }`}>
                &plusmn;{maxObservedVolatilityPercent.toFixed(1)}%
              </span>
            </div>
            <div className="pt-0.5">
              {isVolatilityThresholdExceeded ? (
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-100/90 text-amber-900 font-bold text-[9.5px] border border-amber-300/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  <span>Alert Active (&gt;{volatilityPercentThreshold}%)</span>
                </span>
              ) : (
                <span className="text-[10px] text-stone-400 font-mono block">
                  Limit: &gt;{volatilityPercentThreshold}%
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-2xs">
            <span className="text-[10.5px] text-stone-400 uppercase tracking-wider block font-semibold">
              Overall Historical Drift
            </span>
            <div className="flex items-baseline space-x-1">
              <span
                className={`text-base font-black font-mono ${
                  totalHistoricalDriftCents > 0
                    ? 'text-[#0077b6]'
                    : totalHistoricalDriftCents < 0
                    ? 'text-[#03045e]'
                    : 'text-stone-700'
                }`}
              >
                {formatDelta(totalHistoricalDriftCents)}
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                from #{chartData[0]?.checkNumber ?? 1}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono block">
              {totalHistoricalDriftPercent >= 0 ? `+${totalHistoricalDriftPercent.toFixed(1)}%` : `${totalHistoricalDriftPercent.toFixed(1)}%`}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
            <span className="text-[10.5px] text-stone-400 uppercase tracking-wider block font-semibold">
              Orderbook Polling
            </span>
            <button
              type="button"
              id="chart-record-price-check-btn"
              onClick={() => onAddPriceCheck(c3.priceCents, 'Live Consensus Feed')}
              disabled={isLoadingCheck}
              className="w-full py-1.5 px-2 rounded-lg bg-[#03045e] hover:bg-[#0077b6] text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1 shadow-2xs disabled:opacity-50"
              title="Add a new live price check to this trend"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingCheck ? 'animate-spin' : ''}`} />
              <span>+ Record Check</span>
            </button>
          </div>
        </div>

        {/* Recharts LineChart Visualizer */}
        <div
          className={`relative w-full h-64 bg-white rounded-xl border p-2 sm:p-3 shadow-2xs transition-all overflow-hidden ${
            isVolatilityThresholdExceeded
              ? 'border-amber-400/80 ring-2 ring-amber-400/25 shadow-amber-500/10'
              : 'border-stone-200/80'
          }`}
        >
          {/* Subtle Pulsing Warning Indicator Overlay on the Trend Chart */}
          {isVolatilityThresholdExceeded && (
            <div
              id="trend-chart-volatility-warning-indicator"
              className="absolute top-3 right-3 sm:right-4 z-20 flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-amber-50/95 backdrop-blur-xs border border-amber-300 text-amber-900 text-[11px] font-bold shadow-xs transition-all animate-pulse"
              title={`Price fluctuations (±${maxObservedVolatilityPercent.toFixed(1)}%) exceed your ${volatilityPercentThreshold}% volatility alert threshold`}
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 duration-1000"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="tracking-tight text-amber-950 font-bold">
                Volatility Alert: <span className="font-mono">&plusmn;{maxObservedVolatilityPercent.toFixed(1)}%</span> (&gt;{volatilityPercentThreshold}% limit)
              </span>
              <button
                type="button"
                onClick={() => setShowVolatilitySettings(true)}
                className="ml-1 px-1.5 py-0.5 rounded bg-amber-200/80 hover:bg-amber-300/80 text-amber-900 text-[10px] font-semibold cursor-pointer transition-colors"
              >
                Tune
              </button>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 24, left: -10, bottom: 6 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
                tickLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={[yMinDomain, yMaxDomain]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
                tickLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(val) => `${val}¢`}
              />
              <Tooltip content={<CustomPriceTooltip />} />

              {showChart50Ref && (
                <ReferenceLine
                  y={50}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: '50¢ (Coinflip)',
                    position: 'insideRight',
                    fill: '#94a3b8',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              )}

              {showChartAlertRef && nearestActiveAlert && (
                <ReferenceLine
                  y={nearestActiveAlert.targetPriceCents}
                  stroke="#03045e"
                  strokeDasharray="3 3"
                  strokeWidth={1.8}
                  label={{
                    value: `Alert Target: ${nearestActiveAlert.targetPriceCents}¢`,
                    position: 'insideLeft',
                    fill: '#03045e',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}

              <Line
                type="monotone"
                dataKey="price"
                name="Market Price"
                stroke={isVolatilityThresholdExceeded ? '#d97706' : '#0077b6'}
                strokeWidth={2.5}
                dot={renderChartDot}
                activeDot={{
                  r: 6,
                  fill: '#03045e',
                  stroke: isVolatilityThresholdExceeded ? '#f59e0b' : '#90e0ef',
                  strokeWidth: 2.5,
                }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Footer hint & latest check */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 pt-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0077b6]"></span>
            <span>Hover or tap data points to inspect tick timestamp, price, and delta shift.</span>
          </div>
          <span className="font-mono text-stone-400">
            Latest Check: {c3.timestamp}
          </span>
        </div>

        {/* Interval-Based Polling Monitor & Alert Status Strip */}
        <div
          id="interval-polling-status-bar"
          className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-stone-200 shadow-2xs text-xs"
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Polling Status Pill */}
            <div className="flex items-center space-x-2">
              <span className={`relative flex h-2.5 w-2.5 ${isPollingActive ? '' : 'opacity-40'}`}>
                {isPollingActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b4d8] opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPollingActive ? 'bg-[#0077b6]' : 'bg-stone-400'}`}></span>
              </span>
              <span className="font-bold text-[#03045e]">
                {isPollingActive ? 'Orderbook Polling Active:' : 'Polling Paused:'}
              </span>
              <span className="font-mono text-[#0077b6] font-bold bg-[#caf0f8] px-2 py-0.5 rounded-md border border-[#90e0ef] text-[11px]">
                {isPollingActive ? `Next poll in ${pollingCountdown}s` : 'Paused'}
              </span>
            </div>

            {/* Polling Interval Select */}
            <div className="flex items-center space-x-1.5 text-stone-500">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[11px] font-medium">Interval:</span>
              <div className="inline-flex rounded-lg bg-stone-100 p-0.5 border border-stone-200">
                {[3, 5, 10].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      setPollingIntervalSeconds(sec);
                      setPollingCountdown(sec);
                    }}
                    className={`px-2 py-0.5 text-[10.5px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                      pollingIntervalSeconds === sec
                        ? 'bg-[#03045e] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Polling Toggle Pause/Resume */}
            <button
              type="button"
              id="toggle-polling-active-btn"
              onClick={() => {
                setIsPollingActive(!isPollingActive);
                if (!isPollingActive) setPollingCountdown(pollingIntervalSeconds);
              }}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                isPollingActive
                  ? 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  : 'bg-[#caf0f8] text-[#0077b6] border-[#00b4d8] hover:bg-[#90e0ef]'
              }`}
            >
              {isPollingActive ? (
                <>
                  <Pause className="w-3 h-3 text-stone-500" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-[#0077b6]" />
                  <span>Resume</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick manual poll */}
            <button
              type="button"
              id="manual-poll-now-btn"
              onClick={() => executePricePoll()}
              disabled={isPollingLoading}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-[11px] font-bold cursor-pointer disabled:opacity-50 transition-colors"
              title="Poll orderbook immediately"
            >
              <RefreshCw className={`w-3 h-3 text-[#0077b6] ${isPollingLoading ? 'animate-spin' : ''}`} />
              <span>Poll Now</span>
            </button>

            {/* Simulate Target Trigger (to test toast) */}
            <button
              type="button"
              id="simulate-target-hit-btn"
              onClick={() => executePricePoll(true)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#caf0f8] hover:bg-[#90e0ef] text-[#0077b6] border border-[#00b4d8] text-[11px] font-bold cursor-pointer shadow-2xs transition-colors"
              title="Simulates market price jumping to trigger active target price alerts and display toast"
            >
              <Zap className="w-3 h-3 text-[#0077b6]" />
              <span>Simulate Alert Hit</span>
            </button>

            {/* Set Price Alert Trigger */}
            <button
              type="button"
              id="strip-set-price-alert-btn"
              onClick={() => {
                setInputTargetPrice((prev) => (prev > 0 ? prev : Math.min(99, c3.priceCents + 2)));
                setIsSetPriceAlertModalOpen(true);
              }}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#03045e] hover:bg-[#0077b6] text-white text-[11px] font-bold cursor-pointer shadow-2xs transition-all"
            >
              <Target className="w-3.5 h-3.5 text-[#caf0f8]" />
              <span>Set Price Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Check Timeline Visualizer with Green/Red Arrow Icons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
          <span>Sequential Price Checks (With Trend Arrows)</span>
          <span className="font-mono text-stone-400">Oldest &rarr; Current</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-stretch">
          {/* CHECK 1 (t - 2) */}
          <div
            className={`rounded-xl p-4 border flex flex-col justify-between relative overflow-hidden transition-all shadow-xs ${
              trendC1.direction === 'UP'
                ? 'bg-gradient-to-b from-[#caf0f8]/60 to-white border-[#00b4d8] border-t-4 border-t-[#0077b6] ring-1 ring-[#00b4d8]/20'
                : trendC1.direction === 'DOWN'
                ? 'bg-gradient-to-b from-[#caf0f8]/30 to-white border-[#90e0ef] border-t-4 border-t-[#03045e] ring-1 ring-[#90e0ef]/20'
                : 'bg-stone-50/90 border-stone-200 border-t-4 border-t-stone-300'
            }`}
          >
            {/* Top Row: Check Index & Trend Arrow Badge */}
            <div className="flex items-center justify-between gap-1 pb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#caf0f8] text-[#03045e] font-mono border border-[#90e0ef]">
                Check #1 (t-2)
              </span>
              {renderTrendBadge(trendC1)}
            </div>

            {/* Middle Row: Price Value and Arrow Box */}
            <div className="my-2 flex items-center justify-between">
              <div>
                <div
                  className={`text-3xl font-black tracking-tight font-mono ${
                    trendC1.direction === 'UP'
                      ? 'text-[#0077b6]'
                      : trendC1.direction === 'DOWN'
                      ? 'text-[#03045e]'
                      : 'text-stone-900'
                  }`}
                >
                  {c1.priceCents}¢
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  ${(c1.priceCents / 100).toFixed(2)} / YES
                </div>
              </div>
              {renderPriceArrowBox(trendC1)}
            </div>

            {/* Bottom Row: Timestamp and Direction Label */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10.5px]">
              <span className="text-stone-400 font-mono">{c1.timestamp}</span>
              <span
                className={`font-bold flex items-center space-x-1 ${
                  trendC1.direction === 'UP'
                    ? 'text-[#0077b6]'
                    : trendC1.direction === 'DOWN'
                    ? 'text-[#03045e]'
                    : 'text-stone-500'
                }`}
              >
                {trendC1.direction === 'UP' && <ArrowUp className="w-3 h-3 stroke-[2.5]" />}
                {trendC1.direction === 'DOWN' && <ArrowDown className="w-3 h-3 stroke-[2.5]" />}
                <span>
                  {trendC1.direction === 'UP'
                    ? 'Trending Up'
                    : trendC1.direction === 'DOWN'
                    ? 'Trending Down'
                    : 'Baseline'}
                </span>
              </span>
            </div>
          </div>

          {/* CONNECTOR DELTA 1 -> 2 */}
          <div className="flex md:flex-col items-center justify-center p-2 rounded-xl bg-stone-50 border border-dashed border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 hidden md:block">
              &Delta; 1 &rarr; 2
            </span>
            <div className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-bold font-mono shadow-2xs ${getDeltaColor(delta1To2)}`}>
              {delta1To2 > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-[#0077b6] stroke-[2.5]" />
              ) : delta1To2 < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-[#03045e] stroke-[2.5]" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-stone-400 stroke-[2.5]" />
              )}
              <span>{formatDelta(delta1To2)}</span>
            </div>
            <div className="hidden md:flex items-center text-stone-300 mt-1">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* CHECK 2 (t - 1) */}
          <div
            className={`rounded-xl p-4 border flex flex-col justify-between relative overflow-hidden transition-all shadow-xs ${
              trendC2.direction === 'UP'
                ? 'bg-gradient-to-b from-[#caf0f8]/60 to-white border-[#00b4d8] border-t-4 border-t-[#0077b6] ring-1 ring-[#00b4d8]/20'
                : trendC2.direction === 'DOWN'
                ? 'bg-gradient-to-b from-[#caf0f8]/30 to-white border-[#90e0ef] border-t-4 border-t-[#03045e] ring-1 ring-[#90e0ef]/20'
                : 'bg-stone-50/90 border-stone-200 border-t-4 border-t-stone-300'
            }`}
          >
            {/* Top Row: Check Index & Trend Arrow Badge */}
            <div className="flex items-center justify-between gap-1 pb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#caf0f8] text-[#03045e] font-mono border border-[#90e0ef]">
                Check #2 (t-1)
              </span>
              {renderTrendBadge(trendC2)}
            </div>

            {/* Middle Row: Price Value and Arrow Box */}
            <div className="my-2 flex items-center justify-between">
              <div>
                <div
                  className={`text-3xl font-black tracking-tight font-mono ${
                    trendC2.direction === 'UP'
                      ? 'text-[#0077b6]'
                      : trendC2.direction === 'DOWN'
                      ? 'text-[#03045e]'
                      : 'text-stone-900'
                  }`}
                >
                  {c2.priceCents}¢
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  ${(c2.priceCents / 100).toFixed(2)} / YES
                </div>
              </div>
              {renderPriceArrowBox(trendC2)}
            </div>

            {/* Bottom Row: Timestamp and Direction Label */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10.5px]">
              <span className="text-stone-400 font-mono">{c2.timestamp}</span>
              <span
                className={`font-bold flex items-center space-x-1 ${
                  trendC2.direction === 'UP'
                    ? 'text-[#0077b6]'
                    : trendC2.direction === 'DOWN'
                    ? 'text-[#03045e]'
                    : 'text-stone-500'
                }`}
              >
                {trendC2.direction === 'UP' && <ArrowUp className="w-3 h-3 stroke-[2.5]" />}
                {trendC2.direction === 'DOWN' && <ArrowDown className="w-3 h-3 stroke-[2.5]" />}
                <span>
                  {trendC2.direction === 'UP'
                    ? 'Trending Up'
                    : trendC2.direction === 'DOWN'
                    ? 'Trending Down'
                    : 'Flat'}
                </span>
              </span>
            </div>
          </div>

          {/* CONNECTOR DELTA 2 -> 3 */}
          <div className="flex md:flex-col items-center justify-center p-2 rounded-xl bg-stone-50 border border-dashed border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 hidden md:block">
              &Delta; 2 &rarr; 3
            </span>
            <div className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-bold font-mono shadow-2xs ${getDeltaColor(delta2To3)}`}>
              {delta2To3 > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-[#0077b6] stroke-[2.5]" />
              ) : delta2To3 < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-[#03045e] stroke-[2.5]" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-stone-400 stroke-[2.5]" />
              )}
              <span>{formatDelta(delta2To3)}</span>
            </div>
            <div className="hidden md:flex items-center text-stone-300 mt-1">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* CHECK 3 (Latest / Current) */}
          <div
            className={`rounded-xl p-4 border-2 flex flex-col justify-between relative overflow-hidden transition-all shadow-md ring-4 ${
              trendC3.direction === 'UP'
                ? 'bg-gradient-to-b from-[#caf0f8]/80 to-white border-[#0077b6] border-t-4 border-t-[#0077b6] ring-[#00b4d8]/30'
                : trendC3.direction === 'DOWN'
                ? 'bg-gradient-to-b from-[#caf0f8]/50 to-white border-[#03045e] border-t-4 border-t-[#03045e] ring-[#03045e]/20'
                : 'bg-gradient-to-b from-[#caf0f8]/40 to-white border-[#00b4d8] border-t-4 border-t-[#0077b6] ring-[#90e0ef]/20'
            }`}
          >
            {/* Top Row: Current Badge & Trend Arrow Badge */}
            <div className="flex items-center justify-between gap-1 pb-2">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#03045e] text-white font-mono shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8] animate-pulse"></span>
                <span>Check #3 (Current)</span>
              </span>
              {renderTrendBadge(trendC3)}
            </div>

            {/* Middle Row: Price Value and Arrow Box */}
            <div className="my-2 flex items-center justify-between">
              <div>
                <div
                  className={`text-3xl font-black tracking-tight font-mono ${
                    trendC3.direction === 'UP'
                      ? 'text-[#0077b6]'
                      : trendC3.direction === 'DOWN'
                      ? 'text-[#03045e]'
                      : 'text-[#03045e]'
                  }`}
                >
                  {c3.priceCents}¢
                </div>
                <div className="text-[11px] font-medium text-stone-600 mt-0.5">
                  ${(c3.priceCents / 100).toFixed(2)} / YES
                </div>
              </div>
              {renderPriceArrowBox(trendC3)}
            </div>

            {/* Bottom Row: Timestamp and Direction Label */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10.5px]">
              <span className="text-stone-500 font-mono font-semibold">{c3.timestamp}</span>
              <span
                className={`font-black flex items-center space-x-1 ${
                  trendC3.direction === 'UP'
                    ? 'text-[#0077b6]'
                    : trendC3.direction === 'DOWN'
                    ? 'text-[#03045e]'
                    : 'text-[#0077b6]'
                }`}
              >
                {trendC3.direction === 'UP' && <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />}
                {trendC3.direction === 'DOWN' && <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />}
                <span>
                  {trendC3.direction === 'UP'
                    ? 'Active Uptrend'
                    : trendC3.direction === 'DOWN'
                    ? 'Active Downtrend'
                    : 'Consolidated'}
                </span>
              </span>
            </div>

            {/* Nearest Alert Threshold Indicator in Check 3 */}
            {nearestActiveAlert ? (
              <button
                type="button"
                id="check3-active-alert-pill"
                onClick={() => setIsAlertPanelOpen(true)}
                className="mt-2 pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-left w-full hover:opacity-85 transition-opacity cursor-pointer group"
                title="Click to view and manage price alert thresholds"
              >
                <div className="flex items-center space-x-1 font-bold text-[#03045e]">
                  <BellRing className="w-3 h-3 text-[#0077b6] animate-pulse" />
                  <span>Alert:</span>
                  <span className="font-mono text-[#0077b6]">
                    {nearestActiveAlert.condition === 'ABOVE_OR_EQUAL'
                      ? '≥ '
                      : nearestActiveAlert.condition === 'BELOW_OR_EQUAL'
                      ? '≤ '
                      : '= '}
                    {nearestActiveAlert.targetPriceCents}¢
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-stone-500 group-hover:text-[#0077b6]">
                  {Math.abs(nearestActiveAlert.targetPriceCents - c3.priceCents) === 0
                    ? 'Target Hit!'
                    : `${Math.abs(nearestActiveAlert.targetPriceCents - c3.priceCents)}¢ away`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                id="check3-set-alert-pill"
                onClick={() => setIsAlertPanelOpen(true)}
                className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10.5px] text-stone-400 hover:text-[#0077b6] transition-colors cursor-pointer w-full text-left"
                title="Set a custom price alert threshold"
              >
                <span className="flex items-center space-x-1 font-medium">
                  <Bell className="w-3 h-3" />
                  <span>No alert set</span>
                </span>
                <span className="font-bold text-[#0077b6]">+ Set Alert</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Volatility Analytics Comparison Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {/* Metric 1: Net 3-Check Shift */}
        <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
            Net 3-Check Shift
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-xl font-extrabold font-mono ${
              netShiftCents > 0 ? 'text-[#0077b6]' : netShiftCents < 0 ? 'text-[#03045e]' : 'text-stone-800'
            }`}>
              {formatDelta(netShiftCents)}
            </span>
            <span className="text-xs font-semibold text-stone-500">
              ({netShiftPercent >= 0 ? `+${netShiftPercent.toFixed(1)}%` : `${netShiftPercent.toFixed(1)}%`})
            </span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Net drift from {c1.priceCents}¢ to {c3.priceCents}¢
          </div>
        </div>

        {/* Metric 2: Price Range Spread */}
        <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
            Orderbook Spread Range
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-extrabold text-[#03045e] font-mono">
              {rangeCents}¢ Range
            </span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Low: {minPrice}¢ &bull; High: {maxPrice}¢
          </div>
        </div>

        {/* Metric 3: Cumulative Traversed Path */}
        <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
            Path Movement
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-extrabold text-[#03045e] font-mono">
              {pathLengthCents}¢ Total
            </span>
            <span className="text-xs text-stone-500">
              ({avgStepCents}¢/tick)
            </span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Cumulative absolute price travel
          </div>
        </div>

        {/* Metric 4: Trajectory & Pattern */}
        <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
            Trajectory Pattern
          </div>
          <div className="text-sm font-bold text-[#03045e] truncate">
            {trendTitle}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 truncate">
            {delta1To2 > 0 ? '↗' : delta1To2 < 0 ? '↘' : '→'} Check 1 &rarr; 2 &bull; {delta2To3 > 0 ? '↗' : delta2To3 < 0 ? '↘' : '→'} Check 2 &rarr; 3
          </div>
        </div>
      </div>

      {/* Advisory & Execution Guidance */}
      <div className="p-4 rounded-xl border border-[#90e0ef] bg-[#caf0f8]/30 text-[#03045e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-2.5">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-[#0077b6]" />
          <div className="space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-wide text-[#03045e]">
              Market Execution Advisory &bull; {trendTitle}
            </div>
            <p className="text-xs leading-relaxed text-stone-700">
              {volatilityLevel === 'HIGH' ? (
                <>
                  Rapid price shifts detected over recent checks (amplitude: <strong>{rangeCents}¢</strong>). Avoid entering with market orders to prevent slippage; place <strong>passive limit orders</strong> near model fair value and consider reducing position size via <strong>half-Kelly</strong>.
                </>
              ) : volatilityLevel === 'MODERATE' ? (
                <>
                  Orderbook exhibits healthy price discovery and two-sided liquidity. Standard contract sizing is viable; monitor catalysts for momentum acceleration.
                </>
              ) : (
                <>
                  Price is consolidated around <strong>{c3.priceCents}¢</strong>. Tight bid-ask consistency minimizes immediate slippage risk for calibrated entries.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Button: Record Live Price Check */}
        <div className="shrink-0 flex items-center space-x-2 w-full sm:w-auto">
          <button
            id="poll-live-price-check-btn"
            onClick={() => onAddPriceCheck(c3.priceCents, 'Live Consensus Feed')}
            disabled={isLoadingCheck}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#03045e] text-white hover:bg-[#0077b6] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Poll orderbook and record a new price check"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCheck ? 'animate-spin' : ''}`} />
            <span>Check Price Now</span>
          </button>
        </div>
      </div>

      {/* Volatility Scenario Simulator / Stress Tester & History Toggle */}
      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-stone-500">
          <Sliders className="w-3.5 h-3.5 text-[#0077b6]" />
          <span className="font-semibold text-stone-700">Simulate Price Movement:</span>
          <span className="hidden sm:inline">Test how arrow icons and volatility respond:</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="sim-drop-tick-btn"
            onClick={() => handleSimulateTick(-3)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-[#90e0ef] bg-[#caf0f8]/60 text-[#03045e] font-mono font-bold hover:bg-[#caf0f8] transition-colors cursor-pointer shadow-2xs"
            title="Simulate a -3¢ downward check"
          >
            <TrendingDown className="w-3.5 h-3.5 text-[#03045e] stroke-[2.5]" />
            <span>-3¢ Down</span>
          </button>
          <button
            id="sim-flat-tick-btn"
            onClick={() => handleSimulateTick(0)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-100 text-stone-700 font-mono font-bold hover:bg-stone-200 transition-colors cursor-pointer"
            title="Simulate an identical price check (consolidation)"
          >
            <Minus className="w-3.5 h-3.5 text-stone-400 stroke-[2.5]" />
            <span>0¢ Flat</span>
          </button>
          <button
            id="sim-surge-tick-btn"
            onClick={() => handleSimulateTick(+3)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-[#00b4d8] bg-[#caf0f8] text-[#0077b6] font-mono font-bold hover:bg-[#90e0ef] transition-colors cursor-pointer shadow-2xs"
            title="Simulate a +3¢ upward check"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#0077b6] stroke-[2.5]" />
            <span>+3¢ Up</span>
          </button>

          {checks.length > 0 && (
            <button
              id="toggle-price-checks-history-btn"
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer ml-1"
              title="Toggle historical list of all price checks"
            >
              <History className="w-3.5 h-3.5 text-stone-500" />
              <span>Log ({checks.length})</span>
              {showFullHistory ? (
                <ChevronUp className="w-3 h-3 text-stone-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-stone-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Historical Price Check Log */}
      {showFullHistory && checks.length > 0 && (
        <div className="pt-3 border-t border-stone-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
            <span>All Recorded Price Checks ({checks.length} checks)</span>
            <span className="font-mono text-stone-400">Ocean = Up &bull; Navy = Down</span>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-xl bg-stone-50/50">
            {[...checks].reverse().map((chk, idx) => {
              const origIdx = checks.length - 1 - idx;
              const prevChk = origIdx > 0 ? checks[origIdx - 1] : null;
              const chkTrend = getCheckTrendInfo(chk.priceCents, prevChk ? prevChk.priceCents : null);

              return (
                <div
                  key={chk.id || idx}
                  className="px-3.5 py-2 flex items-center justify-between text-xs hover:bg-white transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-[11px] font-bold text-stone-500">
                      #{chk.checkIndex || origIdx + 1}
                    </span>
                    <span className="font-mono text-stone-400 text-[11px]">
                      {chk.timestamp}
                    </span>
                    <span className="text-[11px] text-stone-500 hidden sm:inline">
                      ({chk.source})
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {chk.priceCents}¢
                    </span>
                    {chkTrend.direction === 'UP' ? (
                      <span className="inline-flex items-center space-x-1 text-[#0077b6] bg-[#caf0f8] px-2 py-0.5 rounded border border-[#00b4d8] font-bold font-mono text-[11px]">
                        <TrendingUp className="w-3 h-3 text-[#0077b6] stroke-[2.5]" />
                        <span>{chkTrend.label}</span>
                      </span>
                    ) : chkTrend.direction === 'DOWN' ? (
                      <span className="inline-flex items-center space-x-1 text-[#03045e] bg-[#caf0f8]/60 px-2 py-0.5 rounded border border-[#90e0ef] font-bold font-mono text-[11px]">
                        <TrendingDown className="w-3 h-3 text-[#03045e] stroke-[2.5]" />
                        <span>{chkTrend.label}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-bold font-mono text-[11px]">
                        <Minus className="w-3 h-3 text-stone-400 stroke-[2.5]" />
                        <span>{chkTrend.label}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SET PRICE ALERT MODAL DIALOG                                              */}
      {/* ========================================================================= */}
      {isSetPriceAlertModalOpen && (
        <div
          id="set-price-alert-modal-backdrop"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSetPriceAlertModalOpen(false);
          }}
        >
          <div
            id="set-price-alert-modal-card"
            className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-5 my-8 transform transition-all text-stone-800"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] shadow-2xs">
                  <Target className="w-5 h-5 text-[#0077b6] stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-[#03045e]">
                    Set Price Alert
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-1 max-w-sm">
                    {eventTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="close-set-price-alert-modal-btn"
                onClick={() => setIsSetPriceAlertModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Price Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <div>
                <span className="text-stone-500 block text-[11px]">Current Market Price:</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl font-black font-mono text-[#0077b6]">
                    {c3.priceCents}¢
                  </span>
                  <span className="text-stone-400 font-mono">
                    (${ (c3.priceCents / 100).toFixed(2) } / YES)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-stone-400 block text-[10.5px]">Last Polled Check:</span>
                <span className="font-mono text-stone-600 font-semibold">{c3.timestamp}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveModalAlert} className="space-y-4 text-xs">
              {/* Target Price Setting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 flex items-center space-x-1.5">
                    <span>Target Price (¢):</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-[#0077b6]">
                    {inputTargetPrice > c3.priceCents
                      ? `+${inputTargetPrice - c3.priceCents}¢ above market`
                      : inputTargetPrice < c3.priceCents
                      ? `${inputTargetPrice - c3.priceCents}¢ below market`
                      : 'Same as current market price'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setInputTargetPrice((p) => Math.max(1, p - 1))}
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold cursor-pointer text-sm"
                  >
                    -1¢
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={inputTargetPrice}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setInputTargetPrice(Math.max(1, Math.min(99, val)));
                        }
                      }}
                      className="w-full py-2 px-3 text-center rounded-xl border-2 border-stone-300 font-mono font-black text-xl text-[#03045e] focus:border-[#0077b6] focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold font-mono">
                      ¢
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInputTargetPrice((p) => Math.min(99, p + 1))}
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold cursor-pointer text-sm"
                  >
                    +1¢
                  </button>
                </div>

                {/* Quick Offset Presets */}
                <div className="flex items-center justify-between gap-1 pt-1">
                  {[-5, -2, 0, 2, 5].map((offset) => {
                    const price = Math.max(1, Math.min(99, c3.priceCents + offset));
                    const isCurrent = offset === 0;
                    return (
                      <button
                        key={offset}
                        type="button"
                        onClick={() => setInputTargetPrice(price)}
                        className={`flex-1 py-1 px-1 rounded-lg border text-[11px] font-mono font-bold transition-colors cursor-pointer text-center ${
                          inputTargetPrice === price
                            ? 'bg-[#03045e] text-white border-[#03045e]'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {isCurrent ? `${price}¢ (Now)` : offset > 0 ? `+${offset}¢` : `${offset}¢`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trigger Condition Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">
                  Trigger Condition:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInputCondition('ABOVE_OR_EQUAL')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      inputCondition === 'ABOVE_OR_EQUAL'
                        ? 'bg-[#caf0f8] text-[#0077b6] border-[#00b4d8] ring-1 ring-[#00b4d8]'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="block font-black text-sm">≥ Above or Equal</span>
                    <span className="text-[10px] text-stone-500">Bullish breakout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputCondition('BELOW_OR_EQUAL')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      inputCondition === 'BELOW_OR_EQUAL'
                        ? 'bg-[#caf0f8]/70 text-[#03045e] border-[#90e0ef] ring-1 ring-[#03045e]'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="block font-black text-sm">≤ Below or Equal</span>
                    <span className="text-[10px] text-stone-500">Bearish dip / hedge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputCondition('EXACT')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      inputCondition === 'EXACT'
                        ? 'bg-[#03045e] text-white border-[#03045e]'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="block font-black text-sm">= Exact Match</span>
                    <span className="text-[10px] opacity-80">Exact tick match</span>
                  </button>
                </div>
              </div>

              {/* Interval-Based Polling Settings */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Timer className="w-4 h-4 text-[#0077b6]" />
                    <span className="font-bold text-stone-800">Interval Polling Frequency:</span>
                  </div>
                  <div className="inline-flex rounded-lg bg-white p-0.5 border border-stone-200 shadow-2xs">
                    {[3, 5, 10].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          setPollingIntervalSeconds(sec);
                          setPollingCountdown(sec);
                        }}
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                          pollingIntervalSeconds === sec
                            ? 'bg-[#03045e] text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  The interval engine checks the active event orderbook every <strong>{pollingIntervalSeconds} seconds</strong> independently. When the target condition is met, an animated floating toast notification triggers instantly.
                </p>
              </div>

              {/* Notification Channels */}
              <div className="space-y-2">
                <span className="font-bold text-stone-800 block">
                  Notification Channels:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50/70">
                    <CheckCircle2 className="w-4 h-4 text-[#0077b6] shrink-0" />
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">
                        In-App Toast Notification
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Floating banner with re-arm controls
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-stone-200 bg-white cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={inputChannelBrowser}
                      onChange={(e) => setInputChannelBrowser(e.target.checked)}
                      className="w-4 h-4 text-[#0077b6] rounded accent-[#0077b6]"
                    />
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">
                        Desktop Browser Push
                      </span>
                      <span className="text-[10px] text-stone-500">
                        OS notification banner
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Optional Note */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 flex items-center justify-between">
                  <span>Alert Note / Label (Optional):</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exit position if price tests resistance"
                  value={inputNote}
                  onChange={(e) => setInputNote(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:border-[#0077b6]"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  id="modal-test-trigger-toast-btn"
                  onClick={triggerTestToast}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-[#90e0ef] bg-[#caf0f8] hover:bg-[#90e0ef] text-[#0077b6] font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                  title="Simulates and displays the toast notification right now"
                >
                  <Zap className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>Test Trigger Toast</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsSetPriceAlertModalOpen(false)}
                    className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="confirm-arm-price-alert-btn"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#03045e] to-[#0077b6] hover:from-[#0077b6] hover:to-[#0096c7] text-white font-bold text-xs cursor-pointer shadow-sm transition-all"
                  >
                    <Target className="w-4 h-4 text-[#caf0f8]" />
                    <span>Arm Price Alert</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING PRICE ALERT TOAST NOTIFICATIONS CONTAINER                        */}
      {/* ========================================================================= */}
      {priceAlertToasts.length > 0 && (
        <div
          id="price-alert-toasts-container"
          className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
        >
          {priceAlertToasts.map((toast) => {
            const isConfirmation = toast.isConfirmation;
            return (
              <div
                key={toast.id}
                id={`toast-${toast.id}`}
                className={`pointer-events-auto rounded-2xl border-2 shadow-2xl p-4 transition-all duration-300 transform translate-y-0 relative overflow-hidden backdrop-blur-md ${
                  isConfirmation
                    ? 'bg-white/95 border-[#00b4d8] text-[#03045e]'
                    : 'bg-white/95 border-[#0077b6] text-stone-900 ring-2 ring-[#0077b6]/20'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 pb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b4d8] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0077b6]"></span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-[#03045e]">
                      {isConfirmation ? 'Price Alert Armed' : 'Target Price Triggered!'}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {toast.timestamp}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPriceAlertToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                    className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
                    title="Dismiss alert toast"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Event Name */}
                <div className="text-xs font-bold text-[#03045e] line-clamp-1 mb-1">
                  {toast.eventTitle}
                </div>

                {/* Price Status Pills */}
                <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#caf0f8] text-[#0077b6] font-mono font-black border border-[#90e0ef]">
                    <Target className="w-3 h-3 text-[#0077b6]" />
                    <span>Target: {toast.conditionLabel} {toast.targetPriceCents}¢</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800 font-mono font-bold border border-stone-200">
                    <span>Orderbook: {toast.currentPriceCents}¢</span>
                  </span>
                </div>

                {/* Toast Message & Note */}
                <p className="text-[11.5px] text-stone-600 leading-snug">
                  {toast.message}
                </p>
                {toast.note && (
                  <p className="text-[10.5px] text-stone-500 italic mt-0.5">
                    &ldquo;{toast.note}&rdquo;
                  </p>
                )}

                {/* Action Controls for Quick Re-Arm or Dismiss */}
                {!isConfirmation && (
                  <div className="pt-2.5 mt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-[10.5px] text-stone-400 font-medium">
                      Quick Re-arm:
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleToastRearm(toast, 2)}
                        className="px-2 py-1 rounded-lg bg-[#caf0f8] hover:bg-[#90e0ef] text-[#0077b6] font-mono font-bold text-[10.5px] border border-[#00b4d8] cursor-pointer transition-colors shadow-2xs"
                        title="Re-arm threshold +2¢ higher"
                      >
                        +2¢ ({Math.min(99, toast.currentPriceCents + 2)}¢)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToastRearm(toast, -2)}
                        className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono font-bold text-[10.5px] border border-stone-200 cursor-pointer transition-colors shadow-2xs"
                        title="Re-arm threshold -2¢ lower"
                      >
                        -2¢ ({Math.max(1, toast.currentPriceCents - 2)}¢)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceAlertToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                        className="px-2 py-1 rounded-lg bg-[#03045e] hover:bg-[#0077b6] text-white font-bold text-[10.5px] cursor-pointer transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress countdown shrink bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-100">
                  <div className="h-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] animate-toast-shrink"></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

