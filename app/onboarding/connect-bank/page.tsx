'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock, Eye, Shield, Zap } from 'lucide-react';

export default function ConnectBankPage() {
  const router = useRouter();
  const [loading,   setLoading]   = useState(false);
  const [connected, setConnected] = useState(false);

  // In production: fetch /api/plaid/link-token, then open Plaid Link SDK.
  // The Plaid Link SDK opens a secure iframe where the user logs into their
  // bank directly — Keeper never sees the credentials.
  // For now this simulates a successful sandbox connection.
  const handleConnect = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real Plaid Link flow:
      // 1. const res = await fetch('/api/plaid/link-token', { method: 'POST' });
      // 2. const { link_token } = await res.json();
      // 3. Open Plaid Link with link_token
      // 4. On success, POST to /api/plaid/exchange with public_token
      await new Promise((r) => setTimeout(r, 1500));
      setConnected(true);
    } finally {
      setLoading(false);
    }
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
              <div key={i} className={`h-1.5 w-12 rounded-full ${i <= 2 ? 'bg-emerald-400' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-10">
        <div className="max-w-xl mx-auto">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Step 2 of 3</p>
          <h1 className="text-3xl font-black mb-3">Connect your bank</h1>
          <p className="text-white/60 leading-relaxed mb-8">
            Keeper uses Plaid to securely read your transactions. You log in directly to your bank — Keeper never sees your credentials.
          </p>

          {/* Security bullets */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-4">
            {[
              { icon: Lock,   text: 'You log in directly to your bank — Keeper never sees your password' },
              { icon: Eye,    text: 'Read-only access. We can see transactions but cannot move money' },
              { icon: Shield, text: 'Works with 11,000+ US banks including Chase, BofA, Wells Fargo, Citi' },
              { icon: Zap,    text: 'Keeper analyzes the last 90 days of transactions automatically' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-sm text-white/70">{text}</p>
              </div>
            ))}
          </div>

          {connected ? (
            <div className="space-y-4">
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-6 text-center">
                <p className="text-5xl mb-3">✓</p>
                <p className="text-emerald-400 font-bold text-lg mb-1">Bank connected!</p>
                <p className="text-white/60 text-sm">Chase Bank (••••4242) is connected. Keeper will now analyze your transactions.</p>
              </div>
              <button
                onClick={() => router.push('/onboarding/connect-email')}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Lock size={16} /> Connect my bank securely</>}
              </button>
              <Link
                href="/onboarding/connect-email"
                className="w-full inline-flex items-center justify-center text-white/50 hover:text-white/80 font-medium py-3 text-sm transition-colors"
              >
                Skip for now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
