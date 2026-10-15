export type MarketCategory = 'Economics' | 'Politics' | 'Weather & Climate' | 'Technology & AI' | 'Finance' | 'Culture & Sports';

export interface PredictionMarketEvent {
  event_ticker: string;
  market_ticker: string;
  title: string;
  sub_title?: string;
  category: string;
  price_cents: number;
  yes_bid?: number | null;
  yes_ask?: number | null;
  volume: number;
  volume_24h?: number;
  open_interest: number;
  rules_primary?: string;
  settlement_sources?: Array<{ name: string; url: string }>;
  close_time?: string | null;
  updated_time?: string;
}

export type KalshiLiveEvent = PredictionMarketEvent;

export interface ResolutionCriteria {
  deadline: string;
  resolutionSource: string;
  yesCondition: string;
  noCondition: string;
  edgeCases: string[];
}

export interface AgentThesis {
  agentName: string;
  stance: 'YES' | 'NO';
  headline: string;
  confidenceEstimate: number; // 0 - 100
  keyArguments: string[];
  empiricalEvidence: string[];
  vulnerabilities: string;
}

export interface DebateSynthesis {
  coreConflict: string;
  baseRateContext: string;
  weightingRationale: string;
}

export interface ProbabilityMetrics {
  calibratedYesPercent: number; // 0 - 100
  calibratedNoPercent: number; // 0 - 100
  confidenceInterval: {
    low: number; // e.g. 58
    high: number; // e.g. 72
  };
  confidenceScore: 'High' | 'Medium' | 'Low';
  fairContractCents: number; // 1 - 99
  brierUncertaintyIndex: number; // 0 (certain) to 1 (pure coinflip)
}

export interface MarketEconomics {
  marketPriceCents: number; // current benchmark price on prediction market (1 - 99)
  spreadCents: number; // e.g. 2 cents
  impliedMarketProb: number; // market price as %
  edgePercentage: number; // model prob - market prob
  recommendedAction: 'BUY YES' | 'BUY NO' | 'PASS (Fairly Priced)' | 'AVOID (Excess Uncertainty)';
  
  // For buying YES:
  yesCostPerContract: number; // in dollars (e.g. 0.54)
  yesPayoutPerContract: number; // always $1.00
  yesProfitPerContract: number; // $0.46
  yesExpectedValue: number; // P(win)*profit - P(loss)*cost
  yesRoiPercent: number;
  
  // For buying NO:
  noCostPerContract: number; // in dollars (e.g. 0.46)
  noPayoutPerContract: number; // always $1.00
  noProfitPerContract: number; // $0.54
  noExpectedValue: number;
  noRoiPercent: number;

  // Kelly sizing
  fullKellyFraction: number; // 0 to 1
  halfKellyFraction: number; // recommended safe fraction (0 to 0.5)
  recommendedContractsOn1000Bankroll: number;

  // Fees
  estimatedKalshiFeeCents: number;
  estimatedExchangeFeeCents?: number;
  netEdgeAfterFees: number;
}

export interface CatalystEvent {
  dateOrTrigger: string;
  description: string;
  impactDirection: 'BULLISH_YES' | 'BEARISH_NO' | 'VOLATILITY';
}

export interface Eli6Explanation {
  analogyTitle: string;
  simpleStory: string;
  penniesExample: string;
  goldenRule: string;
}

export interface PriceCheckRecord {
  id: string;
  checkIndex: number;
  priceCents: number;
  timestamp: string;
  source: 'Orderbook Polled' | 'Live Kalshi API' | 'Live Consensus Feed' | 'Tick Update' | 'Initial Baseline';
  yesBid?: number | null;
  yesAsk?: number | null;
}

