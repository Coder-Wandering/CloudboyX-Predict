import React, { useState, useRef, useEffect } from 'react';
import { ProbabilityAnalysisResult, PriceCheckRecord, PriceAlert, PriceAlertCondition } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Award,
  Info,
  ArrowUpRight,
  HelpCircle,
  Activity,
  Download,
  Check,
  Share2,
  Copy,
  Link,
  Sparkles,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  Sliders,
  AlertTriangle,
  Radio,
  Zap,
  X,
  RefreshCw,
  Twitter,
  Linkedin,
  Send,
  MessageCircle,
  Slack,
  Mail,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { exportAnalysisAsJson } from '../utils/exportUtils';
import { ShareModal } from './ShareModal';

const STORAGE_KEY_PRICE_ALERTS = 'cloudboyx_price_alerts';

// Web Audio API harmonic chime for Price Alerts
const playPriceAlertChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second harmonic tone (A5 - 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.24, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  } catch (e) {
    console.warn('AudioContext alert chime could not play:', e);
  }
};

// Dispatch native browser notification if granted
const sendBrowserNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    } catch (err) {
      console.warn('Browser notification error:', err);
    }
  }
};

interface OddsOverviewCardProps {
  analysis: ProbabilityAnalysisResult;
  onTradeClick: (side: 'YES' | 'NO') => void;
  onOpenEli6: () => void;
  volatilitySummary?: {
    level: 'HIGH' | 'MODERATE' | 'LOW';
    rangeCents: number;
    deltaNet: number;
  };
  volatilityChecks?: PriceCheckRecord[];
  onExportData?: () => void;
}

