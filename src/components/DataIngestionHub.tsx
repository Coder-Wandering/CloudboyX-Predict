import React, { useState } from 'react';
import {
  IngestedPayload,
  NewsArticleRecord,
  FinancialMetricRecord,
  StructuredFeatures,
} from '../types';
import {
  Database,
  RefreshCw,
  TrendingUp,
  Newspaper,
  FileJson,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Table,
  Cpu,
} from 'lucide-react';

interface DataIngestionHubProps {
  isOpen: boolean;
  onClose: () => void;
  ingestedData: IngestedPayload | null;
  onRunIngestion: (query?: string) => Promise<void>;
  onLoadIntoModel: (features: StructuredFeatures) => void;
  isLoading: boolean;
}

export const DataIngestionHub: React.FC<DataIngestionHubProps> = ({
  isOpen,
  onClose,
  ingestedData,
  onRunIngestion,
  onLoadIntoModel,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'kalshi' | 'financial' | 'news' | 'features' | 'storage'>('kalshi');
  const [queryInput, setQueryInput] = useState<string>(
    ingestedData?.query || 'Will OpenAI or Anthropic IPO first?'
  );

  if (!isOpen) return null;

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRunIngestion(queryInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-4xl w-full p-6 space-y-5 overflow-y-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] flex items-center justify-center">
              <Database className="w-5 h-5 text-[#03045e]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#03045e]">
                Multi-Source API Ingestion & Structured Storage
              </h3>
              <p className="text-xs text-stone-500">
                Ingests live news feeds, financial data APIs & prediction market consensus, structures features, and persists to JSON, CSV, and SQLite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs font-semibold text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Trigger Bar */}
        <form onSubmit={handleTrigger} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Target event query for API ingestion..."
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#03045e] hover:bg-[#0077b6] text-white transition-colors flex items-center justify-center space-x-1.5 disabled:bg-stone-300 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Running Ingestion Script...' : 'Run Python Ingestion Script'}</span>
          </button>
        </form>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-stone-100 pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('kalshi')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'kalshi'
                ? 'bg-[#03045e] text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-pulse"></span>
            <span>Prediction Markets ({ingestedData?.kalshi_records?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'financial'
                ? 'bg-[#03045e] text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Financial APIs ({ingestedData?.financial_records?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'news'
                ? 'bg-[#03045e] text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>News APIs ({ingestedData?.news_records?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'features'
                ? 'bg-[#03045e] text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Normalized Features</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-[#03045e] text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Structured Storage (JSON/DB)</span>
          </button>
        </div>

        {/* Tab 0: Prediction Markets */}
        {activeTab === 'kalshi' && (
          <div className="space-y-3">
            <div className="text-xs text-stone-500 flex items-center justify-between">
              <span>Live contracts and implied base rate odds ingested from multi-source prediction benchmarks:</span>
              <span className="font-mono text-[11px] text-[#03045e] bg-[#caf0f8] px-2 py-0.5 rounded border border-[#90e0ef]">
                Market Consensus Stream
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {(ingestedData?.kalshi_records || []).map((km, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-2 hover:border-[#0077b6] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-mono">
                        {km.category || 'General'}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#03045e] bg-[#caf0f8] px-2 py-0.5 rounded border border-[#00b4d8]">
                        {km.price_cents}¢ ($0.{String(km.price_cents).padStart(2, '0')})
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 leading-snug">
                      {km.title}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                    <div className="text-stone-500 font-mono">
                      <span>Vol: ${(km.volume || 0).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (ingestedData?.features) {
                          onLoadIntoModel({
                            ...ingestedData.features,
                            market_implied_prior: km.price_cents,
                          });
                          onClose();
                        }
                      }}
                      className="text-xs font-semibold text-[#0077b6] hover:text-[#03045e] transition-colors cursor-pointer"
                    >
                      Use as Prior ({km.price_cents}%) &rarr;
                    </button>
                  </div>
                </div>
              ))}
              {(!ingestedData?.kalshi_records || ingestedData.kalshi_records.length === 0) && (
                <div className="col-span-2 p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-stone-200">
                  No prediction records ingested yet. Click <strong>Run Python Ingestion Script</strong> above to ingest real-time contracts!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Financial APIs View */}
        {activeTab === 'financial' && (
          <div className="space-y-3">
            <div className="text-xs text-stone-500">
              Live market quotes, volatility indexes, and interest rate spreads fetched via financial market APIs:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(ingestedData?.financial_records || []).map((fin, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-stone-900 font-mono">
                      {fin.symbol}
                    </span>
                    <span className="text-[11px] text-stone-500 block truncate max-w-[160px]">
                      {fin.name}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Status: {fin.status}
                    </span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-sm font-bold font-mono text-stone-900 block">
                      {fin.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`inline-flex items-center text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border ${
                      fin.change_24h_percent >= 0
                        ? 'bg-[#caf0f8] text-[#0077b6] border-[#00b4d8]'
                        : 'bg-[#caf0f8]/60 text-[#03045e] border-[#90e0ef]'
                    }`}>
                      {fin.change_24h_percent >= 0 ? '+' : ''}{fin.change_24h_percent}%
                    </span>
                    {fin.volatility_index && (
                      <span className="text-[10px] text-stone-400 block">
                        Vol: {fin.volatility_index}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: News APIs View */}
        {activeTab === 'news' && (
          <div className="space-y-3">
            <div className="text-xs text-stone-500">
              Live headline stream ingested from News APIs with NLP lexicon sentiment classification (-1.0 to +1.0):
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {(ingestedData?.news_records || []).map((article, idx) => {
                const isPos = article.sentiment_score > 0.1;
                const isNeg = article.sentiment_score < -0.1;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-200 text-stone-800">
                          {article.source}
                        </span>
                        <span className="text-xs font-semibold text-stone-900 leading-snug">
                          {article.title}
                        </span>
                      </div>
                      {article.published_at && (
                        <div className="text-[10px] text-stone-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.published_at}</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${
                        isPos
                          ? 'bg-[#caf0f8] text-[#0077b6] border-[#00b4d8]'
                          : isNeg
                          ? 'bg-[#caf0f8]/60 text-[#03045e] border-[#90e0ef]'
                          : 'bg-stone-200 text-stone-700 border-stone-300'
                      }`}>
                        {article.sentiment_score > 0 ? `+${article.sentiment_score}` : article.sentiment_score}
                      </span>
                      <span className="text-[10px] font-semibold text-stone-500 uppercase">
                        {article.sentiment_label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Normalized Features Table */}
        {activeTab === 'features' && ingestedData?.features && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Normalized structured feature vector ready for Linear, Logistic, and Gemini probability engines:
              </span>
              <button
                onClick={() => {
                  onLoadIntoModel(ingestedData.features);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#03045e] hover:bg-[#0077b6] text-white transition-colors cursor-pointer"
              >
                Load This Vector Into Model Studio &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(ingestedData.features).map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[10px] text-stone-500 font-mono block uppercase">
                    {k.replace(/_/g, ' ')}
                  </span>
                  <span className="text-base font-bold text-[#03045e] font-mono">
                    {typeof v === 'number' ? (v % 1 !== 0 ? v.toFixed(3) : v) : String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Storage Files Inspector */}
        {activeTab === 'storage' && (
          <div className="space-y-3 text-xs">
            <div className="text-stone-500">
              Raw and structured data are persisted across three formats for ML model reproducibility:
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px] space-y-1">
                <span className="text-[#03045e] font-bold block">1. Raw JSON Archive:</span>
                <span className="text-stone-500">/data/raw_ingested_sources.json</span>
                <p className="text-[10px] text-stone-600 font-sans">
                  Stores untruncated API JSON payloads with source headers, HTTP status, and publication timestamps.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px] space-y-1">
                <span className="text-[#03045e] font-bold block">2. Structured Features Vector:</span>
                <span className="text-stone-500">/data/structured_features.json</span>
                <p className="text-[10px] text-stone-600 font-sans">
                  Normalized econometric, sentiment, and volatility metrics directly mapped to mathematical input vector X.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px] space-y-1">
                <span className="text-[#03045e] font-bold block">3. CSV Training Dataset:</span>
                <span className="text-stone-500">/data/structured_dataset.csv</span>
                <p className="text-[10px] text-stone-600 font-sans">
                  Tabular append-only dataset for training regression weights and calculating historical R-squared.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px] space-y-1">
                <span className="text-[#03045e] font-bold block">4. SQLite Relational Database:</span>
                <span className="text-stone-500">/data/events.db</span>
                <p className="text-[10px] text-stone-600 font-sans">
                  Tables: <code>news_articles</code>, <code>financial_metrics</code>, <code>raw_ingestions</code>, <code>predictions</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-stone-100">
          <span className="text-[11px] text-stone-400 font-mono">
            Last Updated: {ingestedData?.timestamp ? new Date(ingestedData.timestamp).toLocaleTimeString() : 'Ready'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#03045e] hover:bg-[#0077b6] text-white transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
