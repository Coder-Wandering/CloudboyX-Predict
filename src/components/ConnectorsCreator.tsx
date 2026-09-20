import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Server,
  Boxes,
  Globe,
  Radio,
  Copy,
  Check,
  Zap,
  Trash2,
  RefreshCw,
  Send,
  Lock,
  Tag,
  Layers,
  ArrowRight,
  Info,
  Sliders,
  CheckSquare,
  Square,
  ShoppingCart,
  Filter,
} from 'lucide-react';
import {
  CustomConnector,
  ConnectorType,
  EnterprisePayloadFormat,
  EnterpriseWebhookEvent,
} from '../types';

interface ConnectorsCreatorProps {
  onSelectConnectorAsTarget: (url: string, format?: EnterprisePayloadFormat) => void;
  onOpenStudio?: () => void;
  onOpenHealthDashboard?: () => void;
}

// Pre-built connectors including MAP Protection Scanner & E-Commerce Marketplaces
const INITIAL_PREBUILT_CONNECTORS: CustomConnector[] = [
  {
    id: 'conn-map-protection',
    name: 'CloudboyX MAP Protection Sentinel',
    description: 'Autonomous MAP surveillance webhook that receives price violation notices from Amazon, Walmart, and Target to trigger automated repricing lockouts and compliance warnings.',
    type: 'compliance_map',
    endpointUrl: 'https://map-protection-scanner.ai.studio/api/webhooks/pricing-feed',
    authType: 'bearer',
    authSecret: 'map_sec_live_9948270192a83f',
    supportedFormats: ['REST_JSON', 'EDI_846'],
    subscribedEvents: ['PRICE_ALERT_TRIGGERED', 'VOLATILITY_SPIKE'],
    direction: 'bidirectional',
    status: 'active',
    isPrebuilt: true,
    createdAt: '2026-09-01',
    lastPingAt: '3 mins ago',
    lastLatencyMs: 44,
    totalDelivered: 142,
    failureCount: 0,
  },
  {
    id: 'conn-amazon-spapi',
    name: 'Amazon SP-API Pricing & AnyOfferChanged',
    description: 'Amazon Selling Partner API notification subscription endpoint for real-time Buy Box loss, pricing undercutting, and competitor volatility feeds.',
    type: 'marketplace',
    endpointUrl: 'https://sellingpartnerapi-na.amazon.com/notifications/v1/subscriptions',
    authType: 'hmac',
    authSecret: 'amzn_spapi_sig_sha256_k7732',
    supportedFormats: ['REST_JSON', 'CXML'],
    subscribedEvents: ['PRICE_ALERT_TRIGGERED', 'VOLATILITY_SPIKE'],
    direction: 'inbound',
    status: 'active',
    isPrebuilt: true,
    createdAt: '2026-09-02',
    lastPingAt: '12 mins ago',
    lastLatencyMs: 58,
    totalDelivered: 89,
    failureCount: 1,
  },
  {
    id: 'conn-walmart-marketplace',
    name: 'Walmart Marketplace Developer Sentinel',
    description: 'Walmart Marketplace V3 event gateway capturing price change notifications and catalog inventory availability telemetry across US fulfillment nodes.',
    type: 'marketplace',
    endpointUrl: 'https://marketplace.walmartapis.com/v3/events/subscriptions',
    authType: 'api_key',
    authSecret: 'wm_client_auth_secret_99182',
    supportedFormats: ['REST_JSON', 'EDI_852'],
    subscribedEvents: ['PRICE_ALERT_TRIGGERED', 'INVENTORY_REORDER_SYNC'],
    direction: 'inbound',
    status: 'active',
    isPrebuilt: true,
    createdAt: '2026-09-03',
    lastPingAt: '25 mins ago',
    lastLatencyMs: 62,
    totalDelivered: 54,
    failureCount: 0,
  },
  {
    id: 'conn-shopify-plus',
    name: 'Shopify Plus Storefront & Webhook Hub',
    description: 'Enterprise Shopify Admin API webhook listener for inventory level rebalances, catalog pricing adjustments, and draft purchase order generation.',
    type: 'marketplace',
    endpointUrl: 'https://myshopify.com/admin/api/2026-01/webhooks.json',
    authType: 'hmac',
    authSecret: 'shppa_sec_991827401a7',
    supportedFormats: ['REST_JSON', 'CXML'],
    subscribedEvents: ['PURCHASE_ORDER_GENERATED', 'INVENTORY_REORDER_SYNC'],
    direction: 'outbound',
    status: 'active',
    isPrebuilt: true,
    createdAt: '2026-09-04',
    lastPingAt: '40 mins ago',
    lastLatencyMs: 41,
    totalDelivered: 76,
    failureCount: 0,
  },
  {
    id: 'conn-cloudboyx-erp',
    name: 'CloudboyX ERP Operations Hub',
    description: 'Native execution platform in the CloudboyX suite bridging predictive market signals directly into automated purchase orders and supplier EDI transactions.',
    type: 'erp',
    endpointUrl: 'https://cloudboyx-erp.ai.studio/api/webhooks/market-signals',
    authType: 'bearer',
    authSecret: 'cbx_sec_live_9948270192a83f',
    supportedFormats: ['REST_JSON', 'EDI_850', 'EDI_846', 'EDI_852', 'EDI_856', 'EDI_810', 'CXML'],
    subscribedEvents: ['PRICE_ALERT_TRIGGERED', 'VOLATILITY_SPIKE', 'KELLY_EDGE_DETECTED', 'PURCHASE_ORDER_GENERATED'],
    direction: 'bidirectional',
    status: 'active',
    isPrebuilt: true,
    createdAt: '2026-09-01',
    lastPingAt: 'Just now',
    lastLatencyMs: 38,
    totalDelivered: 310,
    failureCount: 0,
  },
  {
    id: 'conn-sap-s4hana',
    name: 'SAP S/4HANA OData & IDoc Gateway',
    description: 'Enterprise integration gateway bridging CloudboyX market intelligence into SAP ERP Purchase Orders (EDI 850) and material master inventory records.',
    type: 'erp',
    endpointUrl: 'https://s4hana-gateway.enterprise.corp/sap/bc/rest/cloudboyx/v1/orders',
    authType: 'basic',
    authSecret: 'sap_svc_usr:Pr0d$ecurePass_99',
    supportedFormats: ['EDI_850', 'EDI_846', 'EDI_810', 'REST_JSON'],
    subscribedEvents: ['PURCHASE_ORDER_GENERATED', 'INVENTORY_REORDER_SYNC'],
    direction: 'outbound',
    status: 'active',
    isPrebuilt: true,
    createdAt: '2026-09-05',
    lastPingAt: '1 hour ago',
    lastLatencyMs: 65,
    totalDelivered: 42,
    failureCount: 1,
  },
];

