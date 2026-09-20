import React from 'react';
import { ResolutionCriteria } from '../types';
import { ShieldAlert, Clock, Database, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ResolutionCriteriaCardProps {
  criteria: ResolutionCriteria;
}

export const ResolutionCriteriaCard: React.FC<ResolutionCriteriaCardProps> = ({ criteria }) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-7 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-[#0077b6]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#03045e]">
              Contract Resolution Rulebook &amp; Criteria
            </h3>
            <p className="text-xs text-stone-500">
              Exact terms dictating settlement to either $1.00 or $0.00 per contract
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#03045e] bg-[#caf0f8] px-2.5 py-0.5 rounded border border-[#90e0ef]">
          Binary Rulebook
        </span>
      </div>

      {/* Target Deadline & Authority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-stone-50 border border-[#90e0ef]/70">
          <Clock className="w-4 h-4 text-[#0077b6] mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide block">
              Expiration / Target Deadline
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#03045e] mt-0.5 block font-mono">
              {criteria.deadline}
            </span>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-stone-50 border border-[#90e0ef]/70">
          <Database className="w-4 h-4 text-[#03045e] mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide block">
              Definitive Resolution Source
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#03045e] mt-0.5 block">
              {criteria.resolutionSource}
            </span>
          </div>
        </div>
      </div>

      {/* Exact Trigger Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="p-3.5 rounded-xl bg-[#caf0f8]/40 border border-[#00b4d8]">
          <div className="flex items-center space-x-1.5 text-[#0077b6] font-bold text-xs mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#0077b6]" />
            <span>YES Settlement Trigger ($1.00 Payout)</span>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            {criteria.yesCondition}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#caf0f8]/20 border border-[#90e0ef]">
          <div className="flex items-center space-x-1.5 text-[#03045e] font-bold text-xs mb-1.5">
            <XCircle className="w-4 h-4 text-[#03045e]" />
            <span>NO Settlement Trigger ($1.00 Payout)</span>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            {criteria.noCondition}
          </p>
        </div>
      </div>

      {/* Edge Cases & Caveats */}
      {criteria.edgeCases && criteria.edgeCases.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#caf0f8]/30 border border-[#90e0ef]">
          <div className="flex items-center space-x-1.5 text-[#03045e] font-bold text-xs mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#0077b6]" />
            <span>Ambiguity Traps &amp; Edge Case Clauses</span>
          </div>
          <ul className="space-y-1.5 text-xs text-stone-700">
            {criteria.edgeCases.map((edge, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-[#0077b6] font-bold">&bull;</span>
                <span>{edge}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
