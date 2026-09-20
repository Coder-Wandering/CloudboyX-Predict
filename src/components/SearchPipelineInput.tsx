import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  Compass,
  Radio,
  BookOpen,
  Layers,
  History,
  Clock,
  X,
  Trash2,
  TrendingUp,
  Flame,
  ChevronRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { PRESET_EVENTS, PresetEvent } from '../data/presetEvents';
import { MarketCategory, KalshiLiveEvent } from '../types';
import { KalshiLiveEventsFeed } from './KalshiLiveEventsFeed';

interface SearchPipelineInputProps {
  isLoading: boolean;
  onAnalyze: (query: string, marketPriceCents?: number, category?: MarketCategory) => void;
}

export interface TrendingMarketQuery {
  title: string;
  subTitle?: string;
  category: string;
  priceCents: number;
  volume?: number;
  volume24h?: number;
  eventTicker?: string;
  marketTicker?: string;
  rules?: string;
}

const STORAGE_KEY_RECENT_SEARCHES = 'cloudboyx_recent_searches';

// High-interest curated fallback trending market queries
const FALLBACK_TRENDING_QUERIES: TrendingMarketQuery[] = [
  {
    title: 'Will the Federal Reserve cut the Fed Funds target rate by >= 25 bps at the next FOMC meeting?',
    subTitle: 'Federal Open Market Committee',
    category: 'Economics',
    priceCents: 58,
    volume: 245900,
    volume24h: 18200,
    eventTicker: 'KXFEDDEC25',
  },
  {
    title: 'Will OpenAI or Anthropic IPO first?',
    subTitle: 'Before Dec 31, 2026',
    category: 'Finance',
    priceCents: 9,
    volume: 171652,
    volume24h: 3840,
    eventTicker: 'KXOPENAIIPO',
  },
  {
    title: 'Will the next monthly U.S. Core CPI annualized rate come in strictly below 3.0%?',
    subTitle: 'Bureau of Labor Statistics',
    category: 'Economics',
    priceCents: 44,
    volume: 98400,
    volume24h: 12500,
    eventTicker: 'KXSPOKECPI',
  },
  {
    title: 'Will SpaceX successfully land the Starship Super Heavy booster on the launch tower on the next test flight?',
    subTitle: 'Starship Integrated Flight Test',
    category: 'Technology & AI',
    priceCents: 68,
    volume: 64200,
    volume24h: 4200,
    eventTicker: 'KXSTARSHIP',
  },
  {
    title: 'Will the S&P 500 close at a new all-time high by the end of the current quarter?',
    subTitle: 'S&P Dow Jones Indices',
    category: 'Finance',
    priceCents: 62,
    volume: 89300,
    volume24h: 8900,
    eventTicker: 'KXSP500ATH',
  },
  {
    title: 'Will a named tropical storm or hurricane make landfall in Florida before November 1?',
    subTitle: 'National Hurricane Center',
    category: 'Weather & Climate',
    priceCents: 38,
    volume: 42100,
    volume24h: 3100,
    eventTicker: 'KXFLHURRICANE',
  },
  {
    title: 'Will the Kansas City Chiefs defeat the Baltimore Ravens in their upcoming matchup?',
    subTitle: 'NFL Regular Season Game Winner',
    category: 'Culture & Sports',
    priceCents: 59,
    volume: 178500,
    volume24h: 42300,
    eventTicker: 'KXNFLKCBLT',
  },
  {
    title: 'Will the Detroit Lions cover the point spread (win by >= 4.5 points) against the Green Bay Packers?',
    subTitle: 'NFL Division Spread Margin',
    category: 'Culture & Sports',
    priceCents: 51,
    volume: 134200,
    volume24h: 29800,
    eventTicker: 'KXNFLDETGB',
  },
];

