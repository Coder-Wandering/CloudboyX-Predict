import React, { useState, useMemo } from 'react';
import {
  NflPlayerProp,
  NflPlayerPropsResponse,
  TrackedPlayerPropSlip,
} from '../types';
import {
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
  Zap,
  ShieldAlert,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  Bookmark,
  Trash2,
  ChevronDown,
  Info,
  Award,
  Sparkles,
  Trophy,
  Flame,
  X,
  RotateCcw,
  History,
  Clock,
} from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { getPropLineMovement } from '../data/nflPlayerProps';

/**
 * Visual directional arrow badge (up / down / stable) indicating if the
 * current sportsbook line has shifted relative to opening odds.
 */
export const PropLineShiftBadge: React.FC<{ prop: NflPlayerProp; compact?: boolean }> = ({
  prop,
  compact = false,
}) => {
  const movement = getPropLineMovement(prop);

  if (movement.direction === 'up') {
    return (
      <span
        data-testid={`line-shift-up-${prop.id}`}
        title={`Line Shifted UP: Current ${prop.consensusLine} ${prop.unit} vs Open ${movement.openingLine} ${prop.unit} (Shift: +${movement.delta} ${prop.unit})`}
        className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs shrink-0"
      >
        <ArrowUp className="w-3 h-3 text-emerald-700 stroke-[2.5]" />
        <span>{compact ? `+${movement.delta}` : `UP +${movement.delta} ${prop.unit}`}</span>
      </span>
    );
  }

  if (movement.direction === 'down') {
    return (
      <span
        data-testid={`line-shift-down-${prop.id}`}
        title={`Line Shifted DOWN: Current ${prop.consensusLine} ${prop.unit} vs Open ${movement.openingLine} ${prop.unit} (Shift: ${movement.delta} ${prop.unit})`}
        className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs shrink-0"
      >
        <ArrowDown className="w-3 h-3 text-rose-700 stroke-[2.5]" />
        <span>{compact ? `${movement.delta}` : `DOWN ${movement.delta} ${prop.unit}`}</span>
      </span>
    );
  }

  return (
    <span
      data-testid={`line-shift-stable-${prop.id}`}
      title={`Line is STABLE: Current line ${prop.consensusLine} ${prop.unit} equals opening line`}
      className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight bg-stone-100 text-stone-600 border border-stone-200 shrink-0"
    >
      <Minus className="w-3 h-3 text-stone-500 stroke-[2.5]" />
      <span>{compact ? 'STABLE' : 'STABLE (0.0)'}</span>
    </span>
  );
};

/**
 * Checks whether a given player prop matches any query term in the Recent Searches list.
 * Matches against player name, positions, teams, opponents, and prop types (including aliases).
 */
export const propMatchesRecentSearch = (prop: NflPlayerProp, searches: string[]): boolean => {
  if (!searches || searches.length === 0) return false;
  return searches.some((rawTerm) => {
    const term = rawTerm.trim().toLowerCase();
    if (!term) return false;

    // Check player name
    const playerName = prop.playerName.toLowerCase();
    if (playerName.includes(term) || term.includes(playerName)) return true;

    // Check individual name parts (e.g. "Mahomes" matching "Patrick Mahomes", or "Lamar" matching "Lamar Jackson")
    const parts = playerName.split(/\s+/);
    if (parts.some((p) => p.length >= 2 && (term.includes(p) || p.includes(term)))) {
      return true;
    }

    // Check prop type (e.g. "Passing Yards", "Rushing", "Receiving")
    const propType = prop.propType.toLowerCase();
    if (propType.includes(term) || term.includes(propType)) return true;
    if (term.includes('pass') && propType.includes('pass')) return true;
    if (term.includes('rush') && propType.includes('rush')) return true;
    if ((term.includes('rec') || term.includes('catch')) && propType.includes('rec')) return true;

    // Check team or opponent
    const team = prop.team.toLowerCase();
    const opponent = prop.opponent.toLowerCase();
    if (team.includes(term) || term.includes(team)) return true;
    if (opponent.includes(term) || term.includes(opponent)) return true;

    // Check position
    if (prop.position.toLowerCase() === term) return true;

    return false;
  });
};

interface PlayerPropsAnalyzerViewProps {
  data: NflPlayerPropsResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  selectedMatchup: string;
  onSelectMatchup: (matchup: string) => void;
  initialSearchQuery?: string;
}

