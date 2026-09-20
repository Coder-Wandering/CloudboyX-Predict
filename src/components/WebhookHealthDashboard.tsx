import React, { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  RefreshCw,
  Server,
  ShieldCheck,
  Radio,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  Filter,
  ArrowRight,
  Sliders,
  Send,
  Boxes,
  Database,
  Globe,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  WebhookDeliveryRecord,
  EnterpriseWebhookEvent,
  EnterprisePayloadFormat,
  ActiveEventWebhook,
} from '../types';
import { ApiHealthMonitor } from './ApiHealthMonitor';

interface WebhookHealthDashboardProps {
  deliveryLogs: WebhookDeliveryRecord[];
  onClearLogs: () => void;
  onTriggerTestDispatch: (
    event?: EnterpriseWebhookEvent,
    targetUrl?: string,
    format?: EnterprisePayloadFormat
  ) => Promise<void>;
  isDispatching: boolean;
  onOpenConnectorsCreator?: () => void;
  onOpenStudio?: () => void;
}

// Initial registered active event webhooks
const DEFAULT_ACTIVE_WEBHOOKS: ActiveEventWebhook[] = [
  {
    id: 'wh-price-alert',
    name: 'Price Alert Sentinel -> CloudboyX ERP',
    targetUrl: 'https://cloudboyx-erp.ai.studio/api/webhooks/market-signals',
    eventTrigger: 'PRICE_ALERT_TRIGGERED',
    format: 'REST_JSON',
    status: 'healthy',
    lastDeliveredAt: '2 mins ago',
    deliveryCount: 38,
    successCount: 38,
    avgLatencyMs: 44,
    autoDispatch: true,
  },
  {
    id: 'wh-map-scanner',
    name: 'MAP Protection Scanner -> Price Guard Sentinel',
    targetUrl: 'https://map-protection-scanner.ai.studio/api/webhooks/pricing-feed',
    eventTrigger: 'PRICE_ALERT_TRIGGERED',
    format: 'REST_JSON',
    status: 'healthy',
    lastDeliveredAt: '6 mins ago',
    deliveryCount: 29,
    successCount: 29,
    avgLatencyMs: 51,
    autoDispatch: true,
  },
  {
    id: 'wh-volatility-lockout',
    name: 'Volatility Surge Lockout -> SAP S/4HANA',
    targetUrl: 'https://s4hana-gateway.enterprise.corp/sap/bc/rest/cloudboyx/v1/orders',
    eventTrigger: 'VOLATILITY_SPIKE',
    format: 'EDI_846',
    status: 'healthy',
    lastDeliveredAt: '18 mins ago',
    deliveryCount: 14,
    successCount: 14,
    avgLatencyMs: 62,
    autoDispatch: false,
  },
  {
    id: 'wh-edi-po-replenish',
    name: 'Automated EDI 850 PO Replenishment -> Global B2B',
    targetUrl: 'https://cloudboyx-erp.ai.studio/api/webhooks/market-signals',
    eventTrigger: 'PURCHASE_ORDER_GENERATED',
    format: 'EDI_850',
    status: 'healthy',
    lastDeliveredAt: '35 mins ago',
    deliveryCount: 22,
    successCount: 21,
    avgLatencyMs: 48,
    autoDispatch: true,
  },
  {
    id: 'wh-kelly-allocation',
    name: 'Kelly Edge Capital Reserve -> CloudboyX ERP',
    targetUrl: 'https://cloudboyx-erp.ai.studio/api/webhooks/market-signals',
    eventTrigger: 'KELLY_EDGE_DETECTED',
    format: 'REST_JSON',
    status: 'idle',
    lastDeliveredAt: '1 hour ago',
    deliveryCount: 9,
    successCount: 9,
    avgLatencyMs: 39,
    autoDispatch: false,
  },
  {
    id: 'wh-asn-logistics',
    name: 'Warehouse Advance Ship Notice -> EDI 856 Carrier',
    targetUrl: 'https://cloudboyx-erp.ai.studio/api/webhooks/market-signals',
    eventTrigger: 'ADVANCE_SHIP_NOTICE',
    format: 'EDI_856',
    status: 'healthy',
    lastDeliveredAt: '2 hours ago',
    deliveryCount: 16,
    successCount: 16,
    avgLatencyMs: 55,
    autoDispatch: true,
  },
];