export const OddsOverviewCard: React.FC<OddsOverviewCardProps> = ({
  analysis,
  onTradeClick,
  onOpenEli6,
  volatilitySummary,
  volatilityChecks,
  onExportData,
}) => {
  const probabilities = analysis?.probabilities || {
    calibratedYesPercent: 50,
    fairContractCents: 50,
    confidenceScore: 'Medium' as const,
    rawUncalibratedPercent: 50,
    brierScore: 0.15,
  };
  const marketEconomics = analysis?.marketEconomics || {
    marketPriceCents: 50,
    impliedMarketProb: 50,
    edgePercentage: 0,
    recommendedAction: 'HOLD / NEUTRAL',
    expectedValueCents: 0,
    halfKellyFraction: 0,
    fullKellyFraction: 0,
    spreadCents: 1,
  };
  const eventTitle = analysis?.eventTitle || '';
  const category = analysis?.category || 'Economics';

  const isYesAdvantage = marketEconomics.edgePercentage >= 3;
  const isNoAdvantage = marketEconomics.edgePercentage <= -3;
  const isFair = !isYesAdvantage && !isNoAdvantage;

  const [isExported, setIsExported] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<'link' | 'snippet' | null>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  // Price Alert states
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<PriceAlert | null>(null);
  const [alertCondition, setAlertCondition] = useState<PriceAlertCondition>('ABOVE_OR_EQUAL');
  const [alertTargetPrice, setAlertTargetPrice] = useState<number>(() => Math.min(99, (marketEconomics?.marketPriceCents ?? 50) + 5));
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string | null>(null);
  const alertDialogRef = useRef<HTMLDivElement>(null);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }
  }, []);

  // Load alert for current eventTitle from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRICE_ALERTS);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, PriceAlert>;
        if (parsed && parsed[eventTitle]) {
          setActiveAlert(parsed[eventTitle]);
          setAlertTargetPrice(parsed[eventTitle].targetPriceCents);
          setAlertCondition(parsed[eventTitle].condition);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load price alerts:', e);
    }
    setActiveAlert(null);
    setAlertTargetPrice(Math.min(99, marketEconomics.marketPriceCents + 5));
    setAlertCondition('ABOVE_OR_EQUAL');
  }, [eventTitle]);

  // Monitor market price updates against active alert threshold
  useEffect(() => {
    if (!activeAlert || activeAlert.isTriggered) return;

    const currentPrice = marketEconomics.marketPriceCents;
    const conditionMet =
      (activeAlert.condition === 'ABOVE_OR_EQUAL' && currentPrice >= activeAlert.targetPriceCents) ||
      (activeAlert.condition === 'BELOW_OR_EQUAL' && currentPrice <= activeAlert.targetPriceCents);

    if (conditionMet) {
      const triggeredAlert: PriceAlert = {
        ...activeAlert,
        isTriggered: true,
        triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        triggeredPriceCents: currentPrice,
      };

      setActiveAlert(triggeredAlert);

      // Persist triggered state to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY_PRICE_ALERTS);
        const map = stored ? JSON.parse(stored) : {};
        map[eventTitle] = triggeredAlert;
        localStorage.setItem(STORAGE_KEY_PRICE_ALERTS, JSON.stringify(map));
      } catch (err) {
        console.warn('Failed to persist triggered alert:', err);
      }

      // Play electronic alert chime
      playPriceAlertChime();

      // Send desktop/browser notification
      const condSymbol = activeAlert.condition === 'ABOVE_OR_EQUAL' ? '≥' : '≤';
      sendBrowserNotification(
        `🚨 Price Alert: ${currentPrice}¢ (${eventTitle.slice(0, 32)}...)`,
        `Kalshi market price reached ${currentPrice}¢ (Alert threshold was ${condSymbol} ${activeAlert.targetPriceCents}¢).`
      );
    }
  }, [marketEconomics.marketPriceCents, activeAlert, eventTitle]);

  // Save / Update price alert
  const handleSaveAlert = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch {
        // ignore
      }
    }

    const safeTarget = Math.max(1, Math.min(99, alertTargetPrice));
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      eventTitle,
      targetPriceCents: safeTarget,
      condition: alertCondition,
      createdAt: new Date().toISOString(),
      isActive: true,
      isTriggered: false,
    };

    setActiveAlert(newAlert);
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRICE_ALERTS);
      const map = stored ? JSON.parse(stored) : {};
      map[eventTitle] = newAlert;
      localStorage.setItem(STORAGE_KEY_PRICE_ALERTS, JSON.stringify(map));
    } catch (err) {
      console.warn('Failed to save price alert:', err);
    }

    setAlertSuccessMsg(`Price Alert armed for ${alertCondition === 'ABOVE_OR_EQUAL' ? '≥' : '≤'} ${safeTarget}¢!`);
    setTimeout(() => {
      setAlertSuccessMsg(null);
      setIsAlertModalOpen(false);
    }, 1100);
  };

  // Delete / Remove active price alert
  const handleDeleteAlert = () => {
    setActiveAlert(null);
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRICE_ALERTS);
      if (stored) {
        const map = JSON.parse(stored);
        delete map[eventTitle];
        localStorage.setItem(STORAGE_KEY_PRICE_ALERTS, JSON.stringify(map));
      }
    } catch (err) {
      console.warn('Failed to delete price alert:', err);
    }
    setIsAlertModalOpen(false);
  };

  // Re-arm an alert after it has triggered
  const handleRearmAlert = () => {
    if (!activeAlert) return;
    const rearmed: PriceAlert = {
      ...activeAlert,
      isActive: true,
      isTriggered: false,
      triggeredAt: undefined,
      triggeredPriceCents: undefined,
    };
    setActiveAlert(rearmed);
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRICE_ALERTS);
      const map = stored ? JSON.parse(stored) : {};
      map[eventTitle] = rearmed;
      localStorage.setItem(STORAGE_KEY_PRICE_ALERTS, JSON.stringify(map));
    } catch (err) {
      console.warn('Failed to rearm price alert:', err);
    }
  };

  // Test Alert trigger (plays sound and sends notification preview)
  const handleTestAlert = async () => {
    setIsTestingAlert(true);
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch {
        // ignore
      }
    }

    playPriceAlertChime();
    const condSymbol = alertCondition === 'ABOVE_OR_EQUAL' ? '≥' : '≤';
    sendBrowserNotification(
      `🔔 [Test Alert] Kalshi Price: ${condSymbol} ${alertTargetPrice}¢`,
      `Price alert preview for "${eventTitle}". Current market price is ${marketEconomics.marketPriceCents}¢.`
    );

    setTimeout(() => {
      setIsTestingAlert(false);
    }, 1200);
  };

  // Request browser notification permission explicitly
  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    } catch {
      setNotificationPermission('denied');
    }
  };

  // Close popups on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(e.target as Node)) {
        setIsShareOpen(false);
      }
      if (alertDialogRef.current && !alertDialogRef.current.contains(e.target as Node)) {
        setIsAlertModalOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAlertModalOpen(false);
        setIsShareOpen(false);
      }
    };

    if (isShareOpen || isAlertModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShareOpen, isAlertModalOpen]);

  // Generate shareable URL with parameters
  const generateShareUrl = () => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const params = new URLSearchParams();
    params.set('q', eventTitle);
    params.set('price', String(marketEconomics.marketPriceCents));
    if (category) {
      params.set('category', category);
    }
    return `${origin}${path}?${params.toString()}`;
  };

  // Generate formatted text snippet
  const generateShareTextSnippet = () => {
    const edgeSign = marketEconomics.edgePercentage > 0 ? `+${marketEconomics.edgePercentage}%` : `${marketEconomics.edgePercentage}%`;
    const shareUrl = generateShareUrl();
    return `📊 CloudboyX Predict Market Analysis\n\n🎯 Event: "${eventTitle}"\n• Model Calibrated Odds: ${probabilities.calibratedYesPercent}% YES (${probabilities.fairContractCents}¢ fair value)\n• Kalshi Market Price: ${marketEconomics.marketPriceCents}¢ YES (implied: ${marketEconomics.impliedMarketProb}%)\n• Model Edge: ${edgeSign} (${marketEconomics.recommendedAction})\n• Certainty: ${probabilities.confidenceScore} confidence\n\nExplore interactive probability deconstruction:\n${shareUrl}`;
  };

  const handleCopyLink = async () => {
    const url = generateShareUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedType('link');
      setTimeout(() => {
        setCopiedType(null);
        setIsShareOpen(false);
      }, 2000);
    } catch (err) {
      console.warn('Failed to copy share link:', err);
    }
  };

  const handleCopySnippet = async () => {
    const snippet = generateShareTextSnippet();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(snippet);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = snippet;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedType('snippet');
      setTimeout(() => {
        setCopiedType(null);
        setIsShareOpen(false);
      }, 2000);
    } catch (err) {
      console.warn('Failed to copy share snippet:', err);
    }
  };

  const handleExportClick = () => {
    if (onExportData) {
      onExportData();
    } else {
      exportAnalysisAsJson(analysis, volatilityChecks);
    }
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-7 space-y-6">
      {/* Event Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-stone-100">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
              {category}
            </span>
            <span className="text-xs text-stone-500 font-mono">
              Calibrated: {new Date(analysis.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#03045e] leading-snug">
            {eventTitle}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600">
            {analysis.summary}
          </p>
        </div>

        <div className="shrink-0 flex items-center space-x-2 relative">
          {/* Share Button & Dropdown */}
          <div className="relative" ref={shareDropdownRef}>
            <button
              id="share-analysis-btn"
              onClick={() => setIsShareOpen((prev) => !prev)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                isShareOpen || copiedType
                  ? 'bg-[#0077b6] text-white border border-[#0077b6]'
                  : 'bg-[#caf0f8]/50 text-[#03045e] border border-[#90e0ef] hover:bg-[#caf0f8]'
              }`}
              title="Share this probability analysis via link or formatted summary snippet"
            >
              {copiedType ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Share Menu Flyout */}
            {isShareOpen && (
              <div
                id="share-analysis-flyout"
                className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150 text-left"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-[11px] font-bold text-[#03045e] uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0077b6]" />
                    <span>Share Analysis</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Instant Copy</span>
                </div>

                {/* Option 1: Copy Direct Link */}
                <button
                  id="share-copy-link-btn"
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full text-left p-2 rounded-xl bg-stone-50 hover:bg-[#caf0f8]/40 border border-stone-200 hover:border-[#90e0ef] flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 group-hover:border-[#0077b6] flex items-center justify-center text-[#0077b6] shadow-2xs shrink-0">
                      <Link className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#03045e]">Copy Direct URL</div>
                      <div className="text-[10px] text-stone-500">Opens this contract analysis</div>
                    </div>
                  </div>
                  {copiedType === 'link' ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#0077b6]" />
                  )}
                </button>

                {/* Option 2: Copy Summary Snippet */}
                <button
                  id="share-copy-snippet-btn"
                  type="button"
                  onClick={handleCopySnippet}
                  className="w-full text-left p-2 rounded-xl bg-stone-50 hover:bg-[#caf0f8]/40 border border-stone-200 hover:border-[#90e0ef] flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 group-hover:border-[#0077b6] flex items-center justify-center text-[#0077b6] shadow-2xs shrink-0">
                      <Copy className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#03045e]">Copy Text Summary</div>
                      <div className="text-[10px] text-stone-500">Odds, edge, and deep link</div>
                    </div>
                  </div>
                  {copiedType === 'snippet' ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#0077b6]" />
                  )}
                </button>

                {/* Most Recommended Platforms Grid */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-[#0077b6]" />
                      <span>Recommended Platforms</span>
                    </span>
                    <span className="text-[9px] text-stone-400">1-click share</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {/* X / Twitter */}
                    <button
                      type="button"
                      id="share-quick-twitter-btn"
                      onClick={() => {
                        const tweetText = `📊 Kalshi Market Analysis: "${eventTitle.slice(0, 100)}"\n\n🎯 Model calibrated odds: ${probabilities.calibratedYesPercent}% YES\n📈 Market: ${marketEconomics.marketPriceCents}¢ (Edge: ${marketEconomics.edgePercentage >= 0 ? '+' : ''}${marketEconomics.edgePercentage}%)\n\n#Kalshi #PredictionMarkets`;
                        const url = generateShareUrl();
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=500');
                        setIsShareOpen(false);
                      }}
                      className="p-2 rounded-xl bg-black hover:bg-stone-900 text-white flex items-center space-x-2 text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-2xs"
                      title="Share to X (Twitter)"
                    >
                      <Twitter className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="truncate">X / Twitter</span>
                    </button>

                    {/* LinkedIn */}
                    <button
                      type="button"
                      id="share-quick-linkedin-btn"
                      onClick={() => {
                        const url = generateShareUrl();
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=500');
                        setIsShareOpen(false);
                      }}
                      className="p-2 rounded-xl bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 border border-[#0a66c2]/30 text-[#0a66c2] flex items-center space-x-2 text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-2xs"
                      title="Share to LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-[#0a66c2] shrink-0" />
                      <span className="truncate">LinkedIn</span>
                    </button>

                    {/* Telegram */}
                    <button
                      type="button"
                      id="share-quick-telegram-btn"
                      onClick={() => {
                        const snippet = generateShareTextSnippet();
                        const url = generateShareUrl();
                        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(snippet)}`, '_blank', 'width=600,height=500');
                        setIsShareOpen(false);
                      }}
                      className="p-2 rounded-xl bg-[#229ed9]/10 hover:bg-[#229ed9]/20 border border-[#229ed9]/30 text-[#229ed9] flex items-center space-x-2 text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-2xs"
                      title="Share to Telegram"
                    >
                      <Send className="w-3.5 h-3.5 text-[#229ed9] shrink-0" />
                      <span className="truncate">Telegram</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      id="share-quick-whatsapp-btn"
                      onClick={() => {
                        const snippet = generateShareTextSnippet();
                        const url = generateShareUrl();
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${snippet}\n${url}`)}`, '_blank', 'width=600,height=500');
                        setIsShareOpen(false);
                      }}
                      className="p-2 rounded-xl bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/30 text-[#25d366] flex items-center space-x-2 text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-2xs"
                      title="Share to WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25d366] shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </button>
                  </div>

                  {/* All Platforms & Customizer Opener */}
                  <button
                    type="button"
                    id="share-open-modal-btn"
                    onClick={() => {
                      setIsShareOpen(false);
                      setIsShareModalOpen(true);
                    }}
                    className="w-full text-center py-2 px-3 rounded-xl bg-[#caf0f8]/60 hover:bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer mt-1"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#0077b6]" />
                    <span>All Platforms &amp; Slack (Customize)</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bell Icon Button to Open Price Threshold Alert Modal */}
          <button
            id="price-alert-bell-btn"
            type="button"
            onClick={() => setIsAlertModalOpen(true)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs border ${
              activeAlert?.isTriggered
                ? 'bg-amber-500 text-white border-amber-600 shadow-amber-200 ring-2 ring-amber-300'
                : activeAlert
                ? 'bg-[#0077b6] text-white border-[#0077b6] shadow-2xs'
                : isAlertModalOpen
                ? 'bg-[#0077b6] text-white border-[#0077b6]'
                : 'bg-[#caf0f8]/50 text-[#03045e] border-[#90e0ef] hover:bg-[#caf0f8] hover:border-[#0077b6]'
            }`}
            title={
              activeAlert
                ? `Price Alert set: ${activeAlert.condition === 'ABOVE_OR_EQUAL' ? '≥' : '≤'} ${activeAlert.targetPriceCents}¢ (Click to configure threshold)`
                : `Set price threshold alert for "${eventTitle}"`
            }
            aria-label="Set price threshold alert for current event"
          >
            {activeAlert?.isTriggered ? (
              <BellRing className="w-3.5 h-3.5 animate-bounce text-white" />
            ) : activeAlert ? (
              <BellRing className="w-3.5 h-3.5 text-white" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-[#0077b6]" />
            )}
            <span>Alert</span>
            {activeAlert && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-mono font-bold leading-none">
                {activeAlert.condition === 'ABOVE_OR_EQUAL' ? '≥' : '≤'}{activeAlert.targetPriceCents}¢
              </span>
            )}
          </button>

          {/* Dedicated Price Alert Modal with Backdrop */}
          {isAlertModalOpen && (
            <div
              id="price-alert-modal-backdrop"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsAlertModalOpen(false);
                }
              }}
            >
              <div
                ref={alertDialogRef}
                id="price-alert-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="price-alert-modal-title"
                className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 text-left"
              >
                {/* Header */}
                <div className="px-5 py-4 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-[#caf0f8] text-[#0077b6] shadow-2xs">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3
                        id="price-alert-modal-title"
                        className="text-sm font-bold text-[#03045e]"
                      >
                        Set Price Threshold Alert
                      </h3>
                      <p className="text-xs text-stone-500 truncate max-w-xs sm:max-w-sm" title={eventTitle}>
                        {eventTitle}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAlertModalOpen(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Current Market Price Context */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-500 font-medium">Current Market Price:</span>{' '}
                      <span className="font-extrabold text-[#03045e] text-base ml-1">
                        {marketEconomics.marketPriceCents}¢ YES
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-stone-500">
                      <div>Model Fair Value: <strong className="text-[#0077b6]">{probabilities.fairContractCents}¢</strong></div>
                      <div>Implied Prob: <strong className="text-[#03045e]">{marketEconomics.impliedMarketProb}%</strong></div>
                    </div>
                  </div>

                  {/* Trigger Condition Direction Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Trigger Alert When Market Price:
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setAlertCondition('ABOVE_OR_EQUAL')}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                          alertCondition === 'ABOVE_OR_EQUAL'
                            ? 'bg-[#0077b6] text-white border-[#0077b6] shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Rises to &ge; (Above)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlertCondition('BELOW_OR_EQUAL')}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                          alertCondition === 'BELOW_OR_EQUAL'
                            ? 'bg-[#03045e] text-white border-[#03045e] shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Falls to &le; (Below)</span>
                      </button>
                    </div>
                  </div>

                  {/* Target Price Input & Steppers */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Alert Price Threshold:
                      </label>
                      <span className="text-sm font-extrabold text-[#03045e]">
                        {alertTargetPrice}¢ contract payout
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setAlertTargetPrice((prev) => Math.max(1, prev - 1))}
                        className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors cursor-pointer text-base"
                        title="Decrease 1¢"
                      >
                        -1
                      </button>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={alertTargetPrice}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              setAlertTargetPrice(Math.max(1, Math.min(99, val)));
                            }
                          }}
                          className="w-full text-center py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
                        />
                        <span className="absolute right-3.5 top-2.5 text-stone-400 text-xs font-bold pointer-events-none">
                          ¢
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAlertTargetPrice((prev) => Math.min(99, prev + 1))}
                        className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors cursor-pointer text-base"
                        title="Increase 1¢"
                      >
                        +1
                      </button>
                    </div>

                    {/* Slider Control */}
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={alertTargetPrice}
                      onChange={(e) => setAlertTargetPrice(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#0077b6]"
                    />

                    {/* Quick Preset Threshold Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAlertCondition('ABOVE_OR_EQUAL');
                          setAlertTargetPrice(Math.min(99, marketEconomics.marketPriceCents + 5));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#caf0f8] hover:text-[#0077b6] text-xs font-medium text-stone-600 transition-colors cursor-pointer"
                      >
                        +5¢ ({Math.min(99, marketEconomics.marketPriceCents + 5)}¢)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAlertCondition('BELOW_OR_EQUAL');
                          setAlertTargetPrice(Math.max(1, marketEconomics.marketPriceCents - 5));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#caf0f8] hover:text-[#0077b6] text-xs font-medium text-stone-600 transition-colors cursor-pointer"
                      >
                        -5¢ ({Math.max(1, marketEconomics.marketPriceCents - 5)}¢)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAlertTargetPrice(probabilities.fairContractCents);
                          setAlertCondition(probabilities.fairContractCents >= marketEconomics.marketPriceCents ? 'ABOVE_OR_EQUAL' : 'BELOW_OR_EQUAL');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#caf0f8] hover:text-[#0077b6] text-xs font-medium text-stone-600 transition-colors cursor-pointer"
                      >
                        Fair Value ({probabilities.fairContractCents}¢)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAlertTargetPrice(50);
                          setAlertCondition(50 >= marketEconomics.marketPriceCents ? 'ABOVE_OR_EQUAL' : 'BELOW_OR_EQUAL');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#caf0f8] hover:text-[#0077b6] text-xs font-medium text-stone-600 transition-colors cursor-pointer"
                      >
                        50¢ Coinflip
                      </button>
                    </div>
                  </div>

                  {/* Browser Notification Status & Permission Request */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5">
                      <Volume2 className="w-4 h-4 text-[#0077b6] shrink-0" />
                      <div>
                        <div className="font-semibold text-stone-800 text-xs">
                          {notificationPermission === 'granted'
                            ? 'Browser Notifications: Active'
                            : notificationPermission === 'denied'
                            ? 'Browser Notifications: Blocked'
                            : 'Desktop Notifications: Disabled'}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {notificationPermission === 'granted'
                            ? 'Alerts will pop up in your OS/browser & chime'
                            : 'Harmonic audio chime & in-app banner always sound'}
                        </div>
                      </div>
                    </div>

                    {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
                      <button
                        type="button"
                        onClick={handleRequestPermission}
                        className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-[#0077b6] text-xs font-bold text-[#0077b6] transition-colors cursor-pointer"
                      >
                        Enable
                      </button>
                    )}
                  </div>

                  {/* Feedback Message */}
                  {alertSuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{alertSuccessMsg}</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {activeAlert && (
                      <button
                        type="button"
                        onClick={handleDeleteAlert}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                      >
                        Remove Alert
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleTestAlert}
                      disabled={isTestingAlert}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-200/60 border border-stone-200 transition-colors cursor-pointer flex items-center space-x-1.5"
                      title="Test chime and notification preview"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                      <span>{isTestingAlert ? 'Playing Chime...' : 'Test Sound'}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsAlertModalOpen(false)}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-200/60 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAlert}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0077b6] hover:bg-[#03045e] text-white transition-colors cursor-pointer shadow-xs"
                    >
                      {activeAlert ? 'Update Alert' : 'Arm Price Alert'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Data JSON Button */}
          <button
            id="export-analysis-json-btn"
            onClick={handleExportClick}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              isExported
                ? 'bg-[#caf0f8] text-[#03045e] border border-[#00b4d8] ring-2 ring-[#00b4d8]/40'
                : 'bg-[#caf0f8]/50 text-[#03045e] border border-[#90e0ef] hover:bg-[#caf0f8] hover:text-[#03045e]'
            }`}
            title="Download current analysis object as a JSON file to save research locally"
          >
            {isExported ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>Exported JSON!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>Export Data</span>
              </>
            )}
          </button>

          {/* Explain like I'm 6 */}
          <button
            onClick={onOpenEli6}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#caf0f8]/60 text-[#03045e] border border-[#90e0ef] hover:bg-[#caf0f8] transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#0077b6]" />
            <span>Explain like I'm 6</span>
          </button>
        </div>
      </div>

      {/* Active or Triggered Price Alert Status Banners */}
      {activeAlert?.isTriggered ? (
        <div
          id="triggered-price-alert-banner"
          className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center space-x-2">
                <span>🚨 PRICE ALERT TRIGGERED</span>
                {activeAlert.triggeredAt && (
                  <span className="text-[11px] font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    at {activeAlert.triggeredAt}
                  </span>
                )}
              </div>
              <div className="text-xs text-amber-800 mt-0.5">
                Market contract price reached <strong className="font-extrabold text-amber-950">{activeAlert.triggeredPriceCents ?? marketEconomics.marketPriceCents}¢</strong> (alert threshold was {activeAlert.condition === 'ABOVE_OR_EQUAL' ? '≥' : '≤'} {activeAlert.targetPriceCents}¢).
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleRearmAlert}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Re-arm Alert
            </button>
            <button
              type="button"
              onClick={handleDeleteAlert}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-medium transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : activeAlert && !activeAlert.isTriggered ? (
        <div
          id="active-price-alert-banner"
          className="px-3.5 py-2.5 rounded-xl bg-[#caf0f8]/30 border border-[#90e0ef] text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
        >
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0077b6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0077b6]"></span>
            </span>
            <span className="font-bold text-[#03045e]">Price Alert Armed:</span>
            <span>
              Monitoring Kalshi contract for price {activeAlert.condition === 'ABOVE_OR_EQUAL' ? '≥' : '≤'} <strong className="text-[#0077b6] font-extrabold">{activeAlert.targetPriceCents}¢</strong> (Current: {marketEconomics.marketPriceCents}¢).
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(true)}
              className="text-[#0077b6] hover:text-[#03045e] hover:underline font-bold text-xs cursor-pointer"
            >
              Edit Threshold
            </button>
            <span className="text-stone-300">|</span>
            <button
              type="button"
              onClick={handleDeleteAlert}
              className="text-stone-400 hover:text-rose-600 text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Odds Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Model Calibrated Probability */}
        <div className="bg-[#caf0f8]/30 rounded-xl p-4 sm:p-5 border border-[#90e0ef] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#0077b6] font-bold uppercase tracking-wider mb-2">
              <span>Model Calibrated Odds</span>
              <Target className="w-4 h-4 text-[#0077b6]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-[#03045e] tracking-tight">
                {probabilities.calibratedYesPercent}%
              </span>
              <span className="text-sm font-semibold text-[#0077b6]">
                ({probabilities.fairContractCents}¢ fair value)
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-2">
              Synthesized Brier-calibrated fair contract value for <strong className="text-[#03045e]">YES</strong>.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#90e0ef]/70 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">90% Confidence Band:</span>
            <span className="font-semibold text-[#03045e]">
              [{probabilities.confidenceInterval.low}% &ndash; {probabilities.confidenceInterval.high}%]
            </span>
          </div>
        </div>

        {/* Current Kalshi Market Contract Price */}
        <div className="bg-stone-50 rounded-xl p-4 sm:p-5 border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider mb-2">
              <span>Kalshi Market Price</span>
              <span className="font-mono text-stone-400">Orderbook</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-stone-900 tracking-tight">
                {marketEconomics.marketPriceCents}¢
              </span>
              <span className="text-sm font-semibold text-stone-500">
                (${marketEconomics.yesCostPerContract.toFixed(2)}/contract)
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-2">
              Implied market probability: <strong>{marketEconomics.impliedMarketProb}%</strong> (NO contract at {100 - marketEconomics.marketPriceCents}¢).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 font-medium">Certainty Score:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
                {probabilities.confidenceScore} Confidence
              </span>
            </div>
            {volatilitySummary && (
              <div className="flex items-center justify-between pt-1.5 border-t border-stone-200/60">
                <span className="text-stone-500 font-medium flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-[#0077b6]" />
                  <span>3-Check Volatility:</span>
                </span>
                <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10.5px] font-bold ${
                  volatilitySummary.level === 'HIGH'
                    ? 'bg-[#caf0f8] text-[#03045e] border border-[#0077b6]'
                    : volatilitySummary.level === 'MODERATE'
                    ? 'bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef]'
                    : 'bg-[#caf0f8]/60 text-[#0077b6]'
                }`}>
                  <span>{volatilitySummary.level}</span>
                  <span className="font-mono font-normal">({volatilitySummary.rangeCents}¢ range)</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Model Edge & Recommendation */}
        <div className={`rounded-xl p-4 sm:p-5 border flex flex-col justify-between ${
          isYesAdvantage
            ? 'bg-[#caf0f8]/80 border-[#0077b6]'
            : isNoAdvantage
            ? 'bg-[#caf0f8]/40 border-[#90e0ef]'
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
              <span className={isYesAdvantage ? 'text-[#03045e]' : isNoAdvantage ? 'text-[#0077b6]' : 'text-stone-600'}>
                Mispricing / Edge
              </span>
              {isYesAdvantage ? (
                <TrendingUp className="w-4 h-4 text-[#0077b6]" />
              ) : isNoAdvantage ? (
                <TrendingDown className="w-4 h-4 text-[#03045e]" />
              ) : (
                <Minus className="w-4 h-4 text-stone-400" />
              )}
            </div>

            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                isYesAdvantage ? 'text-[#03045e]' : isNoAdvantage ? 'text-[#0077b6]' : 'text-stone-900'
              }`}>
                {marketEconomics.edgePercentage > 0 ? `+${marketEconomics.edgePercentage}%` : `${marketEconomics.edgePercentage}%`}
              </span>
              <span className="text-xs font-medium text-stone-600">
                {isYesAdvantage ? 'in favor of YES' : isNoAdvantage ? 'in favor of NO' : 'Fairly priced'}
              </span>
            </div>

            <p className="text-xs mt-2 text-stone-700">
              {marketEconomics.recommendedAction === 'BUY YES' && (
                <>Market underprices YES by {marketEconomics.edgePercentage}¢. Positive expected value on YES contracts.</>
              )}
              {marketEconomics.recommendedAction === 'BUY NO' && (
                <>Market overprices YES (underprices NO by {Math.abs(marketEconomics.edgePercentage)}¢). Positive expected value on NO contracts.</>
              )}
              {marketEconomics.recommendedAction === 'PASS (Fairly Priced)' && (
                <>Market contract closely matches fair odds. Expected return does not overcome fees.</>
              )}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between">
            <span className="text-xs font-medium text-stone-600">Action:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              isYesAdvantage
                ? 'bg-[#0077b6] text-white'
                : isNoAdvantage
                ? 'bg-[#03045e] text-white'
                : 'bg-stone-300 text-stone-800'
            }`}>
              {marketEconomics.recommendedAction}
            </span>
          </div>
        </div>
      </div>

      {/* Probability Distribution Visual Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-stone-600">
          <span className="text-[#0077b6] font-bold">YES Probability: {probabilities.calibratedYesPercent}%</span>
          <span className="text-stone-400">Market Price: {marketEconomics.marketPriceCents}¢</span>
          <span className="text-[#03045e] font-bold">NO Probability: {probabilities.calibratedNoPercent}%</span>
        </div>
        <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden flex relative">
          <div
            className="bg-[#0077b6] transition-all duration-700"
            style={{ width: `${probabilities.calibratedYesPercent}%` }}
          />
          <div
            className="bg-[#03045e] transition-all duration-700"
            style={{ width: `${probabilities.calibratedNoPercent}%` }}
          />
          {/* Market price marker pin */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-[#00b4d8] shadow-md"
            style={{ left: `calc(${marketEconomics.marketPriceCents}% - 2px)` }}
            title={`Market Price: ${marketEconomics.marketPriceCents}¢`}
          />
        </div>
        <div className="flex justify-between text-[11px] text-stone-500">
          <span>Contract payout: $1.00 if YES</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#00b4d8] inline-block" />
            <span>Cyan line marks current Kalshi market price ({marketEconomics.marketPriceCents}¢)</span>
          </span>
          <span>Contract payout: $1.00 if NO</span>
        </div>
      </div>

      {/* Interactive Quick Trade Trigger */}
      <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-stone-600">
          Ready to test this edge? Place a simulated paper trade to track your P&amp;L risk-free.
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            id="buy-yes-trigger-btn"
            onClick={() => onTradeClick('YES')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0077b6] hover:bg-[#00b4d8] hover:text-[#03045e] text-white transition-colors cursor-pointer shadow-xs"
          >
            <span>Paper Buy YES ({marketEconomics.marketPriceCents}¢)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            id="buy-no-trigger-btn"
            onClick={() => onTradeClick('NO')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#03045e] hover:bg-[#0077b6] text-white transition-colors cursor-pointer shadow-xs"
          >
            <span>Paper Buy NO ({100 - marketEconomics.marketPriceCents}¢)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Multi-Platform Distribution Modal */}
      {isShareModalOpen && analysis && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          analysis={analysis}
        />
      )}
    </div>
  );
};
