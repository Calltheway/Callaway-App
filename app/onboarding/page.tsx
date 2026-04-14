import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CAN_DO = [
  'See your bank transactions (read-only)',
  'Scan your email for receipts and price-change notices',
  'Identify every recurring charge on your accounts',
  'Find billing errors and price increases',
  'Help you cancel, dispute, or negotiate',
];

const CANNOT_DO = [
  'Move, transfer, or send your money — ever',
  'See your bank username or password',
  'Access accounts you haven\'t connected',
  'Share your data with advertisers or third parties',
];

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-oracle-navy to-oracle-base text-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-xs">K</div>
            <span className="font-bold text-white">Keeper</span>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 w-12 rounded-full ${i === 1 ? 'bg-emerald-400' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-10">
        <div className="max-w-xl mx-auto">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Step 1 of 3</p>
          <h1 className="text-3xl font-black mb-3">What Keeper can and cannot do</h1>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            Before you connect anything, here's exactly what access you're granting.
          </p>

          {/* Can do */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-4">
            <p className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
              <span>✓</span> What Keeper CAN do
            </p>
            <ul className="space-y-3">
              {CAN_DO.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Cannot do */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <p className="text-white/70 font-bold mb-4 flex items-center gap-2">
              <span>✗</span> What Keeper CANNOT do
            </p>
            <ul className="space-y-3">
              {CANNOT_DO.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/50">
                  <span className="shrink-0 mt-0.5">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/onboarding/connect-bank"
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors"
          >
            I understand — Connect my bank <ArrowRight size={18} />
          </Link>

          <p className="text-center text-white/30 text-xs mt-4">
            Bank connections handled by Plaid, used by 7,000+ apps including Venmo and Robinhood
          </p>
        </div>
      </div>
    </div>
  );
}
