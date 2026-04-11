import { OracleSidebar } from '@/components/layout/OracleSidebar';

// DEMO MODE: Auth check disabled so all pages are visible without Supabase setup.
// To enable auth, uncomment the block below and remove the demo defaults.

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Demo user — replace with real auth when Supabase is configured
  const userName  = 'Demo User';
  const userEmail = 'demo@oracle.ai';
  const avatarUrl = undefined;

  /* — Uncomment to enable real auth —
  import { redirect } from 'next/navigation';
  import { createClient } from '@/lib/supabase/server';

  let userName: string | undefined;
  let userEmail: string | undefined;
  let avatarUrl: string | undefined;
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) redirect('/sign-in');
    userEmail = user.email ?? undefined;
    userName  = user.user_metadata?.full_name ?? user.user_metadata?.name ?? undefined;
    avatarUrl = user.user_metadata?.avatar_url ?? undefined;
  } catch {
    redirect('/sign-in');
  }
  */

  return (
    <div className="flex min-h-screen bg-oracle-base">
      <OracleSidebar
        lifeScore={71}
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
      />
      <main className="ml-64 flex-1 min-h-screen bg-oracle-base">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
