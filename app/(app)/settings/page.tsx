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
      <div>
        <p className="oracle-label mb-1">Oracle Intelligence</p>
        <h1 className="text-2xl font-black text-oracle-bright">Settings</h1>
      </div>

      {/* Account info */}
      <Section icon={<Shield size={16} className="text-oracle-teal" />} title="Your account">
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-oracle-bright text-sm">Email</p>
            <p className="text-oracle-muted text-sm">{user.email}</p>
          </div>
          <span className="bg-oracle-teal/10 text-oracle-teal border border-oracle-teal/20 text-xs font-semibold px-2.5 py-1 rounded-full">
            Free plan
          </span>
        </div>
        <div className="py-3 border-t border-oracle-border">
          <Link href="/pricing" className="text-sm text-oracle-teal font-semibold hover:text-oracle-teal-dim transition-colors">
            Upgrade to Pro — unlock all actions →
          </Link>
        </div>
      </Section>

      {/* Connected banks */}
      <Section icon={<CreditCard size={16} className="text-oracle-teal" />} title="Connected bank accounts">
        {accounts.length === 0 ? (
          <div className="py-5 text-center">
            <p className="text-oracle-muted text-sm mb-3">No bank accounts connected yet.</p>
            <Link
              href="/onboarding/connect-bank"
              className="text-sm font-semibold text-oracle-teal hover:text-oracle-teal-dim transition-colors"
            >
              + Connect a bank account
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-oracle-border">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="font-medium text-oracle-bright text-sm">{account.institution_name}</p>
                  <p className="text-oracle-muted text-xs mt-0.5">{account.account_name} ••••{account.mask}</p>
                </div>
                <button className="text-oracle-crimson hover:text-red-400 text-sm font-medium transition-colors">
                  Disconnect
                </button>
              </div>
            ))}
            <div className="pt-3 pb-1">
              <Link href="/onboarding/connect-bank" className="text-sm font-semibold text-oracle-teal hover:text-oracle-teal-dim transition-colors">
                + Add another bank
              </Link>
            </div>
          </div>
        )}
      </Section>

      {/* Connected email */}
      <Section icon={<Bell size={16} className="text-oracle-teal" />} title="Connected email accounts">
        {emailConns.length === 0 ? (
          <div className="py-5 text-center">
            <p className="text-oracle-muted text-sm mb-1">No email connected.</p>
            <p className="text-oracle-muted/60 text-xs mb-3">Email scanning finds ~40% more issues.</p>
            <Link href="/onboarding/connect-email" className="text-sm font-semibold text-oracle-teal hover:text-oracle-teal-dim transition-colors">
              + Connect email
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-oracle-border">
            {emailConns.map((conn) => (
              <div key={conn.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="font-medium text-oracle-bright text-sm">{conn.email_address}</p>
                  <p className="text-oracle-muted text-xs mt-0.5 capitalize">{conn.provider}</p>
                </div>
                <button className="text-oracle-crimson hover:text-red-400 text-sm font-medium transition-colors">
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Security */}
      <Section icon={<Lock size={16} className="text-oracle-teal" />} title="Security">
        <div className="divide-y divide-oracle-border">
          {[
            'Oracle never stores your bank login credentials',
            'All data is encrypted in transit and at rest',
            'Bank access is read-only — Oracle cannot move money',
            'Disconnect any account instantly at any time',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 py-3">
              <span className="text-oracle-teal font-bold text-sm shrink-0">✓</span>
              <p className="text-oracle-text text-sm">{item}</p>
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

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="oracle-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-oracle-border">
        {icon}
        <h2 className="font-bold text-oracle-bright text-sm">{title}</h2>
      </div>
      <div className="px-6 py-1">{children}</div>
    </div>
  );
}