export const SearchPipelineInput: React.FC<SearchPipelineInputProps> = ({
  isLoading,
  onAnalyze,
}) => {
  const [query, setQuery] = useState('');
  const [marketPrice, setMarketPrice] = useState<number | ''>(50);
  const [useMarketPrice, setUseMarketPrice] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'All'>('All');
  const [eventSourceMode, setEventSourceMode] = useState<'live_kalshi' | 'curated'>('live_kalshi');

  // Input focus and suggestions dropdown state
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [trendingQueries, setTrendingQueries] = useState<TrendingMarketQuery[]>(FALLBACK_TRENDING_QUERIES);
  const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Recent Searches state (stores up to last 5 query titles)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT_SEARCHES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 5);
        }
      }
    } catch (e) {
      console.warn('Failed to load recent searches from localStorage:', e);
    }
    return [];
  });

  // Fetch trending queries from /api/markets/trending
  const fetchTrendingQueries = async () => {
    setIsLoadingTrending(true);
    try {
      const response = await fetch('/api/markets/trending');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.trending) && data.trending.length > 0) {
          setTrendingQueries(data.trending);
        }
      }
    } catch (err) {
      console.warn('Notice: using fallback trending queries:', err);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  useEffect(() => {
    fetchTrendingQueries();
  }, []);

  // Handle outside clicks to close trending dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputContainerRef.current &&
        !inputContainerRef.current.contains(event.target as Node)
      ) {
        setIsInputFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Save recent search query to state and localStorage (max 5 items, deduplicated)
  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(STORAGE_KEY_RECENT_SEARCHES, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent searches to localStorage:', e);
      }
      return updated;
    });
  };

  // Remove single search item
  const handleRemoveRecentSearch = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== itemToRemove);
      try {
        localStorage.setItem(STORAGE_KEY_RECENT_SEARCHES, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update recent searches:', err);
      }
      return updated;
    });
  };

  // Clear all recent searches
  const handleClearAllRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY_RECENT_SEARCHES);
    } catch (err) {
      console.warn('Failed to clear recent searches:', err);
    }
  };

  // Re-run recent search
  const handleSelectRecentSearch = (recentQuery: string) => {
    setQuery(recentQuery);
    const priceVal = useMarketPrice && typeof marketPrice === 'number' ? marketPrice : undefined;
    const catVal = selectedCategory === 'All' ? undefined : selectedCategory;
    saveRecentSearch(recentQuery);
    onAnalyze(recentQuery, priceVal, catVal);
  };

  const categories: Array<MarketCategory | 'All'> = [
    'All',
    'Economics',
    'Weather & Climate',
    'Technology & AI',
    'Politics',
    'Finance',
    'Culture & Sports',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    const trimmedQuery = query.trim();
    saveRecentSearch(trimmedQuery);
    const priceVal = useMarketPrice && typeof marketPrice === 'number' ? marketPrice : undefined;
    const catVal = selectedCategory === 'All' ? undefined : selectedCategory;
    onAnalyze(trimmedQuery, priceVal, catVal);
  };

  const handleSelectPreset = (preset: PresetEvent) => {
    setQuery(preset.title);
    setMarketPrice(preset.marketPriceCents);
    setUseMarketPrice(true);
    setSelectedCategory(preset.category);
    saveRecentSearch(preset.title);
    onAnalyze(preset.title, preset.marketPriceCents, preset.category);
  };

  const handleSelectLiveKalshiEvent = (
    title: string,
    priceCents: number,
    cat: MarketCategory,
    liveEvent?: KalshiLiveEvent
  ) => {
    setQuery(title);
    setMarketPrice(priceCents);
    setUseMarketPrice(true);
    setSelectedCategory(cat);
    saveRecentSearch(title);
    setIsInputFocused(false);
    onAnalyze(title, priceCents, cat);
  };

  const handleSelectTrendingQuery = (trending: TrendingMarketQuery) => {
    setQuery(trending.title);
    setMarketPrice(trending.priceCents);
    setUseMarketPrice(true);
    // Find matching category if valid
    const matchedCategory = categories.find((c) => c !== 'All' && c.toLowerCase() === trending.category.toLowerCase()) as MarketCategory | undefined;
    if (matchedCategory) {
      setSelectedCategory(matchedCategory);
    }
    saveRecentSearch(trending.title);
    setIsInputFocused(false);
    onAnalyze(trending.title, trending.priceCents, matchedCategory);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-7">
      <div className="max-w-3xl">
        <h1 className="text-xl sm:text-2xl font-bold text-[#03045e] tracking-tight flex items-center gap-2">
          <span>Prediction Market Research &amp; Odds Analysis</span>
        </h1>
        <p className="mt-1 text-sm text-stone-600 leading-relaxed">
          Browse real-time contracts currently being traded on the CFTC-regulated Kalshi exchange or enter any custom scenario. CloudboyX deconstructs resolution criteria, runs multi-agent debate, and calculates mathematical edge and Kelly sizing.
        </p>
      </div>

      {/* Main Input Form for custom queries */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
          <div ref={inputContainerRef} className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 z-10">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="event-query-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              placeholder="e.g. Will OpenAI or Anthropic IPO first? Or enter any custom event..."
              className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#0077b6] transition-all"
              disabled={isLoading}
              required
              autoComplete="off"
            />

            {/* Trending & Popular Queries Flyout Dropdown on Focus */}
            {isInputFocused && (
              <div
                ref={dropdownRef}
                id="trending-queries-dropdown"
                className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-stone-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
              >
                {/* Dropdown Header */}
                <div className="px-4 py-2.5 bg-stone-50/80 border-b border-stone-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded-md bg-amber-100 text-amber-700">
                      <Flame className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold text-[#03045e] uppercase tracking-wider">
                      Popular &amp; Trending Kalshi Markets
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef]">
                      CFTC Regulated
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsInputFocused(false)}
                      className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-stone-200/60 transition-colors"
                      title="Close suggestions"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Trending Queries List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 divide-dashed">
                  {isLoadingTrending ? (
                    <div className="py-6 flex items-center justify-center space-x-2 text-xs text-stone-500">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#0077b6]" />
                      <span>Loading active market trends from Kalshi API...</span>
                    </div>
                  ) : trendingQueries.length > 0 ? (
                    trendingQueries.map((item, idx) => (
                      <div
                        key={item.eventTicker || `${item.title}-${idx}`}
                        className="p-3 hover:bg-[#caf0f8]/30 transition-colors cursor-pointer group flex items-center justify-between gap-3 text-left"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur before click registers
                          handleSelectTrendingQuery(item);
                        }}
                      >
                        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                          <div className="mt-0.5 w-6 h-6 rounded-lg bg-stone-100 text-[#0077b6] group-hover:bg-[#0077b6] group-hover:text-white transition-colors flex items-center justify-center shrink-0 text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-stone-900 group-hover:text-[#03045e] transition-colors leading-snug truncate">
                              {item.title}
                            </div>
                            <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-stone-500">
                              <span className="font-medium text-[#0077b6]">
                                {item.category}
                              </span>
                              {item.subTitle && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[180px] sm:max-w-xs">{item.subTitle}</span>
                                </>
                              )}
                              {item.volume ? (
                                <>
                                  <span>•</span>
                                  <span className="text-stone-400">Vol: {item.volume.toLocaleString()} contracts</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Price badge & quick analyze indicator */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-extrabold text-[#03045e]">
                              {item.priceCents}¢
                            </div>
                            <div className="text-[10px] text-stone-400">
                              prob: {item.priceCents}%
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-[#0077b6] text-stone-400 group-hover:text-white flex items-center justify-center transition-colors">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-stone-400">
                      No trending items available. Type any custom event scenario above.
                    </div>
                  )}
                </div>

                {/* Dropdown Quick Helper Footer */}
                <div className="px-4 py-2 bg-stone-50/70 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-[#00b4d8]" />
                    <span>Clicking any trending query immediately pre-loads live market odds</span>
                  </span>
                  <span className="font-mono text-[10px] text-stone-400">
                    Live Kalshi Trade API v2
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            id="run-pipeline-submit-btn"
            type="submit"
            disabled={isLoading || !query.trim()}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#03045e] hover:bg-[#0077b6] disabled:bg-stone-300 text-white text-sm font-medium rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating Odds...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#00b4d8]" />
                <span>Calculate Odds</span>
                <ArrowRight className="w-4 h-4 text-[#90e0ef]" />
              </>
            )}
          </button>
        </div>

        {/* Market Pricing Optional Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-stone-100">
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={useMarketPrice}
                onChange={(e) => setUseMarketPrice(e.target.checked)}
                className="rounded border-stone-300 text-[#0077b6] focus:ring-[#0077b6]"
              />
              <span className="font-medium">Compare with current Kalshi market contract price:</span>
            </label>

            {useMarketPrice && (
              <div className="inline-flex items-center space-x-1.5 bg-[#caf0f8]/50 px-2.5 py-1 rounded-lg border border-[#90e0ef]">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={marketPrice}
                  onChange={(e) => setMarketPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-12 bg-white px-1.5 py-0.5 rounded text-center font-bold text-[#03045e] border border-[#90e0ef] text-xs"
                />
                <span className="text-[#0077b6] font-semibold">¢ ($0.{marketPrice ? String(marketPrice).padStart(2, '0') : '50'})</span>
              </div>
            )}
          </div>

          <div className="text-stone-500 italic">
            Kalshi binary contracts trade between 1¢ and 99¢ (payout: $1.00 at maturity)
          </div>
        </div>

        {/* Recent Searches Section (Persisted to localStorage, max 5) */}
        {recentSearches.length > 0 && (
          <div id="recent-searches-container" className="pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-stone-600">
                <History className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>Recent Searches</span>
                <span className="text-[11px] font-normal text-stone-400">
                  ({recentSearches.length}/5 stored)
                </span>
              </div>
              <button
                id="clear-all-recent-searches-btn"
                type="button"
                onClick={handleClearAllRecentSearches}
                className="inline-flex items-center space-x-1 text-[11px] text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Clear all recent searches"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {recentSearches.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="group inline-flex items-center max-w-full sm:max-w-md bg-stone-50 hover:bg-[#caf0f8]/40 border border-stone-200 hover:border-[#90e0ef] rounded-lg pl-2.5 pr-1.5 py-1 text-xs text-stone-700 hover:text-[#03045e] transition-all cursor-pointer shadow-2xs"
                  onClick={() => handleSelectRecentSearch(item)}
                  title={`Re-run analysis: "${item}"`}
                >
                  <Clock className="w-3 h-3 text-stone-400 group-hover:text-[#0077b6] shrink-0 mr-1.5 transition-colors" />
                  <span className="truncate text-xs font-medium mr-1.5">{item}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveRecentSearch(e, item)}
                    className="p-0.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors shrink-0"
                    title="Remove from recent searches"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Mode Switcher: Live Kalshi API vs Curated Presets */}
      <div className="mt-8 pt-5 border-t border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-1 p-1 bg-stone-100 rounded-xl border border-stone-200/80 w-fit">
            <button
              type="button"
              onClick={() => setEventSourceMode('live_kalshi')}
              className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                eventSourceMode === 'live_kalshi'
                  ? 'bg-[#0077b6] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#03045e]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#caf0f8] animate-pulse"></span>
              <span>Live Market Feed</span>
            </button>

            <button
              type="button"
              onClick={() => setEventSourceMode('curated')}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                eventSourceMode === 'curated'
                  ? 'bg-[#0077b6] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#03045e]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>Curated Benchmarks</span>
            </button>
          </div>

          <span className="text-xs text-stone-500">
            {eventSourceMode === 'live_kalshi'
              ? 'Real-time orderbook pricing & consensus trade volumes from prediction markets'
              : 'Hand-curated historical & benchmark forecasting questions'}
          </span>
        </div>

        {/* Render Selected View */}
        {eventSourceMode === 'live_kalshi' ? (
          <KalshiLiveEventsFeed
            onSelectEvent={handleSelectLiveKalshiEvent}
            isLoadingAnalysis={isLoading}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                <Compass className="w-3.5 h-3.5 text-stone-400" />
                <span>Featured Benchmark Scenarios</span>
              </div>

              {/* Category tabs for curated */}
              <div className="hidden sm:flex items-center space-x-1 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#03045e] text-white font-medium'
                        : 'text-stone-600 hover:bg-[#caf0f8]/50 hover:text-[#03045e]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {PRESET_EVENTS.filter((p) => selectedCategory === 'All' || p.category === selectedCategory).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  disabled={isLoading}
                  className="text-left p-3 rounded-xl border border-stone-200 hover:border-[#00b4d8] bg-stone-50/50 hover:bg-[#caf0f8]/20 transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                        {preset.category}
                      </span>
                      <span className="text-xs font-mono font-medium text-[#0077b6] bg-[#caf0f8] px-1.5 py-0.2 rounded border border-[#90e0ef]">
                        Mkt: {preset.marketPriceCents}¢
                      </span>
                    </div>
                    <p className="text-xs font-medium text-stone-800 line-clamp-2 group-hover:text-[#03045e]">
                      {preset.title}
                    </p>
                  </div>
                  <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
                    <span className="truncate max-w-[170px]">{preset.source}</span>
                    <span className="text-[#0077b6] font-medium group-hover:underline">Analyze &rarr;</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

