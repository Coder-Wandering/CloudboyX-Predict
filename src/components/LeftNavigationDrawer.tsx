import React, { useEffect } from 'react';
import {
  X,
  BarChart3,
  TrendingUp,
  Database,
  FileCode2,
  BookOpen,
  HelpCircle,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  Activity,
  Printer,
  Download,
  Radio,
  Boxes,
  ShieldAlert,
  ExternalLink,
  LayoutGrid,
  LogOut,
  User,
  Trophy,
} from 'lucide-react';
import { ProbabilityAnalysisResult, ActiveWorkspaceView } from '../types';
import { CloudboyXLogo } from './CloudboyXLogo';
import { UserSession } from './AccessGateModal';

interface LeftNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveWorkspaceView;
  onSelectView: (view: ActiveWorkspaceView) => void;
  bankroll: number;
  openPositionsCount: number;
  onOpenPortfolio: () => void;
  onOpenIngestion: () => void;
  onOpenPythonScript: () => void;
  onOpenMechanics: () => void;
  onOpenEli6: () => void;
  onOpenTrainingDocs: () => void;
  activeAnalysis?: ProbabilityAnalysisResult | null;
  onExportAnalysisData?: () => void;
  onOpenSuiteSwitcher?: () => void;
  userSession?: UserSession | null;
  onSignOut?: () => void;
}