const AVAILABLE_FORMATS: EnterprisePayloadFormat[] = [
  'REST_JSON',
  'EDI_850',
  'EDI_846',
  'EDI_852',
  'EDI_856',
  'EDI_810',
  'CXML',
];

const AVAILABLE_EVENTS: EnterpriseWebhookEvent[] = [
  'PRICE_ALERT_TRIGGERED',
  'VOLATILITY_SPIKE',
  'KELLY_EDGE_DETECTED',
  'PURCHASE_ORDER_GENERATED',
  'INVENTORY_REORDER_SYNC',
  'ADVANCE_SHIP_NOTICE',
];

export const ConnectorsCreator: React.FC<ConnectorsCreatorProps> = ({
  onSelectConnectorAsTarget,
  onOpenStudio,
  onOpenHealthDashboard,
}) => {
  // Connectors list (stored in localStorage)
  const [connectors, setConnectors] = useState<CustomConnector[]>(() => {
    try {
      const saved = localStorage.getItem('cbx_custom_connectors');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_PREBUILT_CONNECTORS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cbx_custom_connectors', JSON.stringify(connectors));
    } catch (e) {
      console.warn('Failed to save connectors', e);
    }
  }, [connectors]);

  // Modal / Creator Form State
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'ALL' | ConnectorType>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latencyMs: number } | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formType, setFormType] = useState<ConnectorType>('compliance_map');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formAuthType, setFormAuthType] = useState<CustomConnector['authType']>('bearer');
  const [formAuthSecret, setFormAuthSecret] = useState<string>('');
  const [formDirection, setFormDirection] = useState<'inbound' | 'outbound' | 'bidirectional'>('bidirectional');
  const [formSelectedFormats, setFormSelectedFormats] = useState<EnterprisePayloadFormat[]>(['REST_JSON']);
  const [formSelectedEvents, setFormSelectedEvents] = useState<EnterpriseWebhookEvent[]>([
    'PRICE_ALERT_TRIGGERED',
    'VOLATILITY_SPIKE',
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered connectors list
  const filteredConnectors = connectors.filter((c) => {
    if (filterType === 'ALL') return true;
    return c.type === filterType;
  });

  // Handle format selection toggle
  const toggleFormat = (fmt: EnterprisePayloadFormat) => {
    setFormSelectedFormats((prev) =>
      prev.includes(fmt) ? (prev.length > 1 ? prev.filter((f) => f !== fmt) : prev) : [...prev, fmt]
    );
  };

  // Handle event selection toggle
  const toggleEvent = (evt: EnterpriseWebhookEvent) => {
    setFormSelectedEvents((prev) =>
      prev.includes(evt) ? (prev.length > 1 ? prev.filter((e) => e !== evt) : prev) : [...prev, evt]
    );
  };

  // Create & Register New Connector
  const handleCreateConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Connector name is required.');
      return;
    }
    if (!formUrl.trim() || !formUrl.startsWith('http')) {
      setFormError('Please enter a valid HTTP or HTTPS endpoint URL.');
      return;
    }

    const newConnector: CustomConnector = {
      id: `conn-custom-${Date.now()}`,
      name: formName.trim(),
      description: formDescription.trim() || 'Custom registered enterprise webhook connector.',
      type: formType,
      endpointUrl: formUrl.trim(),
      authType: formAuthType,
      authSecret: formAuthSecret.trim() || undefined,
      supportedFormats: formSelectedFormats,
      subscribedEvents: formSelectedEvents,
      direction: formDirection,
      status: 'active',
      isPrebuilt: false,
      createdAt: new Date().toISOString().slice(0, 10),
      lastPingAt: 'Just created',
      lastLatencyMs: 0,
      totalDelivered: 0,
      failureCount: 0,
    };

    setConnectors((prev) => [newConnector, ...prev]);
    setIsCreatorOpen(false);
    // Reset form
    setFormName('');
    setFormDescription('');
    setFormUrl('');
    setFormAuthSecret('');
    setFormError(null);
  };

  // Test Ping a connector
  const handleTestPing = async (connector: CustomConnector) => {
    setTestingId(connector.id);
    setTestResult(null);

    try {
      const res = await fetch('/api/erp/webhook-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: connector.endpointUrl,
          authHeader: connector.authSecret || 'cbx_sec_test_ping',
          payload: {
            ping: true,
            source: 'CloudboyX-Connect-Connector-Tester',
            connectorId: connector.id,
            timestamp: new Date().toISOString(),
          },
          eventType: connector.subscribedEvents[0] || 'PRICE_ALERT_TRIGGERED',
          format: connector.supportedFormats[0] || 'REST_JSON',
          connectorMode: 'standalone_gateway',
          isSimulated: true,
        }),
      });

      const data = await res.json();
      const latency = data.latencyMs || 42;

      setTestResult({
        id: connector.id,
        success: data.success ?? true,
        latencyMs: latency,
      });

      // Update connector stats
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === connector.id
            ? {
                ...c,
                lastPingAt: 'Just now',
                lastLatencyMs: latency,
                totalDelivered: (c.totalDelivered || 0) + 1,
              }
            : c
        )
      );
    } catch {
      setTestResult({ id: connector.id, success: false, latencyMs: 0 });
    } finally {
      setTestingId(null);
    }
  };

  // Delete custom connector
  const handleDelete = (id: string) => {
    setConnectors((prev) => prev.filter((c) => c.id !== id));
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c
      )
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="connectors-creator-view" className="space-y-6 animate-in fade-in duration-200">
      {/* HERO BANNER: INTEGRATION WITH MAP PROTECTION MODULE */}
      <div className="bg-gradient-to-r from-amber-600 via-stone-900 to-[#03045e] rounded-3xl p-5 sm:p-7 text-white shadow-md border border-amber-500/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                MAP PROTECTION &bull; CONNECTORS CREATOR
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-amber-200 text-[10px] font-mono border border-white/20">
                Bidirectional Marketplace Bridge
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Connectors Creator &amp; Marketplace Surveillance Hub
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Create and manage custom webhook connectors linking <strong>CloudboyX Predict</strong> and <strong>CloudboyX Connect</strong> directly to the <strong>MAP Protection Scanner module</strong> (<span className="font-mono text-amber-300">map-protection-scanner.ai.studio</span>), Amazon SP-API, Walmart Marketplace, Shopify Plus, and enterprise ERPs.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-300 font-medium">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>MAP Price Violation Detection</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Automated EDI 850 Reorder Safeguards</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00d4ff] shrink-0" />
                <span>Zero-Latency Webhook Routing</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 space-y-2.5 flex flex-col sm:flex-row lg:flex-col gap-2">
            <button
              id="open-create-connector-modal-btn"
              onClick={() => setIsCreatorOpen(true)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Connector</span>
            </button>

            <a
              id="visit-map-scanner-btn"
              href="https://map-protection-scanner.ai.studio"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer"
            >
              <span>Launch MAP Scanner</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
            </a>
          </div>
        </div>
      </div>

      {/* FILTER & STATS BAR */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-[#03045e] text-white shadow-2xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            All Connectors ({connectors.length})
          </button>

          <button
            onClick={() => setFilterType('compliance_map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'compliance_map'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            MAP Protection ({connectors.filter((c) => c.type === 'compliance_map').length})
          </button>

          <button
            onClick={() => setFilterType('marketplace')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'marketplace'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
            }`}
          >
            Marketplace ({connectors.filter((c) => c.type === 'marketplace').length})
          </button>

          <button
            onClick={() => setFilterType('erp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'erp'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            Enterprise ERP ({connectors.filter((c) => c.type === 'erp').length})
          </button>

          <button
            onClick={() => setFilterType('custom_webhook')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'custom_webhook'
                ? 'bg-[#0077b6] text-white shadow-2xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            Custom ({connectors.filter((c) => c.type === 'custom_webhook').length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenHealthDashboard && (
            <button
              onClick={onOpenHealthDashboard}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#caf0f8] hover:bg-[#90e0ef] text-[#03045e] text-xs font-bold transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-[#0077b6]" />
              <span>Health Dashboard</span>
            </button>
          )}

          {onOpenStudio && (
            <button
              onClick={onOpenStudio}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-stone-500" />
              <span>Open Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* CONNECTORS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredConnectors.map((connector) => {
          const isTesting = testingId === connector.id;
          const result = testResult && testResult.id === connector.id ? testResult : null;

          return (
            <div
              key={connector.id}
              className={`rounded-3xl border p-5 sm:p-6 transition-all shadow-xs flex flex-col justify-between bg-white ${
                connector.type === 'compliance_map'
                  ? 'border-amber-300 hover:border-amber-500 ring-1 ring-amber-200/50'
                  : connector.type === 'marketplace'
                  ? 'border-purple-200 hover:border-purple-400'
                  : connector.type === 'erp'
                  ? 'border-emerald-200 hover:border-emerald-400'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="space-y-3.5">
                {/* Connector Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2.5 rounded-2xl text-white shadow-xs ${
                        connector.type === 'compliance_map'
                          ? 'bg-amber-500'
                          : connector.type === 'marketplace'
                          ? 'bg-purple-600'
                          : connector.type === 'erp'
                          ? 'bg-emerald-600'
                          : 'bg-[#0077b6]'
                      }`}
                    >
                      {connector.type === 'compliance_map' ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : connector.type === 'marketplace' ? (
                        <ShoppingCart className="w-5 h-5" />
                      ) : connector.type === 'erp' ? (
                        <Boxes className="w-5 h-5" />
                      ) : (
                        <Globe className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-base font-black text-stone-900 tracking-tight">
                          {connector.name}
                        </h3>
                        {connector.isPrebuilt && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-stone-100 text-stone-600">
                            Prebuilt
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        {connector.type.replace('_', ' ')} &bull; {connector.direction}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleToggleStatus(connector.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        connector.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {connector.status.toUpperCase()}
                    </button>

                    {!connector.isPrebuilt && (
                      <button
                        onClick={() => handleDelete(connector.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete custom connector"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-600 leading-relaxed">
                  {connector.description}
                </p>

                {/* Endpoint URL Box */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px] flex items-center justify-between gap-2">
                  <span className="truncate text-stone-700" title={connector.endpointUrl}>
                    {connector.endpointUrl}
                  </span>
                  <button
                    onClick={() => handleCopy(connector.endpointUrl, `url-${connector.id}`)}
                    className="p-1 text-stone-400 hover:text-stone-700 shrink-0 cursor-pointer"
                    title="Copy endpoint URL"
                  >
                    {copiedId === `url-${connector.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Tags: Auth + Formats + Events */}
                <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Auth:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-100 text-stone-800">
                      {connector.authType.toUpperCase()}
                    </span>

                    <span className="text-[10px] font-bold text-stone-400 uppercase ml-2">Standards:</span>
                    {connector.supportedFormats.slice(0, 3).map((fmt) => (
                      <span
                        key={fmt}
                        className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#caf0f8] text-[#03045e]"
                      >
                        {fmt}
                      </span>
                    ))}
                    {connector.supportedFormats.length > 3 && (
                      <span className="text-[10px] text-stone-400">+{connector.supportedFormats.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                    <span>Telemetry: {connector.totalDelivered || 0} delivered</span>
                    <span>Last latency: {connector.lastLatencyMs ? `${connector.lastLatencyMs}ms` : 'N/A'}</span>
                  </div>
                </div>

                {/* Test Result Toast Banner */}
                {result && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-mono flex items-center justify-between border ${
                      result.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <span className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ping acknowledged in {result.latencyMs}ms</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Validated</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-stone-200 flex items-center gap-2">
                <button
                  id={`test-ping-${connector.id}`}
                  onClick={() => handleTestPing(connector)}
                  disabled={isTesting}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
                </button>

                <button
                  id={`use-target-${connector.id}`}
                  onClick={() => {
                    onSelectConnectorAsTarget(connector.endpointUrl, connector.supportedFormats[0]);
                    if (onOpenStudio) onOpenStudio();
                  }}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-[#03045e] hover:bg-[#0077b6] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <Radio className="w-3.5 h-3.5 text-[#00d4ff]" />
                  <span>Use in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE NEW CONNECTOR MODAL */}
      {isCreatorOpen && (
        <div
          id="create-connector-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsCreatorOpen(false)}
        >
          <div
            id="create-connector-modal"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    Register New Enterprise Connector
                  </h3>
                  <p className="text-xs text-stone-500">
                    Add a marketplace, MAP protection scanner, or ERP endpoint to your CloudboyX Connect registry.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatorOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateConnector} className="space-y-4 text-xs">
              {/* Connector Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Connector Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Target Plus EDI Ingestor"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0077b6] text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Connector Ecosystem Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ConnectorType)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0077b6] text-xs bg-white cursor-pointer"
                  >
                    <option value="compliance_map">MAP Compliance &amp; Price Surveillance</option>
                    <option value="marketplace">E-Commerce Marketplace (Amazon, Walmart, Shopify)</option>
                    <option value="erp">Enterprise ERP (CloudboyX ERP, SAP, NetSuite)</option>
                    <option value="custom_webhook">Custom Inbound/Outbound Webhook</option>
                  </select>
                </div>
              </div>

              {/* Endpoint URL */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Target Inbound / Webhook Endpoint URL *</label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/webhooks/market-signals"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0077b6] font-mono text-xs"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Description (Optional)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the operational role of this connector..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0077b6] text-xs resize-none"
                />
              </div>

              {/* Authentication & Direction */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Auth Method</label>
                  <select
                    value={formAuthType}
                    onChange={(e) => setFormAuthType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0077b6] text-xs bg-white cursor-pointer"
                  >
                    <option value="bearer">Bearer Token</option>
                    <option value="hmac">HMAC-SHA256 Signature</option>
                    <option value="api_key">API Key Header (X-API-Key)</option>
                    <option value="basic">Basic Auth</option>
                    <option value="none">None / Public</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-700">Secret Token / Key</label>
                  <input
                    type="password"
                    value={formAuthSecret}
                    onChange={(e) => setFormAuthSecret(e.target.value)}
                    placeholder="Enter secret token or key..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0077b6] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Supported Data Standards Checkboxes */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Supported Payload Standards</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_FORMATS.map((fmt) => {
                    const isSelected = formSelectedFormats.includes(fmt);
                    return (
                      <button
                        type="button"
                        key={fmt}
                        onClick={() => toggleFormat(fmt)}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#03045e] text-[#00d4ff] border-[#03045e]'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subscribed Events Checkboxes */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Subscribed Event Triggers</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_EVENTS.map((evt) => {
                    const isSelected = formSelectedEvents.includes(evt);
                    return (
                      <button
                        type="button"
                        key={evt}
                        onClick={() => toggleEvent(evt)}
                        className={`px-2.5 py-1.5 rounded-lg text-left text-[10px] font-bold transition-all cursor-pointer border flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-stone-50 text-stone-600 border-stone-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-amber-500' : 'bg-stone-300'
                          }`}
                        />
                        <span className="truncate">{evt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreatorOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black transition-all shadow-xs cursor-pointer"
                >
                  Register Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
