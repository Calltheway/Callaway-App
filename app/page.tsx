'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useDopamindStore } from '@/store/useDopamindStore';

export default function RootPage() {
  const router = useRouter();
  const { onboardingComplete } = useDopamindStore();

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
    <div className="min-h-screen bg-[#050810] flex items-center justify-center relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="relative mx-auto mb-6 w-24 h-24">
          <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center animate-pulse-glow">
            <span className="text-4xl font-black text-white tracking-tighter">D</span>
          </div>
          {/* Spinning ring */}
          <div className="absolute inset-[-4px] rounded-[20px] border-2 border-transparent animate-spin-slow"
            style={{ background: 'linear-gradient(#050810, #050810) padding-box, linear-gradient(135deg, rgba(124,58,237,0.6), rgba(0,212,255,0.6)) border-box' }}
          />
        </div>

        <h1 className="text-3xl font-black mb-1">
          <span className="gradient-text">Dopamind</span>
        </h1>
        <p className="text-[#94A3B8] text-sm font-medium tracking-wider uppercase">Rewire. Reclaim. Rise.</p>

        {/* Loading indicator */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
