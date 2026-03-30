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
      className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold py-3.5 rounded-xl text-sm transition-colors"
    >
      Sign Out
    </button>
  );
}