export interface VolatilityComparison {
  checks: PriceCheckRecord[];
  delta1To2: number;
  delta2To3: number;
  netShiftCents: number;
  netShiftPercent: number;
  minPrice: number;
  maxPrice: number;
  rangeCents: number;
  pathLengthCents: number;
  volatilityLevel: 'HIGH' | 'MODERATE' | 'LOW';
  trendDirection: 'BULLISH_SURGE' | 'BEARISH_SLIDE' | 'WHIPSAW_REVERSAL' | 'CONSOLIDATED';
  riskScore: number; // 0 - 100
  advisory: string;
}

export interface ProbabilityAnalysisResult {
  id: string;
  query: string;
  eventTitle: string;
  category: MarketCategory;
  timestamp: string;
  summary: string;
  resolutionCriteria: ResolutionCriteria;
  bullAgent: AgentThesis;
  bearAgent: AgentThesis;
  synthesis: DebateSynthesis;
  probabilities: ProbabilityMetrics;
  marketEconomics: MarketEconomics;
  catalysts: CatalystEvent[];
  eli6: Eli6Explanation;
}

export interface PaperTradePosition {
  id: string;
  analysisId: string;
  eventTitle: string;
  contractType: 'YES' | 'NO';
  purchasePriceCents: number;
  contractsCount: number;
  totalCostDollars: number;
  currentProbability: number;
  unrealizedPnLDollars: number;
  status: 'OPEN' | 'RESOLVED_WIN' | 'RESOLVED_LOSS';
  timestamp: string;
}

export type PipelineStage = 
  | 'idle'
  | 'parsing_criteria'
  | 'gathering_baserates'
  | 'bull_advocate_debate'
  | 'bear_advocate_debate'
  | 'synthesizing_calibration'
  | 'complete'
  | 'error';

export interface StructuredFeatures {
  news_sentiment_score: number;       // -1.0 to +1.0
  news_article_count: number;         // e.g. 8
  macro_momentum_percent: number;     // e.g. +0.40%
  market_volatility_vix: number;      // e.g. 15.3
  treasury_10y_yield: number;         // e.g. 4.12%
  market_implied_prior: number;       // 1 - 99 %
  days_to_resolution: number;         // e.g. 14
  // NFL Football Analytics Features
  nfl_offensive_epa?: number;         // Net Expected Points Added per play differential (-0.30 to +0.30)
  nfl_starting_qb_dvoa?: number;      // Quarterback DVOA % (-30.0% to +40.0%)
  nfl_injury_impact_index?: number;   // Net injury differential (-1.0 to +1.0)
  nfl_home_field_advantage?: number;  // Historical home-field point baseline (e.g. +1.8 pts)
  nfl_weather_wind_mph?: number;      // Stadium sustained wind velocity in mph
}

export interface NewsArticleRecord {
  title: string;
  source: string;
  published_at?: string;
  url?: string;
  sentiment_score: number;
  sentiment_label: 'Positive' | 'Negative' | 'Neutral';
}

export interface FinancialMetricRecord {
  symbol: string;
  name: string;
  price: number;
  previous_close?: number;
  change_24h_percent: number;
  volatility_index?: number;
  currency: string;
  timestamp: string;
  status: string;
}

export interface IngestedPayload {
  query: string;
  timestamp: string;
  financial_records: FinancialMetricRecord[];
  news_records: NewsArticleRecord[];
  kalshi_records?: KalshiLiveEvent[];
  features: StructuredFeatures;
}

export type ModelStage = 'linear' | 'logistic' | 'gemini';

export interface LinearModelPrediction {
  model_type: string;
  probability_percent: number;
  linear_score_raw: number;
  r_squared: number;
  intercept: number;
  weights: Record<string, number>;
  feature_contributions: Record<string, number>;
  equation: string;
}

export interface LogisticModelPrediction {
  model_type: string;
  probability_percent: number;
  log_odds_z: number;
  odds_ratio: number;
  brier_uncertainty_score: number;
  weights: Record<string, number>;
  feature_contributions: Record<string, number>;
  equation: string;
}

