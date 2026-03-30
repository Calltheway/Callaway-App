import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getIssues } from '@/lib/db';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  const issues    = await getIssues(user.id);
  const newCount  = issues.filter((i) => i.status === 'new').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar issueCount={newCount} />
      <main className="ml-60 min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
