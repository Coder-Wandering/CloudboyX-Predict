import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Search,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Cpu,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { NFL_SITE_BENCHMARKS } from '../data/nflModelsData';
import { NflSiteBenchmark } from '../types';

interface NflIndustryBenchmarksProps {
  onSelectModelTab?: (tab: string) => void;
}

export const NflIndustryBenchmarks: React.FC<NflIndustryBenchmarksProps> = ({
  onSelectModelTab,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(NFL_SITE_BENCHMARKS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSites = NFL_SITE_BENCHMARKS.filter((site) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      site.siteName.toLowerCase().includes(q) ||
      site.headlineSummary.toLowerCase().includes(q) ||
      site.modelArchitecture.toLowerCase().includes(q) ||
      site.metricsUsed.some((m) => m.toLowerCase().includes(q))
    );
  });

  const activeSite =
    NFL_SITE_BENCHMARKS.find((s) => s.id === selectedSiteId) || NFL_SITE_BENCHMARKS[0];

  return (
    <div id="nfl-industry-benchmarks-container" className="space-y-6">
      {/* Top Banner: Sports Prediction Sites Architecture & Reference */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                <span>Industry Sports Prediction Sites Reference</span>
              </span>
              <span className="text-xs font-bold text-stone-500">
                Comparative Architecture &amp; Methodology Audit
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#03045e] mt-1 tracking-tight">
              Leading Sports Prediction Engines &amp; Model Breakdowns
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              A detailed comparative review of how top sports forecasting sites (Action Network, TeamRankings, PFF Greenline, FiveThirtyEight Elo, FTN DVOA, and NumberFire) architect their models, calculate spreads, simulate game totals, and present value edges.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 max-w-xs shrink-0">
            <span className="font-bold text-[#03045e]">Multi-Model Synthesis:</span> CloudboyX integrates the core strengths of each pioneer (power ratings, trench grades, pace clocks, and Elo) into a unified predictive dashboard.
          </div>
        </div>
      </div>

      {/* Search & Site Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {NFL_SITE_BENCHMARKS.map((site) => (
              <button
                key={site.id}
                type="button"
                onClick={() => setSelectedSiteId(site.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  selectedSiteId === site.id
                    ? 'bg-[#03045e] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>{site.siteName}</span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search methodologies..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
            />
          </div>
        </div>
      </div>

      {/* Selected Site Deep Dive Card */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black text-[#03045e]">
                {activeSite.siteName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
                {activeSite.badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              {activeSite.headlineSummary}
            </p>
          </div>

          <a
            href={activeSite.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0077b6] hover:text-[#03045e] bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors shrink-0"
          >
            <span>Visit Reference Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 2-Column Overview: Model Architecture & Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Model Architecture Box */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="text-xs font-bold text-[#03045e] uppercase tracking-wider flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-[#0077b6]" />
              <span>Model Architecture &amp; Methodology</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {activeSite.modelArchitecture}
            </p>
          </div>

          {/* Key Metrics Used Box */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="text-xs font-bold text-[#03045e] uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Primary Statistical Metrics Employed</span>
            </div>
            <ul className="text-xs text-stone-700 space-y-1">
              {activeSite.metricsUsed.map((metric, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">&bull;</span>
                  <span>{metric}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key Model Features */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#03045e] uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-[#0077b6]" />
            <span>Key User Interface &amp; Feature Components</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeSite.keyFeatures.map((feat, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 flex items-start space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0077b6] shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pros & Limitations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Strengths */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
            <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Model Strengths</span>
            </div>
            <ul className="text-xs text-emerald-950 space-y-1.5">
              {activeSite.pros.map((pro, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">&bull;</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Limitations */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Model Limitations &amp; Blind Spots</span>
            </div>
            <ul className="text-xs text-amber-950 space-y-1.5">
              {activeSite.limitations.map((lim, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">&bull;</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CloudboyX Enhancement Callout */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white shadow-xs space-y-1">
          <div className="text-[11px] font-black uppercase tracking-wider text-[#90e0ef] flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>How CloudboyX Models Enhance This Architecture</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-100 leading-relaxed">
            {activeSite.cloudboyxEnhancement}
          </p>
        </div>
      </div>
    </div>
  );
};
