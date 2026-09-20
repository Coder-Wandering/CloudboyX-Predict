import React, { useState, useMemo } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Send,
  MessageCircle,
  Slack,
  Mail,
  ExternalLink,
  Globe,
  Sparkles,
  Smartphone,
  CheckCircle2,
  TrendingUp,
  Percent,
  Sliders,
} from 'lucide-react';
import { ProbabilityAnalysisResult } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis?: ProbabilityAnalysisResult | null;
}

interface PlatformShareConfig {
  id: string;
  name: string;
  category: 'social' | 'messaging' | 'workplace';
  color: string;
  bgColor: string;
  borderColor: string;
  badge?: string;
  icon: React.ReactNode;
  action: (text: string, url: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  analysis,
}) => {
  const [copiedType, setCopiedType] = useState<'link' | 'snippet' | 'slack' | null>(null);
  const [includeEdge, setIncludeEdge] = useState(true);
  const [includeFairValue, setIncludeFairValue] = useState(true);
  const [includeDeepLink, setIncludeDeepLink] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommended' | 'messaging' | 'custom'>('recommended');

  const eventTitle = analysis?.eventTitle || 'Kalshi Prediction Market Event';
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
  const category = analysis?.category || 'Economics';

  // Generate shareable URL with parameters
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    if (eventTitle) params.set('q', eventTitle);
    if (marketEconomics?.marketPriceCents) params.set('price', marketEconomics.marketPriceCents.toString());
    if (category) params.set('category', category);
    return `${baseUrl}?${params.toString()}`;
  }, [eventTitle, marketEconomics?.marketPriceCents, category]);

  // Generate customized text snippet
  const shareText = useMemo(() => {
    const edgeSign = (marketEconomics?.edgePercentage ?? 0) >= 0 ? `+${marketEconomics?.edgePercentage}%` : `${marketEconomics?.edgePercentage}%`;
    const lines: string[] = [];

    lines.push(`📊 Kalshi Prediction Analysis: "${eventTitle}"`);
    lines.push(`• Model Probability: ${probabilities.calibratedYesPercent}% YES`);
    
    if (includeFairValue) {
      lines.push(`• Fair Contract Value: ${probabilities.fairContractCents}¢`);
    }

    lines.push(`• Market Price: ${marketEconomics.marketPriceCents}¢ (Implied: ${marketEconomics.impliedMarketProb}%)`);

    if (includeEdge) {
      lines.push(`• Model Edge: ${edgeSign} (${marketEconomics.recommendedAction})`);
    }

    lines.push(`• Confidence: ${probabilities.confidenceScore}`);

    if (includeDeepLink && shareUrl) {
      lines.push(`\nExplore full calibrated probability breakdown:\n${shareUrl}`);
    }

    return lines.join('\n');
  }, [eventTitle, probabilities, marketEconomics, includeEdge, includeFairValue, includeDeepLink, shareUrl]);

  // Copy handler
  const handleCopy = async (type: 'link' | 'snippet' | 'slack', textToCopy: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 3000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  // Open popup helper
  const openSharePopup = (url: string) => {
    const width = 600;
    const height = 540;
    const left = Math.max(0, (window.innerWidth - width) / 2);
    const top = Math.max(0, (window.innerHeight - height) / 2);
    window.open(
      url,
      '_blank',
      `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`
    );
  };

  // Recommended platforms list
  const platforms: PlatformShareConfig[] = useMemo(() => [
    {
      id: 'twitter',
      name: 'X (Twitter)',
      category: 'social',
      color: '#ffffff',
      bgColor: 'bg-black hover:bg-stone-900',
      borderColor: 'border-stone-800',
      badge: 'Trending',
      icon: <Twitter className="w-4 h-4 text-white" />,
      action: (text, url) => {
        const tweetText = `📊 Kalshi Market Analysis: "${eventTitle.slice(0, 100)}"\n\n🎯 Model calibrated odds: ${probabilities.calibratedYesPercent}% YES\n📈 Market: ${marketEconomics.marketPriceCents}¢ (Edge: ${marketEconomics.edgePercentage >= 0 ? '+' : ''}${marketEconomics.edgePercentage}%)\n\n#Kalshi #PredictionMarkets`;
        const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
        openSharePopup(intentUrl);
      },
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      category: 'social',
      color: '#0a66c2',
      bgColor: 'bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20',
      borderColor: 'border-[#0a66c2]/30',
      badge: 'B2B / Risk',
      icon: <Linkedin className="w-4 h-4 text-[#0a66c2]" />,
      action: (_, url) => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        openSharePopup(linkedInUrl);
      },
    },
    {
      id: 'telegram',
      name: 'Telegram',
      category: 'messaging',
      color: '#229ed9',
      bgColor: 'bg-[#229ed9]/10 hover:bg-[#229ed9]/20',
      borderColor: 'border-[#229ed9]/30',
      badge: 'Popular',
      icon: <Send className="w-4 h-4 text-[#229ed9]" />,
      action: (text, url) => {
        const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        openSharePopup(tgUrl);
      },
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      category: 'messaging',
      color: '#25d366',
      bgColor: 'bg-[#25d366]/10 hover:bg-[#25d366]/20',
      borderColor: 'border-[#25d366]/30',
      badge: 'Instant',
      icon: <MessageCircle className="w-4 h-4 text-[#25d366]" />,
      action: (text, url) => {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`;
        openSharePopup(waUrl);
      },
    },
    {
      id: 'slack',
      name: 'Slack',
      category: 'workplace',
      color: '#e01e5a',
      bgColor: 'bg-[#4a154b]/10 hover:bg-[#4a154b]/20',
      borderColor: 'border-[#4a154b]/30',
      badge: 'Workplace',
      icon: <Slack className="w-4 h-4 text-[#4a154b]" />,
      action: (text, url) => {
        // Formats as Slack Mrkdwn and copies to clipboard for direct channel pasting
        const slackMrkdwn = `*📊 Kalshi Market Signal: <${url}|${eventTitle}>*\n> • *Model Odds:* ${probabilities.calibratedYesPercent}% YES (Fair: ${probabilities.fairContractCents}¢)\n> • *Market Price:* ${marketEconomics.marketPriceCents}¢ (Implied: ${marketEconomics.impliedMarketProb}%)\n> • *Alpha Edge:* \`${marketEconomics.edgePercentage >= 0 ? '+' : ''}${marketEconomics.edgePercentage}%\` — *${marketEconomics.recommendedAction}*\n> • *Confidence:* ${probabilities.confidenceScore}`;
        handleCopy('slack', slackMrkdwn);
      },
    },
    {
      id: 'reddit',
      name: 'Reddit',
      category: 'social',
      color: '#ff4500',
      bgColor: 'bg-[#ff4500]/10 hover:bg-[#ff4500]/20',
      borderColor: 'border-[#ff4500]/30',
      icon: (
        <svg className="w-4 h-4 fill-[#ff4500]" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.56 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.56 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
      action: (_, url) => {
        const redditTitle = `Kalshi Odds vs Calibrated Model: ${eventTitle} (Model: ${probabilities.calibratedYesPercent}% vs Market: ${marketEconomics.marketPriceCents}¢)`;
        const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(redditTitle)}`;
        openSharePopup(redditUrl);
      },
    },
    {
      id: 'email',
      name: 'Email Briefing',
      category: 'workplace',
      color: '#0077b6',
      bgColor: 'bg-[#0077b6]/10 hover:bg-[#0077b6]/20',
      borderColor: 'border-[#0077b6]/30',
      icon: <Mail className="w-4 h-4 text-[#0077b6]" />,
      action: (text, url) => {
        const subject = `[Market Intelligence] Kalshi Contract Analysis: ${eventTitle}`;
        const body = `${text}\n\nLive Calibrated Analysis Link:\n${url}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      },
    },
  ], [eventTitle, probabilities, marketEconomics]);

  // Native device share support check
  const hasNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kalshi Analysis: ${eventTitle}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed:', err);
        }
      }
    }
  };

  if (!isOpen || !analysis) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#0096c7] p-5 text-white flex items-start justify-between">
          <div className="space-y-1 pr-4">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-white/15 text-white">
                <Share2 className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                Multi-Platform Distribution
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              Share Analysis by Recommended Platforms
            </h3>
            <p className="text-xs text-cyan-100/90 line-clamp-1">
              {eventTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Key Metrics Quick Pill Row */}
          <div className="grid grid-cols-3 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200 text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-500">Model Fair Odds</div>
              <div className="text-base font-black text-[#0077b6] font-mono">
                {probabilities.calibratedYesPercent}% YES
              </div>
            </div>
            <div className="border-x border-stone-200">
              <div className="text-[10px] uppercase font-bold text-stone-500">Kalshi Market</div>
              <div className="text-base font-black text-stone-800 font-mono">
                {marketEconomics.marketPriceCents}¢
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-500">Model Edge</div>
              <div className={`text-base font-black font-mono ${marketEconomics.edgePercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {marketEconomics.edgePercentage >= 0 ? `+${marketEconomics.edgePercentage}%` : `${marketEconomics.edgePercentage}%`}
              </div>
            </div>
          </div>

          {/* Recommended Platforms Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>Top Recommended Platforms</span>
              </span>
              <span className="text-[10px] text-stone-500">One-click formatted share</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  id={`share-platform-${p.id}-btn`}
                  onClick={() => p.action(shareText, shareUrl)}
                  className={`p-3 rounded-2xl border ${p.borderColor} ${p.bgColor} flex flex-col justify-between text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group shadow-2xs`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="p-2 rounded-xl bg-white shadow-2xs group-hover:shadow-xs transition-shadow">
                      {p.icon}
                    </div>
                    {p.badge && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-white/80 text-stone-700 border border-stone-200">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 group-hover:text-[#0077b6] flex items-center justify-between">
                      <span>{p.name}</span>
                      <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-[#0077b6]" />
                    </div>
                    <div className="text-[10px] text-stone-500 capitalize">{p.category}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Native Mobile Share Sheet Button */}
            {hasNativeShare && (
              <button
                type="button"
                id="share-native-sheet-btn"
                onClick={handleNativeShare}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-[#0077b6] text-white font-bold text-xs flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open System Share Sheet (iOS / Android / macOS)</span>
              </button>
            )}
          </div>

          {/* Quick Copy Link & Snippet Actions */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Direct Copy Options
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Copy URL */}
              <button
                type="button"
                id="share-modal-copy-url-btn"
                onClick={() => handleCopy('link', shareUrl)}
                className="p-3 rounded-2xl bg-stone-50 hover:bg-[#caf0f8]/40 border border-stone-200 hover:border-[#0077b6] flex items-center justify-between transition-colors cursor-pointer group text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 group-hover:border-[#0077b6] flex items-center justify-center text-[#0077b6] shadow-2xs shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">Direct Web Link</div>
                    <div className="text-[10px] text-stone-500 font-mono truncate max-w-[150px]">
                      {shareUrl.replace(/^https?:\/\//, '')}
                    </div>
                  </div>
                </div>

                {copiedType === 'link' ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </span>
                ) : (
                  <Copy className="w-4 h-4 text-stone-400 group-hover:text-[#0077b6] shrink-0" />
                )}
              </button>

              {/* Copy Text Summary */}
              <button
                type="button"
                id="share-modal-copy-snippet-btn"
                onClick={() => handleCopy('snippet', shareText)}
                className="p-3 rounded-2xl bg-stone-50 hover:bg-[#caf0f8]/40 border border-stone-200 hover:border-[#0077b6] flex items-center justify-between transition-colors cursor-pointer group text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 group-hover:border-[#0077b6] flex items-center justify-center text-[#0077b6] shadow-2xs shrink-0">
                    <Copy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">Formatted Summary</div>
                    <div className="text-[10px] text-stone-500">Odds, edge, and deep link</div>
                  </div>
                </div>

                {copiedType === 'snippet' ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </span>
                ) : (
                  <Copy className="w-4 h-4 text-stone-400 group-hover:text-[#0077b6] shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Snippet Customizer & Preview (Accordion / Expandable) */}
          <div className="p-3.5 rounded-2xl bg-stone-900 text-stone-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>Message Payload Customizer</span>
              </span>
              {copiedType === 'slack' && (
                <span className="text-[10px] font-bold text-emerald-400">Slack Mrkdwn Copied!</span>
              )}
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-300 pt-1">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEdge}
                  onChange={(e) => setIncludeEdge(e.target.checked)}
                  className="rounded border-stone-700 text-[#0077b6] focus:ring-0 cursor-pointer"
                />
                <span>Include Model Edge</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFairValue}
                  onChange={(e) => setIncludeFairValue(e.target.checked)}
                  className="rounded border-stone-700 text-[#0077b6] focus:ring-0 cursor-pointer"
                />
                <span>Include Fair Value</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDeepLink}
                  onChange={(e) => setIncludeDeepLink(e.target.checked)}
                  className="rounded border-stone-700 text-[#0077b6] focus:ring-0 cursor-pointer"
                />
                <span>Include Deep Link</span>
              </label>
            </div>

            {/* Preview Box */}
            <div className="p-2.5 rounded-xl bg-stone-950 font-mono text-[11px] text-stone-400 whitespace-pre-line border border-stone-800 select-all">
              {shareText}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Shares retain exact calibrated parameters &amp; market price</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
