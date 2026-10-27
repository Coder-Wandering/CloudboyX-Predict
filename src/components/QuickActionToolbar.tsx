import React from 'react';
import {
  Briefcase,
  Download,
  BarChart3,
  TrendingUp,
  Radio,
  Database,
  Sparkles,
  User,
} from 'lucide-react';
import { ActiveWorkspaceView } from '../types';

export interface QuickActionToolbarProps {
  activeView: ActiveWorkspaceView;
  onSelectView: (view: ActiveWorkspaceView) => void;
  bankroll: number;
  openPositionsCount: number;
  onOpenPortfolio: () => void;
  onOpenIngestion?: () => void;
  onOpenTrainingDocs?: () => void;
  hasActiveAnalysis?: boolean;
  onExportAnalysisData?: () => void;
  onShareAnalysis?: () => void;
  onOpenSuiteSwitcher?: () => void;
}

export const QuickActionToolbar: React.FC<QuickActionToolbarProps> = ({
  activeView,
  onSelectView,
  bankroll,
  openPositionsCount,
  onOpenPortfolio,
  onOpenIngestion,
  hasActiveAnalysis = false,
  onExportAnalysisData,
}) => {
  return (
    <nav
      id="desktop-quick-action-floating-toolbar"
      aria-label="Desktop Quick Actions Toolbar"
      className="hidden md:block sticky top-14 sm:top-16 md:top-18 z-20 w-full px-4 sm:px-6 lg:px-8 py-2 pointer-events-none transition-all select-none"
    >
      <div className="max-w-7xl mx-auto">
        <div className="pointer-events-auto bg-white/92 dark:bg-[#0c1322]/95 backdrop-blur-md border border-stone-200/90 dark:border-slate-800 shadow-md hover:shadow-lg transition-all rounded-2xl p-1.5 sm:p-2 flex items-center justify-between gap-2.5">
          {/* Left Group: Direct Access Workspace Switchers */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {/* Quick Action Badge */}
            <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 border border-stone-200/80 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider shrink-0 mr-1">
              <Sparkles className="w-3 h-3 text-[#0077b6] dark:text-[#00d4ff]" />
              <span>Quick Action</span>
            </div>

            {/* Model Studio Direct Button */}
            <button
              id="quick-action-model-studio-btn"
              onClick={() => onSelectView('model_studio')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'model_studio'
                  ? 'bg-[#03045e] text-white shadow-xs dark:bg-[#0077b6]'
                  : 'text-stone-700 dark:text-slate-300 hover:text-[#03045e] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/80'
              }`}
              title="Switch directly to Probability Model Studio"
              aria-current={activeView === 'model_studio' ? 'page' : undefined}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Model Studio</span>
            </button>

            {/* Contract Analyzer Direct Button */}
            <button
              id="quick-action-market-analyzer-btn"
              onClick={() => onSelectView('market_analyzer')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'market_analyzer'
                  ? 'bg-[#03045e] text-white shadow-xs dark:bg-[#0077b6]'
                  : 'text-stone-700 dark:text-slate-300 hover:text-[#03045e] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/80'
              }`}
              title="Switch directly to Market Contract Analyzer"
              aria-current={activeView === 'market_analyzer' ? 'page' : undefined}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Contract Analyzer</span>
            </button>

            {/* NFL Predict Direct Button */}
            <button
              id="quick-action-player-props-btn"
              onClick={() => onSelectView('player_props')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'player_props'
                  ? 'bg-[#03045e] text-white shadow-xs dark:bg-[#0077b6]'
                  : 'text-stone-700 dark:text-slate-300 hover:text-[#03045e] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/80'
              }`}
              title="Switch directly to NFL Predict (Player props, matchups, score predictions & value edges)"
              aria-current={activeView === 'player_props' ? 'page' : undefined}
            >
              <User className="w-3.5 h-3.5" />
              <span>NFL Predict</span>
            </button>

            {/* CloudboyX Connect Direct Button */}
            <button
              id="quick-action-erp-connector-btn"
              onClick={() => onSelectView('erp_connector')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'erp_connector'
                  ? 'bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white shadow-xs dark:from-[#0077b6] dark:to-[#00b4d8]'
                  : 'text-stone-700 dark:text-slate-300 hover:text-[#03045e] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/80'
              }`}
              title="Switch directly to CloudboyX Connect (Universal Webhook & EDI Studio)"
              aria-current={activeView === 'erp_connector' ? 'page' : undefined}
            >
              <Radio className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span>CloudboyX Connect</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${
                  activeView === 'erp_connector'
                    ? 'bg-[#00d4ff] text-[#03045e]'
                    : 'bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]'
                }`}
              >
                Focal
              </span>
            </button>
          </div>

          {/* Right Group: Direct Access to Ingestion Hub, Export Data, and Paper Portfolio */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Direct Access: Data Ingestion Hub */}
            {onOpenIngestion && (
              <button
                id="quick-action-ingestion-btn"
                onClick={onOpenIngestion}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 dark:text-slate-300 hover:text-[#03045e] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                title="Direct access to Data Ingestion Hub"
              >
                <Database className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#00d4ff]" />
                <span className="hidden xl:inline">Data</span>
                <span>Ingestion</span>
              </button>
            )}

            {/* Direct Access: Export Data Button */}
            {onExportAnalysisData && (
              <button
                id="quick-action-export-data-btn"
                onClick={onExportAnalysisData}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  hasActiveAnalysis
                    ? 'bg-[#caf0f8]/80 hover:bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] shadow-2xs dark:bg-[#0077b6]/30 dark:text-[#caf0f8] dark:border-[#0077b6]/50'
                    : 'bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-slate-700'
                }`}
                title={
                  hasActiveAnalysis
                    ? 'Direct 1-click export of current research dataset as JSON'
                    : 'Export analysis dataset as JSON'
                }
              >
                <Download className="w-3.5 h-3.5 text-[#0077b6] dark:text-[#00d4ff]" />
                <span>Export Data</span>
                {hasActiveAnalysis && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Ready to export" />
                )}
              </button>
            )}

            {/* Divider */}
            <div className="h-5 w-px bg-stone-200 dark:bg-slate-700 mx-0.5" />

            {/* Direct Access: Paper Portfolio Button */}
            <button
              id="quick-action-paper-portfolio-btn"
              onClick={onOpenPortfolio}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#03045e] to-[#0077b6] hover:from-[#023e8a] hover:to-[#0096c7] text-white shadow-xs hover:shadow-sm transition-all cursor-pointer group"
              title="Direct access to Paper Portfolio & Simulated Bankroll"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#00d4ff] group-hover:scale-110 transition-transform" />
              <div className="flex items-center space-x-1.5">
                <span className="hidden lg:inline font-medium text-[#caf0f8]">Portfolio:</span>
                <span className="font-mono font-bold tracking-tight">
                  ${bankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {openPositionsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#00d4ff] text-[#03045e] shadow-2xs">
                  {openPositionsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default QuickActionToolbar;
