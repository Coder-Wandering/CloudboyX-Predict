import React from 'react';
import {
  Briefcase,
  BookOpen,
  Printer,
  Download,
  BarChart3,
  TrendingUp,
  Radio,
  Boxes,
  Share2,
  User,
  Trophy,
} from 'lucide-react';
import { ActiveWorkspaceView } from '../types';

interface WorkspaceToolbarProps {
  activeView: ActiveWorkspaceView;
  onSelectView: (view: ActiveWorkspaceView) => void;
  bankroll: number;
  openPositionsCount: number;
  onOpenPortfolio: () => void;
  onOpenTrainingDocs: () => void;
  hasActiveAnalysis?: boolean;
  onExportAnalysisData?: () => void;
  onShareAnalysis?: () => void;
  onOpenSuiteSwitcher?: () => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  activeView,
  onSelectView,
  bankroll,
  openPositionsCount,
  onOpenPortfolio,
  onOpenTrainingDocs,
  hasActiveAnalysis,
  onExportAnalysisData,
  onShareAnalysis,
  onOpenSuiteSwitcher,
}) => {
  return (
    <div
      id="workspace-toolbar-section"
      className="md:hidden bg-white rounded-2xl border border-stone-200 p-2.5 sm:p-3.5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-2.5"
    >
      {/* Left: View Switcher Tabs & Live Status */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full py-0.5">
        {/* Studio View Selector Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200/80 shrink-0">
          <button
            id="toolbar-model-studio-tab"
            onClick={() => onSelectView('model_studio')}
            className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeView === 'model_studio'
                ? 'bg-[#03045e] text-white shadow-xs'
                : 'text-stone-600 hover:text-[#03045e] hover:bg-stone-200/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Model Studio</span>
          </button>

          <button
            id="toolbar-market-analyzer-tab"
            onClick={() => onSelectView('market_analyzer')}
            className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeView === 'market_analyzer'
                ? 'bg-[#03045e] text-white shadow-xs'
                : 'text-stone-600 hover:text-[#03045e] hover:bg-stone-200/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Contract Analyzer</span>
          </button>

          <button
            id="toolbar-player-props-tab"
            onClick={() => onSelectView('player_props')}
            className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeView === 'player_props'
                ? 'bg-[#03045e] text-white shadow-xs'
                : 'text-stone-600 hover:text-[#03045e] hover:bg-stone-200/60'
            }`}
            title="NFL Predict: Player Props, Trench Matchups, Over/Under Points, Score Predictions & Power Ratings"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>NFL Predict</span>
          </button>

          <button
            id="toolbar-erp-connector-tab"
            onClick={() => onSelectView('erp_connector')}
            className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeView === 'erp_connector'
                ? 'bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white shadow-xs'
                : 'text-stone-700 hover:text-[#03045e] hover:bg-stone-200/60'
            }`}
            title="CloudboyX Connect: Standalone Gateway & Suite Add-On (Universal Webhook & EDI Studio)"
          >
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00d4ff] animate-pulse" />
            <span>CloudboyX Connect</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
              activeView === 'erp_connector'
                ? 'bg-[#00d4ff] text-[#03045e]'
                : 'bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]'
            }`}>
              Focal
            </span>
          </button>
        </div>

        {/* Live Exchange API Badge */}
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#caf0f8]/60 text-[#03045e] border border-[#90e0ef] text-xs font-semibold shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-pulse"></span>
          <span className="hidden xs:inline">Kalshi API</span>
          <span>Live</span>
        </div>
      </div>

      {/* Right: Quick Action Controls (Suite, Docs, Export, Portfolio) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar max-w-full py-0.5 shrink-0">
        {/* Enterprise Suite Switcher Button */}
        {onOpenSuiteSwitcher && (
          <button
            id="toolbar-suite-switcher-btn"
            onClick={onOpenSuiteSwitcher}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#caf0f8]/60 hover:bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] transition-colors cursor-pointer shrink-0"
            title="Open CloudboyX Enterprise Suite Switcher (Predict, MAP, ERP)"
          >
            <Boxes className="w-3.5 h-3.5 text-[#0077b6]" />
            <span className="hidden sm:inline">Suite Switcher</span>
            <span className="inline sm:hidden">Suite</span>
          </button>
        )}

        {/* Instruction & Training Docs Button */}
        <button
          id="toolbar-training-docs-btn"
          onClick={onOpenTrainingDocs}
          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-[#caf0f8]/50 text-stone-700 hover:text-[#03045e] border border-stone-200 hover:border-[#90e0ef] transition-colors cursor-pointer shrink-0"
          title="Open instruction and training documentation"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#0077b6]" />
          <span className="hidden sm:inline">Docs &amp; Training</span>
          <span className="inline sm:hidden">Docs</span>
        </button>

        {/* Direct PDF Download Link */}
        <a
          id="toolbar-pdf-download-btn"
          href="/api/docs/pdf/all"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1 px-2 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-[#caf0f8]/50 text-stone-700 hover:text-[#0077b6] border border-stone-200 hover:border-[#90e0ef] transition-colors cursor-pointer shrink-0"
          title="Download complete instruction manual as PDF"
        >
          <Printer className="w-3.5 h-3.5 text-[#0077b6]" />
          <span>PDF</span>
        </a>

        {/* Export Current Analysis Data JSON */}
        {hasActiveAnalysis && onExportAnalysisData && (
          <button
            id="toolbar-export-data-btn"
            onClick={onExportAnalysisData}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#caf0f8] text-[#03045e] hover:bg-[#90e0ef]/60 border border-[#90e0ef] transition-colors cursor-pointer shrink-0"
            title="Download current analysis object as a JSON file"
          >
            <Download className="w-3.5 h-3.5 text-[#0077b6]" />
            <span className="hidden sm:inline">Export Data</span>
            <span className="inline sm:hidden">Export</span>
          </button>
        )}

        {/* Share Analysis Button */}
        {hasActiveAnalysis && onShareAnalysis && (
          <button
            id="toolbar-share-analysis-btn"
            type="button"
            onClick={onShareAnalysis}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#caf0f8] text-[#03045e] hover:bg-[#90e0ef]/60 border border-[#90e0ef] transition-colors cursor-pointer shrink-0"
            title="Share analysis by recommended platforms (X, LinkedIn, Telegram, WhatsApp, Slack)"
          >
            <Share2 className="w-3.5 h-3.5 text-[#0077b6]" />
            <span>Share</span>
          </button>
        )}

        {/* Simulated Paper Trading Portfolio Button */}
        <button
          id="toolbar-portfolio-btn"
          onClick={onOpenPortfolio}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-[#03045e] text-white hover:bg-[#0077b6] border border-[#03045e] transition-colors cursor-pointer shadow-2xs shrink-0"
          title="Open simulated paper trading portfolio"
        >
          <Briefcase className="w-3.5 h-3.5 text-[#90e0ef]" />
          <span className="font-mono font-bold text-xs sm:text-sm">
            ${bankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {openPositionsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#00b4d8] text-[#03045e] text-[10px] font-black">
              {openPositionsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
