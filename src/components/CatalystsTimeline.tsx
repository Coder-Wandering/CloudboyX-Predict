import React from 'react';
import { CatalystEvent } from '../types';
import { Calendar, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

interface CatalystsTimelineProps {
  catalysts: CatalystEvent[];
}

export const CatalystsTimeline: React.FC<CatalystsTimelineProps> = ({ catalysts }) => {
  if (!catalysts || catalysts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-7 space-y-4">
      <div className="flex items-center space-x-2 pb-3 border-b border-stone-100">
        <div className="w-7 h-7 rounded-lg bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] flex items-center justify-center">
          <Calendar className="w-4 h-4 text-[#0077b6]" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#03045e]">
            Upcoming Market Catalysts &amp; Trigger Dates
          </h3>
          <p className="text-xs text-stone-500">
            Events that will dynamically shift contract prices and implied probabilities before settlement
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {catalysts.map((cat, idx) => {
          const isBull = cat.impactDirection === 'BULLISH_YES';
          const isBear = cat.impactDirection === 'BEARISH_NO';

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-stone-50 border border-[#90e0ef]/70 flex flex-col justify-between space-y-2 hover:border-[#00b4d8] transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#03045e] font-mono">
                    {cat.dateOrTrigger}
                  </span>
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isBull
                      ? 'bg-[#caf0f8] text-[#0077b6] border-[#00b4d8]'
                      : isBear
                      ? 'bg-[#caf0f8]/60 text-[#03045e] border-[#90e0ef]'
                      : 'bg-[#caf0f8]/40 text-[#0077b6] border-[#90e0ef]'
                  }`}>
                    {isBull ? (
                      <>
                        <ArrowUpRight className="w-3 h-3 text-[#0077b6]" />
                        <span>YES Catalyst</span>
                      </>
                    ) : isBear ? (
                      <>
                        <ArrowDownRight className="w-3 h-3 text-[#03045e]" />
                        <span>NO Catalyst</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 text-[#0077b6]" />
                        <span>Volatility</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
