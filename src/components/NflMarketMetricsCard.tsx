import React, { useState } from 'react';
import { ProbabilityAnalysisResult } from '../types';
import {
  Trophy,
  Activity,
  Shield,
  ShieldAlert,
  Wind,
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  ArrowUpRight,
  HelpCircle,
  Download,
  Share2,
  Sliders,
  Sparkles,
  Layers,
  Swords,
  ChevronDown,
  Info,
} from 'lucide-react';

interface NflMarketMetricsCardProps {
  analysis: ProbabilityAnalysisResult;
  onTradeClick: (side: 'YES' | 'NO') => void;
  onOpenEli6: () => void;
  onExportData?: () => void;
  isNflMode: boolean;
  onToggleNflMode: (enabled: boolean) => void;
}

interface NflTeamInfo {
  name: string;
  shortName: string;
  abbreviation: string;
  color: string;
  record: string;
  qb: {
    name: string;
    dvoa: number;
    epaPerPlay: number;
    qbr: number;
    status: 'Healthy' | 'Probable' | 'Questionable';
  };
  keyPlayers: Array<{ position: string; name: string; status: 'Active' | 'Questionable' | 'Out'; impact: string }>;
  passBlockWinRate: number;
  passRushWinRate: number;
  redZonePct: number;
}

