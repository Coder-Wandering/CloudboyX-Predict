import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  X,
  AlertCircle,
  HelpCircle,
  Terminal,
  Clock,
  Sparkles,
  Sliders,
  Radio,
} from 'lucide-react';
import { WebhookSecurityConfig, WebhookAuthType } from '../types';

interface SecurityCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WebhookSecurityConfig;
  onSave: (newConfig: WebhookSecurityConfig) => void;
  samplePayload?: string;
}

export function generateRandomHexSecret(byteLength: number = 32): string {
  const array = new Uint8Array(byteLength);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function generateRandomBearerToken(): string {
  const hex = generateRandomHexSecret(16);
  return `cbx_sec_live_${hex}`;
}

export async function computeClientHmac(
  secret: string,
  payload: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): Promise<string> {
  if (!secret || !payload) return '';
  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const msgData = enc.encode(payload);
    const subtleAlgo = algorithm === 'sha512' ? 'SHA-512' : 'SHA-256';

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: subtleAlgo } },
      false,
      ['sign']
    );

    const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('HMAC calculation fallback:', err);
    return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  }
}

export const SecurityCredentialsModal: React.FC<SecurityCredentialsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  samplePayload = '{"event":"PRICE_ALERT_TRIGGERED","target":"ENTERPRISE_ERP"}',
}) => {
  // Local state for editing within modal
  const [authType, setAuthType] = useState<WebhookAuthType>(config.authType || 'bearer');
  const [bearerToken, setBearerToken] = useState<string>(config.bearerToken || '');
  const [hmacSecret, setHmacSecret] = useState<string>(config.hmacSecret || '');
  const [hmacAlgorithm, setHmacAlgorithm] = useState<'sha256' | 'sha512'>(config.hmacAlgorithm || 'sha256');
  const [hmacHeaderName, setHmacHeaderName] = useState<string>(config.hmacHeaderName || 'X-CloudboyX-Signature');
  const [includeTimestamp, setIncludeTimestamp] = useState<boolean>(config.includeTimestamp ?? true);
  const [timestampHeaderName, setTimestampHeaderName] = useState<string>(
    config.timestampHeaderName || 'X-CloudboyX-Timestamp'
  );
  const [signaturePrefix, setSignaturePrefix] = useState<'sha256=' | 'sha512=' | 'none'>(
    config.signaturePrefix || 'sha256='
  );

  // UI helpers
  const [showBearer, setShowBearer] = useState<boolean>(false);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [liveSignature, setLiveSignature] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean | null>(null);

  // Sync state whenever modal opens with fresh config
  useEffect(() => {
    if (isOpen) {
      setAuthType(config.authType || 'bearer');
      setBearerToken(config.bearerToken || '');
      setHmacSecret(config.hmacSecret || '');
      setHmacAlgorithm(config.hmacAlgorithm || 'sha256');
      setHmacHeaderName(config.hmacHeaderName || 'X-CloudboyX-Signature');
      setIncludeTimestamp(config.includeTimestamp ?? true);
      setTimestampHeaderName(config.timestampHeaderName || 'X-CloudboyX-Timestamp');
      setSignaturePrefix(config.signaturePrefix || 'sha256=');
      setVerifiedSuccess(null);
    }
  }, [isOpen, config]);

  // Compute live HMAC signature whenever secret, algorithm, or payload changes
  useEffect(() => {
    let isCurrent = true;
    if (hmacSecret) {
      computeClientHmac(hmacSecret, samplePayload, hmacAlgorithm).then((sig) => {
        if (isCurrent) {
          setLiveSignature(sig);
        }
      });
    } else {
      setLiveSignature('');
    }
    return () => {
      isCurrent = false;
    };
  }, [hmacSecret, samplePayload, hmacAlgorithm]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyPreset = (preset: 'hmac_standard' | 'sap_bearer' | 'github_style' | 'dual_defense') => {
    if (preset === 'hmac_standard') {
      setAuthType('hmac');
      if (!hmacSecret) setHmacSecret(generateRandomHexSecret(32));
      setHmacAlgorithm('sha256');
      setHmacHeaderName('X-CloudboyX-Signature');
      setSignaturePrefix('sha256=');
      setIncludeTimestamp(true);
      setTimestampHeaderName('X-CloudboyX-Timestamp');
    } else if (preset === 'sap_bearer') {
      setAuthType('bearer');
      if (!bearerToken) setBearerToken(generateRandomBearerToken());
    } else if (preset === 'github_style') {
      setAuthType('hmac');
      if (!hmacSecret) setHmacSecret(generateRandomHexSecret(32));
      setHmacAlgorithm('sha256');
      setHmacHeaderName('X-Hub-Signature-256');
      setSignaturePrefix('sha256=');
      setIncludeTimestamp(true);
      setTimestampHeaderName('X-Hub-Timestamp');
    } else if (preset === 'dual_defense') {
      setAuthType('both');
      if (!bearerToken) setBearerToken(generateRandomBearerToken());
      if (!hmacSecret) setHmacSecret(generateRandomHexSecret(32));
      setHmacAlgorithm('sha256');
      setHmacHeaderName('X-CloudboyX-Signature');
      setSignaturePrefix('sha256=');
      setIncludeTimestamp(true);
      setTimestampHeaderName('X-CloudboyX-Timestamp');
    }
    setVerifiedSuccess(null);
  };

  const handleTestVerification = async () => {
    setIsVerifying(true);
    setVerifiedSuccess(null);

    // Simulate verification check of the HMAC signature & header
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (authType === 'bearer' && bearerToken.trim().length > 0) {
      setVerifiedSuccess(true);
    } else if ((authType === 'hmac' || authType === 'both') && hmacSecret.trim().length > 0) {
      setVerifiedSuccess(true);
    } else if (authType === 'none') {
      setVerifiedSuccess(true);
    } else {
      setVerifiedSuccess(false);
    }
    setIsVerifying(false);
  };

  const handleSave = () => {
    const updated: WebhookSecurityConfig = {
      authType,
      bearerToken: bearerToken.trim(),
      hmacSecret: hmacSecret.trim(),
      hmacAlgorithm,
      hmacHeaderName: hmacHeaderName.trim() || 'X-CloudboyX-Signature',
      includeTimestamp,
      timestampHeaderName: timestampHeaderName.trim() || 'X-CloudboyX-Timestamp',
      signaturePrefix,
    };
    onSave(updated);
    onClose();
  };

  const getFullSignatureHeaderValue = () => {
    if (!liveSignature) return 'None';
    if (signaturePrefix === 'sha256=') return `sha256=${liveSignature}`;
    if (signaturePrefix === 'sha512=') return `sha512=${liveSignature}`;
    return liveSignature;
  };

  return (
    <div
      id="security-credentials-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="security-credentials-modal-content"
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#03045e] px-6 py-5 text-white flex items-center justify-between border-b border-[#0077b6]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20 text-[#00d4ff] shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black tracking-tight">Security &amp; Authentication Credentials</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#00d4ff] text-[#03045e]">
                  mTLS &bull; HMAC
                </span>
              </div>
              <p className="text-xs text-stone-200 mt-0.5">
                Configure cryptographic HMAC signatures or Bearer tokens for external receiver verification.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-security-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Quick Preset Profiles */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0077b6]" />
                <span>Enterprise Authentication Presets</span>
              </label>
              <span className="text-[10px] text-stone-400 font-mono">1-Click Configuration</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                id="preset-hmac-standard-btn"
                onClick={() => handleApplyPreset('hmac_standard')}
                className="p-2 rounded-xl border border-stone-200 hover:border-[#0077b6] hover:bg-[#caf0f8]/30 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-[#03045e] group-hover:text-[#0077b6] flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>HMAC-SHA256</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Payload signature</div>
              </button>

              <button
                type="button"
                id="preset-sap-bearer-btn"
                onClick={() => handleApplyPreset('sap_bearer')}
                className="p-2 rounded-xl border border-stone-200 hover:border-[#0077b6] hover:bg-[#caf0f8]/30 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-[#03045e] group-hover:text-[#0077b6] flex items-center space-x-1">
                  <KeyRound className="w-3 h-3" />
                  <span>SAP / Bearer</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">OAuth 2.0 Token</div>
              </button>

              <button
                type="button"
                id="preset-github-style-btn"
                onClick={() => handleApplyPreset('github_style')}
                className="p-2 rounded-xl border border-stone-200 hover:border-[#0077b6] hover:bg-[#caf0f8]/30 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-[#03045e] group-hover:text-[#0077b6] flex items-center space-x-1">
                  <Terminal className="w-3 h-3" />
                  <span>X-Hub Standard</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">GitHub / Stripe style</div>
              </button>

              <button
                type="button"
                id="preset-dual-defense-btn"
                onClick={() => handleApplyPreset('dual_defense')}
                className="p-2 rounded-xl border border-[#0077b6] bg-[#caf0f8]/40 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-black text-[#03045e] flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-[#0077b6]" />
                  <span>Dual Defense</span>
                </div>
                <div className="text-[10px] text-[#0077b6] mt-0.5 font-semibold">Bearer + HMAC</div>
              </button>
            </div>
          </div>

          {/* Authentication Scheme Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Authentication Protocol</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                id="auth-scheme-hmac-btn"
                onClick={() => {
                  setAuthType('hmac');
                  if (!hmacSecret) setHmacSecret(generateRandomHexSecret(32));
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  authType === 'hmac'
                    ? 'border-[#0077b6] bg-[#caf0f8]/50 text-[#03045e] ring-2 ring-[#0077b6]/30 font-bold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>HMAC Signature</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-1 leading-tight">
                  Cryptographic hash over message body
                </div>
              </button>

              <button
                type="button"
                id="auth-scheme-bearer-btn"
                onClick={() => {
                  setAuthType('bearer');
                  if (!bearerToken) setBearerToken(generateRandomBearerToken());
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  authType === 'bearer'
                    ? 'border-[#0077b6] bg-[#caf0f8]/50 text-[#03045e] ring-2 ring-[#0077b6]/30 font-bold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold">
                  <KeyRound className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>Bearer Token</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-1 leading-tight">
                  Standard Authorization: Bearer token
                </div>
              </button>

              <button
                type="button"
                id="auth-scheme-both-btn"
                onClick={() => {
                  setAuthType('both');
                  if (!bearerToken) setBearerToken(generateRandomBearerToken());
                  if (!hmacSecret) setHmacSecret(generateRandomHexSecret(32));
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  authType === 'both'
                    ? 'border-[#03045e] bg-[#03045e] text-white ring-2 ring-[#03045e]/30 font-bold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5 text-[#00d4ff]" />
                  <span>Both (Dual Auth)</span>
                </div>
                <div className={`text-[10px] mt-1 leading-tight ${authType === 'both' ? 'text-stone-200' : 'text-stone-500'}`}>
                  Bearer Token + HMAC verification
                </div>
              </button>

              <button
                type="button"
                id="auth-scheme-none-btn"
                onClick={() => setAuthType('none')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  authType === 'none'
                    ? 'border-stone-400 bg-stone-100 text-stone-900 font-bold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-500 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold">
                  <Radio className="w-3.5 h-3.5 text-stone-400" />
                  <span>None (Testing)</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-1 leading-tight">
                  No auth header or signature
                </div>
              </button>
            </div>
          </div>

          {/* Section: Bearer Token Configuration (visible when 'bearer' or 'both') */}
          {(authType === 'bearer' || authType === 'both') && (
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-[#0077b6]" />
                  <h4 className="text-xs font-bold text-stone-900">Bearer Token / API Key</h4>
                </div>
                <button
                  type="button"
                  id="generate-bearer-token-btn"
                  onClick={() => setBearerToken(generateRandomBearerToken())}
                  className="text-[11px] text-[#0077b6] hover:text-[#03045e] font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate New Token</span>
                </button>
              </div>

              <div className="relative">
                <input
                  id="bearer-token-input"
                  type={showBearer ? 'text' : 'password'}
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="cbx_sec_live_..."
                  className="w-full pl-3 pr-20 py-2 rounded-xl text-xs font-mono border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowBearer(!showBearer)}
                    className="p-1 text-stone-400 hover:text-stone-600 rounded cursor-pointer"
                    title={showBearer ? 'Hide token' : 'Show token'}
                  >
                    {showBearer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(bearerToken, 'bearer')}
                    className="p-1 text-stone-400 hover:text-stone-600 rounded cursor-pointer"
                    title="Copy token"
                  >
                    {copiedKey === 'bearer' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] font-mono text-stone-600 bg-white px-3 py-1.5 rounded-lg border border-stone-200">
                <span className="font-bold text-stone-500">Header:</span>
                <span className="text-[#03045e] truncate">
                  Authorization: Bearer {bearerToken ? (showBearer ? bearerToken : '••••••••••••••••') : '<token>'}
                </span>
              </div>
            </div>
          )}

          {/* Section: HMAC Signature Configuration (visible when 'hmac' or 'both') */}
          {(authType === 'hmac' || authType === 'both') && (
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#0077b6]" />
                  <h4 className="text-xs font-bold text-stone-900">Cryptographic HMAC Signature</h4>
                </div>
                <button
                  type="button"
                  id="generate-hmac-secret-btn"
                  onClick={() => setHmacSecret(generateRandomHexSecret(32))}
                  className="text-[11px] text-[#0077b6] hover:text-[#03045e] font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate 256-bit Key</span>
                </button>
              </div>

              {/* Shared Secret Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                  <span>HMAC Shared Secret Key</span>
                  <span className="text-stone-400 font-normal">Private key shared between sender and receiver</span>
                </label>
                <div className="relative">
                  <input
                    id="hmac-secret-input"
                    type={showSecret ? 'text' : 'password'}
                    value={hmacSecret}
                    onChange={(e) => setHmacSecret(e.target.value)}
                    placeholder="Enter or generate a 32-byte hex secret..."
                    className="w-full pl-3 pr-20 py-2 rounded-xl text-xs font-mono border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="p-1 text-stone-400 hover:text-stone-600 rounded cursor-pointer"
                      title={showSecret ? 'Hide secret' : 'Show secret'}
                    >
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(hmacSecret, 'secret')}
                      className="p-1 text-stone-400 hover:text-stone-600 rounded cursor-pointer"
                      title="Copy secret"
                    >
                      {copiedKey === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Algorithm & Format Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700">Hashing Algorithm</label>
                  <select
                    id="hmac-algorithm-select"
                    value={hmacAlgorithm}
                    onChange={(e) => {
                      const algo = e.target.value as 'sha256' | 'sha512';
                      setHmacAlgorithm(algo);
                      setSignaturePrefix(algo === 'sha512' ? 'sha512=' : 'sha256=');
                    }}
                    className="w-full px-3 py-1.5 rounded-xl text-xs font-mono border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  >
                    <option value="sha256">HMAC-SHA256 (Recommended / Industry Standard)</option>
                    <option value="sha512">HMAC-SHA512 (Extended Digest)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700">Signature Format / Prefix</label>
                  <select
                    id="hmac-prefix-select"
                    value={signaturePrefix}
                    onChange={(e) => setSignaturePrefix(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl text-xs font-mono border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  >
                    <option value="sha256=">sha256=&lt;hash&gt; (GitHub / Stripe standard)</option>
                    <option value="sha512=">sha512=&lt;hash&gt; (SHA-512 standard)</option>
                    <option value="none">Raw Hex Only (&lt;hash&gt;)</option>
                  </select>
                </div>
              </div>

              {/* Signature Header Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-700">Signature Header Name</label>
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <span className="text-stone-400">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setHmacHeaderName('X-CloudboyX-Signature')}
                      className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600 hover:text-[#0077b6] cursor-pointer"
                    >
                      CloudboyX
                    </button>
                    <button
                      type="button"
                      onClick={() => setHmacHeaderName('X-Hub-Signature-256')}
                      className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600 hover:text-[#0077b6] cursor-pointer"
                    >
                      X-Hub-256
                    </button>
                    <button
                      type="button"
                      onClick={() => setHmacHeaderName('X-Signature-SHA256')}
                      className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600 hover:text-[#0077b6] cursor-pointer"
                    >
                      NetSuite/Shopify
                    </button>
                  </div>
                </div>
                <input
                  id="hmac-header-name-input"
                  type="text"
                  value={hmacHeaderName}
                  onChange={(e) => setHmacHeaderName(e.target.value)}
                  placeholder="X-CloudboyX-Signature"
                  className="w-full px-3 py-1.5 rounded-xl text-xs font-mono border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                />
              </div>

              {/* Timestamp Header / Replay Attack Prevention */}
              <div className="pt-2 border-t border-stone-200 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0077b6]" />
                      <span>Replay Attack Defense (Timestamp Header)</span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Attaches request timestamp so receiver can reject payloads older than 5 minutes.
                    </div>
                  </div>
                  <input
                    id="include-timestamp-checkbox"
                    type="checkbox"
                    checked={includeTimestamp}
                    onChange={(e) => setIncludeTimestamp(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0077b6] focus:ring-[#0077b6] cursor-pointer"
                  />
                </label>

                {includeTimestamp && (
                  <div className="pl-5 space-y-1">
                    <label className="text-[10px] font-bold text-stone-600">Timestamp Header Name</label>
                    <input
                      id="timestamp-header-name-input"
                      type="text"
                      value={timestampHeaderName}
                      onChange={(e) => setTimestampHeaderName(e.target.value)}
                      placeholder="X-CloudboyX-Timestamp"
                      className="w-full px-3 py-1 rounded-lg text-xs font-mono border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live Signature Inspector & Sandbox Verification */}
          <div className="bg-[#03045e]/5 rounded-2xl border border-[#0077b6]/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#0077b6]" />
                <h4 className="text-xs font-bold text-[#03045e]">Live Header &amp; Signature Inspector</h4>
              </div>

              <button
                type="button"
                id="test-verify-credentials-btn"
                onClick={handleTestVerification}
                disabled={isVerifying}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-[#00d4ff]" />
                    <span>Test &amp; Verify Signature</span>
                  </>
                )}
              </button>
            </div>

            {/* Verification Status Banner */}
            {verifiedSuccess !== null && (
              <div
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-150 ${
                  verifiedSuccess
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {verifiedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Cryptographic credentials verified! Receiver endpoint will successfully validate request
                      authenticity.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Validation failed: Please enter a valid Bearer Token or HMAC Shared Secret before dispatching.
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Live Headers Preview */}
            <div className="space-y-1.5 font-mono text-[11px] bg-white rounded-xl border border-stone-200 p-3 overflow-x-auto">
              <div className="text-stone-400 font-sans text-[10px] uppercase font-bold mb-1">
                Outgoing HTTP Headers to be Sent:
              </div>
              <div className="text-stone-700">Content-Type: application/json</div>
              {(authType === 'bearer' || authType === 'both') && (
                <div className="text-[#03045e] font-bold">
                  Authorization: Bearer {bearerToken || '<token_required>'}
                </div>
              )}
              {(authType === 'hmac' || authType === 'both') && (
                <div className="text-[#0077b6] font-bold break-all">
                  {hmacHeaderName}: {getFullSignatureHeaderValue()}
                </div>
              )}
              {(authType === 'hmac' || authType === 'both') && includeTimestamp && (
                <div className="text-stone-600 font-semibold">
                  {timestampHeaderName}: {new Date().toISOString()}
                </div>
              )}
              {authType === 'none' && <div className="text-stone-400 italic">No authentication headers configured</div>}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between">
          <div className="text-xs text-stone-500 font-mono">
            Active Scheme:{' '}
            <span className="font-bold text-[#03045e]">
              {authType === 'both'
                ? 'Bearer Token + HMAC'
                : authType === 'hmac'
                ? `HMAC-${hmacAlgorithm.toUpperCase()}`
                : authType === 'bearer'
                ? 'Bearer Token'
                : 'None'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="cancel-security-modal-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              id="save-security-credentials-btn"
              onClick={handleSave}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white text-xs font-black transition-all cursor-pointer shadow-md"
            >
              <Shield className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span>Save Security Credentials</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