export interface GeminiModelPrediction {
  model_type: string;
  probability_percent: number;
  confidence_interval: {
    low: number;
    high: number;
  };
  confidence_score: 'High' | 'Medium' | 'Low';
  bayesian_prior?: number;
  key_drivers: string[];
  rationale: string;
  status: string;
}

export interface DailySentimentPoint {
  date: string; // e.g. "Sep 2"
  fullDate: string; // "2026-09-02"
  dayLabel: string; // "Wed"
  sentimentScore: number; // -1.00 to +1.00
  newsScore: number; // -1.00 to +1.00
  socialScore: number; // -1.00 to +1.00
  volume: number; // total posts/articles analyzed
  sentimentLabel: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish';
  topDrivers: string[];
  priceCents?: number; // 7-day contract price in cents (1-99¢)
  oscillationVelocity?: number; // day-over-day rate of sentiment oscillation
}

export interface MarketSentimentTrendData {
  eventTitle: string;
  category: string;
  lastUpdated: string;
  currentScore: number; // -1.00 to +1.00
  sevenDayAvg: number;
  scoreChange7d: number; // e.g. +0.28
  trendLabel: 'Bullish Surge' | 'Bearish Downtrend' | 'Moderate Optimism' | 'Skeptical Caution' | 'Neutral Equilibrium';
  divergenceWithPrice: {
    type: 'BULLISH_DIVERGENCE' | 'BEARISH_DIVERGENCE' | 'CONFIRMING_UPTREND' | 'CONFIRMING_DOWNTREND' | 'CONSOLIDATING';
    description: string;
    signalStrength: 'Strong' | 'Moderate' | 'Subtle';
  };
  oscillationStats?: {
    amplitude: number; // peak-to-trough oscillation range
    correlationWithPrice: number; // Pearson correlation between sentiment and price (-1.0 to 1.0)
    leadLagPhase: string; // e.g. 'Sentiment Leading Price'
    volatilityIndex: number; // standard deviation of sentiment wave
  };
  channelBreakdown: {
    newsSentiment: number; // -1.00 to +1.00
    newsVolume: number;
    socialSentiment: number; // -1.00 to +1.00
    socialVolume: number;
    positivePercent: number; // e.g. 58
    neutralPercent: number; // e.g. 24
    negativePercent: number; // e.g. 18
  };
  keyTopics: Array<{
    topic: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    impact: 'High' | 'Medium' | 'Low';
  }>;
  days: DailySentimentPoint[];
  dataSource: string;
}

export type PriceAlertCondition = 'ABOVE_OR_EQUAL' | 'BELOW_OR_EQUAL' | 'EXACT';

export interface PriceAlert {
  id: string;
  eventTitle: string;
  targetPriceCents: number;
  condition: PriceAlertCondition;
  createdAt: string;
  isActive: boolean;
  isTriggered?: boolean;
  triggeredAt?: string;
  triggeredPriceCents?: number;
  note?: string;
  channelBrowser?: boolean;
  channelEmail?: boolean;
  emailAddress?: string;
  alertType?: 'TARGET_PRICE' | 'SIGNIFICANT_VOLATILITY';
  significantThresholdCents?: number;
}

export interface SignificantPriceChangeConfig {
  enabled: boolean;
  minDeltaCents: number;
  channelBrowser: boolean;
  channelEmail: boolean;
  emailAddress: string;
  soundEnabled: boolean;
  cooldownSeconds: number;
  lastNotifiedAt?: number;
}

export type EnterpriseWebhookEvent =
  | 'PRICE_ALERT_TRIGGERED'
  | 'VOLATILITY_SPIKE'
  | 'KELLY_EDGE_DETECTED'
  | 'SENTIMENT_SHIFT'
  | 'MANUAL_DISPATCH'
  | 'PURCHASE_ORDER_GENERATED'
  | 'INVENTORY_REORDER_SYNC'
  | 'ADVANCE_SHIP_NOTICE'
  | 'SLACK_EVENT_NOTIFY'
  | 'TELEGRAM_EVENT_NOTIFY';

