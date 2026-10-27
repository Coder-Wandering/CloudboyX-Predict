import { GoogleGenAI } from '@google/genai';

// Global state for Gemini API key quota and per-model availability
let globalQuotaExhaustedUntil: number = 0;
const modelCoolDownMap: Record<string, { until: number; isQuota: boolean }> = {};

export function isGeminiQuotaExhausted(): boolean {
  if (globalQuotaExhaustedUntil > 0 && Date.now() < globalQuotaExhaustedUntil) {
    return true;
  }
  if (globalQuotaExhaustedUntil > 0 && Date.now() >= globalQuotaExhaustedUntil) {
    globalQuotaExhaustedUntil = 0; // reset
  }
  return false;
}

export function isModelInCooldown(modelName: string): boolean {
  if (isGeminiQuotaExhausted()) return true;
  const entry = modelCoolDownMap[modelName];
  if (!entry) return false;
  if (Date.now() < entry.until) return true;
  delete modelCoolDownMap[modelName];
  return false;
}

export function recordGeminiFailure(modelName: string, err?: any) {
  const rawMsg = typeof err?.message === 'string' ? err.message : String(err || '');
  const isQuota =
    rawMsg.includes('429') ||
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('Quota') ||
    err?.status === 429 ||
    err?.code === 429;

  if (isQuota) {
    // Project free-tier daily quota limit hit. Fast-trip circuit breaker for 10 minutes
    // so no further 429s or network delays occur.
    globalQuotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
    console.info(
      `[Gemini Circuit Breaker] Free-tier quota reached (429). Fast-switching to calibrated econometric baselines.`
    );
  } else {
    // Transient hiccup on this specific model (e.g. 503 or timeout) -> 30s cooldown
    modelCoolDownMap[modelName] = {
      until: Date.now() + 30000,
      isQuota: false,
    };
  }
}

export function recordGeminiSuccess(modelName: string) {
  delete modelCoolDownMap[modelName];
  globalQuotaExhaustedUntil = 0;
}

export function getCleanDiagnosticNotice(err: any): string {
  if (!err) return 'status unknown';
  const raw = typeof err?.message === 'string' ? err.message : String(err);
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota') || err?.status === 429) {
    return '429 Quota Exceeded (Cooldown Active)';
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || err?.status === 503) {
    return '503 High Demand';
  }
  if (raw.includes('timed out') || raw.includes('Timeout')) {
    return 'Request Timed Out';
  }
  return 'Service Notice';
}

export function getGeminiApiKey(): string {
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;
  if (isGeminiQuotaExhausted()) {
    return null; // Seamlessly bypass calling external API while in quota cooldown
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}
