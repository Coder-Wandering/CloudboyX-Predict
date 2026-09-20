import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, Scale, BookOpen, Calculator } from 'lucide-react';

interface PipelineProgressProps {
  isLoading: boolean;
}

export const PipelineProgress: React.FC<PipelineProgressProps> = ({ isLoading }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      label: 'Deconstructing Event Criteria',
      desc: 'Defining unambiguous YES/NO triggers, reporting authority, and potential edge-case ambiguities',
      icon: BookOpen,
    },
    {
      label: 'Analyzing Base Rates & Precedents',
      desc: 'Grounding in historical reference classes, frequency distributions, and macro momentum',
      icon: Sparkles,
    },
    {
      label: 'Agent Veritas: Building YES Case',
      desc: 'Formulating affirmative thesis, leading indicators, and supporting empirical evidence',
      icon: Scale,
    },
    {
      label: 'Agent Skeptic: Building NO Counter-Case',
      desc: 'Auditing friction points, execution traps, strict binary settlement risks, and counterarguments',
      icon: Scale,
    },
    {
      label: 'Synthesizing Calibrated Odds & Expected Value',
      desc: 'Brier-score calibration, 90% confidence intervals, market contract pricing, and Kelly sizing',
      icon: Calculator,
    },
  ];

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#90e0ef] bg-[#caf0f8]/20 p-6 shadow-xs animate-in fade-in duration-300">
      <div className="flex items-center space-x-2.5 mb-4">
        <div className="w-5 h-5 rounded-full border-2 border-[#0077b6] border-t-transparent animate-spin" />
        <h2 className="text-base font-semibold text-[#03045e]">
          Running Automated Forecasting Pipeline
        </h2>
        <span className="text-xs text-[#03045e] bg-[#caf0f8] border border-[#90e0ef] px-2 py-0.5 rounded-full font-medium">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const StepIcon = step.icon;

          return (
            <div
              key={idx}
              className={`flex items-start space-x-3 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-white border-[#0077b6] shadow-xs'
                  : isDone
                  ? 'bg-stone-50/70 border-stone-200 opacity-80'
                  : 'bg-transparent border-transparent opacity-40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#0077b6]" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#0077b6] animate-spin" />
                ) : (
                  <StepIcon className="w-4 h-4 text-stone-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold ${isCurrent ? 'text-[#03045e]' : 'text-stone-700'}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