export const PlayerPropsAnalyzerView: React.FC<PlayerPropsAnalyzerViewProps> = ({
  data,
  isLoading,
  onRefresh,
  selectedMatchup,
  onSelectMatchup,
  initialSearchQuery = '',
}) => {
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [selectedPropType, setSelectedPropType] = useState<string>('ALL');
  const [recommendationFilter, setRecommendationFilter] = useState<'ALL' | 'OVER' | 'UNDER' | 'HIGH_EDGE'>('ALL');
  const [lineShiftFilter, setLineShiftFilter] = useState<'ALL' | 'UP' | 'DOWN' | 'STABLE'>('ALL');
  const [filterByRecentSearches, setFilterByRecentSearches] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 250);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'edge' | 'projection' | 'name' | 'lineShift'>('edge');

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

  // Automatically record meaningful searches into recent searches
  React.useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      saveRecentSearch(debouncedSearchQuery.trim());
    }
  }, [debouncedSearchQuery]);

  // Tracked player props slip (sports-betting paper slip, no Kalshi binary contracts)
  const [trackedSlips, setTrackedSlips] = useState<TrackedPlayerPropSlip[]>(() => {
    try {
      const saved = localStorage.getItem('nfl_tracked_prop_slips');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSlipDrawerOpen, setIsSlipDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const saveSlips = (slips: TrackedPlayerPropSlip[]) => {
    setTrackedSlips(slips);
    try {
      localStorage.setItem('nfl_tracked_prop_slips', JSON.stringify(slips));
    } catch {
      // ignore
    }
  };

  const propsList: NflPlayerProp[] = useMemo(() => {
    return data?.props || [];
  }, [data]);

  // Count of props currently matching the Recent Searches list
  const matchingRecentPropsCount = useMemo(() => {
    if (recentSearches.length === 0) return 0;
    return propsList.filter((p) => propMatchesRecentSearch(p, recentSearches)).length;
  }, [propsList, recentSearches]);

  // Filter and sort props with debounced search query to prevent constant re-renders
  const filteredProps = useMemo(() => {
    return propsList
      .filter((prop) => {
        if (selectedPosition !== 'ALL' && prop.position !== selectedPosition) {
          return false;
        }
        if (selectedPropType !== 'ALL' && prop.propType !== selectedPropType) {
          return false;
        }
        if (recommendationFilter === 'OVER' && prop.modelRecommendation !== 'OVER') {
          return false;
        }
        if (recommendationFilter === 'UNDER' && prop.modelRecommendation !== 'UNDER') {
          return false;
        }
        if (recommendationFilter === 'HIGH_EDGE' && Math.abs(prop.edgePercent) < 10) {
          return false;
        }
        if (lineShiftFilter !== 'ALL') {
          const movement = getPropLineMovement(prop);
          if (lineShiftFilter === 'UP' && movement.direction !== 'up') return false;
          if (lineShiftFilter === 'DOWN' && movement.direction !== 'down') return false;
          if (lineShiftFilter === 'STABLE' && movement.direction !== 'stable') return false;
        }
        // Quick-filter: automatically displays only the player props that have been added to the 'Recent Searches' list
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
      })
      .sort((a, b) => {
        if (sortBy === 'edge') {
          return Math.abs(b.edgePercent) - Math.abs(a.edgePercent);
        }
        if (sortBy === 'projection') {
          return b.modelProjection - a.modelProjection;
        }
        if (sortBy === 'lineShift') {
          const moveA = getPropLineMovement(a);
          const moveB = getPropLineMovement(b);
          return Math.abs(moveB.delta) - Math.abs(moveA.delta);
        }
        return a.playerName.localeCompare(b.playerName);
      });
  }, [
    propsList,
    selectedPosition,
    selectedPropType,
    recommendationFilter,
    lineShiftFilter,
    filterByRecentSearches,
    recentSearches,
    debouncedSearchQuery,
    sortBy,
  ]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    if (propsList.length === 0) {
      return { total: 0, topPlay: null, avgEdge: 0, overLeans: 0, underLeans: 0 };
    }
    const sortedByEdge = [...propsList].sort((a, b) => Math.abs(b.edgePercent) - Math.abs(a.edgePercent));
    const topPlay = sortedByEdge[0];
    const totalEdge = propsList.reduce((acc, p) => acc + Math.abs(p.edgePercent), 0);
    const avgEdge = Number((totalEdge / propsList.length).toFixed(1));
    const overLeans = propsList.filter((p) => p.modelRecommendation === 'OVER').length;
    const underLeans = propsList.filter((p) => p.modelRecommendation === 'UNDER').length;

    return {
      total: propsList.length,
      topPlay,
      avgEdge,
      overLeans,
      underLeans,
    };
  }, [propsList]);

  // Handle adding prop to tracked slip
  const handleTrackProp = (prop: NflPlayerProp, side: 'OVER' | 'UNDER') => {
    const odds = side === 'OVER' ? prop.consensusOverOdds : prop.consensusUnderOdds;
    const existingIndex = trackedSlips.findIndex((s) => s.propId === prop.id && s.side === side);
    if (existingIndex >= 0) {
      setToastMessage(`${prop.playerName} ${side} ${prop.consensusLine} is already in your prop slip.`);
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    const newSlip: TrackedPlayerPropSlip = {
      id: `slip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      propId: prop.id,
      playerName: prop.playerName,
      team: prop.team,
      opponent: prop.opponent,
      position: prop.position,
      propType: prop.propType,
      side,
      line: prop.consensusLine,
      unit: prop.unit,
      odds,
      modelProjection: prop.modelProjection,
      edgePercent: prop.edgePercent,
      unitsWagered: 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING',
    };

    saveSlips([newSlip, ...trackedSlips]);
    setToastMessage(`Added to Prop Slip: ${prop.playerName} ${side} ${prop.consensusLine} ${prop.unit}`);
    setIsSlipDrawerOpen(true);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveSlip = (slipId: string) => {
    saveSlips(trackedSlips.filter((s) => s.id !== slipId));
  };

  const handleClearAllSlips = () => {
    if (window.confirm('Clear all tracked props from your slip?')) {
      saveSlips([]);
    }
  };

  const matchupsList = [
    { id: 'ALL', label: 'All Featured Matchups' },
    { id: 'KC_BAL', label: 'KC Chiefs vs BAL Ravens (Week 1)' },
    { id: 'DET_GB', label: 'DET Lions vs GB Packers' },
    { id: 'BUF_MIA', label: 'BUF Bills vs MIA Dolphins' },
    { id: 'PHI_DAL', label: 'PHI Eagles vs DAL Cowboys' },
  ];

  return (
    <div id="player-props-analyzer-workspace" className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Identity Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#03045e] via-[#023e8a] to-[#0077b6] text-white p-5 sm:p-7 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Trophy className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 rounded-xl bg-white/15 border border-white/20 text-[#caf0f8]">
                <User className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Player Props Analyzer
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#caf0f8] text-[#03045e] uppercase tracking-wider">
                NFL Statistical Projections
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#caf0f8]/90 font-medium leading-relaxed">
              Standalone NFL player performance projections and sportsbook consensus line comparisons.
              Evaluates matchup defensive DVOA, target volume, weather, and statistical value edges without binary market complexity.
            </p>
          </div>

          {/* Right Action: Matchup Switcher & Refresh Button */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Matchup Dropdown Selector */}
            <div className="relative">
              <select
                id="props-matchup-selector"
                value={selectedMatchup}
                onChange={(e) => onSelectMatchup(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/25 focus:outline-hidden focus:ring-2 focus:ring-[#90e0ef] cursor-pointer transition-all"
              >
                {matchupsList.map((m) => (
                  <option key={m.id} value={m.id} className="text-stone-900 bg-white font-medium">
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#caf0f8]" />
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              id="refresh-player-props-feed-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#00b4d8] hover:bg-[#90e0ef] text-[#03045e] shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Refresh live mock player yardage lines"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Updating...' : 'Refresh Feed'}</span>
            </button>

            {/* Tracked Props Slip Button */}
            <button
              type="button"
              id="open-prop-slip-drawer-btn"
              onClick={() => setIsSlipDrawerOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all cursor-pointer relative"
              title="View your tracked player props slip"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#caf0f8]" />
              <span>Prop Slip</span>
              {trackedSlips.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-stone-900">
                  {trackedSlips.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Live Source Metadata */}
        <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between text-[11px] text-[#caf0f8]/80 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Data Feed: <strong>{data?.source || 'NFL NextGen Stats & PFF Advanced Player Probability Engine'}</strong></span>
          </div>
          <div>
            Last Updated: <span className="font-mono text-white">{data?.lastUpdated || 'Just now'}</span>
          </div>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Total Props Tracked
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#03045e]">{summaryStats.total}</span>
            <span className="text-xs text-stone-500">Live Player Lines</span>
          </div>
          <div className="text-[11px] text-stone-500">
            {summaryStats.overLeans} Over &bull; {summaryStats.underLeans} Under
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Average Model Edge
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-emerald-600">+{summaryStats.avgEdge}%</span>
            <span className="text-xs text-stone-500">vs Consensus</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Across active depth chart players
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Top Value Play
          </div>
          {summaryStats.topPlay ? (
            <div>
              <div className="text-sm font-black text-[#03045e] truncate">
                {summaryStats.topPlay.playerName}
              </div>
              <div className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <span>{summaryStats.topPlay.propType} {summaryStats.topPlay.modelRecommendation}</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  +{Math.abs(summaryStats.topPlay.edgePercent)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-stone-400 font-medium">No props loaded</div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Benchmark Books
          </div>
          <div className="text-sm font-extrabold text-[#03045e]">
            Consensus Sportsbooks
          </div>
          <div className="text-[11px] text-stone-500">
            DraftKings, FanDuel, BetMGM average
          </div>
        </div>
      </div>

      {/* Control / Filter Bar: parent container for #player-props-btn, Quick-Filter button, Clear All button, and filter text input */}
      <div
        id="player-props-btn-container"
        data-testid="player-props-btn-container"
        className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3.5"
      >
        <div id="player-props-btn-toolbar" className="contents">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Header Action Controls: #player-props-btn, Quick-Filter Recent Searches button, and Clear-All Button */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              id="player-props-btn"
              data-testid="player-props-btn"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#03045e] hover:bg-[#0077b6] text-white shadow-2xs transition-colors cursor-pointer"
              title="Active NFL Player Props Model"
            >
              <User className="w-3.5 h-3.5 text-[#caf0f8]" />
              <span>Player Props</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#0077b6] text-white">
                {filteredProps.length}
              </span>
            </button>

            {/* Quick-filter button that automatically displays only the player props that have been added to the 'Recent Searches' list */}
            <button
              type="button"
              id="quick-filter-recent-searches-btn"
              data-testid="quick-filter-recent-searches-btn"
              aria-label="Quick-filter by Recent Searches"
              aria-pressed={filterByRecentSearches}
              onClick={() => setFilterByRecentSearches((prev) => !prev)}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 border ${
                filterByRecentSearches
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 ring-2 ring-emerald-300/50'
                  : 'bg-stone-100 hover:bg-[#caf0f8]/60 text-stone-700 hover:text-[#03045e] border-stone-200 hover:border-[#0077b6]/40'
              }`}
              title={
                filterByRecentSearches
                  ? `Quick-Filter Active: Showing only props matching Recent Searches (${filteredProps.length} matched). Click to show all props.`
                  : `Quick-Filter: Display only player props matching Recent Searches (${matchingRecentPropsCount} available)`
              }
            >
              <History className={`w-3.5 h-3.5 ${filterByRecentSearches ? 'text-amber-300' : 'text-[#0077b6]'}`} />
              <span>Recent Searches</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] font-black transition-colors ${
                  filterByRecentSearches
                    ? 'bg-emerald-800 text-emerald-100'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {filterByRecentSearches ? `${filteredProps.length} matched` : matchingRecentPropsCount}
              </span>
              {filterByRecentSearches && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {/* Clear-all button inside '#player-props-btn' parent container that resets the filter text input field to empty */}
            <button
              type="button"
              id="clear-all-player-props-btn"
              data-testid="clear-all-filter-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedPosition('ALL');
                setSelectedPropType('ALL');
                setRecommendationFilter('ALL');
                setLineShiftFilter('ALL');
                setFilterByRecentSearches(false);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 hover:border-rose-300 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Reset search filter text input and all prop criteria to default"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500 hover:text-rose-600" />
              <span>Clear All</span>
            </button>
          </div>

            {/* Search Bar with Debounced Input, inline reset, and Recent Searches dropdown */}
            <div className="relative flex-1" id="player-props-search-wrapper">
              <label htmlFor="player-props-search-input" className="sr-only">
                Search Player or Stat...
              </label>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                id="player-props-search-input"
                data-testid="player-props-search-input"
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
                className="w-full pl-9 pr-9 py-2 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:border-[#0077b6] text-stone-900 placeholder:text-stone-400 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  id="clear-props-search-input-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200 transition-colors cursor-pointer"
                  title="Clear filter text input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Local Storage-backed Recent Searches Dropdown & Tag List */}
              {isSearchFocused && (
                <div
                  id="recent-player-props-searches-dropdown"
                  data-testid="recent-player-props-searches"
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
                          id="dropdown-quick-filter-recent-searches-btn"
                          onClick={() => {
                            setFilterByRecentSearches(true);
                            setIsSearchFocused(false);
                          }}
                          className="text-[11px] font-bold text-[#0077b6] hover:text-[#03045e] transition-colors cursor-pointer"
                          title="Quick-filter to show all props matching recent searches"
                        >
                          Quick-Filter All ({matchingRecentPropsCount})
                        </button>
                      )}
                      {recentSearches.length > 0 && (
                        <button
                          type="button"
                          id="clear-all-recent-player-props-searches-btn"
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
                      No recent searches stored. Search by player name or stat category above.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((item) => (
                        <div
                          key={item}
                          onClick={() => handleSelectRecentSearch(item)}
                          className="group inline-flex items-center space-x-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold bg-stone-50 hover:bg-[#caf0f8]/50 text-stone-700 hover:text-[#03045e] border border-stone-200 hover:border-[#0077b6]/40 transition-all cursor-pointer shadow-2xs"
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

                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px] text-stone-400">
                    <span>Click any tag to search or use Quick-Filter</span>
                    <span className="font-mono">Local Storage Backed</span>
                  </div>
                </div>
              )}
            </div>

          {/* Sort & View Mode Controls */}
          <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
            <div className="flex items-center space-x-1.5 text-xs text-stone-500">
              <span className="font-semibold">Sort:</span>
              <select
                id="props-sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-semibold text-stone-700 focus:outline-hidden cursor-pointer"
              >
                <option value="edge">Highest Model Edge (%)</option>
                <option value="lineShift">Largest Line Shift (vs Open)</option>
                <option value="projection">Highest Projection</option>
                <option value="name">Player Name (A-Z)</option>
              </select>
            </div>

            {/* Layout Toggle */}
            <div className="inline-flex p-0.5 rounded-lg bg-stone-100 border border-stone-200">
              <button
                type="button"
                id="props-view-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#03045e] shadow-2xs' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="props-view-table-btn"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#03045e] shadow-2xs' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Matrix Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Position Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-stone-400 uppercase mr-1">Position:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'QB', label: 'Quarterbacks' },
              { id: 'RB', label: 'Running Backs' },
              { id: 'WR', label: 'Wide Receivers' },
              { id: 'TE', label: 'Tight Ends' },
            ].map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => setSelectedPosition(pos.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedPosition === pos.id
                    ? 'bg-[#03045e] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>

          {/* Prop Type Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-stone-400 uppercase mr-1">Prop:</span>
            {[
              { id: 'ALL', label: 'All Props' },
              { id: 'Passing Yards', label: 'Pass Yds' },
              { id: 'Rushing Yards', label: 'Rush Yds' },
              { id: 'Receiving Yards', label: 'Rec Yds' },
              { id: 'Passing TDs', label: 'Pass TDs' },
            ].map((prop) => (
              <button
                key={prop.id}
                type="button"
                onClick={() => setSelectedPropType(prop.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedPropType === prop.id
                    ? 'bg-[#0077b6] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {prop.label}
              </button>
            ))}
          </div>
        </div>

        {/* Line Movement Direction Filter (Up / Down / Stable) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-stone-400 uppercase mr-1">Line Shift vs Open:</span>
            {[
              { id: 'ALL', label: 'All Shifts' },
              { id: 'UP', label: 'Shifted Up (▲)', icon: ArrowUp, count: propsList.filter((p) => getPropLineMovement(p).direction === 'up').length },
              { id: 'DOWN', label: 'Shifted Down (▼)', icon: ArrowDown, count: propsList.filter((p) => getPropLineMovement(p).direction === 'down').length },
              { id: 'STABLE', label: 'Stable (—)', icon: Minus, count: propsList.filter((p) => getPropLineMovement(p).direction === 'stable').length },
            ].map((shift) => (
              <button
                key={shift.id}
                type="button"
                id={`filter-line-shift-${shift.id.toLowerCase()}`}
                onClick={() => setLineShiftFilter(shift.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                  lineShiftFilter === shift.id
                    ? 'bg-[#03045e] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{shift.label}</span>
                {shift.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-black ${
                      lineShiftFilter === shift.id
                        ? 'bg-[#0077b6] text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {shift.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Model Recommendation & Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase mr-1">Quick Filters:</span>
          
          {/* Quick-filter Recent Searches pill button */}
          <button
            type="button"
            id="recent-searches-quick-filter-btn"
            data-testid="recent-searches-quick-filter-btn"
            aria-pressed={filterByRecentSearches}
            onClick={() => setFilterByRecentSearches((prev) => !prev)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              filterByRecentSearches
                ? 'bg-emerald-600 text-white border border-emerald-500 shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent'
            }`}
            title="Toggle quick-filter: display only player props matching Recent Searches"
          >
            <History className="w-3 h-3" />
            <span>Recent Searches</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                filterByRecentSearches ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {matchingRecentPropsCount}
            </span>
          </button>

          <span className="text-stone-300 text-xs px-0.5">|</span>
          <span className="text-[11px] font-bold text-stone-400 uppercase mr-1">Model Lean:</span>
          {[
            { id: 'ALL', label: 'All Recommendations' },
            { id: 'OVER', label: 'Over Leans Only' },
            { id: 'UNDER', label: 'Under Leans Only' },
            { id: 'HIGH_EDGE', label: 'High Edge (10%+)' },
          ].map((rec) => (
            <button
              key={rec.id}
              type="button"
              onClick={() => setRecommendationFilter(rec.id as any)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                recommendationFilter === rec.id
                  ? 'bg-[#caf0f8] text-[#03045e] border border-[#0077b6]'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent'
              }`}
            >
              {rec.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-stone-500 font-medium">
            Showing {filteredProps.length} of {propsList.length} props
          </span>
        </div>

        {/* Informative Active Quick-Filter Banner */}
        {filterByRecentSearches && (
          <div
            id="recent-searches-filter-active-banner"
            data-testid="recent-searches-filter-active-banner"
            className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2 animate-in fade-in"
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-extrabold text-emerald-900">
                Quick-Filter Active:
              </span>
              <span className="text-emerald-800 font-medium">
                Displaying only player props matching Recent Searches ({filteredProps.length} of {propsList.length} matching)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-emerald-700 hidden sm:inline">
                Tracked Terms: {recentSearches.slice(0, 4).join(', ')}{recentSearches.length > 4 ? '...' : ''}
              </span>
              <button
                type="button"
                id="deactivate-recent-searches-quick-filter-btn"
                onClick={() => setFilterByRecentSearches(false)}
                className="px-2.5 py-1 rounded-lg bg-emerald-200 hover:bg-emerald-300 text-emerald-900 font-bold text-[11px] transition-colors cursor-pointer"
                title="Deactivate quick-filter and show all player props"
              >
                Show All Props &times;
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Main Props Content: Cards Grid or Matrix Table */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3 bg-white rounded-2xl border border-stone-200">
          <RefreshCw className="w-8 h-8 text-[#0077b6] animate-spin mx-auto" />
          <p className="text-sm font-bold text-stone-800">
            Querying NFL Telemetry &amp; Statistical Projection Feed...
          </p>
          <p className="text-xs text-stone-500">
            Calculating player volume baselines, defensive pass/rush DVOA, and value margins.
          </p>
        </div>
      ) : filteredProps.length === 0 ? (
        <div className="py-20 text-center space-y-2.5 bg-white rounded-2xl border border-stone-200">
          <User className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No matching player props found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {filterByRecentSearches
              ? `No player props currently match your Recent Searches list (${recentSearches.join(', ')}). Try turning off the quick-filter or resetting your filters.`
              : 'Try resetting your position, prop category, or search filters to view available player lines.'}
          </p>
          <div className="flex items-center justify-center space-x-2 pt-1">
            {filterByRecentSearches && (
              <button
                type="button"
                id="empty-state-reset-quick-filter-btn"
                onClick={() => setFilterByRecentSearches(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer inline-flex items-center space-x-1"
              >
                <span>Turn Off Quick-Filter</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedPosition('ALL');
                setSelectedPropType('ALL');
                setRecommendationFilter('ALL');
                setLineShiftFilter('ALL');
                setSearchQuery('');
                setFilterByRecentSearches(false);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer inline-flex items-center space-x-1"
            >
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProps.map((prop) => {
            const diff = Number((prop.modelProjection - prop.consensusLine).toFixed(1));
            const diffLabel = diff > 0 ? `+${diff} ${prop.unit}` : `${diff} ${prop.unit}`;
            const isOver = prop.modelRecommendation === 'OVER';
            const isUnder = prop.modelRecommendation === 'UNDER';
            const movement = getPropLineMovement(prop);

            return (
              <div
                key={prop.id}
                id={`player-prop-card-${prop.id}`}
                className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-[#90e0ef] hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
              >
                {/* Header: Player Name, Position, Matchup */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-base font-extrabold text-[#03045e]">
                        {prop.playerName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef]">
                        {prop.position}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-stone-100 text-stone-700">
                        {prop.team} vs {prop.opponent}
                      </span>

                      {/* Hot / Trending Visual Indicator Tag */}
                      {prop.recentActivityShift && (
                        <span
                          className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            prop.recentActivityShift.tag === 'HOT'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {prop.recentActivityShift.tag === 'HOT' ? (
                            <Flame className="w-2.5 h-2.5 text-rose-600 fill-rose-600" />
                          ) : (
                            <TrendingUp className="w-2.5 h-2.5 text-emerald-700" />
                          )}
                          <span>{prop.recentActivityShift.tag}</span>
                        </span>
                      )}

                      {/* Directional Shift Arrow Badge */}
                      <PropLineShiftBadge prop={prop} compact={true} />
                    </div>
                    <div className="text-xs font-bold text-stone-600 flex items-center space-x-2">
                      <span>{prop.propType}</span>
                      <span className="text-stone-300">&bull;</span>
                      <span className="text-[11px] text-stone-500">L5 Avg: {prop.historicalLast5Average} {prop.unit}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {prop.injuryStatus === 'Active' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        <span>{prop.injuryStatus}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Matchup Tactical Note */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600 leading-snug">
                  <span className="font-bold text-stone-800">Tactical Insight:</span> {prop.matchupContext}
                </div>

                {/* 24h Shift Note if present */}
                {prop.recentActivityShift && (
                  <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-950 flex items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-1 font-bold">
                      <Flame className="w-3 h-3 text-rose-600 fill-rose-600 shrink-0" />
                      <span>{prop.recentActivityShift.shiftValue}</span>
                    </div>
                    <span className="text-[10px] text-amber-800 font-medium shrink-0">
                      {prop.recentActivityShift.volumeNote}
                    </span>
                  </div>
                )}

                {/* Consensus Line vs Model Projection comparison block */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#caf0f8]/25 border border-[#90e0ef]/70">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Current Line
                      </div>
                      <PropLineShiftBadge prop={prop} />
                    </div>
                    <div className="flex items-baseline space-x-1 mt-0.5">
                      <span className="text-xl font-black text-stone-900">
                        {prop.consensusLine}
                      </span>
                      <span className="text-xs text-stone-500 font-semibold">{prop.unit}</span>
                    </div>
                    {/* Shift & Opening Line Display */}
                    <div className="text-[10.5px] text-stone-500 mt-1 flex flex-wrap items-center gap-1 font-mono">
                      <span className="text-stone-400">Open:</span>
                      <span className="font-bold text-stone-700">{movement.openingLine} {prop.unit}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          movement.direction === 'up'
                            ? 'text-emerald-700'
                            : movement.direction === 'down'
                            ? 'text-rose-700'
                            : 'text-stone-500'
                        }`}
                      >
                        ({movement.deltaFormatted} {prop.unit})
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                      O {prop.consensusOverOdds} / U {prop.consensusUnderOdds}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#0077b6]">
                      Model Projection
                    </div>
                    <div className="flex items-baseline space-x-1 mt-0.5">
                      <span className="text-xl font-black text-[#03045e]">
                        {prop.modelProjection}
                      </span>
                      <span className="text-xs text-[#0077b6] font-semibold">{prop.unit}</span>
                    </div>
                    <div className="text-[10.5px] font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
                      {diff > 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-600" />
                      )}
                      <span>Edge: {diffLabel} ({Math.abs(prop.edgePercent)}%)</span>
                    </div>
                  </div>
                </div>

                {/* Probability Distribution Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-[#0077b6]">
                      OVER: {prop.overProbabilityPercent}%
                    </span>
                    <span className="text-[#03045e]">
                      UNDER: {prop.underProbabilityPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#0077b6] transition-all duration-500"
                      style={{ width: `${prop.overProbabilityPercent}%` }}
                      title={`Over probability: ${prop.overProbabilityPercent}%`}
                    />
                    <div
                      className="bg-[#03045e] transition-all duration-500"
                      style={{ width: `${prop.underProbabilityPercent}%` }}
                      title={`Under probability: ${prop.underProbabilityPercent}%`}
                    />
                  </div>
                </div>

                {/* Bottom Row: Model Recommendation & Track Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Model:</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-wider ${
                        isOver
                          ? 'bg-emerald-100 text-emerald-800'
                          : isUnder
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {prop.modelRecommendation}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTrackProp(prop, 'OVER')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isOver
                          ? 'bg-[#0077b6] text-white hover:bg-[#0096c7] shadow-2xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      Track Over
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTrackProp(prop, 'UNDER')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isUnder
                          ? 'bg-[#03045e] text-white hover:bg-[#023e8a] shadow-2xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      Track Under
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Matrix Table View */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Player / Team</th>
                  <th className="py-3 px-4">Prop Type</th>
                  <th className="py-3 px-4">Line &amp; Movement (vs Open)</th>
                  <th className="py-3 px-4">Model Projection</th>
                  <th className="py-3 px-4">Model Edge</th>
                  <th className="py-3 px-4">Probability Split</th>
                  <th className="py-3 px-4">Recommendation</th>
                  <th className="py-3 px-4 text-right">Quick Track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProps.map((prop) => {
                  const diff = Number((prop.modelProjection - prop.consensusLine).toFixed(1));
                  const diffLabel = diff > 0 ? `+${diff}` : `${diff}`;
                  const isOver = prop.modelRecommendation === 'OVER';
                  const isUnder = prop.modelRecommendation === 'UNDER';
                  const movement = getPropLineMovement(prop);

                  return (
                    <tr key={prop.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#03045e]">
                        <div className="flex items-center space-x-2">
                          <span>{prop.playerName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#caf0f8] text-[#0077b6] font-extrabold">
                            {prop.position}
                          </span>
                          <span className="text-stone-400 font-normal">
                            {prop.team} vs {prop.opponent}
                          </span>
                          {prop.recentActivityShift && (
                            <span
                              className={`inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                                prop.recentActivityShift.tag === 'HOT'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {prop.recentActivityShift.tag === 'HOT' ? (
                                <Flame className="w-2.5 h-2.5 text-rose-600 fill-rose-600" />
                              ) : (
                                <TrendingUp className="w-2.5 h-2.5 text-emerald-700" />
                              )}
                              <span>{prop.recentActivityShift.tag}</span>
                            </span>
                          )}
                          <PropLineShiftBadge prop={prop} compact={true} />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-700">
                        {prop.propType}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-stone-900">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-stone-900">
                            {prop.consensusLine} {prop.unit}
                          </span>
                          <PropLineShiftBadge prop={prop} compact={true} />
                        </div>
                        <div className="flex items-center space-x-1 text-[10.5px] text-stone-500 font-normal mt-0.5">
                          <span className="text-stone-400">Open:</span>
                          <span className="font-semibold text-stone-700">{movement.openingLine} {prop.unit}</span>
                          <span
                            className={
                              movement.direction === 'up'
                                ? 'text-emerald-700 font-bold'
                                : movement.direction === 'down'
                                ? 'text-rose-700 font-bold'
                                : 'text-stone-500'
                            }
                          >
                            ({movement.deltaFormatted})
                          </span>
                        </div>
                        <span className="block text-[10px] text-stone-400 font-normal mt-0.5">
                          O {prop.consensusOverOdds} / U {prop.consensusUnderOdds}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-[#0077b6]">
                        {prop.modelProjection} {prop.unit}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={diff > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {diffLabel} {prop.unit} ({Math.abs(prop.edgePercent)}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex justify-between text-[10px] font-bold text-stone-500 mb-1">
                          <span>O: {prop.overProbabilityPercent}%</span>
                          <span>U: {prop.underProbabilityPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden flex">
                          <div
                            className="bg-[#0077b6]"
                            style={{ width: `${prop.overProbabilityPercent}%` }}
                          />
                          <div
                            className="bg-[#03045e]"
                            style={{ width: `${prop.underProbabilityPercent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
                            isOver
                              ? 'bg-emerald-100 text-emerald-800'
                              : isUnder
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {prop.modelRecommendation}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex space-x-1">
                          <button
                            type="button"
                            onClick={() => handleTrackProp(prop, 'OVER')}
                            className="px-2 py-1 rounded text-[11px] font-bold bg-stone-100 hover:bg-[#0077b6] hover:text-white transition-colors cursor-pointer"
                          >
                            Over
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTrackProp(prop, 'UNDER')}
                            className="px-2 py-1 rounded text-[11px] font-bold bg-stone-100 hover:bg-[#03045e] hover:text-white transition-colors cursor-pointer"
                          >
                            Under
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prop Slip Drawer Modal */}
      {isSlipDrawerOpen && (
        <div
          id="prop-slip-drawer-overlay"
          className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsSlipDrawerOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 bg-[#03045e] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-5 h-5 text-[#caf0f8]" />
                <h3 className="text-base font-bold">Tracked Props Slip</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#caf0f8] text-[#03045e]">
                  {trackedSlips.length} {trackedSlips.length === 1 ? 'Prop' : 'Props'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSlipDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Slips List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {trackedSlips.length === 0 ? (
                <div className="py-16 text-center space-y-2 text-stone-400">
                  <Bookmark className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="text-sm font-semibold text-stone-600">Your prop slip is empty</p>
                  <p className="text-xs text-stone-400">
                    Click &quot;Track Over&quot; or &quot;Track Under&quot; on any player card to add lines to your slip.
                  </p>
                </div>
              ) : (
                trackedSlips.map((slip) => (
                  <div
                    key={slip.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-[#03045e]">
                          {slip.playerName}
                        </div>
                        <div className="text-xs font-semibold text-stone-600">
                          {slip.propType} &bull; <span className="font-bold text-[#0077b6]">{slip.side} {slip.line} {slip.unit}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlip(slip.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove prop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200 text-stone-500">
                      <div>
                        Odds: <strong className="text-stone-800">{slip.odds}</strong>
                      </div>
                      <div>
                        Projection: <strong className="text-[#0077b6]">{slip.modelProjection} {slip.unit}</strong>
                      </div>
                      <div>
                        Edge: <strong className="text-emerald-600">+{Math.abs(slip.edgePercent)}%</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {trackedSlips.length > 0 && (
              <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2.5">
                <div className="flex justify-between text-xs font-bold text-stone-700">
                  <span>Tracked Entries</span>
                  <span>{trackedSlips.length} selections</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAllSlips}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors cursor-pointer"
                >
                  Clear All Selections
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
