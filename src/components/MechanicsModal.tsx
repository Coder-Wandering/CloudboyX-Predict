import React from 'react';
import { X, BookOpen, CheckCircle, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface MechanicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MechanicsModal: React.FC<MechanicsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-2xl w-full p-6 space-y-5 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#03045e]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#03045e]">
                Kalshi Mechanics: Can You Actually Make Money?
              </h3>
              <p className="text-xs text-stone-500">
                The mathematics of event contracts, edge, fees, and trading realities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#03045e] flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-[#03045e] text-white text-[11px] flex items-center justify-center">1</span>
              <span>How Kalshi Differs from Lotteries & Sportsbooks</span>
            </h4>
            <p>
              In a lottery or pari-mutuel pool, the "house" takes 20-50% off the top (rake) and redistributes whatever is left. On Kalshi (a CFTC-regulated exchange):
            </p>
            <ul className="space-y-1 pl-4 list-disc text-stone-600">
              <li>You trade against other market participants, not a casino or house with a 10% built-in vig.</li>
              <li>Every contract is binary: it pays either strictly <strong>$1.00</strong> or <strong>$0.00</strong> at resolution.</li>
              <li>The price (e.g., 54¢) directly represents the current crowd probability estimate (54% chance of YES).</li>
              <li>You can sell your position at any time before settlement to lock in profits or cut losses.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h4 className="font-bold text-[#03045e] flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-[#03045e] text-white text-[11px] flex items-center justify-center">2</span>
              <span>The Mathematics of Having an "Edge"</span>
            </h4>
            <p>
              You only make money long-term if your calibrated probability differs from the market price by more than exchange friction:
            </p>
            <div className="p-3 bg-[#caf0f8]/20 rounded-xl border border-[#90e0ef] font-mono text-xs text-[#03045e] space-y-1">
              <div>Expected Value = (Probability of Win &times; Profit) &minus; (Probability of Loss &times; Cost)</div>
              <div className="text-stone-600 font-sans mt-1">
                If the market prices a Fed rate cut at <strong>50¢ (50%)</strong>, but your rigorous AI model proves the true likelihood is <strong>65%</strong>:
                <br />
                <span className="text-[#0077b6] font-semibold">EV = (0.65 &times; $0.50) &minus; (0.35 &times; $0.50) = +$0.15 (+15¢ per contract / +30% ROI).</span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h4 className="font-bold text-[#03045e] flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-[#03045e] text-white text-[11px] flex items-center justify-center">3</span>
              <span>Why Most Casual Bettors Lose Money</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-[#03045e] block text-xs">Taker Fees & Spreads</span>
                <p className="text-[11px] text-stone-600">
                  Exchange taker fees (~1.5¢ - 3.5¢) and bid-ask spreads eat small 1-2% advantages. Profitable traders place limit orders (makers) to minimize fees.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#caf0f8]/30 border border-[#90e0ef] space-y-1">
                <span className="font-bold text-[#03045e] block text-xs">Overconfidence & Over-Betting</span>
                <p className="text-[11px] text-stone-600">
                  Betting 20-50% of your bankroll on a single "sure thing" guarantees bankruptcy when a tail risk strikes. Strict Kelly sizing limits stakes to 2-5%.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h4 className="font-bold text-[#03045e] flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-[#03045e] text-white text-[11px] flex items-center justify-center">4</span>
              <span>The 3 Proven Paths to Profit</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-700">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-[#0077b6] mt-0.5 shrink-0" />
                <span><strong>Specialized Domain Information:</strong> Being faster or more thorough at analyzing niche data (weather models, obscure agency filings, legal proceedings) than general public sentiment.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-[#0077b6] mt-0.5 shrink-0" />
                <span><strong>Momentum & Swing Trading:</strong> Buying an underpriced contract at 35¢ and selling it for 65¢ as news breaks, without holding until the expiration risk.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-[#0077b6] mt-0.5 shrink-0" />
                <span><strong>Market Making & Rebates:</strong> Providing liquidity on both sides of the book (bidding 48¢ and asking 52¢) and collecting the spread.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#03045e] hover:bg-[#0077b6] text-white transition-colors cursor-pointer shadow-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
