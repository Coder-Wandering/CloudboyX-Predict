import { ProbabilityAnalysisResult, PriceCheckRecord } from '../types';

export interface ExportedResearchPayload {
  exportMetadata: {
    system: string;
    version: string;
    exportedAt: string;
    exportTimestamp: number;
    platform: string;
    contractType: string;
  };
  analysis: ProbabilityAnalysisResult;
  volatilityPriceChecks?: PriceCheckRecord[];
}

/**
 * Downloads the current analysis object as a beautifully formatted JSON file,
 * allowing users to save their research locally.
 */
export function exportAnalysisAsJson(
  analysis: ProbabilityAnalysisResult,
  volatilityChecks?: PriceCheckRecord[]
): { filename: string; success: boolean; jsonString?: string; payload?: ExportedResearchPayload } {
  try {
    const payload: ExportedResearchPayload = {
      exportMetadata: {
        system: 'CloudboyX Predict - Quantitative Intelligence & Probability Modeling',
        version: '2.4.0',
        exportedAt: new Date().toISOString(),
        exportTimestamp: Date.now(),
        platform: 'Universal Event Prediction & Consensus Modeling',
        contractType: 'Probabilistic Event Scenario ($1.00 Payout / 0-100% Scale)',
      },
      analysis,
      ...(volatilityChecks && volatilityChecks.length > 0 ? { volatilityPriceChecks: volatilityChecks } : {}),
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Sanitize filename from event title or query
    const cleanTitle = (analysis.eventTitle || analysis.query || 'event-analysis')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `cloudboyx-analysis-${cleanTitle || 'research'}-${dateStr}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { filename, success: true, jsonString, payload };
  } catch (error) {
    console.error('Failed to export analysis JSON:', error);
    return { filename: '', success: false };
  }
}
