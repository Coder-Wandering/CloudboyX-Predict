import React from 'react';
import { Menu, ShieldCheck, LogOut, User, Sun, Moon } from 'lucide-react';
import { CloudboyXLogo } from './CloudboyXLogo';
import { UserSession } from './AccessGateModal';
import { ActiveWorkspaceView } from '../types';

export interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenSuiteSwitcher?: () => void;
  activeView?: ActiveWorkspaceView;
  onSelectView?: (view: ActiveWorkspaceView) => void;
  bankroll?: number;
  openPositionsCount?: number;
  onOpenPortfolio?: () => void;
  onOpenIngestion?: () => void;
  onOpenPythonScript?: () => void;
  onOpenMechanics?: () => void;
  onOpenEli6?: () => void;
  onOpenTrainingDocs?: () => void;
  hasActiveAnalysis?: boolean;
  onExportAnalysisData?: () => void;
  onShareAnalysis?: () => void;
  onResetBankroll?: () => void;
  onAddBankrollFunds?: (amount: number) => void;
  userSession?: UserSession | null;
  onSignOut?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  userSession,
  onSignOut,
  theme = 'light',
  onToggleTheme,
}) => {
  return (
    <header
      id="main-app-header"
      className="border-b border-stone-200 bg-white/95 sticky top-0 z-30 backdrop-blur-md shadow-xs select-none transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 md:h-18 flex items-center justify-between">
        {/* Three lines for universal menu + Cloudboy Predict */}
        <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0">
          {/* Three Lines Universal Sidebar Menu Trigger */}
          <button
            id="universal-hamburger-menu-btn"
            onClick={onToggleSidebar}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-[#03045e] hover:text-[#0077b6] hover:bg-[#caf0f8]/50 active:bg-[#90e0ef]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0077b6] cursor-pointer flex items-center justify-center group shrink-0"
            aria-label="Open universal navigation menu"
            title="Open universal navigation menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4] group-hover:scale-105 transition-transform" />
          </button>

          {/* Cloudboy Predict Brand Lockup */}
          <div
            id="header-brand-lockup"
            onClick={onToggleSidebar}
            className="flex items-center cursor-pointer select-none group min-w-0"
            title="Cloudboy Predict - Click to open universal navigation menu"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleSidebar?.();
              }
            }}
            aria-label="Cloudboy Predict"
          >
            <CloudboyXLogo
              size={32}
              variant="badge"
              includePredict={true}
              className="transition-transform group-hover:scale-[1.01]"
            />
          </div>
        </div>

        {/* Right Action: Light/Dark Theme Quick Toggle, User Session Pill & Menu indicator */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Light / Dark Theme Toggle */}
          <button
            type="button"
            id="header-theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            title={theme === 'dark' ? 'Switch to Light Theme (tap to change)' : 'Switch to Dark Theme (tap to change)'}
            className={`group relative flex items-center h-8 sm:h-9 px-2.5 sm:px-3 rounded-full border transition-all duration-200 cursor-pointer shadow-2xs select-none active:scale-95 ${
              theme === 'dark'
                ? 'bg-slate-800/95 border-slate-700 hover:bg-slate-700/90 text-amber-300'
                : 'bg-stone-100 border-stone-200 hover:bg-stone-200/80 text-stone-700'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00b4d8] fill-[#00b4d8]/20 transition-transform group-hover:-rotate-12" />
                  <span className="text-[11px] sm:text-xs font-bold font-mono tracking-tight text-slate-200">
                    Dark
                  </span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500/20 transition-transform group-hover:rotate-45" />
                  <span className="text-[11px] sm:text-xs font-bold font-mono tracking-tight text-stone-700">
                    Light
                  </span>
                </>
              )}
            </div>
          </button>

          {userSession && (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold truncate max-w-[120px] sm:max-w-[180px]">
                  {userSession.username}
                </span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-mono">
                  {userSession.role.split(' ')[0]}
                </span>
              </div>

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Lock / Sign Out of Session"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Subtle quick indicator that universal drawer is accessible */}
          <div
            onClick={onToggleSidebar}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-400 hover:text-[#0077b6] hover:bg-stone-50 cursor-pointer transition-colors"
            title="Open universal navigation menu"
          >
            <span className="text-[11px] font-mono tracking-wide">Menu</span>
            <kbd className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px] text-stone-500 font-mono shadow-2xs">
              ⌘+K / Esc
            </kbd>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