export type EnterprisePayloadFormat =
  | 'REST_JSON'
  | 'EDI_846'
  | 'EDI_850'
  | 'EDI_852'
  | 'EDI_856'
  | 'EDI_810'
  | 'CXML';

export type ConnectModuleMode = 
  | 'suite_addon' 
  | 'standalone_gateway' 
  | 'health_dashboard' 
  | 'connectors_creator' 
  | 'backtest'
  | 'marketing_showcase'
  | 'api_health_monitor';

export type ConnectorStatusType = 'operational' | 'degraded' | 'throttled' | 'offline';

export interface RateLimitBucket {
  limit: number;
  period: 'second' | 'minute' | 'hour';
  consumed: number;
  remaining: number;
  resetInSeconds: number;
  burstCapacity?: number;
}

export interface ConnectorHealthMetric {
  id: string;
  name: string;
  category: 'exchange' | 'erp' | 'ecommerce' | 'map_protection';
  targetUrl: string;
  protocol: string;
  status: ConnectorStatusType;
  statusCode: number;
  latencyMs: number;
  uptimePercent24h: number;
  lastHeartbeat: string;
  rateLimit: RateLimitBucket;
  authMethod: string;
  features: string[];
  recentPings: number[];
  lastErrorNotice?: string;
}

export interface HistoricalEventPricePoint {
  timestamp: string;
  priceCents: number;
  volume?: number;
  spreadCents?: number;
  modelProbPercent?: number;
  eventHeadline?: string;
}

export interface BacktestDataset {
  id: string;
  name: string;
  category: string;
  contractTicker: string;
  eventTitle: string;
  description: string;
  timeframe: string;
  interval: string;
  totalTicks: number;
  dataPoints: HistoricalEventPricePoint[];
}

export interface BacktestTriggerCondition {
  type: 'price_threshold' | 'volatility_spike' | 'spread_anomaly' | 'model_edge' | 'periodic_heartbeat';
  thresholdCents: number;
  direction: 'above' | 'below' | 'both';
  volatilityWindowTicks?: number;
  volatilityDeltaCents?: number;
  modelEdgeMinPercent?: number;
  cooldownTicks?: number;
}

export interface SimulatedWebhookExecution {
  id: string;
  tickIndex: number;
  timestamp: string;
  priceCents: number;
  triggerReason: string;
  eventType: EnterpriseWebhookEvent;
  format: EnterprisePayloadFormat;
  statusCode: number;
  statusText: string;
  latencyMs: number;
  success: boolean;
  payloadExcerpt: string;
  fullPayload: any;
  hmacSignature: string;
  signatureVerified: boolean;
  authScheme: string;
  retryCount?: number;
}

export interface BacktestRobustnessMetrics {
  totalEvaluatedTicks: number;
  totalDispatched: number;
  successCount: number;
  failedCount: number;
  deliverySuccessRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  peakQps: number;
  hmacVerificationRate: number;
  falsePositiveRate: number;
  robustnessScore: number;
  robustnessGrade: 'GRADE A+ (PRODUCTION READY)' | 'GRADE A (HIGH RELIABILITY)' | 'GRADE B (ACCEPTABLE)' | 'GRADE C (NEEDS TUNING)';
}

export type ConnectorType = 'marketplace' | 'erp' | 'compliance_map' | 'custom_webhook';

export type WebhookAuthType = 'bearer' | 'hmac' | 'both' | 'none';

export interface WebhookSecurityConfig {
  authType: WebhookAuthType;
  bearerToken: string;
  hmacSecret: string;
  hmacAlgorithm: 'sha256' | 'sha512';
  hmacHeaderName: string;
  includeTimestamp: boolean;
  timestampHeaderName: string;
  signaturePrefix: 'sha256=' | 'sha512=' | 'none';
  customHeaders?: Array<{ key: string; value: string }>;
}

