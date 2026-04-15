'use client';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch { /* demo mode — no Supabase */ }
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full border border-keeper-red/40 text-keeper-red hover:bg-keeper-red/10 font-semibold py-3.5 rounded-xl text-sm transition-colors"
    >
      Sign Out
    </button>
  );
}
