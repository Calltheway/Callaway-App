import { DEMO_ISSUES, DEMO_TOTAL_SAVED, DEMO_ACCOUNTS } from '@/lib/demo-data';
import { SignOutButton } from '../settings/SignOutButton';
import Link from 'next/link';
import { Shield, Building2, FileText, ExternalLink } from 'lucide-react';

export default function ProfilePage() {
  const resolved = DEMO_ISSUES.filter((i) => i.status === 'resolved').length;
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <p className="keeper-label mb-1">Keeper · Profile</p>
        <h1 className="text-2xl font-bold text-keeper-bright">Profile</h1>
      </div>

      {/* User card */}
      <div className="keeper-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-keeper-green/15 border border-keeper-green/25 flex items-center justify-center">
            <span className="text-keeper-green text-2xl font-black">D</span>
          </div>
          <div>
            <p className="text-keeper-bright font-semibold">demo@keeper.app</p>
            <span className="text-xs font-semibold text-keeper-green bg-keeper-green/10 border border-keeper-green/20 px-2.5 py-0.5 rounded-full">
              Free Plan
            </span>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-keeper-border">
          <Link href="#" className="text-sm text-keeper-green font-semibold hover:text-keeper-green-dim transition-colors">
            Upgrade to Keeper Pro — unlock actions →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="keeper-card p-6">
        <h2 className="font-semibold text-keeper-bright mb-4">Your Impact</h2>
        <div className="space-y-3">
          {[
            { label: 'Total Saved',          value: fmt(DEMO_TOTAL_SAVED),         color: 'text-keeper-green' },
            { label: 'Issues Found',         value: String(DEMO_ISSUES.length),   color: 'text-amber-400'    },
            { label: 'Issues Resolved',      value: String(resolved),              color: 'text-blue-400'     },
            { label: 'Connected Accounts',   value: String(DEMO_ACCOUNTS.length), color: 'text-keeper-bright'},
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-keeper-border/50 last:border-0">
              <span className="text-keeper-text text-sm">{label}</span>
              <span className={`font-bold text-sm ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connected accounts */}
      {DEMO_ACCOUNTS.length > 0 && (
        <div className="keeper-card p-6">
          <h2 className="font-semibold text-keeper-bright mb-4 flex items-center gap-2">
            <Building2 size={15} className="text-keeper-green" /> Connected Accounts
          </h2>
          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.id} className="flex items-center justify-between">
                <div>
                  <p className="text-keeper-bright text-sm font-medium">{account.institution_name}</p>
                  <p className="keeper-label">{account.account_name} ••••{account.mask}</p>
                </div>
                <span className="text-xs text-keeper-green bg-keeper-green/10 px-2.5 py-1 rounded-full capitalize">
                  {account.account_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security */}
      <div className="keeper-card p-6">
        <h2 className="font-semibold text-keeper-bright mb-4 flex items-center gap-2">
          <Shield size={15} className="text-keeper-green" /> Security
        </h2>
        <div className="space-y-2">
          {[
            'Keeper never stores your bank login credentials',
            'All data is encrypted in transit and at rest',
            'Bank access is read-only — Keeper cannot move money',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <span className="text-keeper-green text-sm shrink-0 mt-0.5">✓</span>
              <p className="text-keeper-text text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal */}
      <div className="keeper-card p-6">
        <h2 className="font-semibold text-keeper-bright mb-4 flex items-center gap-2">
          <FileText size={15} className="text-keeper-green" /> Legal
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Investment Disclaimer', href: '#' },
            { label: 'Privacy Policy',        href: '#' },
            { label: 'Terms of Service',      href: '#' },
          ].map(({ label, href }) => (
            <div key={label} className="flex items-center justify-between border-b border-keeper-border/50 last:border-0 pb-3 last:pb-0">
              <span className="text-keeper-text text-sm">{label}</span>
              <ExternalLink size={13} className="text-keeper-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <SignOutButton />

      {/* Version */}
      <div className="flex items-center justify-between px-1">
        <span className="keeper-label">Version</span>
        <span className="keeper-label">1.0 · Powered by Claude AI</span>
      </div>
    </div>
  );
}
