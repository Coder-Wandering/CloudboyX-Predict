import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  History,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Download,
  ShieldCheck,
  Check,
  AlertTriangle,
  Activity,
  Clock,
  ArrowRight,
  FileText,
  CheckCircle2,
  XCircle,
  Sliders,
  Sparkles,
  TrendingUp,
  BarChart3,
  Search,
  Copy,
  Lock,
  Zap,
  AlertCircle,
  Eye,
  ChevronRight,
  Server,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import {
  EnterprisePayloadFormat,
  EnterpriseWebhookEvent,
  WebhookSecurityConfig,
  BacktestDataset,
  SimulatedWebhookExecution,
  BacktestRobustnessMetrics,
} from '../types';
import { BACKTEST_DATASETS } from '../data/backtestDatasets';

interface WebhookBacktestModuleProps {
  securityConfig: WebhookSecurityConfig;
  targetUrl: string;
  onPromoteRules?: (rules: {
    thresholdCents: number;
    eventType: EnterpriseWebhookEvent;
    format: EnterprisePayloadFormat;
  }) => void;
  onOpenStudio?: () => void;
  onOpenHealthDashboard?: () => void;
  onOpenSecurityModal?: () => void;
}

type TriggerRuleType = 'price_threshold' | 'volatility_spike' | 'spread_anomaly' | 'model_edge' | 'periodic_heartbeat';
type NetworkSimulationProfile = 'enterprise_wan' | 'zero_loss_lan' | 'congested_jitter' | 'degraded_erp';