export const NflMarketMetricsCard: React.FC<NflMarketMetricsCardProps> = ({
  analysis,
  onTradeClick,
  onOpenEli6,
  onExportData,
  isNflMode,
  onToggleNflMode,
}) => {
  // Preset matchups for quick toggling
  const [selectedPreset, setSelectedPreset] = useState<'chiefs_ravens' | 'lions_packers' | 'bills_dolphins' | 'eagles_cowboys'>('chiefs_ravens');
  const [activeDepthTab, setActiveDepthTab] = useState<'qb' | 'skill' | 'trenches' | 'injuries'>('qb');
  const [spreadBetSelection, setSpreadBetSelection] = useState<'HOME' | 'AWAY'>('HOME');
  const [totalBetSelection, setTotalBetSelection] = useState<'OVER' | 'UNDER'>('OVER');
  const [tradeNotice, setTradeNotice] = useState<string | null>(null);

  // Matchup configuration based on selected preset or query analysis
  const matchups: Record<string, {
    homeTeam: NflTeamInfo;
    awayTeam: NflTeamInfo;
    spread: {
      favorite: 'HOME' | 'AWAY';
      line: number; // e.g. -3.5
      vig: string; // e.g. -110
      modelLine: number; // e.g. -4.8
      coverProb: number; // e.g. 58.4
      consensusMoney: { betsPct: number; handlePct: number };
      keyNumberNotice: string;
    };
    total: {
      line: number; // e.g. 47.5
      vig: string;
      modelTotal: number; // e.g. 50.8
      overProb: number; // e.g. 56.5
      impliedHomeScore: number;
      impliedAwayScore: number;
      weather: { stadium: string; windMph: number; tempF: number; isDome: boolean };
      pacePlaysPerGame: number;
    };
  }> = {
    chiefs_ravens: {
      homeTeam: {
        name: 'Kansas City Chiefs',
        shortName: 'Chiefs',
        abbreviation: 'KC',
        color: '#E31837',
        record: '13-3',
        qb: { name: 'Patrick Mahomes', dvoa: 24.8, epaPerPlay: 0.23, qbr: 77.2, status: 'Healthy' },
        keyPlayers: [
          { position: 'TE1', name: 'Travis Kelce', status: 'Active', impact: 'Key 3rd down target (9.2 yds/tgt)' },
          { position: 'WR1', name: 'Xavier Worthy', status: 'Active', impact: 'Deep vertical stretch threat' },
          { position: 'DT1', name: 'Chris Jones', status: 'Active', impact: 'Interior pressure anchor (18.4% PRWR)' },
          { position: 'LT1', name: 'Kingsley Suamataia', status: 'Questionable', impact: 'Ankle tweak - monitored' },
        ],
        passBlockWinRate: 67.5,
        passRushWinRate: 46.2,
        redZonePct: 65.4,
      },
      awayTeam: {
        name: 'Baltimore Ravens',
        shortName: 'Ravens',
        abbreviation: 'BAL',
        color: '#241773',
        record: '12-4',
        qb: { name: 'Lamar Jackson', dvoa: 22.4, epaPerPlay: 0.21, qbr: 74.9, status: 'Healthy' },
        keyPlayers: [
          { position: 'RB1', name: 'Derrick Henry', status: 'Active', impact: 'Lead power runner (4.9 YPC after contact)' },
          { position: 'WR1', name: 'Zay Flowers', status: 'Active', impact: 'Quick screen & slot separator' },
          { position: 'S1', name: 'Kyle Hamilton', status: 'Active', impact: 'Hybrid slot / box coverage' },
          { position: 'CB2', name: 'Nate Wiggins', status: 'Questionable', impact: 'Groin strain - game-time check' },
        ],
        passBlockWinRate: 63.8,
        passRushWinRate: 44.5,
        redZonePct: 62.1,
      },
      spread: {
        favorite: 'HOME',
        line: -3.5,
        vig: '-110',
        modelLine: -4.8,
        coverProb: 58.4,
        consensusMoney: { betsPct: 62, handlePct: 71 },
        keyNumberNotice: 'Hook risk at 3.5 — Model projects 5.1 pt margin of victory.',
      },
      total: {
        line: 47.5,
        vig: '-108',
        modelTotal: 50.8,
        overProb: 56.8,
        impliedHomeScore: 27.2,
        impliedAwayScore: 23.6,
        weather: { stadium: 'GEHA Field at Arrowhead', windMph: 8, tempF: 58, isDome: false },
        pacePlaysPerGame: 65.4,
      },
    },
    lions_packers: {
      homeTeam: {
        name: 'Detroit Lions',
        shortName: 'Lions',
        abbreviation: 'DET',
        color: '#0076B6',
        record: '14-2',
        qb: { name: 'Jared Goff', dvoa: 21.2, epaPerPlay: 0.19, qbr: 72.8, status: 'Healthy' },
        keyPlayers: [
          { position: 'WR1', name: 'Amon-Ra St. Brown', status: 'Active', impact: 'Elite slot route runner (78% catch rate)' },
          { position: 'RB1', name: 'Jahmyr Gibbs', status: 'Active', impact: 'Dual-threat explosive back' },
          { position: 'RT1', name: 'Penei Sewell', status: 'Active', impact: 'All-Pro run & pass anchor' },
          { position: 'DE1', name: 'Aidan Hutchinson', status: 'Active', impact: 'Top 3 league edge pressure rate' },
        ],
        passBlockWinRate: 72.4,
        passRushWinRate: 48.9,
        redZonePct: 68.2,
      },
      awayTeam: {
        name: 'Green Bay Packers',
        shortName: 'Packers',
        abbreviation: 'GB',
        color: '#203731',
        record: '11-5',
        qb: { name: 'Jordan Love', dvoa: 17.5, epaPerPlay: 0.16, qbr: 68.4, status: 'Healthy' },
        keyPlayers: [
          { position: 'RB1', name: 'Josh Jacobs', status: 'Active', impact: 'Downhill between-tackles hammer' },
          { position: 'WR1', name: 'Jayden Reed', status: 'Active', impact: 'Motion playmaker & target leader' },
          { position: 'CB1', name: 'Jaire Alexander', status: 'Questionable', impact: 'Knee soreness - shadow duty in doubt' },
          { position: 'DT1', name: 'Kenny Clark', status: 'Active', impact: 'Interior run stopper' },
        ],
        passBlockWinRate: 64.1,
        passRushWinRate: 41.8,
        redZonePct: 59.5,
      },
      spread: {
        favorite: 'HOME',
        line: -3.0,
        vig: '-115',
        modelLine: -4.5,
        coverProb: 61.2,
        consensusMoney: { betsPct: 68, handlePct: 76 },
        keyNumberNotice: 'Sitting on Key Number 3. Model suggests laying -3 or -3.5 under -115.',
      },
      total: {
        line: 49.5,
        vig: '-110',
        modelTotal: 52.4,
        overProb: 58.2,
        impliedHomeScore: 28.5,
        impliedAwayScore: 23.9,
        weather: { stadium: 'Ford Field (Indoor Dome)', windMph: 0, tempF: 72, isDome: true },
        pacePlaysPerGame: 66.8,
      },
    },
    bills_dolphins: {
      homeTeam: {
        name: 'Buffalo Bills',
        shortName: 'Bills',
        abbreviation: 'BUF',
        color: '#00338D',
        record: '12-4',
        qb: { name: 'Josh Allen', dvoa: 26.5, epaPerPlay: 0.25, qbr: 79.1, status: 'Healthy' },
        keyPlayers: [
          { position: 'RB1', name: 'James Cook', status: 'Active', impact: 'Open-field explosive runner' },
          { position: 'TE1', name: 'Dalton Kincaid', status: 'Active', impact: 'Primary seam seam threat' },
          { position: 'LB1', name: 'Terrel Bernard', status: 'Active', impact: 'Defensive play-caller & run plugger' },
          { position: 'DE1', name: 'Greg Rousseau', status: 'Active', impact: 'High pass-rush win rate off edge' },
        ],
        passBlockWinRate: 69.1,
        passRushWinRate: 45.3,
        redZonePct: 67.0,
      },
      awayTeam: {
        name: 'Miami Dolphins',
        shortName: 'Dolphins',
        abbreviation: 'MIA',
        color: '#008E97',
        record: '9-7',
        qb: { name: 'Tua Tagovailoa', dvoa: 14.2, epaPerPlay: 0.12, qbr: 64.5, status: 'Healthy' },
        keyPlayers: [
          { position: 'WR1', name: 'Tyreek Hill', status: 'Active', impact: 'Unmatched 4.29 speed boundary threat' },
          { position: 'WR2', name: 'Jaylen Waddle', status: 'Active', impact: 'Crosser & YAC specialist' },
          { position: 'RB1', name: 'De\'Von Achane', status: 'Active', impact: '7.1 YPC perimeter home run threat' },
          { position: 'LT1', name: 'Terron Armstead', status: 'Questionable', impact: 'Knee management' },
        ],
        passBlockWinRate: 59.8,
        passRushWinRate: 40.2,
        redZonePct: 56.4,
      },
      spread: {
        favorite: 'HOME',
        line: -6.5,
        vig: '-110',
        modelLine: -7.8,
        coverProb: 59.7,
        consensusMoney: { betsPct: 59, handlePct: 67 },
        keyNumberNotice: 'Buffalo holds +2.1 EPA differential in cold-weather outdoor games.',
      },
      total: {
        line: 48.0,
        vig: '-110',
        modelTotal: 49.6,
        overProb: 54.1,
        impliedHomeScore: 28.0,
        impliedAwayScore: 21.6,
        weather: { stadium: 'Highmark Stadium', windMph: 14, tempF: 42, isDome: false },
        pacePlaysPerGame: 63.9,
      },
    },
    eagles_cowboys: {
      homeTeam: {
        name: 'Philadelphia Eagles',
        shortName: 'Eagles',
        abbreviation: 'PHI',
        color: '#004C54',
        record: '13-3',
        qb: { name: 'Jalen Hurts', dvoa: 20.4, epaPerPlay: 0.18, qbr: 71.3, status: 'Healthy' },
        keyPlayers: [
          { position: 'RB1', name: 'Saquon Barkley', status: 'Active', impact: 'Leading league in yards after contact' },
          { position: 'WR1', name: 'A.J. Brown', status: 'Active', impact: 'Dominant X-receiver on intermediate posts' },
          { position: 'WR2', name: 'DeVonta Smith', status: 'Active', impact: 'Precision route runner' },
          { position: 'DT1', name: 'Jalen Carter', status: 'Active', impact: 'Disruptive interior penetration' },
        ],
        passBlockWinRate: 71.0,
        passRushWinRate: 47.1,
        redZonePct: 69.5,
      },
      awayTeam: {
        name: 'Dallas Cowboys',
        shortName: 'Cowboys',
        abbreviation: 'DAL',
        color: '#041E42',
        record: '8-8',
        qb: { name: 'Dak Prescott', dvoa: 15.8, epaPerPlay: 0.14, qbr: 65.8, status: 'Healthy' },
        keyPlayers: [
          { position: 'WR1', name: 'CeeDee Lamb', status: 'Active', impact: 'Target monster with 32% team target share' },
          { position: 'DE1', name: 'Micah Parsons', status: 'Active', impact: 'Game-wrecking 24.1% pass rush win rate' },
          { position: 'CB1', name: 'Trevon Diggs', status: 'Active', impact: 'Ball-hawk risk/reward coverage' },
          { position: 'RG1', name: 'Zack Martin', status: 'Questionable', impact: 'Ankle soreness' },
        ],
        passBlockWinRate: 62.4,
        passRushWinRate: 46.5,
        redZonePct: 58.0,
      },
      spread: {
        favorite: 'HOME',
        line: -4.5,
        vig: '-110',
        modelLine: -6.2,
        coverProb: 62.4,
        consensusMoney: { betsPct: 66, handlePct: 74 },
        keyNumberNotice: 'Eagles offensive line holds +12% Pass Block Win Rate over Dallas DL.',
      },
      total: {
        line: 46.5,
        vig: '-112',
        modelTotal: 48.9,
        overProb: 55.4,
        impliedHomeScore: 27.5,
        impliedAwayScore: 21.4,
        weather: { stadium: 'Lincoln Financial Field', windMph: 7, tempF: 52, isDome: false },
        pacePlaysPerGame: 64.8,
      },
    },
  };

  const currentMatchup = matchups[selectedPreset] || matchups.chiefs_ravens;
  const { homeTeam, awayTeam, spread, total } = currentMatchup;

  const handleSimulateBet = (type: 'SPREAD' | 'TOTAL' | 'MONEYLINE', detail: string) => {
    setTradeNotice(`Simulated paper bet submitted: ${detail}! View in Portfolio.`);
    onTradeClick('YES');
    setTimeout(() => {
      setTradeNotice(null);
    }, 3500);
  };

  return (
    <div
      id="nfl-market-metrics-card"
      className="bg-white rounded-2xl border border-[#90e0ef] shadow-xs p-5 sm:p-6 space-y-6 animate-fade-in"
    >
      {/* Top Banner: Mode Indicator & Quick Preset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#03045e] text-[#caf0f8] flex items-center justify-center shadow-xs">
            <Trophy className="w-5 h-5 text-[#90e0ef]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#03045e] uppercase tracking-wider">
                NFL Football Analytics Mode
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#caf0f8] text-[#0077b6] border border-[#00b4d8]">
                LIVE MODEL
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Sport-specific analytics: Game Spread, Over/Under totals, and Team Depth Charts
            </p>
          </div>
        </div>

        {/* Mode Toggle Control */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            id="market-analyzer-mode-toggle"
            type="button"
            onClick={() => onToggleNflMode(!isNflMode)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border bg-[#03045e] text-white border-[#03045e] hover:bg-[#0077b6]"
            title="Switch back to Generic Market Contract mode"
          >
            <Sliders className="w-3.5 h-3.5 text-[#caf0f8]" />
            <span>Switch to Generic Contract Mode</span>
          </button>

          {onExportData && (
            <button
              onClick={onExportData}
              className="p-1.5 rounded-xl bg-stone-100 hover:bg-[#caf0f8] text-stone-600 hover:text-[#0077b6] transition-colors cursor-pointer border border-stone-200"
              title="Export Research Data"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenEli6}
            className="p-1.5 rounded-xl bg-stone-100 hover:bg-[#caf0f8] text-stone-600 hover:text-[#0077b6] transition-colors cursor-pointer border border-stone-200"
            title="Explain Like I'm 6"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Matchup Selector Bar & Team Marquee */}
      <div className="p-4 rounded-xl bg-[#caf0f8]/25 border border-[#90e0ef] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Teams Head-to-Head Display */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-2xs"
              style={{ backgroundColor: awayTeam.color }}
            >
              {awayTeam.abbreviation}
            </span>
            <div>
              <div className="text-xs font-bold text-stone-900">{awayTeam.name}</div>
              <div className="text-[10px] text-stone-500 font-mono">({awayTeam.record}) Away</div>
            </div>
          </div>

          <span className="text-xs font-black text-stone-400 font-mono">@</span>

          <div className="flex items-center space-x-2">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-2xs"
              style={{ backgroundColor: homeTeam.color }}
            >
              {homeTeam.abbreviation}
            </span>
            <div>
              <div className="text-xs font-bold text-stone-900">{homeTeam.name}</div>
              <div className="text-[10px] text-stone-500 font-mono">({homeTeam.record}) Home</div>
            </div>
          </div>
        </div>

        {/* Matchup Quick Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-stone-500 text-[11px] font-semibold mr-1">Matchup:</span>
          <button
            type="button"
            onClick={() => setSelectedPreset('chiefs_ravens')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedPreset === 'chiefs_ravens'
                ? 'bg-[#0077b6] text-white shadow-2xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            KC vs BAL
          </button>
          <button
            type="button"
            onClick={() => setSelectedPreset('lions_packers')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedPreset === 'lions_packers'
                ? 'bg-[#0077b6] text-white shadow-2xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            DET vs GB
          </button>
          <button
            type="button"
            onClick={() => setSelectedPreset('bills_dolphins')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedPreset === 'bills_dolphins'
                ? 'bg-[#0077b6] text-white shadow-2xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            BUF vs MIA
          </button>
          <button
            type="button"
            onClick={() => setSelectedPreset('eagles_cowboys')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedPreset === 'eagles_cowboys'
                ? 'bg-[#0077b6] text-white shadow-2xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            PHI vs DAL
          </button>
        </div>
      </div>

      {/* PRIMARY NFL SPORT-SPECIFIC METRIC CARDS (Game Spread & Over/Under) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* METRIC 1: GAME SPREAD CARD */}
        <div
          id="nfl-game-spread-card"
          className="rounded-xl p-5 bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-4 hover:border-[#0077b6] transition-all"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-[#0077b6]" />
                <span className="text-xs font-bold text-[#03045e] uppercase tracking-wider">
                  Game Spread (Point Handicap)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#caf0f8] text-[#0077b6]">
                CONSENSUS LINE
              </span>
            </div>

            {/* Primary Spread Display */}
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#03045e] tracking-tight">
                  {homeTeam.shortName} {spread.line > 0 ? `+${spread.line}` : spread.line}
                </div>
                <div className="text-xs text-stone-500 font-medium mt-0.5">
                  Consensus vig: {spread.vig} &bull; Away line: {awayTeam.shortName} {spread.line > 0 ? `${-spread.line}` : `+${Math.abs(spread.line)}`}
                </div>
              </div>

              {/* Model Fair Spread Badge */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Model Fair Line</span>
                <span className="text-lg font-black text-[#0077b6]">
                  {homeTeam.shortName} {spread.modelLine > 0 ? `+${spread.modelLine}` : spread.modelLine}
                </span>
              </div>
            </div>

            {/* Cover Probability & Edge */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase font-medium">Cover Probability</span>
                <span className="text-base font-extrabold text-[#03045e]">{spread.coverProb}%</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">+4.2% EV Edge</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase font-medium">Smart Money Split</span>
                <span className="text-base font-extrabold text-[#0077b6]">{spread.consensusMoney.handlePct}% Handle</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">{spread.consensusMoney.betsPct}% of total tickets</span>
              </div>
            </div>

            {/* Spread Key Number & Push Warning */}
            <div className="p-2.5 rounded-lg bg-[#caf0f8]/40 border border-[#90e0ef] text-xs text-[#03045e] flex items-start space-x-2">
              <Info className="w-3.5 h-3.5 text-[#0077b6] shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">{spread.keyNumberNotice}</span>
            </div>
          </div>

          {/* Action Trigger for Game Spread */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSpreadBetSelection('HOME')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  spreadBetSelection === 'HOME'
                    ? 'bg-[#0077b6] text-white'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {homeTeam.shortName} {spread.line}
              </button>
              <button
                type="button"
                onClick={() => setSpreadBetSelection('AWAY')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  spreadBetSelection === 'AWAY'
                    ? 'bg-[#03045e] text-white'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {awayTeam.shortName} {spread.line > 0 ? `${-spread.line}` : `+${Math.abs(spread.line)}`}
              </button>
            </div>

            <button
              type="button"
              id="bet-spread-btn"
              onClick={() => handleSimulateBet('SPREAD', `${spreadBetSelection === 'HOME' ? homeTeam.name : awayTeam.name} Spread (${spread.line})`)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0077b6] hover:bg-[#0096c7] text-white transition-colors cursor-pointer shadow-2xs"
            >
              <span>Paper Bet Spread</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* METRIC 2: OVER/UNDER (TOTAL POINTS) CARD */}
        <div
          id="nfl-over-under-card"
          className="rounded-xl p-5 bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-4 hover:border-[#0077b6] transition-all"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#0077b6]" />
                <span className="text-xs font-bold text-[#03045e] uppercase tracking-wider">
                  Over / Under (Game Total)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#caf0f8] text-[#0077b6]">
                TOTAL POINTS
              </span>
            </div>

            {/* Primary Over/Under Display */}
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#03045e] tracking-tight">
                  {total.line} Pts
                </div>
                <div className="text-xs text-stone-500 font-medium mt-0.5">
                  Standard vig: {total.vig} &bull; Model projection: <strong className="text-[#0077b6]">{total.modelTotal} Pts</strong>
                </div>
              </div>

              {/* Model Edge on Over/Under */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Model Lean</span>
                <span className="text-lg font-black text-emerald-600">
                  OVER ({total.overProb}%)
                </span>
              </div>
            </div>

            {/* Implied Team Totals */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase font-medium">{homeTeam.shortName} Implied Total</span>
                <span className="text-base font-extrabold text-[#03045e]">{total.impliedHomeScore} pts</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Predicted score</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase font-medium">{awayTeam.shortName} Implied Total</span>
                <span className="text-base font-extrabold text-[#0077b6]">{total.impliedAwayScore} pts</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Predicted score</span>
              </div>
            </div>

            {/* Stadium Weather & Pace Impact */}
            <div className="p-2.5 rounded-lg bg-[#caf0f8]/40 border border-[#90e0ef] text-xs text-[#03045e] flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Wind className="w-3.5 h-3.5 text-[#0077b6]" />
                <span className="text-[11px]">
                  {total.weather.stadium} &bull; {total.weather.isDome ? 'Dome / Climate Controlled' : `${total.weather.windMph} mph wind, ${total.weather.tempF}°F`}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-stone-600">
                {total.pacePlaysPerGame} plays/g
              </span>
            </div>
          </div>

          {/* Action Trigger for Over/Under */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs">
              <button
                type="button"
                onClick={() => setTotalBetSelection('OVER')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  totalBetSelection === 'OVER'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                Over {total.line}
              </button>
              <button
                type="button"
                onClick={() => setTotalBetSelection('UNDER')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  totalBetSelection === 'UNDER'
                    ? 'bg-[#03045e] text-white'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                Under {total.line}
              </button>
            </div>

            <button
              type="button"
              id="bet-total-btn"
              onClick={() => handleSimulateBet('TOTAL', `Game Total ${totalBetSelection} ${total.line}`)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#03045e] hover:bg-[#0077b6] text-white transition-colors cursor-pointer shadow-2xs"
            >
              <span>Paper Bet Total</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast Notice */}
      {tradeNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{tradeNotice}</span>
        </div>
      )}

      {/* METRIC 3: TEAM DEPTH CHART & MATCHUP MATRIX */}
      <div
        id="nfl-team-depth-chart-card"
        className="rounded-xl p-5 bg-white border border-stone-200 space-y-4 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-[#0077b6]" />
            <div>
              <h3 className="text-xs font-bold text-[#03045e] uppercase tracking-wider">
                Team Depth Chart &amp; Personnel Matchup Matrix
              </h3>
              <p className="text-[11px] text-stone-500">
                Starting Quarterbacks, key skill position depth, pass protection win rates &amp; injury impact
              </p>
            </div>
          </div>

          {/* Depth Chart Category Sub-tabs */}
          <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveDepthTab('qb')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDepthTab === 'qb'
                  ? 'bg-white text-[#03045e] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Quarterbacks
            </button>
            <button
              type="button"
              onClick={() => setActiveDepthTab('skill')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDepthTab === 'skill'
                  ? 'bg-white text-[#03045e] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Skill Positions
            </button>
            <button
              type="button"
              onClick={() => setActiveDepthTab('trenches')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDepthTab === 'trenches'
                  ? 'bg-white text-[#03045e] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Trenches (OL/DL)
            </button>
            <button
              type="button"
              onClick={() => setActiveDepthTab('injuries')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDepthTab === 'injuries'
                  ? 'bg-white text-[#03045e] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Injury Impact
            </button>
          </div>
        </div>

        {/* Tab 1: Starting Quarterback Matchup */}
        {activeDepthTab === 'qb' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            {/* Away QB */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-6 h-6 rounded-md text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: awayTeam.color }}
                  >
                    {awayTeam.abbreviation}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">{awayTeam.qb.name}</span>
                    <span className="text-[10px] text-stone-500">Starting QB1 &bull; {awayTeam.name}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {awayTeam.qb.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-white border border-stone-200">
                  <span className="text-[9px] text-stone-400 block uppercase font-bold">DVOA %</span>
                  <span className="text-xs font-extrabold text-[#03045e]">+{awayTeam.qb.dvoa}%</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-stone-200">
                  <span className="text-[9px] text-stone-400 block uppercase font-bold">EPA / Play</span>
                  <span className="text-xs font-extrabold text-[#0077b6]">+{awayTeam.qb.epaPerPlay}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-stone-200">
                  <span className="text-[9px] text-stone-400 block uppercase font-bold">ESPN QBR</span>
                  <span className="text-xs font-extrabold text-stone-800">{awayTeam.qb.qbr}</span>
                </div>
              </div>
            </div>

            {/* Home QB */}
            <div className="p-4 rounded-xl bg-[#caf0f8]/20 border border-[#90e0ef] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-6 h-6 rounded-md text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: homeTeam.color }}
                  >
                    {homeTeam.abbreviation}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">{homeTeam.qb.name}</span>
                    <span className="text-[10px] text-stone-500">Starting QB1 &bull; {homeTeam.name}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {homeTeam.qb.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-white border border-stone-200">
                  <span className="text-[9px] text-stone-400 block uppercase font-bold">DVOA %</span>
                  <span className="text-xs font-extrabold text-[#03045e]">+{homeTeam.qb.dvoa}%</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-stone-200">
                  <span className="text-[9px] text-stone-400 block uppercase font-bold">EPA / Play</span>
                  <span className="text-xs font-extrabold text-[#0077b6]">+{homeTeam.qb.epaPerPlay}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-stone-200">
                  <span className="text-[9px] text-stone-400 block uppercase font-bold">ESPN QBR</span>
                  <span className="text-xs font-extrabold text-stone-800">{homeTeam.qb.qbr}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Skill Positions Depth Chart */}
        {activeDepthTab === 'skill' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            {/* Away Key Skill Players */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-600 block uppercase">
                {awayTeam.name} Depth Chart (Key Starters)
              </span>
              <div className="space-y-1.5">
                {awayTeam.keyPlayers.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-mono font-bold text-[10px]">
                        {p.position}
                      </span>
                      <div>
                        <span className="font-bold text-stone-900">{p.name}</span>
                        <span className="text-[10px] text-stone-500 block">{p.impact}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      p.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'Questionable'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Home Key Skill Players */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-600 block uppercase">
                {homeTeam.name} Depth Chart (Key Starters)
              </span>
              <div className="space-y-1.5">
                {homeTeam.keyPlayers.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-[#caf0f8] text-[#0077b6] font-mono font-bold text-[10px]">
                        {p.position}
                      </span>
                      <div>
                        <span className="font-bold text-stone-900">{p.name}</span>
                        <span className="text-[10px] text-stone-500 block">{p.impact}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      p.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'Questionable'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Trenches (O-Line vs D-Line Win Rates) */}
        {activeDepthTab === 'trenches' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#03045e]">
                <span>{awayTeam.shortName} Trench Battle</span>
                <Swords className="w-4 h-4 text-[#0077b6]" />
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                    <span>Pass Block Win Rate (ESPN Analytics)</span>
                    <span className="font-mono font-bold">{awayTeam.passBlockWinRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0077b6]" style={{ width: `${awayTeam.passBlockWinRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                    <span>Pass Rush Win Rate</span>
                    <span className="font-mono font-bold">{awayTeam.passRushWinRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#03045e]" style={{ width: `${awayTeam.passRushWinRate}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#caf0f8]/20 border border-[#90e0ef] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#03045e]">
                <span>{homeTeam.shortName} Trench Battle</span>
                <Swords className="w-4 h-4 text-[#0077b6]" />
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                    <span>Pass Block Win Rate (ESPN Analytics)</span>
                    <span className="font-mono font-bold">{homeTeam.passBlockWinRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0077b6]" style={{ width: `${homeTeam.passBlockWinRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                    <span>Pass Rush Win Rate</span>
                    <span className="font-mono font-bold">{homeTeam.passRushWinRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#03045e]" style={{ width: `${homeTeam.passRushWinRate}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Injury Impact & Net Point Adjustment */}
        {activeDepthTab === 'injuries' && (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-[#0077b6]" />
                <span className="text-xs font-bold text-[#03045e] uppercase">
                  Net Depth Chart Injury Differential Index
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
                +0.08 NET ADVANTAGE (HOME)
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Based on active injury report filings: Both starting quarterbacks are fully cleared with clean practice participation.
              Key personnel monitoring is concentrated on offensive tackle pass protection and secondary depth. Net model point spread adjustment is <strong>+0.6 pts</strong> toward {homeTeam.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
