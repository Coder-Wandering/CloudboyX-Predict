import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  TrendingUp,
  ShieldAlert,
  Boxes,
  CheckCircle2,
  Layers,
  ArrowRight,
  Radio,
  Workflow,
  Copy,
  Check,
  Server,
  Zap,
  Globe,
  Package,
} from 'lucide-react';
import { CloudboyXLogo } from './CloudboyXLogo';

interface CloudboyXSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWebhooksTab?: () => void;
}

export const CloudboyXSuiteModal: React.FC<CloudboyXSuiteModalProps> = ({
  isOpen,
  onClose,
  onOpenWebhooksTab,
}) => {
  const [copiedApp, setCopiedApp] = React.useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedApp(id);
    setTimeout(() => setCopiedApp(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      id="suite-switcher-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="suite-switcher-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="CloudboyX Enterprise Suite Switcher"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-start justify-between bg-gradient-to-r from-stone-50 via-white to-[#caf0f8]/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#03045e] text-white shadow-xs">
              <Layers className="w-6 h-6 text-[#90e0ef]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#03045e] tracking-tight">
                  CloudboyX Enterprise Suite
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00b4d8] text-[#03045e] uppercase tracking-wider">
                  Unified Ecosystem
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Sense, Protect, Execute &amp; Connect across market probability, MAP price surveillance, ERP operations, and universal EDI webhooks.
              </p>
            </div>
          </div>
          <button
            id="close-suite-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close suite switcher"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enterprise Architecture Flow Ribbon */}
        <div className="bg-stone-900 text-white px-5 py-3 border-y border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 font-mono text-[11px] text-[#90e0ef]">
            <Workflow className="w-4 h-4 text-[#00d4ff]" />
            <span className="font-bold">4-PILLAR AUTONOMOUS ARCHITECTURE:</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 font-semibold text-stone-300">
            <span className="text-[#90e0ef] flex items-center space-x-1">
              <span>1. PREDICT</span>
              <span className="text-[10px] text-stone-400 font-normal">(Macro)</span>
            </span>
            <ArrowRight className="w-3 h-3 text-stone-500" />
            <span className="text-amber-300 flex items-center space-x-1">
              <span>2. PROTECT</span>
              <span className="text-[10px] text-stone-400 font-normal">(MAP)</span>
            </span>
            <ArrowRight className="w-3 h-3 text-stone-500" />
            <span className="text-emerald-400 flex items-center space-x-1">
              <span>3. EXECUTE</span>
              <span className="text-[10px] text-stone-400 font-normal">(ERP)</span>
            </span>
            <ArrowRight className="w-3 h-3 text-stone-500" />
            <span className="text-[#00d4ff] flex items-center space-x-1">
              <span>4. CONNECT</span>
              <span className="text-[10px] text-stone-400 font-normal">(EDI/B2B)</span>
            </span>
          </div>
        </div>

        {/* FEATURED FOCAL HERO CARD: CLOUDBOYX CONNECT */}
        <div className="p-5 sm:p-6 pb-2">
          <div className="rounded-3xl border-2 border-[#0077b6] bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#03045e] p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#00d4ff] text-[#03045e] text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  FOCAL POINT PRODUCT
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[#caf0f8] text-[10px] font-bold uppercase tracking-wider border border-white/20">
                  Suite Add-On &bull; Standalone Connector
                </span>
                <span className="text-xs text-[#90e0ef] font-mono flex items-center space-x-1">
                  <Radio className="w-3.5 h-3.5 text-[#00d4ff] animate-pulse" />
                  <span>ANSI X12 &bull; REST &bull; cXML</span>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                CloudboyX Connect &trade; &mdash; Universal Webhook &amp; EDI Studio
              </h3>

              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                Marketed as a <strong>standalone universal connector</strong> for any enterprise or an <strong>included intelligence add-on</strong> in the CloudboyX suite. Direct bidirectional translation between modern REST APIs and legacy ANSI X12 EDI (850, 846, 852, 856, 810), with pre-built adapters for SAP, NetSuite, Dynamics 365, and Shopify.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-[#caf0f8]">
                <div className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">&bull; Standalone Docker / Helm</div>
                <div className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">&bull; EDI 850 / 846 / 852 / 856</div>
                <div className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">&bull; SHA-256 Signature Auth</div>
                <div className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">&bull; Zero-Lockin Microservice</div>
              </div>
            </div>

            <div className="shrink-0 space-y-2 w-full sm:w-auto">
              {onOpenWebhooksTab && (
                <button
                  id="suite-modal-open-connect-btn"
                  onClick={() => {
                    onOpenWebhooksTab();
                    onClose();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-[#00d4ff] hover:bg-[#00b4d8] text-[#03045e] font-black text-xs transition-all shadow-md cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-[#03045e]" />
                  <span>Launch CloudboyX Connect</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <div className="text-[10px] text-center text-stone-300 font-mono">
                Included in Suite or Standalone ($499/mo)
              </div>
            </div>
          </div>
        </div>

        {/* The 3 Primary Core Applications Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: CloudboyX Predict (Current App) */}
          <div
            id="suite-card-predict"
            className="relative rounded-2xl border-2 border-[#0077b6] bg-gradient-to-b from-[#caf0f8]/40 via-white to-white p-5 flex flex-col justify-between shadow-sm ring-2 ring-[#0077b6]/20"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-[#0077b6] text-white shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#03045e] text-white shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse"></span>
                  <span>ACTIVE APPLICATION</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-[#03045e] tracking-tight">
                  CloudboyX Predict
                </h3>
                <div className="text-[11px] font-bold text-[#0077b6] uppercase tracking-wider mt-0.5">
                  Pillar 1: Sense &bull; Market Intelligence
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Quantitative forecast terminal calculating calibrated probability curves (Linear &rarr; Logistic &rarr; AI Ensemble), base rates, Kelly sizing, and orderbook edges.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-stone-200/80">
                <div className="text-[11px] font-semibold text-stone-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>Kalshi Real-Time Exchange API</span>
                </div>
                <div className="text-[11px] font-semibold text-stone-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>Mathematical Calibration Studio</span>
                </div>
                <div className="text-[11px] font-semibold text-stone-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>Dialectic Debate Synthesis</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>Port: 3000 (Current App)</span>
              <span className="text-[#0077b6] font-bold">Online</span>
            </div>
          </div>

          {/* Card 2: CloudboyX MAP Protection */}
          <div
            id="suite-card-map"
            className="rounded-2xl border border-stone-200 bg-gradient-to-b from-amber-50/50 via-white to-white p-5 flex flex-col justify-between hover:border-amber-400 transition-all shadow-xs group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Enforcement Hub
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-stone-900 tracking-tight group-hover:text-amber-700 transition-colors">
                  MAP Protection Scanner
                </h3>
                <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mt-0.5">
                  Pillar 2: Protect &bull; Price Surveillance
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Autonomous price sentinel monitoring e-commerce channels (Amazon, Walmart, Target) to identify Minimum Advertised Price (MAP) violations in real time.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-stone-200/80">
                <div className="text-[11px] font-semibold text-stone-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Real-Time E-Commerce Crawler</span>
                </div>
                <div className="text-[11px] font-semibold text-stone-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Automated Cease &amp; Desist Notices</span>
                </div>
                <div className="text-[11px] font-semibold text-stone-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Seller Compliance Scorecard</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-200 space-y-2">
              <a
                id="launch-map-scanner-btn"
                href="https://map-protection-scanner.ai.studio"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Launch MAP Scanner</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
                <span className="truncate font-mono">map-protection-scanner.ai.studio</span>
                <button
                  onClick={() => handleCopyLink('https://map-protection-scanner.ai.studio', 'map')}
                  className="hover:text-stone-800 p-1 cursor-pointer"
                  title="Copy link"
                >
                  {copiedApp === 'map' ? <Check className="w-3 h-3 text-amber-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: CloudboyX ERP */}
          <div
            id="suite-card-erp"
            className="rounded-2xl border border-stone-200 bg-gradient-to-b from-emerald-50/50 via-white to-white p-5 flex flex-col justify-between hover:border-emerald-400 transition-all shadow-xs group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Boxes className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Universal Hub
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-stone-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                  CloudboyX ERP
                </h3>
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
                  Pillar 3: Execute &bull; Operations &amp; EDI
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Central operating system equipped with universal connectors bridging legacy EDI (850, 856, 810), REST endpoints, and automated purchase orders.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-stone-200/80">
                <div className="text-[11px] font-semibold text-stone-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Universal Connector (EDI + REST)</span>
                </div>
                <div className="text-[11px] font-semibold text-stone-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Wholesale &amp; Direct-to-Consumer Orders</span>
                </div>
                <div className="text-[11px] font-semibold text-stone-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Webhook Target Ingestion</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-200 space-y-2">
              <a
                id="launch-erp-hub-btn"
                href="https://cloudboyx-erp.ai.studio"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Launch CloudboyX ERP</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
                <span className="truncate font-mono">cloudboyx-erp.ai.studio</span>
                <button
                  onClick={() => handleCopyLink('https://cloudboyx-erp.ai.studio', 'erp')}
                  className="hover:text-stone-800 p-1 cursor-pointer"
                  title="Copy link"
                >
                  {copiedApp === 'erp' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Connector Bridge Bar */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-[#0077b6] animate-pulse" />
            <span className="font-bold text-stone-800">
              Need to bridge live prediction signals or run standalone B2B EDI transmissions?
            </span>
          </div>
          {onOpenWebhooksTab && (
            <button
              id="suite-open-webhooks-tab-btn"
              onClick={() => {
                onOpenWebhooksTab();
                onClose();
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#03045e] hover:bg-[#0077b6] text-white font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span>Open CloudboyX Connect Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