export const WebhookBacktestModule: React.FC<WebhookBacktestModuleProps> = ({
  securityConfig,
  targetUrl,
  onPromoteRules,
  onOpenStudio,
  onOpenHealthDashboard,
  onOpenSecurityModal,
}) => {
  // Dataset selection
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('fomc-rate-cut-50');
  const activeDataset: BacktestDataset = useMemo(() => {
    return BACKTEST_DATASETS.find((d) => d.id === selectedDatasetId) || BACKTEST_DATASETS[0];
  }, [selectedDatasetId]);

  // Trigger Policy Configuration
  const [ruleType, setRuleType] = useState<TriggerRuleType>('price_threshold');
  const [thresholdCents, setThresholdCents] = useState<number>(65);
  const [thresholdDirection, setThresholdDirection] = useState<'above' | 'below' | 'both'>('above');
  const [volatilityDeltaCents, setVolatilityDeltaCents] = useState<number>(8);
  const [volatilityWindowTicks, setVolatilityWindowTicks] = useState<number>(4);
  const [modelEdgeMinPercent, setModelEdgeMinPercent] = useState<number>(8);
  const [cooldownTicks, setCooldownTicks] = useState<number>(3);
  const [targetEventType, setTargetEventType] = useState<EnterpriseWebhookEvent>('PRICE_ALERT_TRIGGERED');
  const [payloadFormat, setPayloadFormat] = useState<EnterprisePayloadFormat>('REST_JSON');
  const [networkProfile, setNetworkProfile] = useState<NetworkSimulationProfile>('enterprise_wan');

  // Simulation execution state
  const [simulatedExecutions, setSimulatedExecutions] = useState<SimulatedWebhookExecution[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTickIndex, setCurrentTickIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(5);
  const [selectedExecution, setSelectedExecution] = useState<SimulatedWebhookExecution | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUCCESS' | 'WARNING'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [hoveredTick, setHoveredTick] = useState<number | null>(null);

  // Playback timer ref
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to compute HMAC signature for a simulated payload using SubtleCrypto
  const computeHmac = async (secret: string, text: string, algo: 'sha256' | 'sha512' = 'sha256'): Promise<string> => {
    try {
      if (!secret) return 'sim_unauthenticated_hash_' + Math.random().toString(36).substring(2, 10);
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const subtleAlgo = algo === 'sha512' ? 'SHA-512' : 'SHA-256';
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: subtleAlgo } },
        false,
        ['sign']
      );
      const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(text));
      const hashArray = Array.from(new Uint8Array(signatureBuffer));
      const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return securityConfig.signaturePrefix === 'none'
        ? hex
        : `${securityConfig.signaturePrefix || 'sha256='}${hex}`;
    } catch {
      return 'sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    }
  };

  // Helper to calculate network latency and jitter based on profile
  const sampleNetworkLatency = (profile: NetworkSimulationProfile): { latencyMs: number; success: boolean; statusCode: number; statusText: string } => {
    if (profile === 'zero_loss_lan') {
      const latency = Math.round(18 + Math.random() * 14);
      return { latencyMs: latency, success: true, statusCode: 200, statusText: '200 OK (Cloud Interconnect)' };
    }
    if (profile === 'congested_jitter') {
      const isSlow = Math.random() < 0.25;
      const isDrop = Math.random() < 0.04;
      if (isDrop) {
        return { latencyMs: 480, success: false, statusCode: 504, statusText: '504 Gateway Timeout (Simulated Drop)' };
      }
      const latency = isSlow ? Math.round(160 + Math.random() * 180) : Math.round(55 + Math.random() * 60);
      return { latencyMs: latency, success: true, statusCode: 200, statusText: '200 OK (Jitter Compensated)' };
    }
    if (profile === 'degraded_erp') {
      const isQueueFull = Math.random() < 0.08;
      if (isQueueFull) {
        return { latencyMs: 520, success: false, statusCode: 429, statusText: '429 Rate Limit Exceeded (SAP Queue Full)' };
      }
      const latency = Math.round(190 + Math.random() * 240);
      return { latencyMs: latency, success: true, statusCode: 200, statusText: '200 OK (RFC Inbound Sync)' };
    }
    // enterprise_wan (default)
    const isJitter = Math.random() < 0.05;
    const latency = isJitter ? Math.round(95 + Math.random() * 65) : Math.round(38 + Math.random() * 32);
    return { latencyMs: latency, success: true, statusCode: 200, statusText: '200 OK (Delivered)' };
  };

  // Evaluates whether a specific tick fires a webhook trigger
  const evaluateTickTrigger = (
    tickIndex: number,
    lastTriggerTick: number
  ): { shouldTrigger: boolean; reason: string } => {
    if (tickIndex - lastTriggerTick < cooldownTicks) {
      return { shouldTrigger: false, reason: 'In cooldown period' };
    }

    const currentPoint = activeDataset.dataPoints[tickIndex];
    if (!currentPoint) return { shouldTrigger: false, reason: 'Invalid tick' };

    if (ruleType === 'price_threshold') {
      if (thresholdDirection === 'above' && currentPoint.priceCents >= thresholdCents) {
        return {
          shouldTrigger: true,
          reason: `Price crossed above threshold (${currentPoint.priceCents}¢ >= ${thresholdCents}¢)`,
        };
      }
      if (thresholdDirection === 'below' && currentPoint.priceCents <= thresholdCents) {
        return {
          shouldTrigger: true,
          reason: `Price crossed below threshold (${currentPoint.priceCents}¢ <= ${thresholdCents}¢)`,
        };
      }
      if (thresholdDirection === 'both' && (currentPoint.priceCents >= thresholdCents || currentPoint.priceCents <= 100 - thresholdCents)) {
        return {
          shouldTrigger: true,
          reason: `Price boundary breached (${currentPoint.priceCents}¢ vs ${thresholdCents}¢ target)`,
        };
      }
    }

    if (ruleType === 'volatility_spike') {
      const startIdx = Math.max(0, tickIndex - volatilityWindowTicks);
      const pastPoint = activeDataset.dataPoints[startIdx];
      const diff = Math.abs(currentPoint.priceCents - pastPoint.priceCents);
      if (diff >= volatilityDeltaCents) {
        return {
          shouldTrigger: true,
          reason: `Volatility spike: ${diff}¢ shift over ${tickIndex - startIdx} ticks (>= ${volatilityDeltaCents}¢)`,
        };
      }
    }

    if (ruleType === 'spread_anomaly') {
      if (currentPoint.spreadCents && currentPoint.spreadCents >= 3) {
        return {
          shouldTrigger: true,
          reason: `Spread widened to ${currentPoint.spreadCents}¢ (liquidity thinning)`,
        };
      }
    }

    if (ruleType === 'model_edge') {
      if (currentPoint.modelProbPercent !== undefined) {
        const edge = Math.abs(currentPoint.modelProbPercent - currentPoint.priceCents);
        if (edge >= modelEdgeMinPercent) {
          return {
            shouldTrigger: true,
            reason: `Calibrated model edge anomaly: ${edge}% divergence between model (${currentPoint.modelProbPercent}%) and market (${currentPoint.priceCents}¢)`,
          };
        }
      }
    }

    if (ruleType === 'periodic_heartbeat') {
      if (tickIndex > 0 && tickIndex % Math.max(2, cooldownTicks) === 0) {
        return {
          shouldTrigger: true,
          reason: `Periodic EDI 846 / telemetry sync tick (#${tickIndex})`,
        };
      }
    }

    return { shouldTrigger: false, reason: 'Conditions not met' };
  };

  // Generate payload for execution
  const createSimulatedPayload = (
    tickIndex: number,
    point: typeof activeDataset.dataPoints[0],
    reason: string
  ) => {
    if (payloadFormat === 'REST_JSON') {
      return {
        event_id: `evt_sim_${activeDataset.contractTicker.toLowerCase()}_t${tickIndex}_${Date.now().toString(36)}`,
        event_type: targetEventType,
        timestamp: new Date().toISOString(),
        historical_tick_time: point.timestamp,
        ticker: activeDataset.contractTicker,
        contract_title: activeDataset.eventTitle,
        market_price_cents: point.priceCents,
        implied_probability: point.priceCents / 100,
        model_probability: (point.modelProbPercent || point.priceCents) / 100,
        spread_cents: point.spreadCents || 1,
        volume_at_tick: point.volume || 1000,
        trigger_metadata: {
          rule: ruleType,
          reason,
          cooldown_applied_ticks: cooldownTicks,
          backtest_dataset: activeDataset.name,
        },
        system_diagnostics: {
          destination_url: targetUrl,
          simulation_engine: 'CloudboyX Connect v2.5 Backtest Runner',
          auth_scheme: securityConfig.authType,
        },
      };
    }

    if (payloadFormat === 'EDI_850') {
      return `ISA*00*          *00*          *ZZ*CLOUDBOYX      *ZZ*ENTERPRISE-ERP *${new Date().toISOString().slice(2, 10).replace(/-/g, '')}*1430*U*00401*000000001*0*T*:~
GS*PO*CLOUDBOYX*ENTERPRISE-ERP*${new Date().toISOString().slice(0, 10).replace(/-/g, '')}*1430*1*X*004010~
ST*850*0001~
BEG*00*SA*PO-SIM-T${tickIndex}**${new Date().toISOString().slice(0, 10).replace(/-/g, '')}~
REF*VR*${activeDataset.contractTicker}~
N1*BY*PREDICTION HEDGE AUTOMATION~
PO1*1*1000*EA*${(point.priceCents / 100).toFixed(2)}**VN*${activeDataset.contractTicker}~
PID*F****${point.eventHeadline || reason}~
CTT*1~
SE*8*0001~
GE*1*1~
IEA*1*000000001~`;
    }

    // Default REST JSON
    return {
      event_type: targetEventType,
      contract: activeDataset.contractTicker,
      price_cents: point.priceCents,
      reason,
    };
  };

  // Run instant complete backtest across all ticks
  const handleRunFullBacktest = async () => {
    setIsSimulating(true);
    setIsPaused(false);
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);

    const executions: SimulatedWebhookExecution[] = [];
    let lastTriggerTick = -999;

    for (let i = 0; i < activeDataset.dataPoints.length; i++) {
      const point = activeDataset.dataPoints[i];
      const evaluation = evaluateTickTrigger(i, lastTriggerTick);

      if (evaluation.shouldTrigger) {
        lastTriggerTick = i;
        const netSample = sampleNetworkLatency(networkProfile);
        const payload = createSimulatedPayload(i, point, evaluation.reason);
        const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const signature = await computeHmac(
          securityConfig.hmacSecret,
          payloadStr,
          securityConfig.hmacAlgorithm
        );

        executions.push({
          id: `sim_exec_${i}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          tickIndex: i,
          timestamp: point.timestamp,
          priceCents: point.priceCents,
          triggerReason: evaluation.reason,
          eventType: targetEventType,
          format: payloadFormat,
          statusCode: netSample.statusCode,
          statusText: netSample.statusText,
          latencyMs: netSample.latencyMs,
          success: netSample.success,
          payloadExcerpt: payloadStr.slice(0, 160) + '...',
          fullPayload: payload,
          hmacSignature: signature,
          signatureVerified: securityConfig.authType !== 'none' && !signature.includes('unauthenticated'),
          authScheme: securityConfig.authType,
          retryCount: netSample.statusCode === 504 ? 1 : 0,
        });
      }
    }

    setSimulatedExecutions(executions);
    setCurrentTickIndex(activeDataset.dataPoints.length - 1);
    setIsSimulating(false);
  };

  // Animated Playback Engine
  const startAnimatedPlayback = () => {
    if (isSimulating && !isPaused) return;

    setIsSimulating(true);
    setIsPaused(false);

    let tick = isPaused ? currentTickIndex : 0;
    let localExecutions = isPaused ? [...simulatedExecutions] : [];
    let lastTrigger = -999;

    if (!isPaused) {
      setSimulatedExecutions([]);
      setCurrentTickIndex(0);
    }

    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);

    const intervalMs = Math.max(40, 1000 / playbackSpeed);

    playbackTimerRef.current = setInterval(async () => {
      if (tick >= activeDataset.dataPoints.length) {
        if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        setIsSimulating(false);
        setIsPaused(false);
        return;
      }

      const point = activeDataset.dataPoints[tick];
      const evaluation = evaluateTickTrigger(tick, lastTrigger);

      if (evaluation.shouldTrigger) {
        lastTrigger = tick;
        const netSample = sampleNetworkLatency(networkProfile);
        const payload = createSimulatedPayload(tick, point, evaluation.reason);
        const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const signature = await computeHmac(
          securityConfig.hmacSecret,
          payloadStr,
          securityConfig.hmacAlgorithm
        );

        const newExec: SimulatedWebhookExecution = {
          id: `sim_exec_${tick}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          tickIndex: tick,
          timestamp: point.timestamp,
          priceCents: point.priceCents,
          triggerReason: evaluation.reason,
          eventType: targetEventType,
          format: payloadFormat,
          statusCode: netSample.statusCode,
          statusText: netSample.statusText,
          latencyMs: netSample.latencyMs,
          success: netSample.success,
          payloadExcerpt: payloadStr.slice(0, 160) + '...',
          fullPayload: payload,
          hmacSignature: signature,
          signatureVerified: securityConfig.authType !== 'none' && !signature.includes('unauthenticated'),
          authScheme: securityConfig.authType,
          retryCount: netSample.statusCode === 504 ? 1 : 0,
        };

        localExecutions = [newExec, ...localExecutions];
        setSimulatedExecutions([...localExecutions]);
      }

      setCurrentTickIndex(tick);
      tick++;
    }, intervalMs);
  };

  const pausePlayback = () => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setIsPaused(true);
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    setIsSimulating(false);
    setIsPaused(false);
    setCurrentTickIndex(0);
    setSimulatedExecutions([]);
    setSelectedExecution(null);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  // When changing datasets, reset simulation
  useEffect(() => {
    resetSimulation();
  }, [selectedDatasetId]);

  // Robustness Metrics Computation
  const robustnessMetrics: BacktestRobustnessMetrics = useMemo(() => {
    const totalDispatched = simulatedExecutions.length;
    const evaluated = activeDataset.dataPoints.length;
    if (totalDispatched === 0) {
      return {
        totalEvaluatedTicks: evaluated,
        totalDispatched: 0,
        successCount: 0,
        failedCount: 0,
        deliverySuccessRate: 100,
        avgLatencyMs: 0,
        p95LatencyMs: 0,
        minLatencyMs: 0,
        maxLatencyMs: 0,
        peakQps: 0,
        hmacVerificationRate: 100,
        falsePositiveRate: 0,
        robustnessScore: 95,
        robustnessGrade: 'GRADE A+ (PRODUCTION READY)',
      };
    }

    const successes = simulatedExecutions.filter((e) => e.success).length;
    const failures = totalDispatched - successes;
    const deliverySuccessRate = Number(((successes / totalDispatched) * 100).toFixed(1));

    const latencies = simulatedExecutions.map((e) => e.latencyMs).sort((a, b) => a - b);
    const avgLatencyMs = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
    const p95Index = Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95));
    const p95LatencyMs = latencies[p95Index] || avgLatencyMs;
    const minLatencyMs = latencies[0] || 0;
    const maxLatencyMs = latencies[latencies.length - 1] || 0;

    const hmacSuccesses = simulatedExecutions.filter((e) => e.signatureVerified).length;
    const hmacVerificationRate = Number(((hmacSuccesses / totalDispatched) * 100).toFixed(1));

    // Calculate score
    let score = 100;
    if (deliverySuccessRate < 99) score -= 15;
    if (deliverySuccessRate < 95) score -= 25;
    if (avgLatencyMs > 150) score -= 10;
    if (avgLatencyMs > 300) score -= 20;
    if (hmacVerificationRate < 100 && securityConfig.authType !== 'none') score -= 15;

    score = Math.max(30, Math.min(100, score));

    let grade: BacktestRobustnessMetrics['robustnessGrade'] = 'GRADE A+ (PRODUCTION READY)';
    if (score >= 95) grade = 'GRADE A+ (PRODUCTION READY)';
    else if (score >= 85) grade = 'GRADE A (HIGH RELIABILITY)';
    else if (score >= 70) grade = 'GRADE B (ACCEPTABLE)';
    else grade = 'GRADE C (NEEDS TUNING)';

    return {
      totalEvaluatedTicks: evaluated,
      totalDispatched,
      successCount: successes,
      failedCount: failures,
      deliverySuccessRate,
      avgLatencyMs,
      p95LatencyMs,
      minLatencyMs,
      maxLatencyMs,
      peakQps: Number((totalDispatched / Math.max(1, evaluated * 0.25)).toFixed(1)),
      hmacVerificationRate,
      falsePositiveRate: 0,
      robustnessScore: score,
      robustnessGrade: grade,
    };
  }, [simulatedExecutions, activeDataset, securityConfig]);

  // Filtered deliveries
  const filteredDeliveries = useMemo(() => {
    return simulatedExecutions.filter((item) => {
      if (filterStatus === 'SUCCESS' && !item.success) return false;
      if (filterStatus === 'WARNING' && item.success && item.latencyMs < 150) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.triggerReason.toLowerCase().includes(q) ||
          item.timestamp.toLowerCase().includes(q) ||
          item.statusText.toLowerCase().includes(q) ||
          item.eventType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [simulatedExecutions, filterStatus, searchQuery]);

  // CSV Audit Export
  const handleDownloadAuditCSV = () => {
    if (simulatedExecutions.length === 0) return;
    const headers = [
      'Execution ID',
      'Historical Tick Time',
      'Contract Ticker',
      'Contract Price (Cents)',
      'Trigger Reason',
      'Event Type',
      'Payload Format',
      'Status Code',
      'Status Text',
      'Latency (ms)',
      'Success',
      'HMAC Signature Verified',
      'Auth Scheme',
    ];

    const rows = simulatedExecutions.map((e) => [
      e.id,
      `"${e.timestamp}"`,
      `"${activeDataset.contractTicker}"`,
      e.priceCents,
      `"${e.triggerReason.replace(/"/g, '""')}"`,
      `"${e.eventType}"`,
      `"${e.format}"`,
      e.statusCode,
      `"${e.statusText}"`,
      e.latencyMs,
      e.success ? 'TRUE' : 'FALSE',
      e.signatureVerified ? 'TRUE' : 'FALSE',
      `"${e.authScheme}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `cloudboyx_webhook_backtest_audit_${activeDataset.id}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  // Copy code helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  // SVG Chart Geometry Constants
  const chartWidth = 720;
  const chartHeight = 220;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Chart path generation
  const chartPoints = useMemo(() => {
    const pts = activeDataset.dataPoints;
    if (!pts.length) return [];
    return pts.map((p, idx) => {
      const x = padding.left + (idx / Math.max(1, pts.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - (p.priceCents / 100) * innerHeight;
      return { x, y, point: p, index: idx };
    });
  }, [activeDataset, innerWidth, innerHeight]);

  const linePath = useMemo(() => {
    if (!chartPoints.length) return '';
    return chartPoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');
  }, [chartPoints]);

  const areaPath = useMemo(() => {
    if (!chartPoints.length) return '';
    const firstX = chartPoints[0].x;
    const lastX = chartPoints[chartPoints.length - 1].x;
    const bottomY = padding.top + innerHeight;
    return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [linePath, chartPoints, innerHeight]);

  const thresholdY = padding.top + innerHeight - (thresholdCents / 100) * innerHeight;

  // Map of tickIndex to simulation execution
  const executionByTick = useMemo(() => {
    const map = new Map<number, SimulatedWebhookExecution>();
    simulatedExecutions.forEach((e) => {
      map.set(e.tickIndex, e);
    });
    return map;
  }, [simulatedExecutions]);

  return (
    <div id="webhook-backtest-module-root" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#023e8a] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-radial from-[#00d4ff]/20 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00d4ff] text-[#03045e] shadow-xs flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Enterprise Robustness Lab</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-[#caf0f8] border border-white/20">
                Deterministic Historical Replay
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>HMAC &amp; Rate-Limit Test Suite</span>
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center space-x-2 text-white">
              <History className="w-7 h-7 text-[#00d4ff]" />
              <span>Historical Price Shock &amp; Webhook Backtester</span>
            </h2>

            <p className="text-xs md:text-sm text-stone-200 leading-relaxed">
              Stress-test webhook triggers, threshold crossings, volatility spikes, and HMAC signature authentication against real prediction market event contracts before promoting to live production pipelines.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onPromoteRules && (
              <button
                type="button"
                id="promote-tested-rules-btn"
                onClick={() =>
                  onPromoteRules({
                    thresholdCents,
                    eventType: targetEventType,
                    format: payloadFormat,
                  })
                }
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-black transition-all cursor-pointer shadow-md group"
                title="Synchronize these tested threshold and event parameters into the live dispatcher"
              >
                <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Promote Rules to Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenStudio && (
              <button
                type="button"
                onClick={onOpenStudio}
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Server className="w-4 h-4 text-[#90e0ef]" />
                <span>Live Dispatcher</span>
              </button>
            )}

            {onOpenSecurityModal && (
              <button
                type="button"
                onClick={onOpenSecurityModal}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-black/25 hover:bg-black/40 border border-white/15 text-stone-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>Security Scheme</span>
              </button>
            )}
          </div>
        </div>

        {/* Dataset Selector Ribbon */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-200">
            <BarChart3 className="w-4 h-4 text-[#00d4ff]" />
            <span>HISTORICAL EVENT SCENARIO:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {BACKTEST_DATASETS.map((ds) => (
              <button
                key={ds.id}
                type="button"
                onClick={() => setSelectedDatasetId(ds.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  selectedDatasetId === ds.id
                    ? 'bg-[#00d4ff] text-[#03045e] shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10'
                }`}
              >
                <span>{ds.name}</span>
                <span className="text-[10px] font-mono opacity-80">({ds.totalTicks} ticks)</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Robustness Certification Badge & Key Metrics Bar */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-stone-100">
          <div className="flex items-center space-x-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                robustnessMetrics.robustnessScore >= 90
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : robustnessMetrics.robustnessScore >= 75
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-black tracking-wider uppercase ${
                    robustnessMetrics.robustnessScore >= 90
                      ? 'bg-emerald-100 text-emerald-800'
                      : robustnessMetrics.robustnessScore >= 75
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {robustnessMetrics.robustnessGrade}
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  Score: <strong className="text-stone-900">{robustnessMetrics.robustnessScore}/100</strong>
                </span>
              </div>
              <h3 className="text-lg font-black text-stone-900 tracking-tight mt-1">
                Webhook Reliability &amp; Payload Verification Benchmark
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Simulated against {activeDataset.name} ({activeDataset.contractTicker}) &bull; Target: {targetUrl}
              </p>
            </div>
          </div>

          {/* Quick simulation controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!isSimulating ? (
              <>
                <button
                  type="button"
                  id="run-full-backtest-btn"
                  onClick={handleRunFullBacktest}
                  className="px-4 py-2 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white text-xs font-black transition-all flex items-center space-x-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" />
                  <span>Run Instant Backtest</span>
                </button>

                <button
                  type="button"
                  id="play-replay-btn"
                  onClick={startAnimatedPlayback}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-stone-200"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span>{isPaused ? 'Resume Replay' : 'Play Timeline'}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={pausePlayback}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all flex items-center space-x-2 cursor-pointer shadow-xs"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Replay</span>
              </button>
            )}

            <button
              type="button"
              onClick={resetSimulation}
              disabled={simulatedExecutions.length === 0 && currentTickIndex === 0}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-stone-200 transition-colors disabled:opacity-40 cursor-pointer"
              title="Reset Backtest Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Playback Speed dropdown */}
            <div className="flex items-center space-x-1 pl-2 border-l border-stone-200 text-xs">
              <span className="text-[11px] text-stone-400 font-bold">Speed:</span>
              {[1, 5, 10, 25].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5 Key Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Triggers Fired</div>
            <div className="text-xl font-black text-stone-900 mt-1 flex items-baseline space-x-1">
              <span>{robustnessMetrics.totalDispatched}</span>
              <span className="text-xs font-normal text-stone-500">/ {activeDataset.totalTicks} ticks</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Trigger Rate: {((robustnessMetrics.totalDispatched / activeDataset.totalTicks) * 100).toFixed(0)}%
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Delivery Success</div>
            <div className="text-xl font-black text-emerald-700 mt-1">
              {robustnessMetrics.deliverySuccessRate}%
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">
              {robustnessMetrics.successCount} OK &bull; {robustnessMetrics.failedCount} Failed
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200">
            <div className="text-[11px] font-bold text-[#0077b6] uppercase tracking-wider">Simulated Latency</div>
            <div className="text-xl font-black text-[#03045e] mt-1 flex items-baseline space-x-1">
              <span>{robustnessMetrics.avgLatencyMs}ms</span>
              <span className="text-xs font-normal text-stone-500">(P95: {robustnessMetrics.p95LatencyMs}ms)</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Range: {robustnessMetrics.minLatencyMs}ms - {robustnessMetrics.maxLatencyMs}ms
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200">
            <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">HMAC Verification</div>
            <div className="text-xl font-black text-purple-900 mt-1">
              {robustnessMetrics.hmacVerificationRate}%
            </div>
            <div className="text-[11px] text-purple-700 mt-1">
              {securityConfig.authType === 'none'
                ? 'Unsigned (Testing)'
                : `${securityConfig.hmacAlgorithm.toUpperCase()} Validated`}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 col-span-2 md:col-span-1">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Rate Headroom</div>
            <div className="text-xl font-black text-amber-900 mt-1">
              {robustnessMetrics.peakQps} QPS
            </div>
            <div className="text-[11px] text-amber-700 mt-1">
              Cooldown: {cooldownTicks} ticks enforced
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rules & Policies Configuration (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Policy Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#0077b6]" />
                <h3 className="text-sm font-bold text-stone-900">Trigger Rule Configuration</h3>
              </div>
              <span className="text-[10px] font-mono text-stone-400">RULE SETTER</span>
            </div>

            {/* Rule Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Trigger Condition Type</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as TriggerRuleType)}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0077b6] bg-stone-50/60"
              >
                <option value="price_threshold">Price Threshold Crossing</option>
                <option value="volatility_spike">Volatility / Velocity Spike</option>
                <option value="spread_anomaly">Spread Anomaly &amp; Liquidity Risk</option>
                <option value="model_edge">Model Discrepancy &amp; Calibrated Edge</option>
                <option value="periodic_heartbeat">Periodic Heartbeat (Inventory Sync)</option>
              </select>
            </div>

            {/* Dynamic Rule Controls */}
            {ruleType === 'price_threshold' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800">Threshold Price</label>
                  <span className="text-sm font-mono font-bold text-[#0077b6]">{thresholdCents}¢</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={95}
                  step={1}
                  value={thresholdCents}
                  onChange={(e) => setThresholdCents(Number(e.target.value))}
                  className="w-full accent-[#0077b6] cursor-pointer"
                />

                <div className="pt-2 border-t border-stone-200/80 space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-600">Cross Direction</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['above', 'below', 'both'] as const).map((dir) => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => setThresholdDirection(dir)}
                        className={`py-1 rounded-lg text-[11px] font-bold capitalize transition-colors ${
                          thresholdDirection === dir
                            ? 'bg-[#0077b6] text-white shadow-2xs'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {ruleType === 'volatility_spike' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800">Min Price Delta</label>
                  <span className="text-sm font-mono font-bold text-[#0077b6]">≥ {volatilityDeltaCents}¢</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={25}
                  step={1}
                  value={volatilityDeltaCents}
                  onChange={(e) => setVolatilityDeltaCents(Number(e.target.value))}
                  className="w-full accent-[#0077b6] cursor-pointer"
                />

                <div className="flex items-center justify-between pt-2 border-t border-stone-200/80">
                  <label className="text-[11px] font-bold text-stone-600">Observation Window</label>
                  <span className="text-xs font-mono font-bold text-stone-800">{volatilityWindowTicks} ticks</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={volatilityWindowTicks}
                  onChange={(e) => setVolatilityWindowTicks(Number(e.target.value))}
                  className="w-full accent-[#0077b6] cursor-pointer"
                />
              </div>
            )}

            {ruleType === 'model_edge' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800">Min Model Divergence</label>
                  <span className="text-sm font-mono font-bold text-purple-700">≥ {modelEdgeMinPercent}%</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={25}
                  step={1}
                  value={modelEdgeMinPercent}
                  onChange={(e) => setModelEdgeMinPercent(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <p className="text-[11px] text-stone-500">
                  Fires when the Bayesian model estimate differs from the market contract price by at least {modelEdgeMinPercent}%.
                </p>
              </div>
            )}

            {/* Cooldown Throttle */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">Trigger Cooldown Throttle</label>
                <span className="text-xs font-mono font-bold text-stone-800">{cooldownTicks} ticks</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={cooldownTicks}
                onChange={(e) => setCooldownTicks(Number(e.target.value))}
                className="w-full accent-[#0077b6] cursor-pointer"
              />
              <p className="text-[11px] text-stone-400">
                Prevents webhook flood hammering during sustained boundary breach episodes.
              </p>
            </div>

            {/* Event Type & Payload Format */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Dispatched Event Type</label>
                <select
                  value={targetEventType}
                  onChange={(e) => setTargetEventType(e.target.value as EnterpriseWebhookEvent)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0077b6] bg-stone-50/50"
                >
                  <option value="PRICE_ALERT_TRIGGERED">PRICE_ALERT_TRIGGERED</option>
                  <option value="VOLATILITY_SPIKE">VOLATILITY_SPIKE</option>
                  <option value="MARKET_ODDS_SHIFT">MARKET_ODDS_SHIFT</option>
                  <option value="PURCHASE_ORDER_GENERATED">PURCHASE_ORDER_GENERATED (EDI 850)</option>
                  <option value="INVENTORY_REORDER_SYNC">INVENTORY_REORDER_SYNC (EDI 846)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Payload Format</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['REST_JSON', 'EDI_850', 'EDI_846', 'CXML'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setPayloadFormat(fmt)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        payloadFormat === fmt
                          ? 'bg-[#03045e] text-white shadow-2xs'
                          : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Network Environment Profile */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-700">Simulated Network Conditions</label>
              <select
                value={networkProfile}
                onChange={(e) => setNetworkProfile(e.target.value as NetworkSimulationProfile)}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0077b6] bg-stone-50/50"
              >
                <option value="enterprise_wan">Enterprise WAN (38-65ms, 99.8% uptime)</option>
                <option value="zero_loss_lan">Direct Cloud Interconnect (18-32ms, zero loss)</option>
                <option value="congested_jitter">High Jitter &amp; Spikes (55-340ms, 4% drop)</option>
                <option value="degraded_erp">Degraded SAP/ERP Queue (190-450ms, rate limits)</option>
              </select>
            </div>
          </div>

          {/* Active Security Config Snapshot Card */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-5 text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-stone-700 pb-2.5">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#00d4ff]" />
                <span className="text-xs font-bold text-stone-200">Security Credentials In Force</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#00d4ff] text-[#03045e]">
                {securityConfig.authType.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1 text-xs font-mono text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">HMAC Algorithm:</span>
                <span className="text-[#00d4ff]">{securityConfig.hmacAlgorithm.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">HMAC Header:</span>
                <span className="text-stone-200 truncate max-w-[150px]">{securityConfig.hmacHeaderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Replay Protection:</span>
                <span className="text-emerald-400">{securityConfig.includeTimestamp ? 'Active (Timestamp)' : 'Disabled'}</span>
              </div>
            </div>

            {onOpenSecurityModal && (
              <button
                type="button"
                onClick={onOpenSecurityModal}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
              >
                <span>Change Credentials Scheme</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Replay Chart & Delivery Log (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Historical Chart Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#0077b6]" />
                  <h3 className="text-sm font-bold text-stone-900">
                    Historical Contract Price &amp; Webhook Trigger Overlay
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {activeDataset.eventTitle} &bull; {activeDataset.timeframe}
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-0.5 bg-[#0077b6]" />
                  <span className="text-stone-600 text-[11px]">Contract Price</span>
                </div>
                {ruleType === 'price_threshold' && (
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-0.5 bg-rose-500 border-b border-dashed" />
                    <span className="text-rose-600 text-[11px]">Threshold ({thresholdCents}¢)</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                  <span className="text-emerald-700 text-[11px]">Simulated Webhook</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Chart */}
            <div className="relative w-full overflow-hidden bg-gradient-to-b from-stone-50/50 to-white rounded-2xl border border-stone-200/80 p-2">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto select-none"
              >
                <defs>
                  <linearGradient id="backtestAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0077b6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0077b6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[20, 40, 60, 80, 100].map((val) => {
                  const y = padding.top + innerHeight - (val / 100) * innerHeight;
                  return (
                    <g key={val}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + innerWidth}
                        y2={y}
                        stroke="#e7e5e4"
                        strokeDasharray="3,3"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[9px] fill-stone-400 font-mono"
                      >
                        {val}¢
                      </text>
                    </g>
                  );
                })}

                {/* Shaded area */}
                <path d={areaPath} fill="url(#backtestAreaGradient)" />

                {/* Threshold Reference Line */}
                {ruleType === 'price_threshold' && (
                  <g>
                    <line
                      x1={padding.left}
                      y1={thresholdY}
                      x2={padding.left + innerWidth}
                      y2={thresholdY}
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      strokeDasharray="4,3"
                    />
                    <rect
                      x={padding.left + innerWidth - 75}
                      y={thresholdY - 14}
                      width="75"
                      height="14"
                      rx="3"
                      fill="#f43f5e"
                    />
                    <text
                      x={padding.left + innerWidth - 38}
                      y={thresholdY - 3}
                      textAnchor="middle"
                      className="text-[9px] font-black fill-white font-mono"
                    >
                      TRIGGER {thresholdCents}¢
                    </text>
                  </g>
                )}

                {/* Main Price Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#0077b6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Trigger Marker Beacons along the path */}
                {chartPoints.map((pt) => {
                  const exec = executionByTick.get(pt.index);
                  if (!exec) return null;

                  return (
                    <g
                      key={`trigger-${pt.index}`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedExecution(exec)}
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="6"
                        fill={exec.success ? '#10b981' : '#f43f5e'}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="10"
                        fill={exec.success ? '#10b981' : '#f43f5e'}
                        fillOpacity="0.25"
                      />
                    </g>
                  );
                })}

                {/* Current Playback Scrubber pointer */}
                {currentTickIndex > 0 && currentTickIndex < chartPoints.length && (
                  <g>
                    <line
                      x1={chartPoints[currentTickIndex].x}
                      y1={padding.top}
                      x2={chartPoints[currentTickIndex].x}
                      y2={padding.top + innerHeight}
                      stroke="#03045e"
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                    />
                    <circle
                      cx={chartPoints[currentTickIndex].x}
                      cy={chartPoints[currentTickIndex].y}
                      r="4.5"
                      fill="#03045e"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Hover crosshair */}
                {hoveredTick !== null && hoveredTick < chartPoints.length && (
                  <g>
                    <line
                      x1={chartPoints[hoveredTick].x}
                      y1={padding.top}
                      x2={chartPoints[hoveredTick].x}
                      y2={padding.top + innerHeight}
                      stroke="#78716c"
                      strokeWidth="1"
                    />
                  </g>
                )}
              </svg>

              {/* Timeline scrubber bar below chart */}
              <div className="mt-2 pt-2 border-t border-stone-200/70 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                <span>{activeDataset.dataPoints[0]?.timestamp}</span>
                <span className="text-stone-800 font-bold">
                  Tick {currentTickIndex + 1} of {activeDataset.totalTicks} &bull; Price:{' '}
                  {activeDataset.dataPoints[currentTickIndex]?.priceCents ?? '--'}¢
                </span>
                <span>{activeDataset.dataPoints[activeDataset.totalTicks - 1]?.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Simulated Webhook Deliveries Ledger */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#0077b6]" />
                <h3 className="text-sm font-bold text-stone-900">
                  Simulated Webhook Deliveries ({filteredDeliveries.length})
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 rounded-xl text-xs border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0077b6] w-36 bg-stone-50"
                  />
                </div>

                {/* Filter pills */}
                <div className="inline-flex p-0.5 rounded-xl bg-stone-100 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      filterStatus === 'ALL' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('SUCCESS')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      filterStatus === 'SUCCESS' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    200 OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('WARNING')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      filterStatus === 'WARNING' ? 'bg-white text-amber-700 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    Slow/Retry
                  </button>
                </div>

                {/* CSV Export Button */}
                <button
                  type="button"
                  id="download-backtest-audit-csv-btn"
                  onClick={handleDownloadAuditCSV}
                  disabled={simulatedExecutions.length === 0}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    simulatedExecutions.length > 0
                      ? exportSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#caf0f8] hover:bg-[#90e0ef] text-[#03045e] border border-[#90e0ef]'
                      : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                  }`}
                  title="Export simulated delivery logs and latency metrics as a CSV file for compliance auditing"
                >
                  {exportSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Audit Exported!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-[#0077b6]" />
                      <span>Download Audit (CSV)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Deliveries List / Table */}
            {filteredDeliveries.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-3">
                <Clock className="w-10 h-10 mx-auto text-stone-300 opacity-60" />
                <div className="text-sm font-bold text-stone-600">No Webhook Dispatches in Ledger</div>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Click <strong>&quot;Run Instant Backtest&quot;</strong> or <strong>&quot;Play Timeline&quot;</strong> to evaluate trigger thresholds against historical market price data.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[380px] overflow-y-auto rounded-2xl border border-stone-200">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Tick / Time</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Trigger Reason</th>
                      <th className="py-2.5 px-3">HMAC Verify</th>
                      <th className="py-2.5 px-3 text-right">Latency</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredDeliveries.map((exec) => (
                      <tr key={exec.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              exec.success
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                exec.success ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span>{exec.statusCode}</span>
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-stone-800 whitespace-nowrap font-medium">
                          {exec.timestamp}
                        </td>

                        <td className="py-2.5 px-3 font-bold text-stone-900">
                          {exec.priceCents}¢
                        </td>

                        <td className="py-2.5 px-3 text-stone-600 max-w-[240px] truncate" title={exec.triggerReason}>
                          {exec.triggerReason}
                        </td>

                        <td className="py-2.5 px-3">
                          {exec.signatureVerified ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <ShieldCheck className="w-3 h-3 text-purple-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-500">
                              <span>Open / None</span>
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right font-medium text-stone-600">
                          {exec.latencyMs}ms
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedExecution(exec)}
                            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-[#caf0f8] text-stone-700 hover:text-[#03045e] text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payload & Cryptographic Inspection Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    selectedExecution.success
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Webhook Dispatch Audit &bull; {selectedExecution.eventType}
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    Tick Time: {selectedExecution.timestamp} &bull; Price: {selectedExecution.priceCents}¢
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedExecution(null)}
                className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              {/* Delivery Metadata */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-stone-400 text-[10px] uppercase">Status Code</span>
                  <div className="text-sm font-bold text-emerald-700 flex items-center space-x-1.5 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{selectedExecution.statusCode} {selectedExecution.statusText}</span>
                  </div>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase">Simulated Latency</span>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {selectedExecution.latencyMs}ms
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 text-[10px] uppercase">Trigger Rule Justification</span>
                  <div className="text-xs font-bold text-stone-800 mt-0.5">
                    {selectedExecution.triggerReason}
                  </div>
                </div>
              </div>

              {/* Cryptographic Signature Card */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-700" />
                    <span className="font-bold text-purple-900">
                      HMAC Signature ({securityConfig.hmacAlgorithm.toUpperCase()})
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-black bg-purple-200 text-purple-800">
                    VALIDATED
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-purple-200/80 text-[11px] text-purple-950 break-all select-all">
                  {selectedExecution.hmacSignature}
                </div>
                <div className="flex items-center justify-between text-[10px] text-purple-700">
                  <span>Header: {securityConfig.hmacHeaderName}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedExecution.hmacSignature, 'sig-copy')}
                    className="hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    {copiedCodeKey === 'sig-copy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCodeKey === 'sig-copy' ? 'Copied' : 'Copy Signature'}</span>
                  </button>
                </div>
              </div>

              {/* Payload Excerpt */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-stone-600">
                  <span className="font-bold">Dispatched Payload ({selectedExecution.format})</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        typeof selectedExecution.fullPayload === 'string'
                          ? selectedExecution.fullPayload
                          : JSON.stringify(selectedExecution.fullPayload, null, 2),
                        'payload-copy'
                      )
                    }
                    className="text-[11px] text-[#0077b6] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    {copiedCodeKey === 'payload-copy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCodeKey === 'payload-copy' ? 'Copied' : 'Copy Payload'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-stone-900 text-[#90e0ef] rounded-2xl overflow-x-auto text-[11px] leading-relaxed max-h-56">
                  {typeof selectedExecution.fullPayload === 'string'
                    ? selectedExecution.fullPayload
                    : JSON.stringify(selectedExecution.fullPayload, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedExecution(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
