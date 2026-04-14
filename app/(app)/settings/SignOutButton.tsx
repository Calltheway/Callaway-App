'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full border border-oracle-crimson/40 text-oracle-crimson hover:bg-oracle-crimson/10 font-semibold py-3.5 rounded-xl text-sm transition-colors"
    >
      Sign Out
    </button>
  );
}