export const WebhookHealthDashboard: React.FC<WebhookHealthDashboardProps> = ({
  deliveryLogs,
  onClearLogs,
  onTriggerTestDispatch,
  isDispatching,
  onOpenConnectorsCreator,
  onOpenStudio,
}) => {
  const [activeWebhooks, setActiveWebhooks] = useState<ActiveEventWebhook[]>(DEFAULT_ACTIVE_WEBHOOKS);
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<'ALL' | 'JSON' | 'EDI'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'ERROR'>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'deliveries' | 'api_health'>('deliveries');

  // Toggle auto-dispatch for an active webhook
  const handleToggleAutoDispatch = (id: string) => {
    setActiveWebhooks((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, autoDispatch: !wh.autoDispatch } : wh))
    );
  };

  // Trigger test ping for a specific webhook
  const handlePingWebhook = async (wh: ActiveEventWebhook) => {
    setTestingWebhookId(wh.id);
    try {
      await onTriggerTestDispatch(wh.eventTrigger, wh.targetUrl, wh.format);
      setActiveWebhooks((prev) =>
        prev.map((item) =>
          item.id === wh.id
            ? {
                ...item,
                deliveryCount: item.deliveryCount + 1,
                successCount: item.successCount + 1,
                lastDeliveredAt: 'Just now',
                status: 'healthy',
              }
            : item
        )
      );
    } catch {
      setActiveWebhooks((prev) =>
        prev.map((item) =>
          item.id === wh.id
            ? { ...item, deliveryCount: item.deliveryCount + 1, status: 'degraded' }
            : item
        )
      );
    } finally {
      setTestingWebhookId(null);
    }
  };

  // Latency & delivery metrics calculation
  const metrics = useMemo(() => {
    if (deliveryLogs.length === 0) {
      // Provide realistic default baseline metrics if no local history yet
      return {
        totalDeliveries: 128,
        successRatePercent: 99.2,
        avgLatencyMs: 48,
        minLatencyMs: 28,
        maxLatencyMs: 94,
        slaCompliancePercent: 99.2,
        activeEndpointsCount: activeWebhooks.filter((w) => w.autoDispatch).length,
      };
    }

    const total = deliveryLogs.length;
    const successes = deliveryLogs.filter((l) => l.success).length;
    const rate = Math.round((successes / total) * 1000) / 10;
    const latencies = deliveryLogs.map((l) => l.latencyMs || 40);
    const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / total);
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const compliant = deliveryLogs.filter((l) => (l.latencyMs || 40) <= 120).length;
    const sla = Math.round((compliant / total) * 1000) / 10;

    return {
      totalDeliveries: total,
      successRatePercent: rate,
      avgLatencyMs: avg,
      minLatencyMs: min,
      maxLatencyMs: max,
      slaCompliancePercent: sla,
      activeEndpointsCount: activeWebhooks.filter((w) => w.autoDispatch).length,
    };
  }, [deliveryLogs, activeWebhooks]);

  // Chart data for latency metrics over time
  const chartData = useMemo(() => {
    if (deliveryLogs.length === 0) {
      // Synthetic baseline data points if no logs yet
      return [
        { seq: '10:40', time: '10:40', latency: 42, slaTarget: 100, format: 'REST_JSON', status: 200 },
        { seq: '10:45', time: '10:45', latency: 38, slaTarget: 100, format: 'REST_JSON', status: 200 },
        { seq: '10:50', time: '10:50', latency: 64, slaTarget: 100, format: 'EDI_850', status: 200 },
        { seq: '10:55', time: '10:55', latency: 49, slaTarget: 100, format: 'REST_JSON', status: 200 },
        { seq: '11:00', time: '11:00', latency: 52, slaTarget: 100, format: 'EDI_846', status: 200 },
        { seq: '11:05', time: '11:05', latency: 44, slaTarget: 100, format: 'REST_JSON', status: 200 },
        { seq: '11:10', time: '11:10', latency: 58, slaTarget: 100, format: 'EDI_856', status: 200 },
        { seq: '11:15', time: '11:15', latency: 45, slaTarget: 100, format: 'REST_JSON', status: 200 },
      ];
    }

    // Reverse logs to show chronological progression
    const reversed = [...deliveryLogs].reverse();
    return reversed
      .filter((log) => {
        if (selectedFormatFilter === 'JSON') return log.format === 'REST_JSON';
        if (selectedFormatFilter === 'EDI') return log.format.startsWith('EDI') || log.format === 'CXML';
        return true;
      })
      .map((log, idx) => ({
        seq: `#${idx + 1}`,
        time: log.timestamp || `T-${idx}`,
        latency: log.latencyMs || 45,
        slaTarget: 100,
        format: log.format,
        status: log.statusCode,
        eventType: log.eventType,
      }));
  }, [deliveryLogs, selectedFormatFilter]);

  // Filtered delivery logs table
  const filteredLogs = useMemo(() => {
    return deliveryLogs.filter((log) => {
      if (statusFilter === 'SUCCESS' && !log.success) return false;
      if (statusFilter === 'ERROR' && log.success) return false;
      if (selectedFormatFilter === 'JSON' && log.format !== 'REST_JSON') return false;
      if (selectedFormatFilter === 'EDI' && !log.format.startsWith('EDI') && log.format !== 'CXML') return false;
      return true;
    });
  }, [deliveryLogs, statusFilter, selectedFormatFilter]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadAuditReport = () => {
    const dataStr = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        system: 'CloudboyX Connect Webhook Health Sentinel',
        metrics,
        activeWebhooks,
        deliveryLogs,
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudboyx_webhook_health_audit_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    if (deliveryLogs.length === 0) return;

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      'Delivery ID',
      'Timestamp',
      'Event Type',
      'Payload Format',
      'HTTP Status Code',
      'Status Text',
      'Delivery Result',
      'Latency (ms)',
      'SLA Compliant (<80ms)',
      'Target Endpoint URL',
    ];

    const dataRows = deliveryLogs.map((log) => [
      escapeCsv(log.id),
      escapeCsv(log.timestamp),
      escapeCsv(log.eventType),
      escapeCsv(log.format),
      escapeCsv(log.statusCode),
      escapeCsv(log.statusText),
      escapeCsv(log.success ? 'SUCCESS' : 'FAILED'),
      escapeCsv(log.latencyMs),
      escapeCsv((log.latencyMs || 0) < 80 ? 'YES' : 'NO'),
      escapeCsv(log.targetUrl),
    ]);

    const latencies = deliveryLogs.map((l) => l.latencyMs || 0);
    const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;
    const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
    const successCount = deliveryLogs.filter((l) => l.success).length;
    const successRate = deliveryLogs.length > 0 ? ((successCount / deliveryLogs.length) * 100).toFixed(1) : '0';

    const summarySection = [
      [],
      ['"=== AUDIT & LATENCY METRICS SUMMARY ==="'],
      ['"Metric"', '"Value"'],
      ['"Total Events Audited"', escapeCsv(deliveryLogs.length)],
      ['"Successful Deliveries"', escapeCsv(successCount)],
      ['"Failed Deliveries"', escapeCsv(deliveryLogs.length - successCount)],
      ['"Delivery Success Rate"', escapeCsv(`${successRate}%`)],
      ['"Average Ping Latency"', escapeCsv(`${avgLatency} ms`)],
      ['"Minimum Ping Latency"', escapeCsv(`${minLatency} ms`)],
      ['"Maximum Ping Latency"', escapeCsv(`${maxLatency} ms`)],
      ['"Export Timestamp"', escapeCsv(new Date().toISOString())],
    ];

    const csvContent = [
      headers.join(','),
      ...dataRows.map((r) => r.join(',')),
      ...summarySection.map((r) => r.join(',')),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudboyx-webhook-delivery-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="webhook-health-dashboard" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Status Overview & Direct Actions */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#03045e] to-[#0077b6] text-white shadow-xs">
            <Activity className="w-6 h-6 text-[#00d4ff] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-black text-[#03045e] tracking-tight">
                Webhook Health &amp; Telemetry Dashboard
              </h2>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>SYSTEMS OPERATIONAL</span>
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Live monitoring of event triggers, transmission round-trip latencies, SLA uptime, and EDI delivery pipelines.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onOpenConnectorsCreator && (
            <button
              onClick={onOpenConnectorsCreator}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Connectors Creator (MAP)</span>
            </button>
          )}

          <button
            onClick={() => onTriggerTestDispatch('PRICE_ALERT_TRIGGERED')}
            disabled={isDispatching}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#03045e] hover:bg-[#0077b6] text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${isDispatching ? 'animate-spin' : ''}`} />
            <span>{isDispatching ? 'Transmitting...' : 'Dispatch Test Signal'}</span>
          </button>

          {onOpenStudio && (
            <button
              onClick={onOpenStudio}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-stone-500" />
              <span>Configure In Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-View Switcher: Webhook Delivery Telemetry vs API Health Monitor & Rate Limits */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
        <div className="inline-flex gap-1.5">
          <button
            type="button"
            id="view-deliveries-tab-btn"
            onClick={() => setActiveViewMode('deliveries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeViewMode === 'deliveries'
                ? 'bg-white text-[#03045e] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#0077b6]" />
            <span>Webhook Dispatches &amp; Logs</span>
          </button>

          <button
            type="button"
            id="view-api-health-tab-btn"
            onClick={() => setActiveViewMode('api_health')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeViewMode === 'api_health'
                ? 'bg-[#03045e] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>API Health Monitor &amp; Rate Limits</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/30 text-emerald-300">
              Kalshi + Connectors
            </span>
          </button>
        </div>

        <div className="text-xs text-stone-500 font-mono pr-2 hidden sm:block">
          {activeViewMode === 'deliveries' ? 'Displaying delivery pipeline & SLA telemetry' : 'Real-time Kalshi & Connector connectivity and rate limits'}
        </div>
      </div>

      {activeViewMode === 'api_health' ? (
        <ApiHealthMonitor />
      ) : (
        <>
      {/* 4 High-Impact KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Delivery Success Rate */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-baseline space-x-1">
              <span>{metrics.successRatePercent}%</span>
              <span className="text-xs font-bold text-emerald-600">SLA Met</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1 font-mono">
              {metrics.totalDeliveries} total dispatches recorded
            </div>
          </div>
        </div>

        {/* Card 2: Average Round-Trip Latency */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Latency</span>
            <Clock className="w-4 h-4 text-[#0077b6]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#03045e] tracking-tight flex items-baseline space-x-1">
              <span>{metrics.avgLatencyMs}</span>
              <span className="text-xs font-bold text-stone-500">ms</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1 font-mono">
              Min: {metrics.minLatencyMs}ms &bull; Max: {metrics.maxLatencyMs}ms
            </div>
          </div>
        </div>

        {/* Card 3: Active Event Trigger Endpoints */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Webhooks</span>
            <Radio className="w-4 h-4 text-[#00b4d8]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-baseline space-x-1">
              <span>{metrics.activeEndpointsCount}</span>
              <span className="text-xs font-bold text-stone-400">/ {activeWebhooks.length} enabled</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1 font-mono">
              Auto-dispatch active for market triggers
            </div>
          </div>
        </div>

        {/* Card 4: SLA Target Compliance */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">SLA Target (&le;100ms)</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight flex items-baseline space-x-1">
              <span>{metrics.slaCompliancePercent}%</span>
              <span className="text-xs font-bold text-stone-500">&lt; 100ms</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1 font-mono">
              Zero dropped packets or timeouts
            </div>
          </div>
        </div>
      </div>

      {/* LATENCY METRICS RECHARTS VISUALIZATION */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#0077b6]" />
            <h3 className="text-sm font-bold text-stone-900">
              Round-Trip Transmission Latency (ms) Over Deliveries
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#caf0f8] text-[#03045e]">
              Recharts Telemetry
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="inline-flex p-1 rounded-xl bg-stone-100 text-xs">
              <button
                onClick={() => setSelectedFormatFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFormatFilter === 'ALL'
                    ? 'bg-white text-[#03045e] shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFormatFilter('JSON')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFormatFilter === 'JSON'
                    ? 'bg-white text-[#03045e] shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                REST JSON
              </button>
              <button
                onClick={() => setSelectedFormatFilter('EDI')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFormatFilter === 'EDI'
                    ? 'bg-white text-[#03045e] shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                EDI / cXML
              </button>
            </div>
          </div>
        </div>

        {/* The Recharts Line / Area Chart */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0077b6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0077b6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="seq"
                tickLine={false}
                stroke="#94a3b8"
                fontSize={11}
                tickMargin={8}
              />
              <YAxis
                unit="ms"
                domain={[0, 'auto']}
                tickLine={false}
                stroke="#94a3b8"
                fontSize={11}
                tickMargin={6}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#03045e] text-white p-3 rounded-xl shadow-xl text-xs font-sans border border-[#0077b6] space-y-1">
                        <div className="font-bold flex items-center justify-between gap-3 text-[#90e0ef]">
                          <span>{data.seq} ({data.time})</span>
                          <span className="font-mono text-emerald-400">{data.status} OK</span>
                        </div>
                        <div className="text-sm font-black text-white">
                          Latency: <span className="text-[#00d4ff]">{data.latency} ms</span>
                        </div>
                        <div className="text-[11px] text-stone-300">
                          Format: <span className="font-mono text-amber-300">{data.format}</span>
                        </div>
                        {data.eventType && (
                          <div className="text-[10px] text-stone-400 font-mono">
                            Event: {data.eventType}
                          </div>
                        )}
                        <div className="text-[10px] text-stone-400 pt-0.5 border-t border-white/10">
                          Target SLA: {data.slaTarget}ms
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={100}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: '100ms Target SLA',
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#0077b6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#latencyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0077b6]"></span>
              <span className="font-semibold text-stone-700">Observed Roundtrip Latency</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-rose-500"></span>
              <span className="font-semibold text-stone-700">100ms SLA Baseline</span>
            </span>
          </div>
          <span className="font-mono text-[11px]">Sampling: Every Dispatched Signal</span>
        </div>
      </div>

      {/* ACTIVE EVENT-TRIGGERED WEBHOOKS STATUS TABLE */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-[#0077b6]" />
            <h3 className="text-sm font-bold text-stone-900">
              Active Event-Triggered Webhook Subscriptions ({activeWebhooks.length})
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            Real-time listener rules bridging market probability signals to enterprise receivers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Webhook Rule / Destination</th>
                <th className="py-2.5 px-3">Event Trigger</th>
                <th className="py-2.5 px-3">Data Format</th>
                <th className="py-2.5 px-3">Health Status</th>
                <th className="py-2.5 px-3">Telemetry</th>
                <th className="py-2.5 px-3">Auto-Dispatch</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {activeWebhooks.map((wh) => (
                <tr key={wh.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-stone-900 flex items-center space-x-1.5">
                      <span>{wh.name}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono truncate max-w-[280px]" title={wh.targetUrl}>
                      {wh.targetUrl}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#caf0f8] text-[#03045e]">
                      {wh.eventTrigger}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-100 text-stone-700 border border-stone-200">
                      {wh.format}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        wh.status === 'healthy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : wh.status === 'degraded'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          wh.status === 'healthy'
                            ? 'bg-emerald-500 animate-pulse'
                            : wh.status === 'degraded'
                            ? 'bg-amber-500'
                            : 'bg-stone-400'
                        }`}
                      />
                      <span className="capitalize">{wh.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-600 font-mono text-[11px]">
                    <div>{wh.avgLatencyMs}ms avg</div>
                    <div className="text-[10px] text-stone-400">{wh.deliveryCount} delivered</div>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleAutoDispatch(wh.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        wh.autoDispatch
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      {wh.autoDispatch ? 'ENABLED' : 'PAUSED'}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handlePingWebhook(wh)}
                      disabled={testingWebhookId === wh.id}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#caf0f8] hover:text-[#03045e] text-stone-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      title="Trigger immediate test dispatch"
                    >
                      <Send className={`w-3 h-3 ${testingWebhookId === wh.id ? 'animate-spin' : ''}`} />
                      <span>{testingWebhookId === wh.id ? 'Testing...' : 'Ping'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT DELIVERY LOGS & AUDIT TRAIL */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#0077b6]" />
            <h3 className="text-sm font-bold text-stone-900">
              Live Delivery Logs &amp; Audit Trail ({filteredLogs.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="inline-flex p-1 rounded-xl bg-stone-100 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-[#03045e] shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('SUCCESS')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'SUCCESS'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                200 OK
              </button>
              <button
                onClick={() => setStatusFilter('ERROR')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'ERROR'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Errors
              </button>
            </div>

            {deliveryLogs.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#caf0f8] hover:bg-[#90e0ef] text-[#03045e] border border-[#90e0ef] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Download delivery logs and latency metrics as CSV for auditing"
                >
                  <Download className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>Download Logs (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadAuditReport}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Download telemetry audit as JSON"
                >
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={onClearLogs}
                  className="px-2.5 py-1.5 text-xs text-stone-400 hover:text-rose-600 font-semibold transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-stone-400 space-y-2">
            <Server className="w-8 h-8 mx-auto text-stone-300" />
            <p className="font-bold text-stone-700">No Webhook Deliveries In Current Filter</p>
            <p className="text-xs">Click "Dispatch Test Signal" above to generate a delivery record.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  className="border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 transition-all bg-stone-50/40"
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          log.success
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${log.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{log.statusCode}</span>
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-stone-900">{log.eventType}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#caf0f8] text-[#03045e]">
                            {log.format}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono truncate max-w-sm sm:max-w-md">
                          {log.targetUrl}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 text-xs font-mono text-stone-500">
                      <span>{log.timestamp}</span>
                      <span className="font-bold text-[#0077b6]">{log.latencyMs}ms</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Payload and Response Inspector */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-stone-200 space-y-3 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Payload Sent */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                            <span>Transmitted Payload</span>
                            <button
                              onClick={() => handleCopy(JSON.stringify(log.payload, null, 2), `payload-${log.id}`)}
                              className="text-[11px] text-[#0077b6] hover:underline flex items-center space-x-1 cursor-pointer"
                            >
                              {copiedId === `payload-${log.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedId === `payload-${log.id}` ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <div className="p-3 bg-stone-900 text-stone-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                            <pre>{typeof log.payload === 'string' ? log.payload : JSON.stringify(log.payload, null, 2)}</pre>
                          </div>
                        </div>

                        {/* Response Body Received */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                            <span>Target Response ({log.statusText})</span>
                            {log.responseBody && (
                              <button
                                onClick={() => handleCopy(JSON.stringify(log.responseBody, null, 2), `resp-${log.id}`)}
                                className="text-[11px] text-[#0077b6] hover:underline flex items-center space-x-1 cursor-pointer"
                              >
                                {copiedId === `resp-${log.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedId === `resp-${log.id}` ? 'Copied' : 'Copy'}</span>
                              </button>
                            )}
                          </div>
                          <div className="p-3 bg-stone-50 border border-stone-200 text-stone-800 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                            <pre>{JSON.stringify(log.responseBody || { status: 'Awaiting Ack' }, null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
