import React, { useState, useEffect } from 'react';
import {
  Webhook,
  Send,
  Radio,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  FileCode2,
  Boxes,
  ShieldCheck,
  ExternalLink,
  Clock,
  ArrowUpRight,
  Code2,
  Filter,
  Layers,
  ArrowRight,
  Download,
  Info,
  Server,
  Zap,
  Globe,
  Cpu,
  Package,
  BookOpen,
  Share2,
  Sliders,
  CheckSquare,
  Activity,
  Shield,
  KeyRound,
  Lock,
  History,
} from 'lucide-react';
import {
  ProbabilityAnalysisResult,
  EnterpriseWebhookEvent,
  EnterprisePayloadFormat,
  WebhookDeliveryRecord,
  ConnectModuleMode,
  WebhookSecurityConfig,
} from '../types';
import { WebhookHealthDashboard } from './WebhookHealthDashboard';
import { ConnectorsCreator } from './ConnectorsCreator';
import { WebhookTelemetrySparkline } from './WebhookTelemetrySparkline';
import { SecurityCredentialsModal } from './SecurityCredentialsModal';
import { WebhookBacktestModule } from './WebhookBacktestModule';
import { ApiHealthMonitor } from './ApiHealthMonitor';
import { QuickNotifyModal } from './QuickNotifyModal';

interface EnterpriseWebhookStudioProps {
  activeAnalysis?: ProbabilityAnalysisResult | null;
  onOpenSuiteSwitcher?: () => void;
}

const DEFAULT_ERP_URL = 'https://cloudboyx-erp.ai.studio/api/webhooks/market-signals';
const DEFAULT_MAP_URL = 'https://map-protection-scanner.ai.studio/api/webhooks/pricing-feed';
const DEFAULT_SAP_URL = 'https://s4hana-gateway.enterprise.corp/sap/bc/rest/cloudboyx/v1/orders';
const DEFAULT_NETSUITE_URL = 'https://netsuite.custhelp.com/services/rest/connect/v1.3/webhooks';

// Pre-seeded baseline delivery logs for last 10 events telemetry
const INITIAL_DELIVERY_RECORDS: WebhookDeliveryRecord[] = [
  {
    id: 'cbx-init-01',
    timestamp: '11:12:04',
    targetUrl: DEFAULT_ERP_URL,
    eventType: 'PRICE_ALERT_TRIGGERED',
    format: 'REST_JSON',
    statusCode: 200,
    statusText: '200 OK',
    latencyMs: 34,
    payload: { status: 'dispatched' },
    success: true,
  },
  {
    id: 'cbx-init-02',
    timestamp: '11:11:42',
    targetUrl: DEFAULT_ERP_URL,
    eventType: 'VOLATILITY_SPIKE',
    format: 'REST_JSON',
    statusCode: 200,
    statusText: '200 OK',
    latencyMs: 42,
    payload: { status: 'dispatched' },
    success: true,
  },
  {
    id: 'cbx-init-03',
    timestamp: '11:11:18',
    targetUrl: DEFAULT_MAP_URL,
    eventType: 'KELLY_EDGE_DETECTED',
    format: 'REST_JSON',
    statusCode: 200,
    statusText: '200 OK',
    latencyMs: 29,
    payload: { status: 'dispatched' },
    success: true,
  },
  {
    id: 'cbx-init-04',
    timestamp: '11:10:55',
    targetUrl: DEFAULT_SAP_URL,
    eventType: 'PURCHASE_ORDER_GENERATED',
    format: 'EDI_850',
    statusCode: 200,
    statusText: '200 OK',
    latencyMs: 58,
    payload: { status: 'dispatched' },
    success: true,
  },
  {
    id: 'cbx-init-05',
    timestamp: '11:10:30',
    targetUrl: DEFAULT_ERP_URL,
    eventType: 'INVENTORY_REORDER_SYNC',
    format: 'EDI_846',
    statusCode: 200,
    statusText: '200 OK',
    latencyMs: 38,
    payload: { status: 'dispatched' },
    success: true,
  },
  {
    id: 'cbx-init-06',
    timestamp: '11:10:02',
    targetUrl: DEFAULT_MAP_URL,
    eventType: 'PRICE_ALERT_TRIGGERED',
    format: 'REST_JSON',
    statusCode: 200,
    statusText: '200 OK',
    latencyMs: 31,
    payload: { status: 'dispatched' },
    success: true,
  },
  {
    id: 'cbx-init-07',
    timestamp: '11:09:41',
    targetUrl: DEFAULT_ERP_URL,
    eventType: 'SENTIMENT_SHIFT',
    format: 'REST_JSON',
    statusCode: 200,
    statusText: '200 OK',
    latencyMs: 46,
    payload: { status: 'dispatched' },
    success: true,
  },
  {
    id: 'cbx-init-08',
    timestamp: '11:09:12',
    targetUrl: DEFAULT_ERP_URL,
    eventType: 'KELLY_EDGE_DETECTED',
    format: 'REST_JSON',
    statusCode: 200,
    statusText: '200 OK',
    latencyMs: 37,
    payload: { status: 'dispatched' },
    success: true,
  },
  {
    id: 'cbx-init-09',
    timestamp: '11:08:50',
    targetUrl: DEFAULT_SAP_URL,
    eventType: 'ADVANCE_SHIP_NOTICE',
    format: 'EDI_856',
    statusCode: 200,
    statusText: '200 OK',
    latencyMs: 52,
    payload: { status: 'dispatched' },
    success: true,
  },
  {
    id: 'cbx-init-10',
    timestamp: '11:08:24',
    targetUrl: DEFAULT_ERP_URL,
    eventType: 'PRICE_ALERT_TRIGGERED',
    format: 'REST_JSON',
    statusCode: 200,
    statusText: '200 OK',
    latencyMs: 35,
    payload: { status: 'dispatched' },
    success: true,
  },
];

