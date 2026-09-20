import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Terminal, FileCode2, ExternalLink, Sparkles } from 'lucide-react';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({ isOpen, onClose }) => {
  const [scriptCode, setScriptCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/script/code')
        .then((res) => res.json())
        .then((data) => {
          if (data.code) setScriptCode(data.code);
        })
        .catch((err) => console.error('Failed to load script:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!scriptCode) return;
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-4xl w-full p-6 space-y-5 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] flex items-center justify-center">
              <FileCode2 className="w-5 h-5 text-[#03045e]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#03045e]">
                Multi-Source Ingestion & Probability Model Script
              </h3>
              <p className="text-xs text-stone-500">
                Standalone Python script (<code>ingest_and_model.py</code>) with zero mandatory pip dependencies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions & CLI instructions */}
        <div className="p-4 rounded-xl bg-[#03045e] text-stone-100 space-y-3 font-mono text-xs border border-[#0077b6]">
          <div className="flex items-center justify-between text-[#caf0f8] font-sans text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-[#00b4d8]" />
              <span>Command-Line Execution</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center space-x-1 font-sans text-xs cursor-pointer border border-white/20"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#90e0ef]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Script!' : 'Copy Script'}</span>
              </button>
              <a
                href="/api/script/download"
                download="ingest_and_model.py"
                className="px-2.5 py-1 rounded bg-[#0077b6] hover:bg-[#00b4d8] text-white font-bold transition-colors flex items-center space-x-1 font-sans text-xs shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </a>
            </div>
          </div>

          <div className="space-y-1 text-[#caf0f8]">
            <div><span className="text-[#90e0ef]/70"># Run full pipeline: ingest news + financial APIs & execute models</span></div>
            <div className="text-[#90e0ef]">python3 ingest_and_model.py --query "Federal Reserve rate cut"</div>
            <div className="pt-1"><span className="text-[#90e0ef]/70"># Run specific model iteration:</span></div>
            <div className="text-[#90e0ef]">python3 ingest_and_model.py --model linear</div>
            <div className="text-[#90e0ef]">python3 ingest_and_model.py --model logistic</div>
            <div className="text-[#90e0ef]">python3 ingest_and_model.py --model gemini</div>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="font-semibold text-[#03045e]">Script Code Preview (Python 3.10+)</span>
            <span className="text-[11px] text-stone-400">Standard library only (urllib, json, sqlite3, math)</span>
          </div>

          <div className="bg-stone-950 text-stone-200 rounded-xl p-4 font-mono text-[11px] max-h-96 overflow-y-auto leading-relaxed border border-stone-800 selection:bg-[#0077b6]">
            {loading ? (
              <div className="py-8 text-center text-stone-500">Loading python script...</div>
            ) : (
              <pre className="whitespace-pre">{scriptCode}</pre>
            )}
          </div>
        </div>

        {/* Architecture Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <strong className="text-[#03045e] block font-bold">1. Multi-Source APIs</strong>
            <p className="text-stone-600 text-[11px]">
              Pulls live market quotes (^GSPC, ^TNX, ^VIX, SPY) and news headline RSS with sentiment polarity scoring (-1 to +1).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <strong className="text-[#03045e] block font-bold">2. Structured Storage</strong>
            <p className="text-stone-600 text-[11px]">
              Stores raw payloads in JSON, normalized feature vectors in JSON/CSV, and historical queries in SQLite <code>events.db</code>.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <strong className="text-[#03045e] block font-bold">3. Model Iteration</strong>
            <p className="text-stone-600 text-[11px]">
              Includes Stage 1 Linear (OLS), Stage 2 Logistic (Sigmoid Odds), and Stage 3 Google AI Studio Gemini engine.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#03045e] hover:bg-[#0077b6] text-white transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
