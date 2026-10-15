import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Tv,
  MapPin,
  RefreshCw,
  Search,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Shield,
  Sun,
  Activity,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { NflGameScheduleItem, NflScheduleResponse } from '../types';
import { getMockNflScheduleResponse } from '../data/nflScheduleData';

interface NflScheduleTabProps {
  onAnalyzeGame: (matchupQuery: string) => void;
  onNavigateToPlayerProps: (matchupQuery?: string) => void;
}

export const NflScheduleTab: React.FC<NflScheduleTabProps> = ({
  onAnalyzeGame,
  onNavigateToPlayerProps,
}) => {
  const [scheduleData, setScheduleData] = useState<NflScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSlotFilter, setActiveSlotFilter] = useState<'ALL' | 'PRIMETIME' | 'EARLY' | 'LATE'>('ALL');
  const [activeNetworkFilter, setActiveNetworkFilter] = useState<string>('ALL');

  const fetchSchedule = async (slotFilter = activeSlotFilter, networkFilter = activeNetworkFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      let filterParam = 'ALL';
      if (slotFilter === 'PRIMETIME') {
        filterParam = 'PRIMETIME';
      } else if (slotFilter === 'EARLY') {
        filterParam = 'EARLY';
      } else if (slotFilter === 'LATE') {
        filterParam = 'LATE';
      } else if (networkFilter !== 'ALL') {
        filterParam = networkFilter;
      }

      const res = await fetch(`/api/nfl/schedule?filter=${encodeURIComponent(filterParam)}`);
      if (res.ok) {
        const data: NflScheduleResponse = await res.json();
        setScheduleData(data);
      } else {
        setScheduleData(getMockNflScheduleResponse(filterParam));
      }
    } catch (err: any) {
      console.warn('API call failed, using mock schedule data:', err);
      setScheduleData(getMockNflScheduleResponse());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(activeSlotFilter, activeNetworkFilter);
  }, [activeSlotFilter, activeNetworkFilter]);

  const games = scheduleData?.games || [];

  // Local client-side search filtering
  const filteredGames = games.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.gameTitle.toLowerCase().includes(q) ||
      g.awayTeam.name.toLowerCase().includes(q) ||
      g.awayTeam.city.toLowerCase().includes(q) ||
      g.awayTeam.code.toLowerCase().includes(q) ||
      g.homeTeam.name.toLowerCase().includes(q) ||
      g.homeTeam.city.toLowerCase().includes(q) ||
      g.homeTeam.code.toLowerCase().includes(q) ||
      g.broadcastNetwork.toLowerCase().includes(q) ||
      g.venue.toLowerCase().includes(q)
    );
  });

  const getNetworkBadgeStyle = (network: string) => {
    if (network.includes('NBC') || network.includes('Peacock')) {
      return 'bg-gradient-to-r from-amber-500/10 to-orange-500/15 text-amber-900 border-amber-300/80';
    }
    if (network.includes('CBS')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    if (network.includes('FOX')) {
      return 'bg-red-50 text-red-800 border-red-200';
    }
    if (network.includes('ESPN') || network.includes('ABC')) {
      return 'bg-rose-50 text-rose-900 border-rose-200';
    }
    return 'bg-purple-50 text-purple-800 border-purple-200';
  };

  return (
    <div id="nfl-schedule-container" className="space-y-6">
      {/* Header & Meta Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-[#caf0f8] text-[#03045e] uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>{scheduleData?.weekTitle || 'Upcoming NFL Slate'}</span>
              </span>
              <span className="text-xs font-bold text-stone-500">
                {scheduleData?.seasonYear || '2024-2025'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#03045e] mt-1.5 tracking-tight">
              NFL Game Schedule &amp; Broadcast Telecast Guide
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Official upcoming kickoff times, national broadcast networks, consensus game spreads, and direct Bayesian research pipeline integrations.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center space-x-2.5 shrink-0 self-start lg:self-center">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Updated</div>
              <div className="text-xs font-mono font-bold text-stone-700">
                {scheduleData?.lastUpdated || 'Live Sync'}
              </div>
            </div>
            <button
              id="nfl-schedule-refresh-btn"
              type="button"
              onClick={() => fetchSchedule()}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 text-[#03045e] border border-stone-300 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0077b6] ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Refresh Schedule'}</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-5 pt-5 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="nfl-schedule-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by team (e.g. Chiefs, Ravens), city, or network..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:bg-white transition-all"
            />
          </div>

          {/* Slot & Network Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Slot:
            </span>
            <button
              type="button"
              onClick={() => setActiveSlotFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSlotFilter === 'ALL'
                  ? 'bg-[#03045e] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              All Slots ({games.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSlotFilter('PRIMETIME')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSlotFilter === 'PRIMETIME'
                  ? 'bg-[#03045e] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              🌙 Primetime
            </button>
            <button
              type="button"
              onClick={() => setActiveSlotFilter('EARLY')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSlotFilter === 'EARLY'
                  ? 'bg-[#03045e] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              Sunday 1:00 PM
            </button>
            <button
              type="button"
              onClick={() => setActiveSlotFilter('LATE')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSlotFilter === 'LATE'
                  ? 'bg-[#03045e] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              Sunday 4:05/4:25 PM
            </button>
          </div>
        </div>

        {/* Network Filter Bar */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Network:
          </span>
          {['ALL', 'NBC', 'CBS', 'FOX', 'ESPN'].map((net) => (
            <button
              key={net}
              type="button"
              onClick={() => setActiveNetworkFilter(net)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                activeNetworkFilter === net
                  ? 'bg-[#0077b6] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              {net === 'ALL' ? 'All Broadcasts' : net}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && !scheduleData && (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <RefreshCw className="w-8 h-8 text-[#0077b6] animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">Fetching live NFL broadcast slate...</h3>
          <p className="text-xs text-stone-500 mt-1">
            Loading official kickoff times, broadcast affiliations, and consensus opening odds.
          </p>
        </div>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGames.map((game) => {
          return (
            <div
              key={game.id}
              id={`nfl-game-card-${game.id}`}
              className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:shadow-sm hover:border-[#90e0ef] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Bar: Kickoff Time & Broadcast Network */}
                <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-stone-100">
                  <div className="flex items-center space-x-1.5 text-xs font-extrabold text-[#03045e]">
                    <Clock className="w-3.5 h-3.5 text-[#0077b6] shrink-0" />
                    <span>{game.kickoffTime}</span>
                  </div>

                  {/* Broadcast Network Badge */}
                  <div
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black border ${getNetworkBadgeStyle(
                      game.broadcastNetwork
                    )}`}
                    title={`Broadcast Network: ${game.broadcastNetwork}`}
                  >
                    <Tv className="w-3 h-3 shrink-0" />
                    <span>{game.broadcastNetwork}</span>
                  </div>
                </div>

                {/* Matchup Header */}
                <div className="py-4 space-y-2.5">
                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 font-black text-xs flex items-center justify-center border border-stone-200 shadow-2xs">
                        {game.awayTeam.code}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900 leading-tight">
                          {game.awayTeam.city} {game.awayTeam.name}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Away &bull; {game.awayTeam.conference} {game.awayTeam.division} ({game.awayTeam.record})
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-extrabold text-stone-700">
                        {game.moneylineAway}
                      </span>
                    </div>
                  </div>

                  {/* At Divider */}
                  <div className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                    <div className="h-px bg-stone-100 flex-1" />
                    <span>AT</span>
                    <div className="h-px bg-stone-100 flex-1" />
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#03045e] text-white font-black text-xs flex items-center justify-center shadow-2xs">
                        {game.homeTeam.code}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900 leading-tight">
                          {game.homeTeam.city} {game.homeTeam.name}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Home &bull; {game.homeTeam.conference} {game.homeTeam.division} ({game.homeTeam.record})
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-extrabold text-stone-700">
                        {game.moneylineHome}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Market Lines & Venue Context */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-stone-600">
                      <Activity className="w-3.5 h-3.5 text-[#0077b6]" />
                      <span className="font-semibold">Spread:</span>
                      <span className="font-mono font-extrabold text-[#03045e]">{game.spread}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-stone-600">
                      <span className="font-semibold">Total:</span>
                      <span className="font-mono font-extrabold text-[#03045e]">O/U {game.overUnder}</span>
                    </div>
                    {game.isPrimetime && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                        Primetime
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                    <div className="flex items-center space-x-1 truncate max-w-[65%]" title={game.venue}>
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{game.venue}</span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0 text-stone-400">
                      <Sun className="w-3 h-3" />
                      <span className="truncate">{game.weatherForecast.split(',')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Headline Note */}
                {game.headlineNote && (
                  <p className="text-[11px] text-stone-500 italic mt-2.5 line-clamp-2">
                    &ldquo;{game.headlineNote}&rdquo;
                  </p>
                )}
              </div>

              {/* Bottom Quick Actions */}
              <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToPlayerProps(`${game.awayTeam.name} vs ${game.homeTeam.name}`)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:text-[#03045e] hover:bg-stone-100 transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>Props</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAnalyzeGame(`${game.awayTeam.city} ${game.awayTeam.name} vs ${game.homeTeam.city} ${game.homeTeam.name}`)}
                  className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-[#03045e] hover:bg-[#0077b6] text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#90e0ef]" />
                  <span>Analyze Contract</span>
                  <ChevronRight className="w-3 h-3 text-[#90e0ef]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGames.length === 0 && !isLoading && (
        <div className="p-10 text-center bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-stone-800">No games found matching filters</h3>
          <p className="text-xs text-stone-500 mt-1">
            Try adjusting your search query, time slot, or broadcast network selection.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveSlotFilter('ALL');
              setActiveNetworkFilter('ALL');
            }}
            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#03045e] text-white hover:bg-[#0077b6] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