export const EnterpriseWebhookStudio: React.FC<EnterpriseWebhookStudioProps> = ({
  activeAnalysis,
  onOpenSuiteSwitcher,
}) => {
  // Connector Operational Mode: Suite Add-On vs Standalone Gateway vs Marketing Showcase
  const [connectorMode, setConnectorMode] = useState<ConnectModuleMode>(() => {
    return (localStorage.getItem('cbx_connect_mode') as ConnectModuleMode) || 'suite_addon';
  });

  // Config state
  const [targetUrl, setTargetUrl] = useState<string>(() => {
    return localStorage.getItem('cbx_webhook_target_url') || DEFAULT_ERP_URL;
  });
  const [authHeader, setAuthHeader] = useState<string>(() => {
    return localStorage.getItem('cbx_webhook_auth_header') || 'cbx_sec_live_9948270192a83f';
  });

  // Security Credentials Modal & Config
  const [securityConfig, setSecurityConfig] = useState<WebhookSecurityConfig>(() => {
    try {
      const saved = localStorage.getItem('cbx_webhook_security_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // ignore
    }
    return {
      authType: 'bearer',
      bearerToken: localStorage.getItem('cbx_webhook_auth_header') || 'cbx_sec_live_9948270192a83f',
      hmacSecret: '8f7e2a9b4c1d6e3f5a0b2c4d6e8f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f',
      hmacAlgorithm: 'sha256',
      hmacHeaderName: 'X-CloudboyX-Signature',
      includeTimestamp: true,
      timestampHeaderName: 'X-CloudboyX-Timestamp',
      signaturePrefix: 'sha256=',
    };
  });
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [eventType, setEventType] = useState<EnterpriseWebhookEvent>('PRICE_ALERT_TRIGGERED');
  const [format, setFormat] = useState<EnterprisePayloadFormat>('REST_JSON');
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState<boolean>(() => {
    return localStorage.getItem('cbx_auto_dispatch_enabled') === 'true';
  });
  const [isSimulatedReceiver, setIsSimulatedReceiver] = useState<boolean>(true);
  const [triggerPriceThreshold, setTriggerPriceThreshold] = useState<number>(65);
  const [promotedRuleBanner, setPromotedRuleBanner] = useState<string | null>(null);

  const handlePromoteBacktestedRules = (rules: {
    thresholdCents: number;
    eventType: EnterpriseWebhookEvent;
    format: EnterprisePayloadFormat;
  }) => {
    setTriggerPriceThreshold(rules.thresholdCents);
    setEventType(rules.eventType);
    setFormat(rules.format);
    setConnectorMode('suite_addon');
    setPromotedRuleBanner(
      `Promoted backtested policy: ${rules.eventType} (${rules.thresholdCents}¢ threshold) in ${rules.format} format!`
    );
    setTimeout(() => setPromotedRuleBanner(null), 6000);
  };

  // Standalone mode custom inputs
  const [standalonePoNumber, setStandalonePoNumber] = useState<string>('PO-2026-90412');
  const [standaloneSku, setStandaloneSku] = useState<string>('SKU-CBX-7029-X');
  const [standaloneQuantity, setStandaloneQuantity] = useState<number>(500);
  const [standaloneUnitPrice, setStandaloneUnitPrice] = useState<number>(45.5);
  const [showSegmentInspector, setShowSegmentInspector] = useState<boolean>(false);
  const [marketingTab, setMarketingTab] = useState<'overview' | 'docker' | 'helm' | 'sdk' | 'pricing'>('overview');

  // Delivery states
  const [isQuickNotifyOpen, setIsQuickNotifyOpen] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    statusCode: number;
    statusText: string;
    deliveryId: string;
    latencyMs: number;
    responseBody: any;
  } | null>(null);

  // Delivery History
  const [deliveryLogs, setDeliveryLogs] = useState<WebhookDeliveryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('cbx_webhook_delivery_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_DELIVERY_RECORDS;
    } catch {
      return INITIAL_DELIVERY_RECORDS;
    }
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadLogsSuccess, setDownloadLogsSuccess] = useState<boolean>(false);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('cbx_connect_mode', connectorMode);
  }, [connectorMode]);

  useEffect(() => {
    localStorage.setItem('cbx_webhook_target_url', targetUrl);
  }, [targetUrl]);

  useEffect(() => {
    localStorage.setItem('cbx_webhook_auth_header', authHeader);
  }, [authHeader]);

  useEffect(() => {
    try {
      localStorage.setItem('cbx_webhook_security_config', JSON.stringify(securityConfig));
      if (securityConfig.bearerToken) {
        setAuthHeader(securityConfig.bearerToken);
      }
    } catch (e) {
      console.warn('Failed to save security config', e);
    }
  }, [securityConfig]);

  useEffect(() => {
    localStorage.setItem('cbx_auto_dispatch_enabled', String(autoDispatchEnabled));
  }, [autoDispatchEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('cbx_webhook_delivery_logs', JSON.stringify(deliveryLogs.slice(0, 25)));
    } catch (e) {
      console.warn('Failed to save webhook logs', e);
    }
  }, [deliveryLogs]);

  // Fallback sample market data if no active analysis is loaded
  const sampleEventData = {
    eventTitle: activeAnalysis?.eventTitle || 'Federal Reserve cuts interest rates at next FOMC meeting',
    marketTicker: activeAnalysis?.marketEconomics.marketPriceCents ? 'KXFED-RATE-CUT' : 'KXFED-RATE-CUT',
    category: activeAnalysis?.category || 'Economics',
    marketPriceCents: activeAnalysis?.marketEconomics.marketPriceCents ?? 64,
    calibratedProb: activeAnalysis?.probabilities.calibratedYesPercent ?? 71,
    spreadCents: activeAnalysis?.marketEconomics.spreadCents ?? 2,
    kellyEdge: activeAnalysis?.probabilities.calibratedYesPercent && activeAnalysis?.marketEconomics.marketPriceCents
      ? (activeAnalysis.probabilities.calibratedYesPercent - activeAnalysis.marketEconomics.marketPriceCents)
      : 7,
  };

  // Generate payload according to selected format, mode & event
  const generatePayload = () => {
    const timestamp = new Date().toISOString();
    const eventId = `EVT-${Date.now().toString().slice(-8)}`;
    const yymmdd = `${timestamp.slice(2, 4)}${timestamp.slice(5, 7)}${timestamp.slice(8, 10)}`;
    const hhmm = `${timestamp.slice(11, 13)}${timestamp.slice(14, 16)}`;
    const yyyymmdd = `${timestamp.slice(0, 4)}${timestamp.slice(5, 7)}${timestamp.slice(8, 10)}`;

    // REST JSON FORMAT
    if (format === 'REST_JSON') {
      if (connectorMode === 'standalone_gateway') {
        return {
          connector_version: 'CloudboyX-Connect-Gateway-v2.5',
          mode: 'STANDALONE_ENTERPRISE_GATEWAY',
          transaction_id: eventId,
          timestamp,
          source_system: 'CloudboyX-Universal-Bridge',
          target_system: targetUrl.includes('s4hana') ? 'SAP_S4HANA_ERP' : targetUrl.includes('netsuite') ? 'NETSUITE_ONEWORLD' : 'ENTERPRISE_ERP',
          purchase_order: {
            po_number: standalonePoNumber,
            order_date: timestamp.slice(0, 10),
            currency: 'USD',
            payment_terms: 'NET_30',
            vendor_id: 'VEND-CLOUDBOYX-900',
            line_items: [
              {
                line_no: 1,
                sku: standaloneSku,
                description: 'Enterprise Automated Inventory Lot',
                quantity: standaloneQuantity,
                unit: 'EA',
                unit_price: standaloneUnitPrice,
                total_amount: Math.round(standaloneQuantity * standaloneUnitPrice * 100) / 100,
              },
            ],
            total_order_amount: Math.round(standaloneQuantity * standaloneUnitPrice * 100) / 100,
          },
          telemetry: {
            validation_status: 'ANSI_X12_COMPLIANT',
            signature: `sha256=${eventId}`,
          },
        };
      }

      // Suite Add-on mode payload
      return {
        event_id: eventId,
        event_type: eventType,
        timestamp,
        source: 'CloudboyX-Predict-Engine-v2',
        connector_gateway: 'CloudboyX-Connect-Suite-Bridge',
        target_destination: 'CloudboyX-ERP-Connector',
        market_contract: {
          ticker: sampleEventData.marketTicker,
          title: sampleEventData.eventTitle,
          category: sampleEventData.category,
          current_price_cents: sampleEventData.marketPriceCents,
          implied_odds_percent: sampleEventData.marketPriceCents,
          calibrated_probability_percent: sampleEventData.calibratedProb,
          statistical_edge_points: sampleEventData.kellyEdge,
          spread_cents: sampleEventData.spreadCents,
        },
        erp_action_recommendation: {
          suggested_action: eventType === 'PRICE_ALERT_TRIGGERED' 
            ? 'ADJUST_PURCHASE_ORDER_SAFETY_MARGIN'
            : eventType === 'VOLATILITY_SPIKE'
            ? 'HOLD_PRICE_REVISION_APPROVAL'
            : eventType === 'KELLY_EDGE_DETECTED'
            ? 'ALLOCATE_COMMERCE_HEDGE_RESERVE'
            : 'LOG_PREDICTIVE_SIGNAL',
          confidence: 'HIGH',
          erp_target_module: 'INVENTORY_PURCHASING_AUTOMATION',
          affected_skus: [standaloneSku, 'SKU-CBX-1044', 'SKU-CBX-9981'],
          priority: 'P1_CRITICAL',
        },
      };
    }

    // EDI 846 (Inventory Inquiry / Advice)
    if (format === 'EDI_846') {
      return `ISA*00*          *00*          *ZZ*CLOUDBOYXCON   *ZZ*ENTERPRISEERP  *${yymmdd}*${hhmm}*U*00401*000000101*0*P*>~
GS*IB*CLOUDBOYXCON*ENTERPRISEERP*${yyyymmdd}*${hhmm}*101*X*004010~
ST*846*0001~
BIA*00*SI*${eventId}*${timestamp.slice(0, 10)}~
REF*VR*CLOUDBOYX-CONNECT-GATEWAY~
REF*MK*${connectorMode === 'standalone_gateway' ? standalonePoNumber : sampleEventData.marketTicker}~
LIN*1*VN*${standaloneSku}*MG*INVENTORY_STOCK~
QTY*33*${connectorMode === 'standalone_gateway' ? standaloneQuantity : sampleEventData.marketPriceCents}*EA~
CTP*WS*RES*${connectorMode === 'standalone_gateway' ? standaloneUnitPrice.toFixed(2) : `0.${sampleEventData.calibratedProb}`}~
N1*BY*ENTERPRISE PROCUREMENT HQ~
CTT*1~
SE*11*0001~
GE*1*101~
IEA*1*000000101~`;
    }

    // EDI 850 (Purchase Order)
    if (format === 'EDI_850') {
      return `ISA*00*          *00*          *ZZ*CLOUDBOYXCON   *ZZ*SUPPLIERGLOBAL *${yymmdd}*${hhmm}*U*00401*000000301*0*P*>~
GS*PO*CLOUDBOYXCON*SUPPLIERGLOBAL*${yyyymmdd}*${hhmm}*301*X*004010~
ST*850*0001~
BEG*00*SA*${standalonePoNumber}**${yymmdd}~
CUR*BY*USD~
REF*IA*VENDOR-ACCT-98441~
REF*VR*CLOUDBOYX-CONNECT-PO-GATEWAY~
ITD*01*3*1.0*10*30~
N1*ST*CLOUDBOYX CENTRAL FULFILLMENT~
N3*400 LOGISTICS BOULEVARD~
N4*CHICAGO*IL*60601*US~
PO1*1*${standaloneQuantity}*EA*${standaloneUnitPrice.toFixed(2)}*PE*CB*${standaloneSku}~
PID*F****ENTERPRISE BULK AUTOMATED INVENTORY REPLENISHMENT~
CTT*1~
SE*13*0001~
GE*1*301~
IEA*1*000000301~`;
    }

    // EDI 852 (Product Activity / POS Demand Telemetry)
    if (format === 'EDI_852') {
      return `ISA*00*          *00*          *ZZ*CLOUDBOYXCON   *ZZ*ENTERPRISEERP  *${yymmdd}*${hhmm}*U*00401*000000201*0*P*>~
GS*PD*CLOUDBOYXCON*ENTERPRISEERP*${yyyymmdd}*${hhmm}*201*X*004010~
ST*852*0001~
XQ*H*${timestamp.slice(0, 10)}~
LIN*1*UP*MARKET_PREDICT*VN*${standaloneSku}~
ZA*QS*${connectorMode === 'standalone_gateway' ? standaloneQuantity : sampleEventData.marketPriceCents}*EA*002*${timestamp.slice(0, 10)}~
SD*CBX-RETAIL-CLUSTER-EAST*500*EA~
CTT*1~
SE*8*0001~
GE*1*201~
IEA*1*000000201~`;
    }

    // EDI 856 (Advance Ship Notice / Manifest)
    if (format === 'EDI_856') {
      return `ISA*00*          *00*          *ZZ*CLOUDBOYXCON   *ZZ*CARRIERLOGIST  *${yymmdd}*${hhmm}*U*00401*000000401*0*P*>~
GS*SH*CLOUDBOYXCON*CARRIERLOGIST*${yyyymmdd}*${hhmm}*401*X*004010~
ST*856*0001~
BSN*00*ASN-${Date.now().toString().slice(-6)}*${yymmdd}*${hhmm}*0001~
HL*1**S~
TD1*CTN*25~
TD5*B*2*FEDX*M*GROUND~
REF*BM*BOL-${Date.now().toString().slice(-6)}~
DTM*011*${yymmdd}~
HL*2*1*O~
PRF*${standalonePoNumber}~
HL*3*2*I~
LIN*1*VP*${standaloneSku}~
SN1*1*${standaloneQuantity}*EA~
CTT*1~
SE*15*0001~
GE*1*401~
IEA*1*000000401~`;
    }

    // EDI 810 (Commercial Invoice)
    if (format === 'EDI_810') {
      const totalCost = (standaloneQuantity * standaloneUnitPrice).toFixed(2);
      return `ISA*00*          *00*          *ZZ*CLOUDBOYXCON   *ZZ*ACCOUNTSPAY    *${yymmdd}*${hhmm}*U*00401*000000501*0*P*>~
GS*IN*CLOUDBOYXCON*ACCOUNTSPAY*${yyyymmdd}*${hhmm}*501*X*004010~
ST*810*0001~
BIG*${yymmdd}*INV-${Date.now().toString().slice(-6)}*${yymmdd}*${standalonePoNumber}~
CUR*BY*USD~
N1*BT*ENTERPRISE BUYING GROUP~
ITD*01*3*2.0*10*30~
IT1*1*${standaloneQuantity}*EA*${standaloneUnitPrice.toFixed(2)}**VN*${standaloneSku}~
TDS*${Math.round(parseFloat(totalCost) * 100)}~
CTT*1~
SE*10*0001~
GE*1*501~
IEA*1*000000501~`;
    }

    // cXML Commerce standard
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.050/cXML.dtd">
<cXML payloadID="${eventId}@cloudboyx.connect" timestamp="${timestamp}">
  <Header>
    <From><Credential domain="NetworkID"><Identity>CLOUDBOYX_CONNECT</Identity></Credential></From>
    <To><Credential domain="NetworkID"><Identity>ENTERPRISE_ERP</Identity></Credential></To>
    <Sender><Credential domain="NetworkID"><Identity>CLOUDBOYX_GATEWAY</Identity><SharedSecret>${authHeader}</SharedSecret></Credential><UserAgent>CloudboyX Connect v2.5</UserAgent></Sender>
  </Header>
  <Request deploymentMode="production">
    <OrderRequest>
      <OrderRequestHeader orderID="${standalonePoNumber}" orderDate="${timestamp}" type="new">
        <Total><Money currency="USD">${(standaloneQuantity * standaloneUnitPrice).toFixed(2)}</Money></Total>
        <ShipTo><Address addressID="WH-01"><Name xml:lang="en">CloudboyX Central Distribution</Name></Address></ShipTo>
      </OrderRequestHeader>
      <ItemOut quantity="${standaloneQuantity}" lineNumber="1">
        <ItemID><SupplierPartID>${standaloneSku}</SupplierPartID></ItemID>
        <ItemDetail><UnitPrice><Money currency="USD">${standaloneUnitPrice.toFixed(2)}</Money></UnitPrice><Description xml:lang="en">Enterprise Reorder Inventory Item</Description><UnitOfMeasure>EA</UnitOfMeasure></ItemDetail>
      </ItemOut>
    </OrderRequest>
  </Request>
</cXML>`;
  };

  const currentPayload = generatePayload();
  const payloadString = typeof currentPayload === 'string' ? currentPayload : JSON.stringify(currentPayload, null, 2);

  // Dispatch Webhook to backend
  const handleDispatch = async () => {
    setIsDispatching(true);
    setLastResult(null);

    try {
      const res = await fetch('/api/erp/webhook-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          authHeader: securityConfig.bearerToken || authHeader,
          securityConfig,
          payload: currentPayload,
          eventType,
          format,
          connectorMode,
          isSimulated: isSimulatedReceiver,
        }),
      });

      const data = await res.json();
      setLastResult(data);

      const newRecord: WebhookDeliveryRecord = {
        id: data.deliveryId || `cbx-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        targetUrl,
        eventType,
        format,
        statusCode: data.statusCode || 200,
        statusText: data.statusText || '200 OK',
        latencyMs: data.latencyMs || 42,
        payload: currentPayload,
        responseBody: data.responseBody,
        success: data.success ?? true,
      };

      setDeliveryLogs((prev) => [newRecord, ...prev.slice(0, 24)]);
    } catch (err: any) {
      console.error('Dispatch failed:', err);
      setLastResult({
        success: false,
        statusCode: 500,
        statusText: 'Internal Client Failure',
        deliveryId: `err-${Date.now()}`,
        latencyMs: 0,
        responseBody: { error: err.message },
      });
    } finally {
      setIsDispatching(false);
    }
  };

  // Test dispatch handler for the Webhook Health Dashboard
  const handleTriggerTestDispatch = async (
    customEvent?: EnterpriseWebhookEvent,
    customTargetUrl?: string,
    customFormat?: EnterprisePayloadFormat
  ) => {
    setIsDispatching(true);
    const finalEvent = customEvent || eventType;
    const finalUrl = customTargetUrl || targetUrl;
    const finalFormat = customFormat || format;

    try {
      const res = await fetch('/api/erp/webhook-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: finalUrl,
          authHeader: securityConfig.bearerToken || authHeader,
          securityConfig,
          payload: currentPayload,
          eventType: finalEvent,
          format: finalFormat,
          connectorMode,
          isSimulated: isSimulatedReceiver,
        }),
      });

      const data = await res.json();
      setLastResult(data);

      const newRecord: WebhookDeliveryRecord = {
        id: data.deliveryId || `cbx-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        targetUrl: finalUrl,
        eventType: finalEvent,
        format: finalFormat,
        statusCode: data.statusCode || 200,
        statusText: data.statusText || '200 OK',
        latencyMs: data.latencyMs || 42,
        payload: currentPayload,
        responseBody: data.responseBody,
        success: data.success ?? true,
      };

      setDeliveryLogs((prev) => [newRecord, ...prev.slice(0, 24)]);
    } catch (err: any) {
      console.error('Test dispatch error:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPayload = () => {
    const isEdi = format.startsWith('EDI');
    const isXml = format === 'CXML';
    const ext = isEdi ? 'edi' : isXml ? 'xml' : 'json';
    const mime = isEdi ? 'application/edi-x12' : isXml ? 'application/xml' : 'application/json';
    const blob = new Blob([payloadString], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudboyx_connect_${format.toLowerCase()}_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadLogsCSV = () => {
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

    // Compute latency metrics and SLA audit figures
    const latencies = deliveryLogs.map((l) => l.latencyMs || 0);
    const sortedLatencies = [...latencies].sort((a, b) => a - b);
    const totalEvents = deliveryLogs.length;
    const successCount = deliveryLogs.filter((l) => l.success).length;
    const failureCount = totalEvents - successCount;
    const successRate = totalEvents > 0 ? ((successCount / totalEvents) * 100).toFixed(1) : '0';
    const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;
    const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p95Latency = sortedLatencies[Math.min(p95Index, sortedLatencies.length - 1)] || 0;
    const slaPassCount = deliveryLogs.filter((l) => (l.latencyMs || 0) < 80).length;
    const slaPassRate = totalEvents > 0 ? ((slaPassCount / totalEvents) * 100).toFixed(1) : '0';

    const summarySection = [
      [],
      ['"=== AUDIT & LATENCY METRICS SUMMARY ==="'],
      ['"Metric"', '"Value"'],
      ['"Total Events Audited"', escapeCsv(totalEvents)],
      ['"Successful Transmissions"', escapeCsv(successCount)],
      ['"Failed Transmissions"', escapeCsv(failureCount)],
      ['"Delivery Success Rate"', escapeCsv(`${successRate}%`)],
      ['"Average Ping Latency"', escapeCsv(`${avgLatency} ms`)],
      ['"Minimum Ping Latency"', escapeCsv(`${minLatency} ms`)],
      ['"Maximum Ping Latency"', escapeCsv(`${maxLatency} ms`)],
      ['"P95 Ping Latency"', escapeCsv(`${p95Latency} ms`)],
      ['"SLA Compliance Rate (<80ms)"', escapeCsv(`${slaPassRate}%`)],
      ['"Audit Export Timestamp"', escapeCsv(new Date().toISOString())],
      ['"Auditing Gateway"', escapeCsv('CloudboyX Connect Webhook Studio')],
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
    const dateFormatted = new Date().toISOString().slice(0, 10);
    const timeFormatted = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    a.download = `cloudboyx-webhook-delivery-audit-log-${dateFormatted}-${timeFormatted}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadLogsSuccess(true);
    setTimeout(() => setDownloadLogsSuccess(false), 2500);
  };

  const generateCurlCommand = () => {
    const isEdi = format.startsWith('EDI');
    const isXml = format === 'CXML';
    const contentType = isEdi ? 'application/edi-x12' : isXml ? 'application/xml' : 'application/json';
    const escapedPayload = payloadString.replace(/'/g, "'\\''");

    const headerLines: string[] = [`-H 'Content-Type: ${contentType}'`];

    if (securityConfig.authType === 'bearer' || securityConfig.authType === 'both') {
      if (securityConfig.bearerToken) {
        headerLines.push(`-H 'Authorization: Bearer ${securityConfig.bearerToken}'`);
      }
    }

    if (securityConfig.authType === 'hmac' || securityConfig.authType === 'both') {
      const hmacHdr = securityConfig.hmacHeaderName || 'X-CloudboyX-Signature';
      const pfx = securityConfig.signaturePrefix === 'none' ? '' : securityConfig.signaturePrefix;
      headerLines.push(`-H '${hmacHdr}: ${pfx}<calculated_hmac_${securityConfig.hmacAlgorithm}>'`);
      if (securityConfig.includeTimestamp) {
        headerLines.push(`-H '${securityConfig.timestampHeaderName || 'X-CloudboyX-Timestamp'}: ${new Date().toISOString()}'`);
      }
    }

    headerLines.push(`-H 'X-CloudboyX-Event: ${eventType}'`);
    headerLines.push(`-H 'X-CloudboyX-Gateway-Mode: ${connectorMode}'`);

    return `curl -X POST '${targetUrl}' \\\n  ${headerLines.join(' \\\n  ')} \\\n  -d '${escapedPayload}'`;
  };

  return (
    <div id="enterprise-webhook-studio" className="space-y-6 animate-in fade-in duration-200">
      {/* Studio Header Banner with Brand Lockup & Dual-Mode Badging */}
      <div className="bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#03045e] rounded-3xl p-5 sm:p-7 text-white shadow-md border border-[#0077b6]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00d4ff] text-[#03045e] text-[10px] font-black uppercase tracking-wider shadow-2xs">
                CLOUDBOYX CONNECT &trade;
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[#caf0f8] text-[10px] font-bold uppercase tracking-wider border border-white/20">
                Focal Add-On &bull; Standalone Gateway
              </span>
              <span className="flex items-center space-x-1 text-xs text-[#90e0ef] font-mono">
                <Radio className="w-3.5 h-3.5 text-[#00d4ff] animate-pulse" />
                <span>B2B Telemetry &amp; EDI Engine</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center space-x-2">
              <span>CloudboyX Connect</span>
              <span className="text-[#90e0ef] font-normal text-lg sm:text-2xl">&bull; Webhook &amp; EDI Studio</span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-200 max-w-3xl leading-relaxed">
              Deployable as an <strong className="text-white">integrated add-on module</strong> in the CloudboyX suite 
              or market-ready as a <strong className="text-[#00d4ff]">standalone B2B universal connector</strong> bridging 
              REST APIs, ANSI X12 EDI (850, 846, 852, 856, 810), and legacy ERPs (SAP, NetSuite, Dynamics 365).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Security Credentials Modal Trigger Button */}
            <button
              type="button"
              id="webhook-open-security-credentials-btn"
              onClick={() => setIsSecurityModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer shadow-xs group"
              title="Configure HMAC signatures or Bearer tokens"
            >
              <Shield className="w-4 h-4 text-[#00d4ff] group-hover:scale-110 transition-transform" />
              <span>Security Credentials</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#00d4ff] text-[#03045e]">
                {securityConfig.authType === 'both'
                  ? 'Dual Auth'
                  : securityConfig.authType === 'hmac'
                  ? `HMAC-${securityConfig.hmacAlgorithm.toUpperCase()}`
                  : securityConfig.authType === 'bearer'
                  ? 'Bearer'
                  : 'Open'}
              </span>
            </button>

            {onOpenSuiteSwitcher && (
              <button
                id="webhook-open-suite-switcher-btn"
                onClick={onOpenSuiteSwitcher}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Boxes className="w-4 h-4 text-[#90e0ef]" />
                <span>Suite Matrix</span>
              </button>
            )}

            {/* Quick Notify (Slack & Telegram) */}
            <button
              id="webhook-quick-notify-header-btn"
              type="button"
              onClick={() => setIsQuickNotifyOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-xs font-black transition-all cursor-pointer shadow-md"
              title="Send formatted event update to Slack or Telegram"
            >
              <Zap className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
              <span>Quick Notify</span>
              <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-stone-950/15 text-stone-900">
                Slack &bull; Telegram
              </span>
            </button>

            <button
              id="webhook-trigger-dispatch-header-btn"
              onClick={handleDispatch}
              disabled={isDispatching}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#00d4ff] hover:bg-[#00b4d8] text-[#03045e] text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isDispatching ? 'Transmitting...' : 'Dispatch Signal / EDI'}</span>
            </button>
          </div>
        </div>

        {/* Operational Mode Switcher Bar */}
        <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-200">
            <Cpu className="w-4 h-4 text-[#00d4ff]" />
            <span>OPERATING ARCHITECTURE:</span>
          </div>

          <div className="inline-flex flex-wrap p-1 rounded-xl bg-black/30 border border-white/20 text-xs backdrop-blur-xs gap-1">
            <button
              type="button"
              id="connect-mode-suite-btn"
              onClick={() => setConnectorMode('suite_addon')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                connectorMode === 'suite_addon'
                  ? 'bg-[#00d4ff] text-[#03045e] shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Suite Add-On</span>
              <span className="text-[10px] opacity-80 font-mono">(Signals)</span>
            </button>

            <button
              type="button"
              id="connect-mode-standalone-btn"
              onClick={() => setConnectorMode('standalone_gateway')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                connectorMode === 'standalone_gateway'
                  ? 'bg-[#00d4ff] text-[#03045e] shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Standalone Gateway</span>
              <span className="text-[10px] opacity-80 font-mono">(Universal B2B)</span>
            </button>

            <button
              type="button"
              id="connect-mode-health-btn"
              onClick={() => setConnectorMode('health_dashboard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                connectorMode === 'health_dashboard'
                  ? 'bg-[#00d4ff] text-[#03045e] shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Health Dashboard</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            <button
              type="button"
              id="connect-mode-api-health-btn"
              onClick={() => setConnectorMode('api_health_monitor')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                connectorMode === 'api_health_monitor'
                  ? 'bg-emerald-400 text-stone-950 shadow-xs'
                  : 'text-emerald-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>API Health Monitor</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300">
                Rate Limits
              </span>
            </button>

            <button
              type="button"
              id="connect-mode-connectors-btn"
              onClick={() => setConnectorMode('connectors_creator')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                connectorMode === 'connectors_creator'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'text-amber-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Connectors Creator</span>
              <span className="px-1 py-0.2 rounded text-[9px] font-black uppercase bg-amber-400/30 text-amber-200">
                MAP Module
              </span>
            </button>

            <button
              type="button"
              id="connect-mode-marketing-btn"
              onClick={() => setConnectorMode('marketing_showcase')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                connectorMode === 'marketing_showcase'
                  ? 'bg-[#00d4ff] text-[#03045e] shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Packaging &amp; Specs</span>
            </button>

            <button
              type="button"
              id="connect-mode-backtest-btn"
              onClick={() => setConnectorMode('backtest')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                connectorMode === 'backtest'
                  ? 'bg-[#00d4ff] text-[#03045e] shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <History className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span>Backtest Engine</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-[#00d4ff]/20 text-[#00d4ff]">
                Simulation
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Promoted Rule Notification Banner */}
      {promotedRuleBanner && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-900 font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{promotedRuleBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setPromotedRuleBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 font-normal hover:underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Real-time API Health Monitor Quick Strip */}
      {connectorMode !== 'api_health_monitor' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 text-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-white font-bold text-[11px] tracking-wider uppercase">API Health Sentinel:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
              Kalshi Exchange API: 20 req/s active
            </span>
            <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono text-[10px] border border-stone-700">
              6 External Connectors Operational
            </span>
          </div>

          <button
            type="button"
            id="open-api-health-monitor-strip-btn"
            onClick={() => setConnectorMode('api_health_monitor')}
            className="text-xs font-bold text-[#00d4ff] hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>Open Dedicated API Health Monitor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MODE 3: MARKETING & ARCHITECTURE SHOWCASE VIEW */}
      {connectorMode === 'marketing_showcase' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Packaging Deck Navigation */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-[#0077b6]" />
              <h3 className="text-sm font-bold text-stone-900">
                CloudboyX Connect: Product Architecture &amp; Standalone Commercialization
              </h3>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setMarketingTab('overview')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  marketingTab === 'overview' ? 'bg-[#03045e] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Architecture Matrix
              </button>
              <button
                type="button"
                onClick={() => setMarketingTab('docker')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  marketingTab === 'docker' ? 'bg-[#03045e] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Docker Run
              </button>
              <button
                type="button"
                onClick={() => setMarketingTab('helm')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  marketingTab === 'helm' ? 'bg-[#03045e] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Kubernetes Helm
              </button>
              <button
                type="button"
                onClick={() => setMarketingTab('sdk')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  marketingTab === 'sdk' ? 'bg-[#03045e] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Node/Python SDK
              </button>
              <button
                type="button"
                onClick={() => setMarketingTab('pricing')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  marketingTab === 'pricing' ? 'bg-[#03045e] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Packaging &amp; Pricing
              </button>
            </div>
          </div>

          {/* Tab 1: Architecture Comparison Matrix */}
          {marketingTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: Standalone Connector */}
              <div className="bg-white rounded-3xl border-2 border-[#0077b6] p-6 shadow-sm flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#03045e] text-[#00d4ff] uppercase tracking-wider">
                      STANDALONE PRODUCT
                    </span>
                    <span className="text-xs font-bold text-stone-400 font-mono">Microservice / Container</span>
                  </div>

                  <h3 className="text-xl font-black text-[#03045e] tracking-tight">
                    CloudboyX Connect Standalone
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    A universal enterprise integration gateway and EDI translation engine sold or deployed independently to enterprises who just need high-speed B2B data piping without the forecasting platform.
                  </p>

                  <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0077b6] shrink-0 mt-0.5" />
                      <span><strong>Universal B2B Ingestion</strong>: Translates REST, GraphQL, JSON, and cXML directly to ANSI X12 EDI.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0077b6] shrink-0 mt-0.5" />
                      <span><strong>Zero Dependency</strong>: Runs on your Cloud Run, AWS ECS, Kubernetes, or on-premise datacenter.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0077b6] shrink-0 mt-0.5" />
                      <span><strong>Enterprise Security</strong>: HMAC-SHA256 signature verification, IP whitelist, mutual TLS (mTLS), and audit logging.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0077b6] shrink-0 mt-0.5" />
                      <span><strong>Native Adapters</strong>: Pre-built connectors for SAP S/4HANA, NetSuite, Dynamics 365, Shopify Plus, and Amazon SP-API.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setConnectorMode('standalone_gateway')}
                    className="px-4 py-2 rounded-xl bg-[#03045e] text-white hover:bg-[#0077b6] text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center space-x-1.5"
                  >
                    <span>Test In Standalone Mode</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-stone-500">Self-Hosted or SaaS</span>
                </div>
              </div>

              {/* Option B: CloudboyX Suite Add-On */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider border border-emerald-200">
                      SUITE INTEGRATED ADD-ON
                    </span>
                    <span className="text-xs font-bold text-stone-400 font-mono">Unified Platform</span>
                  </div>

                  <h3 className="text-xl font-black text-stone-900 tracking-tight">
                    CloudboyX Complete Suite Add-On
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Operates as the autonomous nervous system inside the CloudboyX enterprise ecosystem, directly connecting <strong>Predict</strong>, <strong>MAP Protection</strong>, and <strong>ERP</strong> into a self-driving commerce loop.
                  </p>

                  <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Real-Time Signal Routing</strong>: Pushes Kalshi market odds, volatility spikes, and Kelly edges directly into ERP inventory rules.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>MAP Repricer Lock</strong>: Feeds marketplace MAP price violations into ERP repricers to protect margin.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Zero Configuration</strong>: Pre-wired telemetry pipes with automated threshold triggering.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Single Pane of Glass</strong>: Unified audit log, consolidated billing, and shared telemetry keys.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setConnectorMode('suite_addon')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center space-x-1.5"
                  >
                    <span>Use Suite Add-On Mode</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-stone-500">Part of CloudboyX Suite</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Docker Container Quickstart */}
          {marketingTab === 'docker' && (
            <div className="bg-stone-900 rounded-3xl p-6 text-white border border-stone-800 space-y-4 shadow-md font-mono text-xs">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-[#00d4ff]" />
                  <span className="font-bold text-stone-200">Standalone Docker Deployment</span>
                </div>
                <button
                  onClick={() => handleCopy(`docker run -d \\
  --name cloudboyx-connect \\
  -p 8080:8080 \\
  -e CBX_AUTH_SECRET=cbx_sec_live_9948270192a83f \\
  -e TARGET_ERP_URL=https://cloudboyx-erp.ai.studio/api/webhooks/market-signals \\
  -e EDI_STANDARDS_STRICT=true \\
  cloudboyx/connect:latest`, 'docker-cmd')}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  {copiedKey === 'docker-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'docker-cmd' ? 'Copied' : 'Copy Docker Run'}</span>
                </button>
              </div>

              <pre className="text-[#90e0ef] leading-relaxed overflow-x-auto p-3 bg-stone-950/80 rounded-xl border border-stone-800/80">
{`# 1. Pull and launch CloudboyX Connect as a standalone B2B gateway
docker run -d \\
  --name cloudboyx-connect \\
  -p 8080:8080 \\
  -e CBX_AUTH_SECRET=cbx_sec_live_9948270192a83f \\
  -e TARGET_ERP_URL=https://cloudboyx-erp.ai.studio/api/webhooks/market-signals \\
  -e EDI_STANDARDS_STRICT=true \\
  cloudboyx/connect:latest

# 2. Verify health of the local connector gateway
curl http://localhost:8080/health
# {"status":"ok","gateway":"CloudboyX Connect v2.5","specs":["ANSI_X12","REST_JSON","cXML"]}`}
              </pre>
            </div>
          )}

          {/* Tab 3: Kubernetes Helm */}
          {marketingTab === 'helm' && (
            <div className="bg-stone-900 rounded-3xl p-6 text-white border border-stone-800 space-y-4 shadow-md font-mono text-xs">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-[#00d4ff]" />
                  <span className="font-bold text-stone-200">Kubernetes Helm Chart Deployment</span>
                </div>
                <button
                  onClick={() => handleCopy(`helm repo add cloudboyx https://charts.cloudboyx.ai
helm install cbx-connect cloudboyx/connect \\
  --set replicaCount=3 \\
  --set ingress.enabled=true \\
  --set ingress.hosts[0].host=connect.yourdomain.com \\
  --set security.hmacSecret=cbx_sec_live_9948270192a83f`, 'helm-cmd')}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  {copiedKey === 'helm-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'helm-cmd' ? 'Copied' : 'Copy Helm Cmd'}</span>
                </button>
              </div>

              <pre className="text-[#90e0ef] leading-relaxed overflow-x-auto p-3 bg-stone-950/80 rounded-xl border border-stone-800/80">
{`# Add CloudboyX Enterprise Helm Registry
helm repo add cloudboyx https://charts.cloudboyx.ai
helm repo update

# Install highly available CloudboyX Connect Gateway (3 replicas with autoscaling)
helm install cbx-connect cloudboyx/connect \\
  --namespace enterprise-integrations \\
  --create-namespace \\
  --set replicaCount=3 \\
  --set autoscaling.minReplicas=3 \\
  --set autoscaling.maxReplicas=20 \\
  --set ingress.enabled=true \\
  --set ingress.hosts[0].host=connect.enterprise.corp \\
  --set security.hmacSecret=cbx_sec_live_9948270192a83f`}
              </pre>
            </div>
          )}

          {/* Tab 4: SDK Quickstart */}
          {marketingTab === 'sdk' && (
            <div className="bg-stone-900 rounded-3xl p-6 text-white border border-stone-800 space-y-4 shadow-md font-mono text-xs">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-[#00d4ff]" />
                  <span className="font-bold text-stone-200">TypeScript / Node.js &amp; Python Client SDK</span>
                </div>
                <button
                  onClick={() => handleCopy(`npm install @cloudboyx/connect`, 'npm-cmd')}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  {copiedKey === 'npm-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'npm-cmd' ? 'Copied' : 'Copy npm'}</span>
                </button>
              </div>

              <pre className="text-[#90e0ef] leading-relaxed overflow-x-auto p-3 bg-stone-950/80 rounded-xl border border-stone-800/80">
{`// Install: npm install @cloudboyx/connect
import { CloudboyXConnectClient } from '@cloudboyx/connect';

const client = new CloudboyXConnectClient({
  apiKey: process.env.CLOUDBOYX_CONNECT_KEY,
  endpoint: 'https://connect.enterprise.corp/api/v1',
});

// Dispatch an automated EDI 850 Purchase Order or REST webhook
const response = await client.dispatch({
  format: 'EDI_850',
  target: 'SAP_S4HANA',
  payload: {
    poNumber: 'PO-2026-90412',
    sku: 'SKU-CBX-7029-X',
    quantity: 500,
    unitPrice: 45.50,
  }
});
console.log('EDI Transmission ACK:', response.acknowledgment);`}
              </pre>
            </div>
          )}

          {/* Tab 5: Packaging & Commercial Licensing */}
          {marketingTab === 'pricing' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">DEVELOPER COMMUNITY</span>
                <div className="text-2xl font-black text-stone-900">$0 <span className="text-xs font-normal text-stone-500">/ forever</span></div>
                <p className="text-xs text-stone-600">Open-core self-hosted container for developers and small supply chain teams.</p>
                <div className="space-y-1.5 text-xs text-stone-700 border-t border-stone-100 pt-3">
                  <div>&bull; Single-node Docker container</div>
                  <div>&bull; REST JSON &amp; EDI 846/850/852</div>
                  <div>&bull; Community GitHub support</div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#caf0f8]/50 to-white rounded-2xl border-2 border-[#0077b6] p-5 space-y-4 shadow-xs ring-2 ring-[#0077b6]/20">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0077b6]">ENTERPRISE STANDALONE</span>
                <div className="text-2xl font-black text-[#03045e]">$499 <span className="text-xs font-normal text-stone-500">/ mo</span></div>
                <p className="text-xs text-stone-600">Dedicated high-availability connector gateway with native ERP adapters.</p>
                <div className="space-y-1.5 text-xs text-stone-700 border-t border-stone-200/80 pt-3">
                  <div>&bull; Unlimited webhook throughput</div>
                  <div>&bull; SAP, NetSuite &amp; Dynamics 365</div>
                  <div>&bull; Automated EDI 997 functional ACKs</div>
                  <div>&bull; SOC 2 Type II compliance</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">CLOUDBOYX SUITE BUNDLE</span>
                <div className="text-2xl font-black text-emerald-700">INCLUDED <span className="text-xs font-normal text-stone-500">in Suite</span></div>
                <p className="text-xs text-stone-600">Fully integrated with CloudboyX Predict &amp; MAP Protection out of the box.</p>
                <div className="space-y-1.5 text-xs text-stone-700 border-t border-stone-100 pt-3">
                  <div>&bull; Auto-wired to prediction signals</div>
                  <div>&bull; Price alert auto-dispatch</div>
                  <div>&bull; MAP repricer violation sync</div>
                  <div>&bull; Zero-config deployment</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: WEBHOOK HEALTH & TELEMETRY DASHBOARD */}
      {connectorMode === 'health_dashboard' && (
        <WebhookHealthDashboard
          deliveryLogs={deliveryLogs}
          onClearLogs={() => setDeliveryLogs([])}
          onTriggerTestDispatch={handleTriggerTestDispatch}
          isDispatching={isDispatching}
          onOpenConnectorsCreator={() => setConnectorMode('connectors_creator')}
          onOpenStudio={() => setConnectorMode('suite_addon')}
        />
      )}

      {/* MODE 4: CONNECTORS CREATOR (MAP PROTECTION & MARKETPLACES) */}
      {connectorMode === 'connectors_creator' && (
        <ConnectorsCreator
          onSelectConnectorAsTarget={(url, fmt) => {
            setTargetUrl(url);
            if (fmt) setFormat(fmt);
          }}
          onOpenStudio={() => setConnectorMode('suite_addon')}
          onOpenHealthDashboard={() => setConnectorMode('health_dashboard')}
        />
      )}

      {/* MODE 5: BACKTEST & HISTORICAL PRICE SHOCK SIMULATION */}
      {connectorMode === 'backtest' && (
        <WebhookBacktestModule
          securityConfig={securityConfig}
          targetUrl={targetUrl}
          onPromoteRules={handlePromoteBacktestedRules}
          onOpenStudio={() => setConnectorMode('suite_addon')}
          onOpenHealthDashboard={() => setConnectorMode('health_dashboard')}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        />
      )}

      {/* MODE 6: DEDICATED API HEALTH & RATE LIMIT MONITOR */}
      {connectorMode === 'api_health_monitor' && (
        <ApiHealthMonitor
          onSelectConnectorForWebhook={(url, name) => {
            setTargetUrl(url);
            setConnectorMode('suite_addon');
            setPromotedRuleBanner(`Selected ${name} (${url}) as active inbound receiver!`);
            setTimeout(() => setPromotedRuleBanner(null), 5000);
          }}
          onOpenBacktest={() => setConnectorMode('backtest')}
        />
      )}

      {/* MODES 1 & 2: Main Two-Column Configuration & Payload Area (Suite Add-On & Standalone modes) */}
      {(connectorMode === 'suite_addon' || connectorMode === 'standalone_gateway') && (
        <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Endpoint, Triggers & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Target Endpoint Configuration Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Webhook className="w-4 h-4 text-[#0077b6]" />
                  <h3 className="text-sm font-bold text-stone-900">
                    {connectorMode === 'standalone_gateway' ? 'Enterprise Destination' : 'Target Inbound Receiver'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">HTTP POST &bull; mTLS</span>
              </div>

              {/* Quick Destination Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Target Ecosystem Preset</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetUrl(DEFAULT_ERP_URL)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      targetUrl === DEFAULT_ERP_URL
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs">
                      <Boxes className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-bold">CloudboyX ERP</span>
                    </div>
                    <div className="text-[10px] text-stone-500 truncate mt-0.5">Native Universal Hub</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetUrl(DEFAULT_MAP_URL)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      targetUrl === DEFAULT_MAP_URL
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate font-bold">MAP Sentinel</span>
                    </div>
                    <div className="text-[10px] text-stone-500 truncate mt-0.5">Price Crawler Feed</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetUrl(DEFAULT_SAP_URL)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      targetUrl === DEFAULT_SAP_URL
                        ? 'border-[#0077b6] bg-[#caf0f8]/50 text-[#03045e] font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs">
                      <Server className="w-3.5 h-3.5 text-[#0077b6] shrink-0" />
                      <span className="truncate font-bold">SAP S/4HANA</span>
                    </div>
                    <div className="text-[10px] text-stone-500 truncate mt-0.5">OData / IDoc Bridge</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetUrl(DEFAULT_NETSUITE_URL)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      targetUrl === DEFAULT_NETSUITE_URL
                        ? 'border-[#03045e] bg-stone-100 text-[#03045e] font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs">
                      <Layers className="w-3.5 h-3.5 text-[#03045e] shrink-0" />
                      <span className="truncate font-bold">Oracle NetSuite</span>
                    </div>
                    <div className="text-[10px] text-stone-500 truncate mt-0.5">SuiteTalk REST API</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConnectorMode('connectors_creator')}
                    className="col-span-2 p-2.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-950 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>+ Marketplace &amp; MAP Connectors Creator</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Endpoint URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Webhook / EDI Destination URL</label>
                <input
                  id="webhook-target-url-input"
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://your-erp.com/api/webhooks/market-signals"
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0077b6] bg-stone-50/50"
                />
              </div>

              {/* Security Credentials & External Authentication Panel */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-gradient-to-br from-stone-50 to-[#caf0f8]/20 border border-stone-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-[#0077b6]" />
                    <label className="text-xs font-bold text-stone-800">Security Credentials &amp; Auth</label>
                  </div>
                  <button
                    type="button"
                    id="open-security-modal-from-card-btn"
                    onClick={() => setIsSecurityModalOpen(true)}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#0077b6] hover:text-[#03045e] hover:underline cursor-pointer"
                  >
                    <span>Configure HMAC / Bearer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Active Protocol Pill & Info */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      securityConfig.authType === 'both'
                        ? 'bg-[#03045e] text-white'
                        : securityConfig.authType === 'hmac'
                        ? 'bg-[#0077b6] text-white'
                        : securityConfig.authType === 'bearer'
                        ? 'bg-[#caf0f8] text-[#03045e]'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {securityConfig.authType === 'both'
                      ? 'Dual Auth (Bearer + HMAC)'
                      : securityConfig.authType === 'hmac'
                      ? `HMAC-${securityConfig.hmacAlgorithm.toUpperCase()} Signature`
                      : securityConfig.authType === 'bearer'
                      ? 'Bearer Token (OAuth 2.0)'
                      : 'None (Testing)'}
                  </span>

                  {(securityConfig.authType === 'hmac' || securityConfig.authType === 'both') && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white border border-stone-200 text-stone-600">
                      Header: {securityConfig.hmacHeaderName || 'X-CloudboyX-Signature'}
                    </span>
                  )}

                  {securityConfig.includeTimestamp && (securityConfig.authType === 'hmac' || securityConfig.authType === 'both') && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700">
                      Replay Defense Active
                    </span>
                  )}
                </div>

                {/* Authorization Secret / Token Input Display */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-600">
                    <span>
                      {securityConfig.authType === 'hmac'
                        ? 'HMAC Shared Secret'
                        : securityConfig.authType === 'both'
                        ? 'Bearer Token / HMAC Secret'
                        : 'Bearer Token'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSecurityModalOpen(true)}
                      className="text-[10px] text-stone-400 hover:text-[#0077b6] font-mono cursor-pointer"
                    >
                      [Manage in Security Modal]
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="webhook-auth-header-input"
                      type="text"
                      value={authHeader}
                      onChange={(e) => {
                        setAuthHeader(e.target.value);
                        setSecurityConfig((prev) => ({
                          ...prev,
                          bearerToken:
                            prev.authType === 'bearer' || prev.authType === 'both' ? e.target.value : prev.bearerToken,
                          hmacSecret: prev.authType === 'hmac' ? e.target.value : prev.hmacSecret,
                        }));
                      }}
                      placeholder="cbx_sec_live_..."
                      className="w-full px-3 py-2 rounded-xl text-xs font-mono border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0077b6] bg-white shadow-2xs"
                    />
                  </div>
                </div>

                {/* Primary Button to trigger modal */}
                <button
                  type="button"
                  id="open-security-credentials-modal-btn"
                  onClick={() => setIsSecurityModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl border border-[#0077b6]/30 bg-white hover:bg-[#caf0f8]/40 text-[#03045e] hover:text-[#0077b6] text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>Configure Security Credentials (HMAC &amp; Bearer)</span>
                </button>
              </div>

              {/* Simulation Mode Toggle */}
              <div className="pt-2 border-t border-stone-100 space-y-3">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-800">Simulate Receiver Acknowledgment</div>
                    <div className="text-[11px] text-stone-500">Instant EDI 997 functional ACK, latency &amp; signature</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSimulatedReceiver}
                    onChange={(e) => setIsSimulatedReceiver(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0077b6] focus:ring-[#0077b6] cursor-pointer"
                  />
                </label>

                {connectorMode === 'suite_addon' && (
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                        <span>Auto-Dispatch On Price Alert</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#caf0f8] text-[#03045e]">AUTOMATED</span>
                      </div>
                      <div className="text-[11px] text-stone-500">Auto-transmit whenever active contract hits alert target</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoDispatchEnabled}
                      onChange={(e) => setAutoDispatchEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0077b6] focus:ring-[#0077b6] cursor-pointer"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Standalone Parameters or Suite Trigger Configuration Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
                <Filter className="w-4 h-4 text-[#0077b6]" />
                <h3 className="text-sm font-bold text-stone-900">
                  {connectorMode === 'standalone_gateway' ? 'B2B Transaction Parameters' : 'Market Signal Trigger & Schema'}
                </h3>
              </div>

              {/* In Standalone Mode: PO, SKU & Quantity Controls */}
              {connectorMode === 'standalone_gateway' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600">PO Number (BEG03)</label>
                      <input
                        type="text"
                        value={standalonePoNumber}
                        onChange={(e) => setStandalonePoNumber(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border border-stone-200 bg-stone-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600">SKU / Item (LIN03)</label>
                      <input
                        type="text"
                        value={standaloneSku}
                        onChange={(e) => setStandaloneSku(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border border-stone-200 bg-stone-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600">Quantity (QTY02)</label>
                      <input
                        type="number"
                        value={standaloneQuantity}
                        onChange={(e) => setStandaloneQuantity(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border border-stone-200 bg-stone-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600">Unit Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={standaloneUnitPrice}
                        onChange={(e) => setStandaloneUnitPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border border-stone-200 bg-stone-50"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* In Suite Mode: Event Trigger Selector */
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Market Trigger Type</label>
                  <select
                    id="webhook-event-type-select"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EnterpriseWebhookEvent)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  >
                    <option value="PRICE_ALERT_TRIGGERED">PRICE_ALERT_TRIGGERED (Contract crossed threshold)</option>
                    <option value="VOLATILITY_SPIKE">VOLATILITY_SPIKE (Rapid price velocity or spread expansion)</option>
                    <option value="KELLY_EDGE_DETECTED">KELLY_EDGE_DETECTED (Statistically mispriced &gt; 10%)</option>
                    <option value="SENTIMENT_SHIFT">SENTIMENT_SHIFT (7-day sentiment/news divergence)</option>
                    <option value="PURCHASE_ORDER_GENERATED">PURCHASE_ORDER_GENERATED (Autonomous reorder)</option>
                    <option value="INVENTORY_REORDER_SYNC">INVENTORY_REORDER_SYNC (Warehouse safety buffer)</option>
                    <option value="MANUAL_DISPATCH">MANUAL_DISPATCH (Diagnostic heartbeat signal)</option>
                  </select>

                  {/* Price Alert Threshold Slider */}
                  {eventType === 'PRICE_ALERT_TRIGGERED' && (
                    <div className="p-3 rounded-xl bg-[#caf0f8]/30 border border-[#0077b6]/20 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#03045e]">Trigger Price Threshold</span>
                        <span className="font-mono font-black text-[#0077b6]">{triggerPriceThreshold}¢</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={95}
                        step={1}
                        value={triggerPriceThreshold}
                        onChange={(e) => setTriggerPriceThreshold(Number(e.target.value))}
                        className="w-full accent-[#0077b6] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                        <span>5¢ Min</span>
                        <span className="text-[#0077b6]">Auto-tested in Backtest Engine</span>
                        <span>95¢ Max</span>
                      </div>
                    </div>
                  )}

                  {/* Link to Backtest Engine */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-stone-500">Need to stress-test this rule?</span>
                    <button
                      type="button"
                      id="open-backtest-from-trigger-btn"
                      onClick={() => setConnectorMode('backtest')}
                      className="text-[11px] font-bold text-[#0077b6] hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <History className="w-3 h-3 text-[#0077b6]" />
                      <span>Simulate in Backtest Engine</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Payload Architecture & EDI Format Selector */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700">Transmission Standard</label>
                  <button
                    type="button"
                    onClick={() => setShowSegmentInspector(!showSegmentInspector)}
                    className="text-[10.5px] font-bold text-[#0077b6] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <Info className="w-3 h-3" />
                    <span>{showSegmentInspector ? 'Hide Segment Guide' : 'Inspect EDI Segments'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormat('REST_JSON')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      format === 'REST_JSON' ? 'bg-[#03045e] text-white shadow-xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    REST JSON
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('EDI_850')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      format === 'EDI_850' ? 'bg-[#03045e] text-white shadow-xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                    title="EDI 850: Purchase Order (ANSI X12)"
                  >
                    EDI 850 (PO)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('EDI_846')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      format === 'EDI_846' ? 'bg-[#03045e] text-white shadow-xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                    title="EDI 846: Inventory Inquiry / Advice (ANSI X12)"
                  >
                    EDI 846 (Inv)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('EDI_852')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      format === 'EDI_852' ? 'bg-[#03045e] text-white shadow-xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                    title="EDI 852: Product Activity Data / POS Telemetry"
                  >
                    EDI 852 (POS)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('EDI_856')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      format === 'EDI_856' ? 'bg-[#03045e] text-white shadow-xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                    title="EDI 856: Ship Notice / Manifest (ASN)"
                  >
                    EDI 856 (ASN)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('EDI_810')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      format === 'EDI_810' ? 'bg-[#03045e] text-white shadow-xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                    title="EDI 810: Commercial Invoice"
                  >
                    EDI 810 (Inv)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Payload Viewer, EDI Segment Decoder & Execution (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Payload Inspector & Code Block */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 text-stone-200 shadow-md overflow-hidden flex flex-col">
              {/* Terminal / Code Window Header */}
              <div className="px-4 py-3 bg-stone-950/80 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-[#00d4ff]" />
                  <span className="font-mono text-xs font-bold text-stone-300">
                    {format === 'REST_JSON'
                      ? 'cloudboyx_connect_payload.json'
                      : `${format.toLowerCase()}_ansi_x12_stream.edi`}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-stone-800 text-[#00d4ff] border border-stone-700">
                    {format}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-stone-800 text-stone-400">
                    {payloadString.length} bytes
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={handleDownloadPayload}
                    className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-mono flex items-center space-x-1 transition-colors cursor-pointer"
                    title="Download file directly"
                  >
                    <Download className="w-3 h-3" />
                    <span className="hidden sm:inline">Export</span>
                  </button>

                  <button
                    onClick={() => handleCopy(payloadString, 'payload')}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-mono flex items-center space-x-1 transition-colors cursor-pointer"
                    title="Copy payload to clipboard"
                  >
                    {copiedKey === 'payload' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopy(generateCurlCommand(), 'curl')}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-mono flex items-center space-x-1 transition-colors cursor-pointer"
                    title="Copy cURL command"
                  >
                    {copiedKey === 'curl' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>cURL Copied</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="w-3 h-3" />
                        <span>cURL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Block Content */}
              <div className="p-4 overflow-x-auto max-h-[340px] font-mono text-xs text-[#90e0ef] leading-relaxed bg-stone-900/90 selection:bg-[#0077b6] selection:text-white">
                <pre>{payloadString}</pre>
              </div>

              {/* Bottom Action Footer */}
              <div className="px-4 py-3 bg-stone-950/60 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-xs text-stone-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Target:</span>
                  <span className="font-mono text-stone-300 truncate max-w-[200px]">{targetUrl}</span>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    id="webhook-quick-notify-footer-btn"
                    type="button"
                    onClick={() => setIsQuickNotifyOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                    title="Send formatted event update to Slack or Telegram"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Quick Notify (Slack / Telegram)</span>
                  </button>

                  <button
                    id="webhook-dispatch-action-btn"
                    onClick={handleDispatch}
                    disabled={isDispatching}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0077b6] text-stone-950 hover:text-white text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                  {isDispatching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                      <span>Transmitting via Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmit to Target Endpoint</span>
                    </>
                  )}
                </button>
                </div>
              </div>

              {/* Compact Telemetry Sparkline & Success Rate Preview */}
              <div className="pt-2">
                <WebhookTelemetrySparkline logs={deliveryLogs} compact={true} />
              </div>
            </div>

            {/* EDI Segment Inspector Guide (Expandable) */}
            {showSegmentInspector && format.startsWith('EDI') && (
              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-3 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between font-bold text-[#03045e]">
                  <span className="flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-[#0077b6]" />
                    <span>ANSI X12 Segment Decoder ({format})</span>
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">Version 004010 Standard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <strong className="text-[#0077b6]">ISA / IEA:</strong> Interchange Control Envelope (Trading partner identifiers, control number, delimiters).
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <strong className="text-[#0077b6]">GS / GE:</strong> Functional Group Envelope (Groups transactions by type e.g. PO, IB, PD).
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <strong className="text-[#0077b6]">ST / SE:</strong> Transaction Set Header/Trailer (Defines transaction boundary and segment count).
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <strong className="text-[#0077b6]">BEG / BIA / BIG:</strong> Beginning Segment (Carries document number, transaction date, and purpose).
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <strong className="text-[#0077b6]">LIN / PO1:</strong> Line Item Identification (SKU, vendor part number, line index).
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <strong className="text-[#0077b6]">QTY / CTP:</strong> Quantities &amp; Pricing (Lot sizes, contract cents, discount margins).
                  </div>
                </div>
              </div>
            )}

            {/* Last Response Inspector Banner */}
            {lastResult && (
              <div
                id="webhook-last-response-card"
                className={`rounded-2xl p-4 border transition-all animate-in fade-in duration-200 ${
                  lastResult.success
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/70 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {lastResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="font-bold text-sm">
                      {lastResult.statusCode} {lastResult.statusText}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white border border-stone-200 text-stone-700">
                      {lastResult.latencyMs}ms latency
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-stone-500">ID: {lastResult.deliveryId}</span>
                </div>

                <div className="bg-white/80 rounded-xl p-3 border border-emerald-200/60 font-mono text-xs overflow-x-auto max-h-[160px]">
                  <pre>{JSON.stringify(lastResult.responseBody, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Banner linking to Webhook Health Dashboard */}
        <div className="bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-xs">
              <Activity className="w-5 h-5 text-[#00d4ff] animate-pulse" />
            </div>
            <div>
              <div className="font-black text-xs sm:text-sm tracking-tight flex items-center space-x-2">
                <span>Webhook Health &amp; Telemetry Station</span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-400 text-stone-950">LIVE SLA</span>
              </div>
              <div className="text-[11px] text-stone-200 mt-0.5">
                Monitor active event triggers, inspect Recharts latency trends, and analyze delivery logs.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConnectorMode('health_dashboard')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#03045e] text-xs font-black transition-all cursor-pointer shadow-xs shrink-0 flex items-center space-x-1.5"
          >
            <span>Open Health Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Progress Bar & Latency Sparkline Telemetry for Last 10 Webhook Events */}
        <WebhookTelemetrySparkline logs={deliveryLogs} onDownloadLogs={handleDownloadLogsCSV} />

        {/* Delivery Logs & Audit Trail Table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#0077b6]" />
              <h3 className="text-sm font-bold text-stone-900">
                CloudboyX Connect Telemetry Transmissions &amp; Audit Log
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-100 text-stone-600">
                {deliveryLogs.length} Records
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                id="download-webhook-logs-btn"
                onClick={handleDownloadLogsCSV}
                disabled={deliveryLogs.length === 0}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  deliveryLogs.length > 0
                    ? downloadLogsSuccess
                      ? 'bg-emerald-600 text-white border border-emerald-600'
                      : 'bg-[#caf0f8] hover:bg-[#90e0ef] text-[#03045e] border border-[#90e0ef]'
                    : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                }`}
                title="Export recent delivery logs and latency metrics as a CSV file for auditing"
              >
                {downloadLogsSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Logs Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-[#0077b6]" />
                    <span>Download Logs (CSV)</span>
                  </>
                )}
              </button>

              {deliveryLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDeliveryLogs([])}
                  className="text-xs text-stone-400 hover:text-rose-600 font-semibold transition-colors cursor-pointer px-2 py-1"
                >
                  Clear Log
                </button>
              )}
            </div>
          </div>

          {deliveryLogs.length === 0 ? (
            <div className="py-8 text-center text-stone-400 space-y-1 text-xs">
              <Webhook className="w-8 h-8 mx-auto text-stone-300" />
              <p className="font-semibold text-stone-600">No Webhook or EDI Transmissions Yet</p>
              <p>Click "Transmit to Target Endpoint" above to dispatch a live or simulated signal.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Event / Type</th>
                    <th className="py-2.5 px-3">Standard</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Target Endpoint</th>
                    <th className="py-2.5 px-3 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {deliveryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-stone-600">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-bold text-[#03045e]">{log.eventType}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
                          {log.format}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.success
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${log.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{log.statusCode}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 truncate max-w-[220px]" title={log.targetUrl}>
                        {log.targetUrl}
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-500">{log.latencyMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Security & Authentication Credentials Modal */}
      <SecurityCredentialsModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        config={securityConfig}
        onSave={(newCfg) => setSecurityConfig(newCfg)}
        samplePayload={payloadString}
      />

      {/* Quick Notify (Slack & Telegram) Modal */}
      <QuickNotifyModal
        isOpen={isQuickNotifyOpen}
        onClose={() => setIsQuickNotifyOpen(false)}
        analysis={activeAnalysis}
        onNotificationSent={(record) => {
          setDeliveryLogs((prev) => [record, ...prev]);
          setLastResult({
            success: record.success,
            statusCode: record.statusCode,
            statusText: record.success ? '200 OK (Notification Delivered)' : 'Failed',
            deliveryId: record.id,
            latencyMs: record.latencyMs,
            responseBody: {
              status: 'DELIVERED',
              target: record.targetUrl,
              format: record.format,
              timestamp: record.timestamp,
            },
          });
        }}
      />
    </div>
  );
};
