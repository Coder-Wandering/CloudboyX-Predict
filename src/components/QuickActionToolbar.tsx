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
  Database,
  Sparkles,
} from 'lucide-react';

export interface QuickActionToolbarProps {
  activeView: 'model_studio' | 'market_analyzer' | 'erp_connector';
  onSelectView: (view: 'model_studio' | 'market_analyzer' | 'erp_connector') => void;
  bankroll: number;
  openPositionsCount: number;
  onOpenPortfolio: () => void;
  onOpenIngestion?: () => void;
  onOpenTrainingDocs: () => void;
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
  onOpenTrainingDocs,
  hasActiveAnalysis = false,
  onExportAnalysisData,
  onShareAnalysis,
  onOpenSuiteSwitcher,
}) => {
  return (
    <nav
      id="desktop-quick-action-floating-toolbar"
      aria-label="Desktop Quick Actions Toolbar"
      className="hidden md:block sticky top-14 sm:top-16 md:top-18 z-20 w-full px-4 sm:px-6 lg:px-8 py-2 pointer-events-none transition-all select-none"
    >
      <div className="max-w-7xl mx-auto">
        <div className="pointer-events-auto bg-white/92 backdrop-blur-md border border-stone-200/90 shadow-md hover:shadow-lg transition-all rounded-2xl p-1.5 sm:p-2 flex items-center justify-between gap-2.5">
          {/* Left Group: Direct Access Workspace Switchers */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {/* Quick Action Badge */}
            <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-600 border border-stone-200/80 text-[11px] font-bold uppercase tracking-wider shrink-0 mr-1">
              <Sparkles className="w-3 h-3 text-[#0077b6]" />
              <span>Quick Action</span>
            </div>

            {/* Model Studio Direct Button */}
            <button
              id="quick-action-model-studio-btn"
              onClick={() => onSelectView('model_studio')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'model_studio'
                  ? 'bg-[#03045e] text-white shadow-xs'
                  : 'text-stone-700 hover:text-[#03045e] hover:bg-stone-100'
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
                  ? 'bg-[#03045e] text-white shadow-xs'
                  : 'text-stone-700 hover:text-[#03045e] hover:bg-stone-100'
              }`}
              title="Switch directly to Market Contract Analyzer"
              aria-current={activeView === 'market_analyzer' ? 'page' : undefined}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Contract Analyzer</span>
            </button>

            {/* CloudboyX Connect Direct Button */}
            <button
              id="quick-action-erp-connector-btn"
              onClick={() => onSelectView('erp_connector')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'erp_connector'
                  ? 'bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white shadow-xs'
                  : 'text-stone-700 hover:text-[#03045e] hover:bg-stone-100'
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

          {/* Right Group: Direct Access to Paper Portfolio, Export Data, Ingestion, and Docs */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Direct Access: Data Ingestion Hub */}
            {onOpenIngestion && (
              <button
                id="quick-action-ingestion-btn"
                onClick={onOpenIngestion}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 hover:text-[#03045e] hover:bg-stone-100 border border-stone-200/80 transition-colors cursor-pointer"
                title="Direct access to Data Ingestion Hub without opening menus"
              >
                <Database className="w-3.5 h-3.5 text-[#0077b6]" />
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
                    ? 'bg-[#caf0f8]/80 hover:bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200'
                }`}
                title={
                  hasActiveAnalysis
                    ? 'Direct 1-click export of current research dataset as JSON'
                    : 'Export analysis dataset as JSON'
                }
              >
                <Download className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>Export Data</span>
                {hasActiveAnalysis && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Ready to export" />
                )}
              </button>
            )}

            {/* Direct Access: Training Docs Button */}
            <button
              id="quick-action-training-docs-btn"
              onClick={onOpenTrainingDocs}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 hover:text-[#03045e] hover:bg-stone-100 border border-stone-200/80 transition-colors cursor-pointer"
              title="Direct access to Training Documentation"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#0077b6]" />
              <span className="hidden lg:inline">Docs</span>
            </button>

            {/* Divider */}
            <div className="h-5 w-px bg-stone-200 mx-0.5" />

            {/* Direct Access: Paper Portfolio Button */}
            <button
              id="quick-action-paper-portfolio-btn"
              onClick={onOpenPortfolio}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#03045e] to-[#0077b6] hover:from-[#023e8a] hover:to-[#0096c7] text-white shadow-xs hover:shadow-sm transition-all cursor-pointer group"
              title="Direct access to Paper Portfolio & Simulated Bankroll without opening menus"
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
