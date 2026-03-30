import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAccounts, getEmailConnections } from '@/lib/db';
import { SignOutButton } from './SignOutButton';
import Link from 'next/link';
import { Shield, CreditCard, Bell, Lock } from 'lucide-react';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const [accounts, emailConns] = await Promise.all([
    getAccounts(user.id),
    getEmailConnections(user.id),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-black text-navy-900">Settings</h1>

      {/* Account info */}
      <Section icon={<Shield size={16} className="text-emerald-500" />} title="Your account">
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-navy-900 text-sm">Email</p>
            <p className="text-slate-500 text-sm">{user.email}</p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">Free plan</span>
        </div>
        <div className="py-3 border-t border-slate-100">
          <Link href="/pricing" className="text-sm text-emerald-600 font-semibold hover:text-emerald-700">
            Upgrade to Pro — unlock actions →
          </Link>
        </div>
      </Section>

      {/* Connected banks */}
      <Section icon={<CreditCard size={16} className="text-emerald-500" />} title="Connected bank accounts">
        {accounts.length === 0 ? (
          <div className="py-5 text-center">
            <p className="text-slate-500 text-sm mb-3">No bank accounts connected yet.</p>
            <Link
              href="/onboarding/connect-bank"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              + Connect a bank account
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="font-medium text-navy-900 text-sm">{account.institution_name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{account.account_name} ••••{account.mask}</p>
                </div>
                <button className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                  Disconnect
                </button>
              </div>
            ))}
            <div className="pt-3">
              <Link href="/onboarding/connect-bank" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                + Add another bank
              </Link>
            </div>
          </div>
        )}
      </Section>

      {/* Connected email */}
      <Section icon={<Bell size={16} className="text-emerald-500" />} title="Connected email accounts">
        {emailConns.length === 0 ? (
          <div className="py-5 text-center">
            <p className="text-slate-500 text-sm mb-1">No email connected.</p>
            <p className="text-slate-400 text-xs mb-3">Email scanning finds ~40% more issues.</p>
            <Link href="/onboarding/connect-email" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              + Connect email
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {emailConns.map((conn) => (
              <div key={conn.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="font-medium text-navy-900 text-sm">{conn.email_address}</p>
                  <p className="text-slate-500 text-xs mt-0.5 capitalize">{conn.provider}</p>
                </div>
                <button className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Security */}
      <Section icon={<Lock size={16} className="text-emerald-500" />} title="Security">
        <div className="divide-y divide-slate-100">
          {[
            'Keeper never stores your bank login credentials',
            'All data is encrypted in transit and at rest',
            'Bank access is read-only — Keeper cannot move money',
            'Disconnect any account instantly at any time',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 py-3">
              <span className="text-emerald-500 font-bold text-sm shrink-0">✓</span>
              <p className="text-slate-600 text-sm">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Sign out */}
      <div>
        <SignOutButton />
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
        {icon}
        <h2 className="font-bold text-navy-900 text-sm">{title}</h2>
      </div>
      <div className="px-6 py-1">{children}</div>
    </div>
  );
}
