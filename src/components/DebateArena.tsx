import React from 'react';
import { AgentThesis, DebateSynthesis } from '../types';
import { Scale, ShieldCheck, ShieldAlert, BrainCircuit, ArrowRight } from 'lucide-react';

interface DebateArenaProps {
  bullAgent: AgentThesis;
  bearAgent: AgentThesis;
  synthesis: DebateSynthesis;
}

export const DebateArena: React.FC<DebateArenaProps> = ({
  bullAgent,
  bearAgent,
  synthesis,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#03045e]">
              Multi-Agent Debate Arena
            </h3>
            <p className="text-xs text-stone-500">
              Adversarial debate between specialized affirmative and counter-thesis AI agents
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-semibold text-[#03045e] bg-[#caf0f8] px-2.5 py-0.5 rounded-full border border-[#90e0ef]">
          Dialectic Synthesis
        </span>
      </div>

      {/* Dual Debate Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bull Agent (YES Advocate) */}
        <div className="rounded-xl border border-[#0077b6] bg-[#caf0f8]/30 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#0077b6]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0077b6]">
                  {bullAgent.agentName}
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#caf0f8] text-[#0077b6] border border-[#00b4d8]">
                YES Case: {bullAgent.confidenceEstimate}%
              </span>
            </div>

            <div className="text-xs sm:text-sm font-semibold text-[#03045e] border-l-2 border-[#0077b6] pl-3 py-0.5">
              "{bullAgent.headline}"
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#0077b6] uppercase tracking-wide block mb-1.5">
                Core Affirmative Arguments
              </span>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {bullAgent.keyArguments.map((arg, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-[#0077b6] font-bold">&bull;</span>
                    <span>{arg}</span>
                  </li>
                ))}
              </ul>
            </div>

            {bullAgent.empiricalEvidence && bullAgent.empiricalEvidence.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wide block mb-1.5">
                  Supporting Empirical Evidence
                </span>
                <ul className="space-y-1 text-xs text-stone-600">
                  {bullAgent.empiricalEvidence.map((ev, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-stone-400 font-mono text-[10px]">[E{i + 1}]</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#90e0ef] text-[11px] text-stone-600">
            <strong className="text-[#03045e]">Primary Vulnerability:</strong> {bullAgent.vulnerabilities}
          </div>
        </div>

        {/* Bear Agent (NO Advocate) */}
        <div className="rounded-xl border border-[#03045e]/40 bg-[#caf0f8]/15 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-[#03045e]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#03045e]">
                  {bearAgent.agentName}
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#caf0f8] text-[#03045e] border border-[#90e0ef]">
                NO Case: {bearAgent.confidenceEstimate}%
              </span>
            </div>

            <div className="text-xs sm:text-sm font-semibold text-[#03045e] border-l-2 border-[#03045e] pl-3 py-0.5">
              "{bearAgent.headline}"
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#03045e] uppercase tracking-wide block mb-1.5">
                Core Skeptical Counter-Arguments
              </span>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {bearAgent.keyArguments.map((arg, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-[#03045e] font-bold">&bull;</span>
                    <span>{arg}</span>
                  </li>
                ))}
              </ul>
            </div>

            {bearAgent.empiricalEvidence && bearAgent.empiricalEvidence.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wide block mb-1.5">
                  Friction Points &amp; Failure Precedents
                </span>
                <ul className="space-y-1 text-xs text-stone-600">
                  {bearAgent.empiricalEvidence.map((ev, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-stone-400 font-mono text-[10px]">[F{i + 1}]</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#90e0ef] text-[11px] text-stone-600">
            <strong className="text-[#03045e]">Primary Vulnerability:</strong> {bearAgent.vulnerabilities}
          </div>
        </div>
      </div>

      {/* Synthesizer Verdict */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#03045e] text-white space-y-3 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#00b4d8]">
          <BrainCircuit className="w-4 h-4 text-[#00b4d8]" />
          <span>Superforecaster Synthesis &amp; Calibration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[#90e0ef] font-semibold block">Core Dialectic Conflict</span>
            <p className="text-[#caf0f8]/90 leading-relaxed">
              {synthesis.coreConflict}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[#90e0ef] font-semibold block">Base Rate / Reference Class</span>
            <p className="text-[#caf0f8]/90 leading-relaxed">
              {synthesis.baseRateContext}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[#90e0ef] font-semibold block">Calibration &amp; Weighting Rationale</span>
            <p className="text-[#caf0f8]/90 leading-relaxed">
              {synthesis.weightingRationale}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