export interface CustomConnector {
  id: string;
  name: string;
  description: string;
  type: ConnectorType;
  endpointUrl: string;
  authType: 'bearer' | 'basic' | 'hmac' | 'api_key' | 'none';
  authSecret?: string;
  supportedFormats: EnterprisePayloadFormat[];
  subscribedEvents: EnterpriseWebhookEvent[];
  direction: 'inbound' | 'outbound' | 'bidirectional';
  status: 'active' | 'paused' | 'testing';
  isPrebuilt?: boolean;
  createdAt: string;
  lastPingAt?: string;
  lastLatencyMs?: number;
  totalDelivered?: number;
  failureCount?: number;
}

export interface ActiveEventWebhook {
  id: string;
  name: string;
  connectorId?: string;
  targetUrl: string;
  eventTrigger: EnterpriseWebhookEvent;
  format: EnterprisePayloadFormat;
  status: 'healthy' | 'degraded' | 'idle' | 'failed';
  lastDeliveredAt?: string;
  deliveryCount: number;
  successCount: number;
  avgLatencyMs: number;
  autoDispatch: boolean;
}

export interface WebhookDeliveryRecord {
  id: string;
  timestamp: string;
  targetUrl: string;
  eventType: EnterpriseWebhookEvent;
  format: EnterprisePayloadFormat;
  statusCode: number;
  statusText: string;
  latencyMs: number;
  payload: any;
  responseBody?: any;
  success: boolean;
}

export interface EnterpriseSuiteApp {
  id: 'predict' | 'map_protection' | 'erp' | 'connect';
  name: string;
  tagline: string;
  role: 'Sense (Market Intelligence)' | 'Protect (Price & Compliance)' | 'Execute (Operations & EDI)' | 'Connect (Universal Webhook & EDI Gateway)';
  url: string;
  isCurrentApp: boolean;
  badge: string;
  description: string;
  features: string[];
}

export type BacktestSizingMethod = 'half_kelly' | 'full_kelly' | 'fixed_stake' | 'fixed_contracts';

export interface BacktestStrategySettings {
  category: MarketCategory;
  initialBankroll: number;
  minEdgeThreshold: number; // e.g. 4 (%)
  sizingMethod: BacktestSizingMethod;
  fixedStakeAmount: number; // e.g. $100
  fixedContractsCount: number; // e.g. 50
  includeFees: boolean;
}

export interface BacktestDayRecord {
  day: number; // 1 to 30
  date: string; // e.g. "Aug 13"
  fullDate: string; // e.g. "2026-08-13"
  contractTicker: string;
  contractTitle: string;
  category: MarketCategory;
  openPriceCents: number;
  highPriceCents: number;
  lowPriceCents: number;
  closePriceCents: number;
  spreadCents: number;
  volume: number;
  eventHeadline: string;
  actualOutcome: 'YES' | 'NO';
  modelProbPercent: number;
  modelSignal: 'BUY YES' | 'BUY NO' | 'PASS';
  edgePercent: number;
  contractsCount: number;
  positionCostDollars: number;
  feeDollars: number;
  tradePnLDollars: number;
  tradeReturnPercent: number;
  cumulativePnLDollars: number;
  cumulativeEquityDollars: number;
  benchmarkEquityDollars: number;
  drawdownPercent: number;
  isWin: boolean | null; // null if PASS
}

export interface BacktestPerformanceMetrics {
  category: MarketCategory;
  initialBankroll: number;
  finalEquity: number;
  netProfitDollars: number;
  totalRoiPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  passedDays: number;
  winRatePercent: number;
  profitFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPercent: number;
  maxDrawdownDollars: number;
  avgTradePnLDollars: number;
  brierScore: number;
  alphaVsPassivePercent: number;
  bestTradeDollars: number;
  worstTradeDollars: number;
  consecutiveWinsMax: number;
  consecutiveLossesMax: number;
}

export interface BacktestExecutionResult {
  settings: BacktestStrategySettings;
  metrics: BacktestPerformanceMetrics;
  days: BacktestDayRecord[];
  category: MarketCategory;
  timestamp: string;
}