export const LeftNavigationDrawer: React.FC<LeftNavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  bankroll,
  openPositionsCount,
  onOpenPortfolio,
  onOpenIngestion,
  onOpenPythonScript,
  onOpenMechanics,
  onOpenEli6,
  onOpenTrainingDocs,
  activeAnalysis,
  onExportAnalysisData,
  onOpenSuiteSwitcher,
  userSession,
  onSignOut,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        id="navigation-backdrop"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      />

      {/* Slide-out Left Drawer */}
      <aside
        id="left-navigation-drawer"
        className={`fixed top-0 left-0 bottom-0 w-84 sm:w-96 max-w-[88vw] bg-white z-50 shadow-2xl flex flex-col border-r border-stone-200 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Main Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/80">
          <CloudboyXLogo size={30} variant="badge" includePredict={true} />
          <button
            id="close-drawer-btn"
            onClick={onClose}
            className="p-2.5 rounded-xl text-stone-500 hover:text-[#03045e] hover:bg-[#caf0f8]/60 transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* User Account / VIP Session Card */}
          {userSession && (
            <div className="rounded-xl p-3 bg-stone-900 text-white border border-stone-800 shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#0077b6] flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {userSession.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{userSession.username}</div>
                  <div className="text-[10px] text-[#90e0ef] font-mono">{userSession.role}</div>
                </div>
              </div>
              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Lock Session / Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* CloudboyX Unified Enterprise Suite Switcher Block */}
          <div className="rounded-2xl border-2 border-[#0077b6]/30 bg-gradient-to-b from-[#caf0f8]/50 via-white to-stone-50 p-3.5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-[#03045e] uppercase tracking-wider flex items-center space-x-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>CloudboyX Suite</span>
              </span>
              {onOpenSuiteSwitcher && (
                <button
                  id="drawer-open-suite-modal-btn"
                  onClick={() => {
                    onOpenSuiteSwitcher();
                    onClose();
                  }}
                  className="text-[10px] font-bold text-[#0077b6] hover:text-[#03045e] hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>Overview</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* The 3 App Quick Switcher Items */}
            <div className="space-y-1.5 text-xs">
              {/* App 1: CloudboyX Predict (Current App) */}
              <div className="p-2 rounded-xl bg-white border border-[#0077b6] flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-[#03045e] text-white flex items-center justify-center text-[10px] font-black">
                    P
                  </div>
                  <div>
                    <div className="font-bold text-[#03045e] leading-tight">CloudboyX Predict</div>
                    <div className="text-[10px] text-stone-500">Sense &bull; Market Odds</div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
                  ACTIVE
                </span>
              </div>

              {/* App 2: CloudboyX MAP Protection */}
              <a
                id="drawer-link-map-scanner"
                href="https://map-protection-scanner.ai.studio"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white hover:bg-amber-50/60 border border-stone-200 hover:border-amber-400 flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800 group-hover:text-amber-700 leading-tight">
                      MAP Protection
                    </div>
                    <div className="text-[10px] text-stone-500">Protect &bull; Price Sentinel</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600" />
              </a>

              {/* App 3: CloudboyX ERP */}
              <a
                id="drawer-link-erp"
                href="https://cloudboyx-erp.ai.studio"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white hover:bg-emerald-50/60 border border-stone-200 hover:border-emerald-400 flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Boxes className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800 group-hover:text-emerald-700 leading-tight">
                      CloudboyX ERP
                    </div>
                    <div className="text-[10px] text-stone-500">Execute &bull; EDI / Connectors</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600" />
              </a>

              {/* App 4: CloudboyX Connect (Focal Standalone & Suite Add-On) */}
              <button
                type="button"
                id="drawer-link-connect"
                onClick={() => {
                  onSelectView('erp_connector');
                  onClose();
                }}
                className={`w-full p-2 rounded-xl border flex items-center justify-between transition-all group cursor-pointer text-left ${
                  activeView === 'erp_connector'
                    ? 'bg-[#caf0f8] border-[#0077b6] shadow-2xs'
                    : 'bg-white hover:bg-[#caf0f8]/40 border-[#0077b6]/40 hover:border-[#0077b6]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-[#0077b6] text-white flex items-center justify-center shadow-xs">
                    <Radio className="w-3.5 h-3.5 text-[#00d4ff]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#03045e] leading-tight flex items-center space-x-1.5">
                      <span>CloudboyX Connect</span>
                      <span className="px-1 py-0.2 rounded text-[8px] font-black bg-[#00d4ff] text-[#03045e]">
                        FOCAL
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500">Bridge &bull; Webhook &amp; EDI Gateway</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#0077b6]" />
              </button>
            </div>
          </div>

          {/* Quick Portfolio Balance Card */}
          <div
            onClick={() => {
              onOpenPortfolio();
              onClose();
            }}
            className="p-3.5 rounded-xl bg-gradient-to-br from-[#caf0f8]/90 via-[#caf0f8]/40 to-white border border-[#90e0ef] hover:border-[#0077b6] transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#03045e] uppercase tracking-wider flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>Simulated Bankroll</span>
              </span>
              {openPositionsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#0077b6] text-white text-[10px] font-bold">
                  {openPositionsCount} Open {openPositionsCount === 1 ? 'Trade' : 'Trades'}
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-[#03045e] tracking-tight font-mono">
                ${bankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-[#0077b6] group-hover:translate-x-0.5 transition-transform flex items-center">
                Portfolio &rarr;
              </span>
            </div>
          </div>

          {/* Section 1: Main Views */}
          <div>
            <h3 className="px-2 mb-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Primary Studios &amp; Views
            </h3>
            <div className="space-y-1">
              <button
                id="drawer-nav-model-studio-btn"
                onClick={() => {
                  onSelectView('model_studio');
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  activeView === 'model_studio'
                    ? 'bg-[#caf0f8] text-[#03045e] font-bold border border-[#90e0ef] shadow-2xs'
                    : 'text-stone-700 hover:bg-[#caf0f8]/30 hover:text-[#03045e] font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeView === 'model_studio'
                        ? 'bg-[#0077b6] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold">Probability Model Studio</div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      Linear &rarr; Logistic &rarr; Gemini AI models
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${
                    activeView === 'model_studio' ? 'text-[#0077b6]' : 'text-stone-300'
                  }`}
                />
              </button>

              <button
                id="drawer-nav-market-analyzer-btn"
                onClick={() => {
                  onSelectView('market_analyzer');
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  activeView === 'market_analyzer'
                    ? 'bg-[#caf0f8] text-[#03045e] font-bold border border-[#90e0ef] shadow-2xs'
                    : 'text-stone-700 hover:bg-[#caf0f8]/30 hover:text-[#03045e] font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeView === 'market_analyzer'
                        ? 'bg-[#0077b6] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold">Market Contract Analyzer</div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      Live events, multi-agent debate &amp; Kelly edge
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${
                    activeView === 'market_analyzer' ? 'text-[#0077b6]' : 'text-stone-300'
                  }`}
                />
              </button>

              <button
                id="drawer-nav-player-props-btn"
                onClick={() => {
                  onSelectView('player_props');
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  activeView === 'player_props'
                    ? 'bg-[#caf0f8] text-[#03045e] font-bold border border-[#90e0ef] shadow-2xs'
                    : 'text-stone-700 hover:bg-[#caf0f8]/30 hover:text-[#03045e] font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeView === 'player_props'
                        ? 'bg-[#0077b6] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold">NFL Predict</div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      Player props, matchups, points, predictions &amp; power ratings
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${
                    activeView === 'player_props' ? 'text-[#0077b6]' : 'text-stone-300'
                  }`}
                />
              </button>

              <button
                id="drawer-nav-erp-connector-btn"
                onClick={() => {
                  onSelectView('erp_connector');
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  activeView === 'erp_connector'
                    ? 'bg-gradient-to-r from-[#caf0f8] to-white text-[#03045e] font-bold border-2 border-[#0077b6] shadow-xs'
                    : 'text-stone-700 hover:bg-[#caf0f8]/30 hover:text-[#03045e] font-medium border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeView === 'erp_connector'
                        ? 'bg-[#03045e] text-[#00d4ff] shadow-xs'
                        : 'bg-stone-100 text-[#0077b6]'
                    }`}
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold flex items-center space-x-1.5">
                      <span>CloudboyX Connect</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#00d4ff] text-[#03045e]">
                        FOCAL
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-normal">
                      Enterprise Webhook &amp; EDI Studio (Standalone / Suite)
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${
                    activeView === 'erp_connector' ? 'text-[#0077b6]' : 'text-stone-300'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 2: Data Ingestion & Script Pipelines */}
          <div>
            <h3 className="px-2 mb-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Pipelines &amp; Automation
            </h3>
            <div className="space-y-1">
              <button
                id="drawer-nav-ingestion-hub-btn"
                onClick={() => {
                  onOpenIngestion();
                  onClose();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-stone-700 hover:bg-[#caf0f8]/30 hover:text-[#03045e] transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold flex items-center space-x-1.5">
                      <span>Multi-Source Ingestion Hub</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8] animate-pulse"></span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Market contracts, Yahoo Finance, web sentiment
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
                  Live
                </span>
              </button>

              <button
                id="drawer-nav-python-script-btn"
                onClick={() => {
                  onOpenPythonScript();
                  onClose();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-stone-700 hover:bg-[#caf0f8]/30 hover:text-[#03045e] transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] flex items-center justify-center">
                    <FileCode2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold">Python Pipeline Script</div>
                    <div className="text-[11px] text-stone-500">
                      <code className="font-mono text-[10px] bg-stone-100 px-1 py-0.2 rounded text-stone-700">ingest_and_model.py</code> execution engine
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300" />
              </button>

              {/* Active Research Export Button */}
              {activeAnalysis && (
                <button
                  id="drawer-export-analysis-btn"
                  onClick={() => {
                    if (onExportAnalysisData) onExportAnalysisData();
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-[#03045e] bg-[#caf0f8] hover:bg-[#90e0ef]/40 border border-[#90e0ef] transition-all cursor-pointer group"
                  title="Download current research analysis as JSON"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-[#0077b6] text-white flex items-center justify-center shadow-xs shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs sm:text-sm font-bold flex items-center space-x-1.5">
                        <span>Export Research (JSON)</span>
                      </div>
                      <div className="text-[11px] text-[#0077b6] truncate max-w-[170px]">
                        {activeAnalysis.eventTitle}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#0077b6] text-white shrink-0 ml-1">
                    JSON
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Section 3: Educational Guides & Rules */}
          <div>
            <h3 className="px-2 mb-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Instruction, Training &amp; Education
            </h3>
            <div className="space-y-1">
              <button
                id="drawer-nav-training-docs-btn"
                onClick={() => {
                  onOpenTrainingDocs();
                  onClose();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-[#03045e] bg-[#caf0f8]/60 hover:bg-[#caf0f8] border border-[#90e0ef] transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0077b6] text-white flex items-center justify-center shadow-xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold flex items-center space-x-1.5">
                      <span>Instruction &amp; Training Center</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#00b4d8] text-[#03045e] uppercase">
                        DOCS
                      </span>
                    </div>
                    <div className="text-[11px] text-[#0077b6]">
                      Training guide, operator manual &amp; exam
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <a
                    href="/api/docs/pdf/all"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 rounded-md text-[10px] font-extrabold bg-white border border-[#90e0ef] text-[#0077b6] hover:bg-[#0077b6] hover:text-white transition-colors flex items-center space-x-1"
                    title="Directly download instructions as PDF"
                  >
                    <Printer className="w-3 h-3" />
                    <span>PDF</span>
                  </a>
                  <ChevronRight className="w-4 h-4 text-[#0077b6] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                id="drawer-nav-mechanics-btn"
                onClick={() => {
                  onOpenMechanics();
                  onClose();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-stone-700 hover:bg-[#caf0f8]/30 hover:text-[#03045e] transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold">How to Trade Event Contracts</div>
                    <div className="text-[11px] text-stone-500">
                      Contract mechanics, payouts &amp; fee structure
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300" />
              </button>

              <button
                id="drawer-nav-eli6-btn"
                onClick={() => {
                  onOpenEli6();
                  onClose();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-stone-700 hover:bg-[#caf0f8]/30 hover:text-[#03045e] transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold">ELI6 Explainer</div>
                    <div className="text-[11px] text-stone-500">
                      Explain prediction markets like I am 6 years old
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer Status */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/70 space-y-2 text-xs">
          <div className="flex items-center justify-between text-stone-600">
            <span className="flex items-center space-x-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#0077b6]" />
              <span>Regulated Event Market</span>
            </span>
            <span className="font-mono text-[10px] text-stone-400">Consensus Feed v2</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00b4d8] animate-pulse" />
              <span>Probability Pipeline Live</span>
            </span>
            <span className="font-semibold text-[#03045e]">CloudboyX Predict</span>
          </div>
        </div>
      </aside>
    </>
  );
};
