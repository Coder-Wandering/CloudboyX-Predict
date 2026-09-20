import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Activity,
  DollarSign,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { KalshiLiveEvent, MarketCategory } from '../types';

interface KalshiLiveEventsFeedProps {
  onSelectEvent: (
    title: string,
    marketPriceCents: number,
    category: MarketCategory,
    liveEvent?: KalshiLiveEvent
  ) => void;
  isLoadingAnalysis: boolean;
}

export const KalshiLiveEventsFeed: React.FC<KalshiLiveEventsFeedProps> = ({
  onSelectEvent,
  isLoadingAnalysis,
}) => {
  const [events, setEvents] = useState<KalshiLiveEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'volume' | 'price_high' | 'price_low' | 'recent'>('volume');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [expandedRulesTicker, setExpandedRulesTicker] = useState<string | null>(null);

  const categories = [
    'All',
    'Financials',
    'Economics',
    'World',
    'Science and Technology',
    'Elections',
    'Climate and Weather',
  ];

  const fetchLiveEvents = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        sortBy,
        ...(selectedCategory !== 'All' ? { category: selectedCategory } : {}),
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
        ...(forceRefresh ? { forceRefresh: 'true' } : {}),
      });

      const res = await fetch(`/api/markets/events?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Market API returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data.events)) {
        setEvents(data.events);
        if (data.lastUpdated) {
          setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (err: any) {
      console.warn('Failed to load market live feed:', err.message);
      setError('Unable to reach market consensus feed at this moment. Showing cached verified events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveEvents();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLiveEvents();
  };

  const mapCategoryToAppCategory = (kalshiCategory: string): MarketCategory => {
    const lower = kalshiCategory.toLowerCase();
    if (lower.includes('finan') || lower.includes('stock') || lower.includes('crypto')) return 'Finance';
    if (lower.includes('econ') || lower.includes('fed') || lower.includes('cpi')) return 'Economics';
    if (lower.includes('tech') || lower.includes('science') || lower.includes('ai')) return 'Technology & AI';
    if (lower.includes('elect') || lower.includes('polit') || lower.includes('congress')) return 'Politics';
    if (lower.includes('climat') || lower.includes('weath') || lower.includes('temp')) return 'Weather & Climate';
    return 'Culture & Sports';
  };

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      {/* Live Status & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#03045e] text-[#caf0f8] px-4 py-3 rounded-xl shadow-xs">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b4d8] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00b4d8]"></span>
          </span>
          <div className="text-xs">
            <span className="font-semibold text-white tracking-wide">Live Kalshi Exchange Feed</span>
            <span className="text-[#90e0ef] ml-2 hidden md:inline">
              (CFTC-regulated prediction contracts • 1¢ - 99¢)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 text-xs text-[#caf0f8]">
          {lastUpdated && (
            <span className="text-[#90e0ef] text-[11px] hidden lg:inline">
              Synced at {lastUpdated}
            </span>
          )}
          <button
            id="refresh-kalshi-events-btn"
            type="button"
            onClick={() => fetchLiveEvents(true)}
            disabled={isLoading}
            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#0077b6] hover:bg-[#00b4d8] hover:text-[#03045e] text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Fetch latest orderbook prices from Kalshi"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#caf0f8]' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search in Kalshi Events */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="kalshi-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search live Kalshi contracts (e.g. OpenAI, Elon Musk, CPI, Fed, Mars)..."
            className="w-full pl-9 pr-20 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#0077b6]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTimeout(() => fetchLiveEvents(), 50);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-stone-400 hover:text-stone-700 px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
        </form>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2 self-end md:self-auto">
          <span className="text-[11px] font-medium text-stone-500">Sort:</span>
          <select
            id="kalshi-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 focus:outline-hidden focus:ring-1 focus:ring-[#0077b6]"
          >
            <option value="volume">Highest Trading Volume</option>
            <option value="price_high">Highest Market Odds (Yes %)</option>
            <option value="price_low">Lowest Market Odds (Yes %)</option>
            <option value="recent">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer text-xs ${
              selectedCategory === cat
                ? 'bg-[#0077b6] text-white font-medium shadow-xs'
                : 'bg-[#caf0f8]/50 text-[#03045e] hover:bg-[#caf0f8]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="text-xs text-[#03045e] bg-[#caf0f8] border border-[#90e0ef] rounded-xl p-3 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchLiveEvents(true)}
            className="font-medium underline hover:text-[#0077b6]"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Events Grid */}
      {isLoading && events.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-16 bg-stone-200 rounded"></div>
                <div className="h-4 w-12 bg-stone-200 rounded"></div>
              </div>
              <div className="h-10 bg-stone-200 rounded"></div>
              <div className="h-4 w-24 bg-stone-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-10 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
          <Activity className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-stone-700">No prediction markets match your criteria</p>
          <p className="text-xs text-stone-500 mt-1">Try clearing filters or search terms.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-3 px-3 py-1.5 text-xs bg-[#03045e] text-white rounded-lg hover:bg-[#0077b6] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map((event) => {
            const isExpanded = expandedRulesTicker === event.event_ticker;
            const appCategory = mapCategoryToAppCategory(event.category);

            return (
              <div
                key={event.event_ticker}
                className="p-4 rounded-xl border border-stone-200 hover:border-[#00b4d8] bg-white hover:bg-[#caf0f8]/15 transition-all flex flex-col justify-between shadow-2xs group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200/60">
                      {event.category}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-stone-500 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200/50">
                      {event.event_ticker}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-stone-900 line-clamp-2 leading-snug group-hover:text-[#03045e]">
                    {event.title}
                  </h3>

                  {event.sub_title && (
                    <p className="text-xs text-stone-500 mt-1 line-clamp-1">{event.sub_title}</p>
                  )}

                  {/* Price and Odds Metrics Box */}
                  <div className="mt-3.5 p-2.5 rounded-lg bg-[#caf0f8]/40 border border-[#90e0ef]/70 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500 block">
                        Kalshi Yes Price
                      </span>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-xl font-extrabold text-[#03045e]">
                          {event.price_cents}¢
                        </span>
                        <span className="text-xs font-semibold text-[#0077b6]">
                          ({event.price_cents}% prob)
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {event.yes_bid !== null && event.yes_ask !== null && (
                        <div className="text-[11px] text-stone-600 font-mono">
                          Bid/Ask: {event.yes_bid}¢ / {event.yes_ask}¢
                        </div>
                      )}
                      <div className="text-[11px] font-medium text-stone-500 mt-0.5">
                        Vol: {formatCurrency(event.volume)}
                      </div>
                    </div>
                  </div>

                  {/* Resolution rules expandable preview */}
                  {event.rules_primary && (
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRulesTicker(isExpanded ? null : event.event_ticker);
                        }}
                        className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center space-x-1 font-medium cursor-pointer"
                      >
                        <ShieldCheck className="w-3 h-3 text-[#0077b6]" />
                        <span>{isExpanded ? 'Hide Kalshi Settlement Rules' : 'View Settlement Rules'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-1.5 p-2 bg-stone-50 rounded text-[11px] text-stone-600 leading-relaxed border border-stone-200">
                          <p className="font-medium text-stone-700 mb-1">Official Resolution Criteria:</p>
                          <p>{event.rules_primary}</p>
                          {event.settlement_sources && event.settlement_sources.length > 0 && (
                            <div className="mt-1.5 pt-1.5 border-t border-stone-200 text-[10px] text-stone-500">
                              <span className="font-semibold">Settlement Sources: </span>
                              {event.settlement_sources.map((s) => s.name).join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-400">
                    Open Interest: {event.open_interest.toLocaleString()}
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectEvent(event.title, event.price_cents, appCategory, event)}
                    disabled={isLoadingAnalysis}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#03045e] hover:bg-[#0077b6] disabled:bg-stone-300 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#00b4d8]" />
                    <span>Analyze Odds &rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
