import { MarketCategory } from '../types';

export interface PresetEvent {
  title: string;
  category: MarketCategory;
  marketPriceCents: number;
  description: string;
  source: string;
}

export const PRESET_EVENTS: PresetEvent[] = [
  {
    title: 'Will the Federal Reserve cut the Fed Funds target rate by >= 25 bps at the next FOMC meeting?',
    category: 'Economics',
    marketPriceCents: 58,
    description: 'Federal Open Market Committee policy announcement and interest rate target range.',
    source: 'Federal Reserve Board of Governors',
  },
  {
    title: 'Will the next monthly U.S. Core CPI annualized rate come in strictly below 3.0%?',
    category: 'Economics',
    marketPriceCents: 44,
    description: 'Bureau of Labor Statistics Consumer Price Index for All Urban Consumers (CPI-U) Core metric.',
    source: 'U.S. Bureau of Labor Statistics (BLS)',
  },
  {
    title: 'Will a named tropical storm or hurricane make landfall in Florida before November 1?',
    category: 'Weather & Climate',
    marketPriceCents: 38,
    description: 'National Hurricane Center official cyclone track and continental U.S. landfall verification.',
    source: 'NOAA National Hurricane Center (NHC)',
  },
  {
    title: 'Will SpaceX successfully land the Starship Super Heavy booster on the launch tower on the next test flight?',
    category: 'Technology & AI',
    marketPriceCents: 68,
    description: 'Next integrated test flight tower catch verification via mission control telemetry.',
    source: 'FAA Launch License & SpaceX Official Mission Broadcast',
  },
  {
    title: 'Will the U.S. Senate pass the bipartisan AI safety and transparency framework bill this calendar year?',
    category: 'Politics',
    marketPriceCents: 29,
    description: 'Roll call vote passage in the United States Senate and transmission to the House or White House.',
    source: 'Official Congressional Record (Congress.gov)',
  },
  {
    title: 'Will the S&P 500 close at a new all-time high by the end of the current quarter?',
    category: 'Finance',
    marketPriceCents: 62,
    description: 'S&P 500 Index official daily closing level verified at 4:00 PM Eastern standard trading close.',
    source: 'S&P Dow Jones Indices / NYSE Data Feed',
  },
  {
    title: 'Will the Kansas City Chiefs defeat the Baltimore Ravens in their upcoming matchup?',
    category: 'Culture & Sports',
    marketPriceCents: 59,
    description: 'NFL regular season moneyline resolution verified via official NFL Game Statistics & Information System (GSIS).',
    source: 'NFL GSIS / NFL.com Official Box Score',
  },
  {
    title: 'Will the Detroit Lions cover the point spread (win by >= 4.5 points) against the Green Bay Packers?',
    category: 'Culture & Sports',
    marketPriceCents: 51,
    description: 'Contract settles YES ($1.00) if Detroit wins by strictly 5 or more points, NO ($0.00) if Green Bay wins or loses by 4 or fewer points.',
    source: 'NFL GSIS / Official Game Book Scoring Summary',
  },
  {
    title: 'Will total combined points in Buffalo Bills vs. Miami Dolphins reach strictly >= 48.5 points?',
    category: 'Culture & Sports',
    marketPriceCents: 48,
    description: 'Full game including official 10-minute overtime total combined points scored by both teams.',
    source: 'Official NFL.com Final Box Score & Scoring Summary',
  },
  {
    title: 'Will the San Francisco 49ers clinch the NFC West division title before Week 18?',
    category: 'Culture & Sports',
    marketPriceCents: 64,
    description: 'Mathematical clinch of 1st place in NFC West per official NFL tiebreaking procedures.',
    source: 'NFL Communications / Official Standings & Tiebreakers',
  },
  {
    title: 'Will Patrick Mahomes record strictly >= 2.5 passing touchdowns in his next game?',
    category: 'Culture & Sports',
    marketPriceCents: 53,
    description: 'Individual player passing touchdown count verified following official Elias Sports Bureau Tuesday stat audit.',
    source: 'Elias Sports Bureau / NFL GSIS Weekly Stat Audit',
  },
];
