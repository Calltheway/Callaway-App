'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useUnhookedStore } from '@/store/useUnhookedStore';

export default function RootPage() {
  const router = useRouter();
  const { onboardingComplete } = useUnhookedStore();

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = getSupabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          if (onboardingComplete) {
            router.replace('/dashboard');
          } else {
            router.replace('/onboarding');
          }
        } else {
          router.replace('/auth');
        }
      } catch {
        router.replace('/auth');
      }
    }

    checkAuth();
  }, [router, onboardingComplete]);

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center animate-pulse">
          <span className="text-3xl font-black text-[#00D4FF]">U</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Unhooked</h1>
        <p className="text-gray-400 text-sm">Loading your journey...</p>
      </div>
    </div>
  );
}