export interface NflRecentActivityShift {
  tag: 'HOT' | 'TRENDING';
  headline: string;
  shiftValue: string; // e.g., "+1.5 pt line shift (24h)" or "+4.2% prob surge"
  volumeNote: string;
  reason: string;
  timestamp24h: string;
  isHighActivity: boolean;
}

export type PropLineShiftDirection = 'up' | 'down' | 'stable';

export interface NflPlayerProp {
  id: string;
  playerName: string;
  team: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K';
  opponent: string;
  propType: 'Passing Yards' | 'Rushing Yards' | 'Receiving Yards' | 'Passing TDs' | 'Receptions' | 'Anytime TD';
  consensusLine: number;
  consensusOverOdds: string;
  consensusUnderOdds: string;
  openingLine?: number;
  openingOverOdds?: string;
  openingUnderOdds?: string;
  lineMovement?: PropLineShiftDirection;
  lineShiftDelta?: number;
  modelProjection: number;
  unit: string;
  overProbabilityPercent: number;
  underProbabilityPercent: number;
  modelRecommendation: 'OVER' | 'UNDER' | 'NEUTRAL';
  edgePercent: number;
  matchupContext: string;
  injuryStatus: 'Active' | 'Probable' | 'Questionable';
  historicalLast5Average: number;
  recentActivityShift?: NflRecentActivityShift;
}

export interface NflPlayerPropsResponse {
  success: boolean;
  matchup: string;
  lastUpdated: string;
  source: string;
  props: NflPlayerProp[];
}

export type ActiveWorkspaceView = 'model_studio' | 'market_analyzer' | 'player_props' | 'erp_connector';

export interface TrackedPlayerPropSlip {
  id: string;
  propId: string;
  playerName: string;
  team: string;
  opponent: string;
  position: string;
  propType: string;
  side: 'OVER' | 'UNDER';
  line: number;
  unit: string;
  odds: string;
  modelProjection: number;
  edgePercent: number;
  unitsWagered: number;
  timestamp: string;
  status: 'PENDING' | 'HIT' | 'MISS';
}

export interface NflGameTeam {
  name: string;
  city: string;
  code: string;
  record: string;
  conference: string;
  division: string;
}

export interface NflGameScheduleItem {
  id: string;
  gameTitle: string;
  awayTeam: NflGameTeam;
  homeTeam: NflGameTeam;
  kickoffTime: string; // e.g. "Thursday, Sep 5 • 8:20 PM EDT"
  kickoffDate: string; // e.g. "Sep 5, 2024"
  timeSlot: 'Thursday Night' | 'Sunday Early' | 'Sunday Late' | 'Sunday Night' | 'Monday Night';
  broadcastNetwork: string; // e.g. "NBC / Peacock", "FOX", "CBS", "ESPN / ABC", "Prime Video"
  venue: string; // e.g. "GEHA Field at Arrowhead Stadium, Kansas City, MO"
  spread: string; // e.g. "KC -3.0"
  overUnder: string; // e.g. "46.5"
  moneylineAway: string; // e.g. "+135"
  moneylineHome: string; // e.g. "-155"
  weatherForecast: string; // e.g. "72°F, Clear, 5 mph wind"
  isPrimetime: boolean;
  status: 'UPCOMING' | 'LIVE' | 'FINAL';
  headlineNote?: string;
}

export interface NflScheduleResponse {
  success: boolean;
  weekTitle: string;
  seasonYear: string;
  totalGames: number;
  lastUpdated: string;
  source: string;
  games: NflGameScheduleItem[];
}

export type NflSubModelTab =
  | 'props'
  | 'matchup'
  | 'points'
  | 'predictions'
  | 'power_ratings'
  | 'site_benchmarks';

export interface NflMatchupMetric {
  name: string;
  category: 'Passing' | 'Rushing' | 'Trench' | 'Efficiency' | 'Defense';
  awayValue: string | number;
  homeValue: string | number;
  awayRank: number;
  homeRank: number;
  advantageTeam: 'AWAY' | 'HOME' | 'EVEN';
  edgeNote: string;
  unit?: string;
}

