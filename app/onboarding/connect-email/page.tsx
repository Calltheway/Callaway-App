'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function ConnectEmailPage() {
  const router = useRouter();
  const [gmailConnected,   setGmailConnected]   = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [loadingGmail,     setLoadingGmail]     = useState(false);
  const [loadingOutlook,   setLoadingOutlook]   = useState(false);

  // In production: use next-auth or expo-auth-session OAuth flows.
  // Scopes: gmail.readonly (financial senders only).
  const connectGmail = async () => {
    setLoadingGmail(true);
    await new Promise((r) => setTimeout(r, 1200));
    setGmailConnected(true);
    setLoadingGmail(false);
  };

  const connectOutlook = async () => {
    setLoadingOutlook(true);
    await new Promise((r) => setTimeout(r, 1200));
    setOutlookConnected(true);
    setLoadingOutlook(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-950 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-xs">K</div>
            <span className="font-bold">Keeper</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-1.5 w-12 rounded-full bg-emerald-400" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-10">
        <div className="max-w-xl mx-auto">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Step 3 of 3</p>
          <h1 className="text-3xl font-black mb-3">Connect your email</h1>
          <p className="text-white/60 leading-relaxed mb-2">
            Keeper scans for receipts, price-change notices, and renewal emails — finding issues your bank alone can't show.
          </p>
          <p className="text-white/40 text-sm mb-8">Optional, but finds ~40% more issues.</p>

          <div className="space-y-3 mb-8">
            {/* Gmail */}
            <button
              onClick={gmailConnected ? undefined : connectGmail}
              disabled={loadingGmail}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all ${
                gmailConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold shrink-0">G</div>
              <div className="flex-1">
                <p className="font-semibold">{gmailConnected ? 'Gmail connected ✓' : 'Connect Gmail'}</p>
                <p className="text-white/50 text-sm">{gmailConnected ? 'Keeper is scanning for receipts' : 'Read-only · Financial emails only'}</p>
              </div>
              {!gmailConnected && (
                loadingGmail
                  ? <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  : <span className="text-emerald-400">→</span>
              )}
            </button>

            {/* Outlook */}
            <button
              onClick={outlookConnected ? undefined : connectOutlook}
              disabled={loadingOutlook}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all ${
                outlookConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">M</div>
              <div className="flex-1">
                <p className="font-semibold">{outlookConnected ? 'Outlook connected ✓' : 'Connect Outlook / Hotmail'}</p>
                <p className="text-white/50 text-sm">{outlookConnected ? 'Keeper is scanning for receipts' : 'Read-only · Financial emails only'}</p>
              </div>
              {!outlookConnected && (
                loadingOutlook
                  ? <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  : <span className="text-emerald-400">→</span>
              )}
            </button>
          </div>

          <p className="text-white/30 text-xs text-center mb-6">
            Keeper only reads emails from financial senders. Read-only access, revoke any time.
          </p>

          <button
            onClick={() => router.push('/onboarding/first-scan')}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors"
          >
            {gmailConnected || outlookConnected ? 'Run my first scan' : 'Skip — use bank data only'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
