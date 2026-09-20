import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FileText,
  Download,
  Copy,
  Check,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Activity,
  ShieldCheck,
  Calculator,
  Briefcase,
  Layers,
  Terminal,
  Printer,
} from 'lucide-react';

interface TrainingInstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection?: (sectionId: string, view?: 'model_studio' | 'market_analyzer') => void;
}

type TabType = 'training' | 'operator' | 'cheatsheet' | 'quiz';

export const TrainingInstructionModal: React.FC<TrainingInstructionModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSection,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('training');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (docType: 'training' | 'operator' | 'cheatsheet') => {
    window.open(`/api/docs/download/${docType}`, '_blank');
  };

  const handleDownloadPdf = (docType: 'training' | 'operator' | 'cheatsheet' | 'all') => {
    window.open(`/api/docs/pdf/${docType}`, '_blank');
  };

  const quizQuestions = [
    {
      question: 'On Kalshi event contracts, what does a YES contract trading at 42¢ represent?',
      options: [
        'A 58% implied market probability',
        'A 42% implied market probability and a $0.42 cost per contract',
        'A guaranteed $0.42 dividend',
        'A fixed exchange fee',
      ],
      correct: 1,
      explanation: 'Every binary contract pays out $1.00 on win; thus, the price in cents (42¢) directly equals the implied probability (42%).',
    },
    {
      question: 'What is statistical edge (E) in prediction market trading?',
      options: [
        'Total volume traded divided by 100',
        'The difference between your calibrated probability and the market price (P_calibrated - P_implied)',
        'The exchange commission charged on taker orders',
        'The number of open contracts in your portfolio',
      ],
      correct: 1,
      explanation: 'Edge is the difference between true estimated probability and market price. Positive edge represents positive expected value.',
    },
    {
      question: 'Why do institutional quantitative traders prefer Half-Kelly over Full Kelly?',
      options: [
        'Because Half-Kelly provides 100% higher returns',
        'Because prediction market models have estimation uncertainty; Half-Kelly preserves ~75% growth while reducing variance and drawdown by 50%',
        'Because the exchange prohibits trading more than half of bankroll',
        'Because Half-Kelly avoids paying all transaction fees',
      ],
      correct: 1,
      explanation: 'Half-Kelly drastically cuts ruin risk and volatility while sacrificing only a minor portion of geometric compounding.',
    },
    {
      question: 'In the 3-Check Volatility Card, what does a prominent Green Upward Arrow (↗) indicate?',
      options: [
        'A contract price decrease from the previous tick',
        'A contract price increase (+X¢) reflecting positive buying pressure or upward probability drift',
        'A contract resolution to NO',
        'The market has closed for the session',
      ],
      correct: 1,
      explanation: 'Green Upward Arrows clearly signal upward price jumps (+X¢ Up), showing active orderbook demand and momentum.',
    },
  ];

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleGradeQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score += 1;
    });
    setQuizScore(score);
  };

  return (
    <div
      id="training-instruction-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#03045e] text-[#caf0f8] flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-[#90e0ef]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black text-[#03045e] tracking-tight">
                  Instruction &amp; Training Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] uppercase tracking-wide">
                  Official Docs &bull; v2.4
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Complete documentation, curriculum training modules, operator manual, and self-check exam
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-6 pt-3 border-b border-stone-200 bg-white flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('training')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'training'
                  ? 'bg-[#0077b6] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#caf0f8]/40 hover:text-[#03045e]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>User Training Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('operator')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'operator'
                  ? 'bg-[#0077b6] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#caf0f8]/40 hover:text-[#03045e]'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Operator Manual</span>
            </button>

            <button
              onClick={() => setActiveTab('cheatsheet')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'cheatsheet'
                  ? 'bg-[#0077b6] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#caf0f8]/40 hover:text-[#03045e]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Quick Cheat Sheet</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'bg-[#0077b6] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#caf0f8]/40 hover:text-[#03045e]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Operator Exam</span>
            </button>
          </div>

          {/* Document Download Triggers (PDF & MD) */}
          <div className="pb-2 flex items-center space-x-2">
            {/* Download PDF button */}
            <button
              onClick={() => handleDownloadPdf(activeTab === 'quiz' ? 'all' : activeTab)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#caf0f8] text-[#03045e] hover:bg-[#90e0ef]/60 border border-[#90e0ef] transition-colors cursor-pointer shadow-2xs"
              title="Download instructions as PDF document"
            >
              <Printer className="w-3.5 h-3.5 text-[#0077b6]" />
              <span>Download PDF</span>
            </button>

            {/* Download All Instructions PDF */}
            <button
              onClick={() => handleDownloadPdf('all')}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
              title="Download full combined instruction manual as PDF"
            >
              <span>Full Manual PDF</span>
            </button>

            {activeTab === 'training' && (
              <button
                onClick={() => handleDownload('training')}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Download complete Markdown file"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>.MD</span>
              </button>
            )}
            {activeTab === 'operator' && (
              <button
                onClick={() => handleDownload('operator')}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Download operator manual Markdown file"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>.MD</span>
              </button>
            )}
            {activeTab === 'cheatsheet' && (
              <button
                onClick={() => handleDownload('cheatsheet')}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Download cheat sheet Markdown file"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>.MD</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 text-stone-800 text-sm space-y-6">
          {/* TAB 1: USER TRAINING GUIDE */}
          {activeTab === 'training' && (
            <div className="space-y-8">
              {/* Module 1 */}
              <section className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider font-mono">
                    Module 1 &bull; Foundations
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToSection?.('market-analyzer-section', 'market_analyzer');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Contract Analyzer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-lg font-black text-stone-900">
                  Binary Event Contracts &amp; The 1¢ to 99¢ Paradigm
                </h3>
                <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
                  On regulated prediction exchanges like Kalshi, every contract represents a verifiable binary outcome (0 or 1).
                  Contracts resolve to <strong>$1.00 (100¢)</strong> if the specified condition is met, or <strong>$0.00 (0¢)</strong> if it fails.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                    <div className="text-[11px] font-bold text-stone-400 uppercase">Implied Probability</div>
                    <div className="text-lg font-black text-stone-900 font-mono mt-0.5">Price = %</div>
                    <div className="text-[11px] text-stone-500 mt-1">
                      A YES contract trading at 48¢ implies exactly a 48% market probability.
                    </div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                    <div className="text-[11px] font-bold text-stone-400 uppercase">Payout &amp; Return</div>
                    <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">$1.00 Max</div>
                    <div className="text-[11px] text-stone-500 mt-1">
                      Buying at 48¢ yields $0.52 profit on win (+108.3% ROI). Loss is capped at 48¢.
                    </div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                    <div className="text-[11px] font-bold text-stone-400 uppercase">NO Contract Symmetry</div>
                    <div className="text-lg font-black text-indigo-700 font-mono mt-0.5">100 - YES Price</div>
                    <div className="text-[11px] text-stone-500 mt-1">
                      If YES is 48¢, NO trades at 52¢ (100¢ - 48¢ = 52¢).
                    </div>
                  </div>
                </div>
              </section>

              {/* Module 2 */}
              <section className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider font-mono">
                    Module 2 &bull; Econometric Modeling
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToSection?.('model-studio-section', 'model_studio');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Launch Model Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-lg font-black text-stone-900">
                  Linear vs. Logistic vs. AI Regression Architectures
                </h3>
                <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
                  CloudboyX Predict avoids black-box guessing by letting you test three distinct mathematical model types with live multi-source feature weights:
                </p>
                <div className="space-y-2.5">
                  <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs">
                    <div className="font-bold text-stone-900 flex items-center space-x-1.5">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      <span>1. Linear Regression (Composite Score)</span>
                    </div>
                    <p className="text-stone-600 mt-1">
                      Calculates $P = \beta_0 + \sum \beta_i X_i$. Fast, straightforward feature attribution, but can clip probabilities near extremes (0% and 100%).
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs">
                    <div className="font-bold text-stone-900 flex items-center space-x-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>2. Logistic Regression (Sigmoid Transform)</span>
                    </div>
                    <p className="text-stone-600 mt-1">
                      Transforms raw log-odds through the sigmoid function P(Y=1) = 1 / (1 + e^-z). Guarantees outputs remain in (0, 1) and naturally dampens extreme macro outliers.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs">
                    <div className="font-bold text-stone-900 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>3. Gemini AI Multi-Agent Synthesizer</span>
                    </div>
                    <p className="text-stone-600 mt-1">
                      Ingests qualitative nuance (speech tone, statutory amendments, diplomatic statements) and produces a Bayesian calibrated posterior with 90% confidence bands.
                    </p>
                  </div>
                </div>
              </section>

              {/* Module 3 */}
              <section className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider font-mono">
                    Module 3 &bull; Risk &amp; Sizing
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToSection?.('kalshi-calculator-card', 'market_analyzer');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Kelly Calculator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-lg font-black text-stone-900">
                  Kelly Criterion: Eliminating Ruin Risk via Mathematical Staking
                </h3>
                <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
                  Having a positive edge is not enough; incorrect sizing guarantees bankruptcy over time. The Kelly formula calculates optimal bankroll allocation:
                </p>
                <div className="p-4 bg-stone-900 text-white rounded-xl font-mono text-xs overflow-x-auto">
                  <div className="text-emerald-400 font-bold mb-1"># Fractional Kelly Allocation Formula:</div>
                  <div>f* = (p * b - q) / b</div>
                  <div className="text-stone-400 mt-1">where:</div>
                  <div className="text-stone-300">p = Calibrated Win Probability (e.g. 0.62)</div>
                  <div className="text-stone-300">q = Loss Probability (1 - p = 0.38)</div>
                  <div className="text-stone-300">b = Net Payout Ratio = (1.00 - Cost) / Cost = (1.00 - 0.48) / 0.48 = 1.083</div>
                  <div className="text-emerald-300 mt-2 font-bold">&gt;&gt; Recommended Execution: Half-Kelly (0.50 * f*) to mitigate estimation error!</div>
                </div>
              </section>

              {/* Module 4 */}
              <section className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider font-mono">
                    Module 4 &bull; Execution &amp; Volatility
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToSection?.('price-volatility-card', 'market_analyzer');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View 3-Check Volatility</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-lg font-black text-stone-900">
                  The 3-Check Velocity Engine &amp; Directional Arrows
                </h3>
                <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
                  Prediction market orderbooks are thin; liquidity shocks can create temporary false pricing. CloudboyX Predict evaluates consecutive tick checks:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                    <div className="font-bold text-emerald-900 flex items-center space-x-1.5">
                      <span className="text-base">↗</span>
                      <span>Green Upward Arrow (+X¢ Up)</span>
                    </div>
                    <p className="text-emerald-800 mt-1">
                      Signals positive buying momentum. Check if news or polling justified the bump. Avoid FOMO market orders; place limit orders at model fair value.
                    </p>
                  </div>
                  <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl">
                    <div className="font-bold text-rose-900 flex items-center space-x-1.5">
                      <span className="text-base">↘</span>
                      <span>Red Downward Arrow (-X¢ Down)</span>
                    </div>
                    <p className="text-rose-800 mt-1">
                      Signals selling pressure or consensus fading. Look for adverse catalyst updates or bid wall deterioration before entering.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: OPERATOR MANUAL */}
          {activeTab === 'operator' && (
            <div className="space-y-6">
              <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">
                    System Operations &bull; Cloud Run Ingress Port 3000
                  </span>
                  <button
                    onClick={() => handleCopy('npm run build && NODE_ENV=production node dist/server.cjs', 'build-cmd')}
                    className="flex items-center space-x-1 text-xs font-mono text-stone-300 hover:text-white bg-stone-800 px-2 py-1 rounded cursor-pointer"
                  >
                    {copiedKey === 'build-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Build Command</span>
                  </button>
                </div>
                <pre className="font-mono text-xs overflow-x-auto p-3 bg-black/40 rounded-lg text-emerald-300">
{`# Production Build & Verification
npm run lint
npm run build
NODE_ENV=production node dist/server.cjs
curl -s http://localhost:3000/api/health`}
                </pre>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <h4 className="font-black text-stone-900 text-base">Key Operational Procedures:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="font-bold text-stone-900 flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-indigo-600" />
                      <span>1. Automated Ingestion Pipeline</span>
                    </div>
                    <p className="text-stone-600 text-xs">
                      Run <code className="bg-stone-200 px-1 py-0.5 rounded font-mono">python3 scripts/ingest_and_model.py</code> via cron or on-demand from the Multi-Source Ingestion Hub.
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="font-bold text-stone-900 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>2. CFTC Compliance &amp; Regulatory Checks</span>
                    </div>
                    <p className="text-stone-600 text-xs">
                      All event resolution terms must be verified in the Resolution Criteria Card before staging trade execution.
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="font-bold text-stone-900 flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span>3. Paper Trading Bankroll Auditing</span>
                    </div>
                    <p className="text-stone-600 text-xs">
                      Simulated bankrolls persist in browser storage. Use the "Reset Bankroll" button in the portfolio modal to return to $1,000.00 baseline.
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="font-bold text-stone-900 flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span>4. Gemini API Fallback &amp; Cooldown</span>
                    </div>
                    <p className="text-stone-600 text-xs">
                      The server automatically cascades across models with built-in timeouts and graceful knowledge-base fallbacks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHEAT SHEET */}
          {activeTab === 'cheatsheet' && (
            <div className="space-y-5">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
                <h4 className="font-black text-indigo-950 text-sm mb-2 flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>Execution Decision Matrix</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-indigo-200 font-bold text-indigo-900">
                        <th className="py-2 pr-4">Condition</th>
                        <th className="py-2 pr-4">Statistical Indicator</th>
                        <th className="py-2">Standard Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100 text-stone-700">
                      <tr>
                        <td className="py-2 font-mono font-bold text-emerald-800">Edge ≥ +4%</td>
                        <td className="py-2">Calibrated P &gt; Market Price + 4¢</td>
                        <td className="py-2 font-bold text-emerald-700">BUY YES (Half-Kelly sizing)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono font-bold text-rose-800">Edge ≤ -4%</td>
                        <td className="py-2">Calibrated P &lt; Market Price - 4¢</td>
                        <td className="py-2 font-bold text-rose-700">BUY NO (or fade consensus)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-stone-500">|Edge| &lt; 2%</td>
                        <td className="py-2">Fairly priced orderbook</td>
                        <td className="py-2 font-semibold text-stone-600">PASS (Fees eat expected edge)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-amber-700">Range ≥ 5¢</td>
                        <td className="py-2">High 3-Check Volatility</td>
                        <td className="py-2 font-semibold text-amber-800">Use passive limits; Quarter-Kelly</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Shortcuts and Quick Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <h5 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Formula Cheat Sheet</h5>
                  <div className="space-y-1 font-mono text-[11px] text-stone-700">
                    <div>EV = P_calibrated - Cost</div>
                    <div>Max_Payout = Contracts * $1.00</div>
                    <div>Net_Profit = Max_Payout - Cost_Total</div>
                    <div>ROI% = (Net_Profit / Cost_Total) * 100</div>
                  </div>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <h5 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Orderbook Color Rules</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span><strong>Green (↗)</strong>: Upward tick, positive edge, buy signal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span><strong>Red (↘)</strong>: Downward tick, negative edge, loss risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-400"></span>
                      <span><strong>Gray (→)</strong>: Neutral price tick, consolidation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPERATOR EXAM / QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-black text-indigo-950 text-sm">Operator Self-Check Certification Exam</h4>
                  <p className="text-xs text-indigo-800 mt-0.5">
                    Test your understanding of contract mechanics, Kelly math, and volatility rules.
                  </p>
                </div>
                {quizScore !== null && (
                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-indigo-700">
                      {quizScore} / {quizQuestions.length}
                    </span>
                    <div className="text-[11px] font-bold text-indigo-900">
                      {quizScore === quizQuestions.length ? 'Master Certified!' : 'Review Modules Above'}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-xl border border-stone-200 bg-white space-y-3">
                    <div className="font-bold text-stone-900 text-xs sm:text-sm flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 font-mono text-xs flex items-center justify-center shrink-0">
                        {qIdx + 1}
                      </span>
                      <span>{q.question}</span>
                    </div>

                    <div className="space-y-2 pl-7">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[qIdx] === oIdx;
                        const isGraded = quizScore !== null;
                        const isCorrect = q.correct === oIdx;

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectAnswer(qIdx, oIdx)}
                            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? isGraded
                                  ? isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                    : 'bg-rose-50 border-rose-300 text-rose-900'
                                  : 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-2xs'
                                : isGraded && isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-stone-50/60 border-stone-200 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <span className="text-indigo-600 font-bold ml-2">&bull; Selected</span>}
                          </button>
                        );
                      })}
                    </div>

                    {quizScore !== null && (
                      <div className="pl-7 pt-1 text-[11px] text-stone-500 italic">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleGradeQuiz}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                >
                  Submit &amp; Grade Exam
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Action Strip */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-xs text-stone-500 hidden sm:block">
            Need real-time interactive assistance? Use the <strong>Walkthrough Bot</strong> in the bottom-right corner.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer ml-auto"
          >
            Done &amp; Return to App
          </button>
        </div>
      </div>
    </div>
  );
};
