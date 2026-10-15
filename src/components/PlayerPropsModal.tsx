import React, { useState, useMemo } from 'react';
import { NflPlayerProp, NflPlayerPropsResponse } from '../types';
import {
  X,
  User,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Search,
  Check,
  Award,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  RotateCcw,
  History,
  Clock,
} from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { getPropLineMovement } from '../data/nflPlayerProps';
import { propMatchesRecentSearch } from './PlayerPropsAnalyzerView';

interface PlayerPropsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: NflPlayerPropsResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  onPlacePaperBet?: (playerName: string, propType: string, side: 'OVER' | 'UNDER', line: number) => void;
}

export const PlayerPropsModal: React.FC<PlayerPropsModalProps> = ({
  isOpen,
  onClose,
  data,
  isLoading,
  onRefresh,
  onPlacePaperBet,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [filterByRecentSearches, setFilterByRecentSearches] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 250);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [betFeedback, setBetFeedback] = useState<string | null>(null);

  // Local storage-backed recent searches for player props
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nfl_player_props_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return ['Mahomes', 'Lamar Jackson', 'Passing Yards', 'Derrick Henry', 'Receiving Yards'];
  });

  const saveRecentSearch = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('nfl_player_props_recent_searches', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== itemToRemove);
      try {
        localStorage.setItem('nfl_player_props_recent_searches', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearAllRecentSearches = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('nfl_player_props_recent_searches');
    } catch {
      // ignore
    }
  };

  const handleSelectRecentSearch = (query: string) => {
    setSearchQuery(query);
    saveRecentSearch(query);
    setIsSearchFocused(false);
  };

  React.useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      saveRecentSearch(debouncedSearchQuery.trim());
    }
  }, [debouncedSearchQuery]);

  const propsList: NflPlayerProp[] = useMemo(() => {
    return data?.props || [];
  }, [data]);

  const matchingRecentPropsCount = useMemo(() => {
    if (recentSearches.length === 0) return 0;
    return propsList.filter((p) => propMatchesRecentSearch(p, recentSearches)).length;
  }, [propsList, recentSearches]);

  const filteredProps = useMemo(() => {
    return propsList.filter((prop) => {
      if (selectedType !== 'ALL' && prop.propType !== selectedType) {
        return false;
      }
      if (selectedTeam !== 'ALL' && prop.team !== selectedTeam) {
        return false;
      }
      if (filterByRecentSearches) {
        if (!propMatchesRecentSearch(prop, recentSearches)) {
          return false;
        }
      }
      if (debouncedSearchQuery.trim()) {
        const q = debouncedSearchQuery.toLowerCase();
        const matchesName = prop.playerName.toLowerCase().includes(q);
        const matchesTeam = prop.team.toLowerCase().includes(q);
        const matchesOpp = prop.opponent.toLowerCase().includes(q);
        const matchesProp = prop.propType.toLowerCase().includes(q);
        if (!matchesName && !matchesTeam && !matchesOpp && !matchesProp) {
          return false;
        }
      }
      return true;
    });
  }, [propsList, selectedType, selectedTeam, filterByRecentSearches, recentSearches, debouncedSearchQuery]);

  if (!isOpen) return null;

  const handleBetClick = (prop: NflPlayerProp, side: 'OVER' | 'UNDER') => {
    onPlacePaperBet?.(prop.playerName, prop.propType, side, prop.consensusLine);
    setBetFeedback(`Simulated Paper Bet placed: ${prop.playerName} ${side} ${prop.consensusLine} ${prop.unit}`);
    setTimeout(() => setBetFeedback(null), 3000);
  };

  return (
    <div
      id="nfl-player-props-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#03045e] via-[#023e8a] to-[#0077b6] text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-[#caf0f8]/20 border border-[#90e0ef]/30 text-[#caf0f8]">
                <User className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                NFL Live Player Props &amp; Yardage Projections
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00b4d8] text-[#03045e]">
                LIVE MOCK API
              </span>
            </div>
            <p className="text-xs text-[#caf0f8]/90">
              {data?.matchup || 'Kansas City Chiefs vs Baltimore Ravens'} &bull; Source: {data?.source || 'NFL NextGen Stats & PFF Probability Engine'}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              id="refresh-player-props-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-[#caf0f8] border border-white/20 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh live mock player stats"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              id="close-player-props-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert if bet placed */}
        {betFeedback && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-1">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{betFeedback}</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-mono">Paper Portfolio Updated</span>
          </div>
        )}

        {/* Controls & Filter Bar */}
        <div className="p-3 sm:p-4 bg-stone-50 border-b border-stone-200 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1" id="modal-player-props-search-wrapper">
              <label htmlFor="search-player-props-input" className="sr-only">
                Search Player or Stat...
              </label>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                id="search-player-props-input"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    saveRecentSearch(searchQuery.trim());
                    setIsSearchFocused(false);
                  } else if (e.key === 'Escape') {
                    setIsSearchFocused(false);
                  }
                }}
                placeholder="Search Player or Stat..."
                aria-label="Search Player or Stat..."
                autoComplete="off"
                className="w-full pl-9 pr-9 py-1.5 rounded-xl text-xs bg-white border border-stone-200 focus:outline-hidden focus:border-[#0077b6] text-stone-900 placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  id="modal-clear-props-input-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Clear search text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Local Storage-backed Recent Searches Dropdown & Tag List */}
              {isSearchFocused && (
                <div
                  id="modal-recent-player-props-searches-dropdown"
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute left-0 right-0 top-full mt-1.5 z-40 p-3 bg-white rounded-xl border border-stone-200 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-700">
                      <History className="w-3.5 h-3.5 text-[#0077b6]" />
                      <span>Recent Searches</span>
                      <span className="text-[10px] font-semibold text-stone-400">({recentSearches.length})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {recentSearches.length > 0 && (
                        <button
                          type="button"
                          id="modal-quick-filter-recent-searches-btn"
                          onClick={() => {
                            setFilterByRecentSearches(true);
                            setIsSearchFocused(false);
                          }}
                          className="text-[11px] font-bold text-[#0077b6] hover:text-[#03045e] transition-colors cursor-pointer"
                        >
                          Quick-Filter ({matchingRecentPropsCount})
                        </button>
                      )}
                      {recentSearches.length > 0 && (
                        <button
                          type="button"
                          id="modal-clear-all-recent-searches-btn"
                          onClick={clearAllRecentSearches}
                          className="text-[11px] font-semibold text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Clear History
                        </button>
                      )}
                    </div>
                  </div>

                  {recentSearches.length === 0 ? (
                    <div className="py-2 text-center text-xs text-stone-400">
                      No recent searches stored.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((item) => (
                        <div
                          key={item}
                          onClick={() => handleSelectRecentSearch(item)}
                          className="group inline-flex items-center space-x-1.5 pl-2 pr-1 py-0.5 rounded-lg text-xs font-semibold bg-stone-50 hover:bg-[#caf0f8]/50 text-stone-700 hover:text-[#03045e] border border-stone-200 hover:border-[#0077b6]/40 transition-all cursor-pointer shadow-2xs"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSelectRecentSearch(item);
                          }}
                        >
                          <Clock className="w-3 h-3 text-stone-400 group-hover:text-[#0077b6]" />
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(e, item)}
                            className="p-0.5 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
                            title={`Remove "${item}" from recent searches`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick-Filter Recent Searches button */}
            <button
              type="button"
              id="modal-recent-searches-quick-filter-btn"
              onClick={() => setFilterByRecentSearches((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 border ${
                filterByRecentSearches
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'bg-stone-100 hover:bg-[#caf0f8]/60 text-stone-700 hover:text-[#03045e] border-stone-200'
              }`}
              title="Toggle quick-filter: display only player props matching Recent Searches"
            >
              <History className="w-3.5 h-3.5" />
              <span>Recent Searches</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  filterByRecentSearches ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {matchingRecentPropsCount}
              </span>
            </button>

            {/* Clear-All Button */}
            <button
              type="button"
              id="modal-clear-all-props-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedTeam('ALL');
                setSelectedType('ALL');
                setFilterByRecentSearches(false);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200 transition-colors cursor-pointer shrink-0 flex items-center space-x-1"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3 text-stone-500" />
              <span>Clear</span>
            </button>

            {/* Team Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'KC', 'BAL', 'DET', 'GB', 'BUF', 'MIA'].map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => setSelectedTeam(team)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedTeam === team
                      ? 'bg-[#03045e] text-white shadow-2xs'
                      : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {team === 'ALL' ? 'All Teams' : team}
                </button>
              ))}
            </div>
          </div>

          {/* Prop Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'All Props' },
              { id: 'Passing Yards', label: 'Passing Yards' },
              { id: 'Rushing Yards', label: 'Rushing Yards' },
              { id: 'Receiving Yards', label: 'Receiving Yards' },
              { id: 'Passing TDs', label: 'Passing TDs' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedType === tab.id
                    ? 'bg-[#0077b6] text-white'
                    : 'bg-stone-200/70 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="text-stone-400 text-xs px-1">|</span>
            <span className="text-[11px] text-stone-500 font-medium">
              Showing {filteredProps.length} live {filteredProps.length === 1 ? 'prop' : 'props'}
            </span>
          </div>
        </div>

        {/* Props Cards Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0077b6] animate-spin mx-auto" />
              <p className="text-xs text-stone-600 font-medium">
                Querying mock NFL telemetry feed for live player yardage lines...
              </p>
            </div>
          ) : filteredProps.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <User className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-sm font-bold text-stone-700">No matching player props found</p>
              <p className="text-xs text-stone-500">
                Try clearing your search query or switching the prop category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProps.map((prop) => {
                const diff = Number((prop.modelProjection - prop.consensusLine).toFixed(1));
                const diffLabel = diff > 0 ? `+${diff} ${prop.unit}` : `${diff} ${prop.unit}`;
                const isOver = prop.modelRecommendation === 'OVER';
                const isUnder = prop.modelRecommendation === 'UNDER';

                return (
                  <div
                    key={prop.id}
                    id={`player-prop-card-${prop.id}`}
                    className="p-4 rounded-xl border border-stone-200 bg-white hover:border-[#90e0ef] hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                  >
                    {/* Top Row: Player Info & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-extrabold text-[#03045e]">
                            {prop.playerName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef]">
                            {prop.position}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-stone-100 text-stone-700">
                            {prop.team} vs {prop.opponent}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-stone-600">
                          {prop.propType}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        {prop.injuryStatus === 'Active' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            <span>{prop.injuryStatus}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Matchup Tactical Note */}
                    <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 leading-snug">
                      <span className="font-semibold text-stone-700">Matchup Note:</span> {prop.matchupContext}
                    </div>

                    {/* Metric Comparison: Consensus Line vs Model Projection */}
                    {(() => {
                      const movement = getPropLineMovement(prop);
                      return (
                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#caf0f8]/20 border border-[#90e0ef]/70">
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                Current Line
                              </div>
                              {/* Directional Shift Arrow Badge */}
                              <span
                                className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[9.5px] font-extrabold uppercase ${
                                  movement.direction === 'up'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : movement.direction === 'down'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                                }`}
                              >
                                {movement.direction === 'up' && <ArrowUp className="w-2.5 h-2.5 text-emerald-700 stroke-[2.5]" />}
                                {movement.direction === 'down' && <ArrowDown className="w-2.5 h-2.5 text-rose-700 stroke-[2.5]" />}
                                {movement.direction === 'stable' && <Minus className="w-2.5 h-2.5 text-stone-500 stroke-[2.5]" />}
                                <span>{movement.direction === 'stable' ? 'STABLE' : `${movement.deltaFormatted}`}</span>
                              </span>
                            </div>
                            <div className="flex items-baseline space-x-1 mt-0.5">
                              <span className="text-lg font-black text-stone-900">
                                {prop.consensusLine}
                              </span>
                              <span className="text-xs text-stone-500 font-semibold">{prop.unit}</span>
                            </div>
                            <div className="text-[10px] text-stone-500 font-mono mt-0.5 flex flex-wrap items-center gap-1">
                              <span>Open: {movement.openingLine} {prop.unit}</span>
                              <span className="text-stone-400">&bull;</span>
                              <span>O {prop.consensusOverOdds} / U {prop.consensusUnderOdds}</span>
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#0077b6]">
                              Model Projection
                            </div>
                            <div className="flex items-baseline space-x-1 mt-0.5">
                              <span className="text-lg font-black text-[#03045e]">
                                {prop.modelProjection}
                              </span>
                              <span className="text-xs text-[#0077b6] font-semibold">{prop.unit}</span>
                            </div>
                            <div className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
                              {diff > 0 ? (
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-rose-600" />
                              )}
                              <span>Edge: {diffLabel}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Probability Visual Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10.5px] font-semibold">
                        <span className="text-[#0077b6]">
                          OVER {prop.consensusLine}: {prop.overProbabilityPercent}%
                        </span>
                        <span className="text-stone-500">
                          UNDER {prop.consensusLine}: {prop.underProbabilityPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden flex">
                        <div
                          className="bg-[#0077b6] transition-all duration-500"
                          style={{ width: `${prop.overProbabilityPercent}%` }}
                        />
                        <div
                          className="bg-[#03045e] transition-all duration-500"
                          style={{ width: `${prop.underProbabilityPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Historical Reference & Paper Bet Actions */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-stone-500">
                        Last 5 Avg: <strong className="text-stone-800">{prop.historicalLast5Average} {prop.unit}</strong>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleBetClick(prop, 'OVER')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isOver
                              ? 'bg-[#0077b6] text-white hover:bg-[#0096c7] shadow-2xs'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          Bet OVER
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBetClick(prop, 'UNDER')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isUnder
                              ? 'bg-[#03045e] text-white hover:bg-[#023e8a] shadow-2xs'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          Bet UNDER
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-[#0077b6]" />
            <span>
              Projections updated in real-time based on depth chart personnel, weather, and defensive DVOA.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
