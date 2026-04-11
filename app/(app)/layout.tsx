import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OracleSidebar } from '@/components/layout/OracleSidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let userName:  string | undefined;
  let userEmail: string | undefined;
  let avatarUrl: string | undefined;

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      redirect('/sign-in');
    }

    userEmail = user.email ?? undefined;
    userName  = (user.user_metadata?.full_name as string | undefined)
             ?? (user.user_metadata?.name as string | undefined)
             ?? undefined;
    avatarUrl = (user.user_metadata?.avatar_url as string | undefined)
             ?? (user.user_metadata?.picture as string | undefined)
             ?? undefined;
  } catch {
    redirect('/sign-in');
  }

  return (
    <div className="flex min-h-screen bg-oracle-base">
      {/* Fixed sidebar */}
      <OracleSidebar
        lifeScore={72}
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
      />

      {/* Main content — offset by sidebar width */}
      <main className="ml-64 flex-1 min-h-screen bg-oracle-base">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
