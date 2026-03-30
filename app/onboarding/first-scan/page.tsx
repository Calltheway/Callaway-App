'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  'Fetching 90 days of transactions…',
  'Identifying recurring charges…',
  'Checking for price increases…',
  'Looking for duplicate charges…',
  'Running AI analysis with Claude…',
  'Ranking issues by dollar impact…',
];

export default function FirstScanPage() {
  const router = useRouter();
  const [step,    setStep]    = useState(0);
  const [done,    setDone]    = useState(false);
  const [issues,  setIssues]  = useState(0);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    let i = 0;
    const ticker = setInterval(() => {
      i++;
      setStep(i);
      if (i >= STEPS.length - 1) {
        clearInterval(ticker);
        runAnalysis();
      }
    }, 900);
    return () => clearInterval(ticker);
  }, []);

  const runAnalysis = async () => {
    try {
      const res  = await fetch('/api/analyze', { method: 'POST' });
      const data = await res.json();
      setIssues(data.issuesFound ?? 0);
      setSavings(data.potentialSavings ?? 0);
    } catch {
      // Still complete onboarding even if analysis fails
    } finally {
      setDone(true);
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const progress = Math.min(((step + 1) / STEPS.length) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {!done ? (
          <>
            {/* Animated logo */}
            <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-4xl mx-auto mb-8 shadow-lg shadow-emerald-500/30">
              K
            </div>

            <h1 className="text-2xl font-black mb-2">Keeper is scanning…</h1>
            <p className="text-white/50 text-sm mb-10">
              Analyzing your last 90 days of transactions for money you're losing.
            </p>

            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-emerald-400 text-sm mb-8">{STEPS[Math.min(step, STEPS.length - 1)]}</p>

            {/* Step list */}
            <div className="text-left space-y-2.5">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    i < step ? 'bg-emerald-500 text-white' :
                    i === step ? 'bg-emerald-500/30 text-emerald-400' :
                    'bg-white/10 text-white/20'
                  }`}>
                    {i < step ? '✓' : ''}
                  </div>
                  <span className={`text-sm ${i <= step ? 'text-white/80' : 'text-white/25'}`}>{s}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {issues > 0 ? (
              <>
                <div className="text-6xl mb-6">💰</div>
                <h1 className="text-3xl font-black mb-2">Keeper found {issues} {issues === 1 ? 'issue' : 'issues'}</h1>
                {savings > 0 && (
                  <p className="text-5xl font-black text-emerald-400 my-4">{fmt(savings)}</p>
                )}
                <p className="text-white/60 mb-10">in potential monthly savings. Let's get your money back.</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">🔍</div>
                <h1 className="text-3xl font-black mb-3">Scan complete</h1>
                <p className="text-white/60 mb-10">Connect a bank account so Keeper has transactions to analyze. Most users find their first issue within 60 seconds of connecting.</p>
              </>
            )}

            <button
              onClick={() => router.replace('/dashboard')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors"
            >
              {issues > 0 ? 'See my issues →' : 'Go to dashboard →'}
            </button>
            <p className="text-white/30 text-xs mt-4">Keeper re-scans daily and notifies you when new issues are found</p>
          </>
        )}
      </div>
    </div>
  );
}