export interface NflMatchupModelData {
  id: string;
  matchupTitle: string;
  awayTeam: NflGameTeam;
  homeTeam: NflGameTeam;
  offensiveLineAdvantage: 'AWAY' | 'HOME' | 'EVEN';
  defensivePressureAdvantage: 'AWAY' | 'HOME' | 'EVEN';
  redZoneAdvantage: 'AWAY' | 'HOME' | 'EVEN';
  passingEfficiencyAdvantage: 'AWAY' | 'HOME' | 'EVEN';
  rushingEfficiencyAdvantage: 'AWAY' | 'HOME' | 'EVEN';
  metrics: NflMatchupMetric[];
  strategicKeyTakeaways: string[];
}

export interface NflPointsModelData {
  id: string;
  matchupTitle: string;
  awayTeam: NflGameTeam;
  homeTeam: NflGameTeam;
  consensusTotal: number;
  modelProjectedTotal: number;
  totalDifferential: number;
  modelRecommendation: 'OVER' | 'UNDER' | 'NEUTRAL';
  overProbability: number;
  underProbability: number;
  edgePercent: number;
  confidenceStars: number;
  paceMetrics: {
    awaySecondsPerPlay: number;
    homeSecondsPerPlay: number;
    projectedTotalPlays: number;
    paceRankAway: number;
    paceRankHome: number;
    paceStyle: string;
  };
  impliedTeamTotals: {
    awayImplied: number;
    homeImplied: number;
  };
  weatherFactor: {
    temperature: string;
    windSpeedMph: number;
    precipitationChance: number;
    passingImpactPenalty: string;
    totalPointAdjustment: number;
  };
  scoringDistribution: {
    range: string;
    probability: number;
  }[];
  simulationNotes: string[];
  recentActivityShift?: NflRecentActivityShift;
}

export interface NflPredictionsModelData {
  id: string;
  matchupTitle: string;
  awayTeam: NflGameTeam;
  homeTeam: NflGameTeam;
  projectedScoreAway: number;
  projectedScoreHome: number;
  moneylineAway: string;
  moneylineHome: string;
  spreadConsensus: string;
  spreadModel: string;
  spreadCoverEdge: number;
  awayCoverProbability: number;
  homeCoverProbability: number;
  spreadPick: string;
  spreadConfidenceStars: number;
  moneylineWinProbAway: number;
  moneylineWinProbHome: number;
  moneylineEdgeAway: number;
  moneylineEdgeHome: number;
  simulationsCount: number;
  keyOutcomeDistributions: {
    marginRange: string;
    probability: number;
  }[];
  consensusSignals: {
    source: string;
    pick: string;
    confidence: string;
  }[];
  recentActivityShift?: NflRecentActivityShift;
  spreadActivityShift?: NflRecentActivityShift;
  moneylineActivityShift?: NflRecentActivityShift;
}

export interface NflPowerRatingsData {
  id: string;
  matchupTitle: string;
  awayTeam: NflGameTeam;
  homeTeam: NflGameTeam;
  awayPowerRating: number;
  homePowerRating: number;
  awayRank: number;
  homeRank: number;
  netPowerDiff: number;
  homeFieldAdvantagePts: number;
  restDifferentialDays: number;
  travelMilesImpact: string;
  qbReplacementValuePts: {
    awayQb: string;
    awayQbWar: number;
    homeQb: string;
    homeQbWar: number;
  };
  situationalTrends: string[];
}

export interface NflSiteBenchmark {
  id: string;
  siteName: string;
  badge: string;
  siteUrl: string;
  headlineSummary: string;
  modelArchitecture: string;
  keyFeatures: string[];
  metricsUsed: string[];
  pros: string[];
  limitations: string[];
  cloudboyxEnhancement: string;
}

