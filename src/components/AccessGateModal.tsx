import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Lock, ArrowRight, Sparkles, CheckCircle2, AlertTriangle, Eye, EyeOff, UserCheck } from 'lucide-react';
import { CloudboyXLogo } from './CloudboyXLogo';

export interface UserSession {
  username: string;
  role: 'VIP Beta Tester' | 'Institutional Analyst' | 'Administrator';
  accessKey: string;
  authenticatedAt: string;
}

interface AccessGateModalProps {
  onAuthenticate: (session: UserSession) => void;
  defaultPasscodeHint?: string;
}

// Pre-approved passcodes for instant VIP / Beta access
const VALID_PASSCODES: Record<string, { username: string; role: UserSession['role'] }> = {
  'CLOUDBOY-VIP-2026': { username: 'Cloudboy Partner', role: 'VIP Beta Tester' },
  'PREDICT-BETA-77': { username: 'Quant Beta Analyst', role: 'Institutional Analyst' },
  'ALPHA-ACCESS-001': { username: 'Lead Researcher', role: 'Institutional Analyst' },
  'ADMIN-MASTER-999': { username: 'System Administrator', role: 'Administrator' },
  'VIP': { username: 'VIP Member', role: 'VIP Beta Tester' },
  'BETA': { username: 'Beta Explorer', role: 'VIP Beta Tester' },
  'DEMO': { username: 'Guest Analyst', role: 'VIP Beta Tester' },
};

export const AccessGateModal: React.FC<AccessGateModalProps> = ({ onAuthenticate }) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customName, setCustomName] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleaned = passcode.trim().toUpperCase();

    if (!cleaned) {
      setError('Please enter your VIP access passcode or invitation key.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const match = VALID_PASSCODES[cleaned];
      if (match) {
        const session: UserSession = {
          username: customName.trim() || match.username,
          role: match.role,
          accessKey: cleaned,
          authenticatedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem('cloudboy_user_session', JSON.stringify(session));
        } catch {
          // ignore
        }
        setIsLoading(false);
        onAuthenticate(session);
      } else {
        setIsLoading(false);
        setError('Invalid access key. Use one of the beta keys below or contact gocloudboy2@gmail.com for credentials.');
      }
    }, 400);
  };

  const handleQuickKey = (key: string) => {
    setPasscode(key);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-[#03045e] via-[#023e8a] to-[#0077b6] p-6 text-white text-center relative">
          <div className="flex justify-center mb-3">
            <CloudboyXLogo size={42} variant="badge" includePredict={true} />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[#90e0ef] text-xs font-medium border border-white/20 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Private VIP &amp; Beta Gatekeeper</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">CloudboyX Predict</h2>
          <p className="text-xs text-stone-200 mt-1 max-w-xs mx-auto">
            Institutional econometric forecasting &amp; quantitative prediction market intelligence.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>VIP Access Key / Passcode</span>
              <span className="text-[11px] font-normal text-stone-500">Case-insensitive</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (e.g. VIP or DEMO)"
                className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder:text-stone-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-transparent transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                title={showPasscode ? 'Hide' : 'Show'}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Your Name / Identifier (Optional)</span>
              <span className="text-[11px] font-normal text-stone-500">For workspace attribution</span>
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Alex (Capital Partners)"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#03045e] hover:bg-[#023e8a] active:bg-[#0077b6] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Verifying Access...</span>
              </span>
            ) : (
              <>
                <span>Enter Prediction Suite</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick-Click Beta Test Keys */}
          <div className="pt-3 border-t border-stone-100">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pre-authorized Beta Keys (Click to auto-fill)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'VIP Pass', key: 'VIP', desc: 'VIP Member' },
                { label: 'Demo Key', key: 'DEMO', desc: 'Guest Analyst' },
                { label: 'Beta Pass', key: 'BETA', desc: 'Beta Explorer' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleQuickKey(item.key)}
                  className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    passcode.trim().toUpperCase() === item.key
                      ? 'border-[#0077b6] bg-[#caf0f8]/40 text-[#03045e] font-bold'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{item.key}</div>
                  <div className="text-[10px] text-stone-500 truncate">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-stone-400">
              Need custom enterprise provisioning? Inquire at{' '}
              <a
                href="mailto:gocloudboy2@gmail.com?subject=CloudboyX%20Predict%20VIP%20Access"
                className="text-[#0077b6] hover:underline font-medium"
              >
                gocloudboy2@gmail.com
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
