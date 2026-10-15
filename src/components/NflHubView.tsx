import React, { useState } from 'react';
import {
  NflPlayerPropsResponse,
  NflSubModelTab,
} from '../types';
import {
  User,
  Swords,
  Activity,
  Trophy,
  Zap,
  BookOpen,
  Calendar,
  Tv,
  ChevronDown,
  Sparkles,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { NFL_GAME_MODEL_SUITES } from '../data/nflModelsData';
import { PlayerPropsAnalyzerView } from './PlayerPropsAnalyzerView';
import { NflMatchupModel } from './NflMatchupModel';
import { NflPointsModel } from './NflPointsModel';
import { NflPredictionsModel } from './NflPredictionsModel';
import { NflPredictionsDashboard } from './NflPredictionsDashboard';
import { NflPowerRatingsModel } from './NflPowerRatingsModel';
import { NflIndustryBenchmarks } from './NflIndustryBenchmarks';

interface NflHubViewProps {
  playerPropsData: NflPlayerPropsResponse | null;
  isLoadingProps: boolean;
  onRefreshProps: () => void;
  selectedMatchup: string;
  onSelectMatchup: (matchup: string) => void;
  initialSearchQuery?: string;
}

export const NflHubView: React.FC<NflHubViewProps> = ({
  playerPropsData,
  isLoadingProps,
  onRefreshProps,
  selectedMatchup,
  onSelectMatchup,
  initialSearchQuery,
}) => {
  // Current active sub-model tab
  const [activeModelTab, setActiveModelTab] = useState<NflSubModelTab>('props');

  // Currently selected game suite
  const [selectedGameKey, setSelectedGameKey] = useState<string>('game-bal-kc');

  const currentSuite =
    NFL_GAME_MODEL_SUITES[selectedGameKey] || NFL_GAME_MODEL_SUITES['game-bal-kc'];

  const handleGameSelect = (gameKey: string) => {
    setSelectedGameKey(gameKey);
    const suite = NFL_GAME_MODEL_SUITES[gameKey];
    if (suite) {
      onSelectMatchup(suite.matchupTitle);
    }
  };

  return (
    <div id="nfl-hub-view" className="space-y-6">
      {/* Top Workspace Header & Matchup Selector */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#caf0f8] text-[#03045e] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>NFL Quantitative Modeling Suite</span>
              </span>
              <span className="text-xs font-bold text-stone-500">
                Multi-Model Analytics &amp; Monte Carlo Sim
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#03045e] mt-1 tracking-tight">
              NFL Predictive Models &amp; Analytics Hub
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Explore specialized econometric models across player props, trench matchups, over/under game totals, score predictions, power ratings, and sports forecasting site architectures.
            </p>
          </div>

          {/* Matchup Quick Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
              <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mb-1 px-1 flex items-center justify-between">
                <span>Select Marquee Matchup</span>
                <Calendar className="w-3 h-3 text-[#0077b6]" />
              </div>
              <select
                id="nfl-hub-matchup-select"
                value={selectedGameKey}
                onChange={(e) => handleGameSelect(e.target.value)}
                className="w-full text-xs font-bold text-[#03045e] bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0077b6] cursor-pointer"
              >
                <option value="game-bal-kc">BAL @ KC (Thursday Night Kickoff)</option>
                <option value="game-gb-phi">GB vs PHI (São Paulo Friday)</option>
                <option value="game-lar-det">LAR @ DET (Sunday Night Dome)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selected Game Slate Info Banner */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 font-extrabold text-[#03045e]">
              <span>Active Game:</span>
              <span className="text-stone-800">{currentSuite.matchupTitle}</span>
            </div>
            <span className="hidden sm:inline text-stone-300">&bull;</span>
            <div className="flex items-center space-x-1 text-stone-600">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{currentSuite.kickoffTime}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 flex items-center space-x-1">
              <Tv className="w-3 h-3 text-[#0077b6]" />
              <span>{currentSuite.network}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Model Navigation Bar (Sub-tabs under NFL Tab) */}
      <div className="p-2 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {/* Tab 1: Player Props */}
          <button
            type="button"
            id="nfl-subtab-player-props"
            onClick={() => setActiveModelTab('props')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-2 ${
              activeModelTab === 'props'
                ? 'bg-[#03045e] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Player Props Model</span>
            <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black uppercase bg-amber-500 text-stone-950">
              <Flame className="w-2.5 h-2.5 fill-current text-rose-700" />
              <span>HOT</span>
            </span>
          </button>

          {/* Tab 2: Matchup Model */}
          <button
            type="button"
            id="nfl-subtab-matchup"
            onClick={() => setActiveModelTab('matchup')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-2 ${
              activeModelTab === 'matchup'
                ? 'bg-[#03045e] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Matchup Model</span>
          </button>

          {/* Tab 3: Points Model */}
          <button
            type="button"
            id="nfl-subtab-points"
            onClick={() => setActiveModelTab('points')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-2 ${
              activeModelTab === 'points'
                ? 'bg-[#03045e] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Points &amp; Over/Under</span>
            <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>TRENDING</span>
            </span>
          </button>

          {/* Tab 4: Predictions Model */}
          <button
            type="button"
            id="nfl-subtab-predictions"
            onClick={() => setActiveModelTab('predictions')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-2 ${
              activeModelTab === 'predictions'
                ? 'bg-[#03045e] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Predictions Dashboard</span>
            <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white animate-pulse">
              <Flame className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
              <span>HOT &bull; 24h</span>
            </span>
          </button>

          {/* Tab 5: Situational & Power Ratings */}
          <button
            type="button"
            id="nfl-subtab-power-ratings"
            onClick={() => setActiveModelTab('power_ratings')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-2 ${
              activeModelTab === 'power_ratings'
                ? 'bg-[#03045e] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Power &amp; Situational</span>
          </button>

          {/* Tab 6: Industry Site Benchmarks */}
          <button
            type="button"
            id="nfl-subtab-site-benchmarks"
            onClick={() => setActiveModelTab('site_benchmarks')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-2 ${
              activeModelTab === 'site_benchmarks'
                ? 'bg-[#03045e] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Site Benchmarks</span>
          </button>
        </div>
      </div>

      {/* Render Active Sub-Model View */}
      {activeModelTab === 'props' && (
        <PlayerPropsAnalyzerView
          data={playerPropsData}
          isLoading={isLoadingProps}
          onRefresh={onRefreshProps}
          selectedMatchup={selectedMatchup}
          onSelectMatchup={onSelectMatchup}
          initialSearchQuery={initialSearchQuery}
        />
      )}

      {activeModelTab === 'matchup' && (
        <NflMatchupModel
          data={currentSuite.matchupData}
          onSelectProps={() => setActiveModelTab('props')}
          onSelectPredictions={() => setActiveModelTab('predictions')}
        />
      )}

      {activeModelTab === 'points' && (
        <NflPointsModel
          data={currentSuite.pointsData}
          onSelectPredictions={() => setActiveModelTab('predictions')}
          onSelectMatchup={() => setActiveModelTab('matchup')}
        />
      )}

      {activeModelTab === 'predictions' && (
        <NflPredictionsDashboard
          predictionsData={currentSuite.predictionsData}
          pointsData={currentSuite.pointsData}
          powerRatingsData={currentSuite.powerRatingsData}
          onSelectProps={() => setActiveModelTab('props')}
          onSelectMatchup={() => setActiveModelTab('matchup')}
        />
      )}

      {activeModelTab === 'power_ratings' && (
        <NflPowerRatingsModel
          data={currentSuite.powerRatingsData}
          onSelectPredictions={() => setActiveModelTab('predictions')}
          onSelectMatchup={() => setActiveModelTab('matchup')}
        />
      )}

      {activeModelTab === 'site_benchmarks' && (
        <NflIndustryBenchmarks
          onSelectModelTab={(tab) => setActiveModelTab(tab as NflSubModelTab)}
        />
      )}
    </div>
  );
};
