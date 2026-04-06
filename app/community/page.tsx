'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUnhookedStore } from '@/store/useUnhookedStore';
import { getSupabaseBrowser } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Heart, Plus, Trophy, Users } from 'lucide-react';

interface CommunityPost {
  id: string;
  content: string;
  streak_days: number;
  likes: number;
  created_at: string;
}

const DEMO_POSTS: CommunityPost[] = [
  { id: '1', content: 'Hit 30 days today. My mind is clearer than it\'s been in years. If you\'re on day 1, I promise it gets better.', streak_days: 30, likes: 47, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', content: 'Almost relapsed tonight. Did the theta session instead. The urge passed in 12 minutes. These brainwave sessions are no joke.', streak_days: 14, likes: 31, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', content: 'Week 1 done. The HRV breathwork is my secret weapon. Every time I feel a craving I do the 4-7-8 and it works.', streak_days: 7, likes: 22, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', content: 'Day 90. I am free. Not just from the habit — from the shame. You can do this.', streak_days: 90, likes: 128, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: '5', content: 'Three months ago I was hiding. Now I look people in the eye. The confidence is real.', streak_days: 90, likes: 85, created_at: new Date(Date.now() - 259200000).toISOString() },
];

const WEEKLY_LEADERS = [
  { rank: 1, name: 'A****n', days: 94, emoji: '🏆' },
  { rank: 2, name: 'M****k', days: 87, emoji: '🥈' },
  { rank: 3, name: 'J****s', days: 73, emoji: '🥉' },
  { rank: 4, name: 'R****l', days: 61, emoji: '⚡' },
  { rank: 5, name: 'C****e', days: 58, emoji: '⚡' },
];

export default function CommunityPage() {
  const router = useRouter();
  const { isPremium, streakDays, userId } = useUnhookedStore();

  const [posts, setPosts] = useState<CommunityPost[]>(DEMO_POSTS);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'feed' | 'leaderboard'>('feed');

  useEffect(() => {
    async function loadPosts() {
      try {
        const supabase = getSupabaseBrowser();
        const { data } = await supabase
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        if (data && data.length > 0) setPosts(data as CommunityPost[]);
      } catch { /* use demo */ }
    }
    loadPosts();
  }, []);

  async function handlePost() {
    if (!newPost.trim() || !isPremium) return;
    setPosting(true);
    try {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase
        .from('community_posts')
        .insert({ user_id: userId, content: newPost.trim(), streak_days: streakDays })
        .select()
        .single();
      if (data) setPosts((prev) => [data as CommunityPost, ...prev]);
      setNewPost('');
    } catch { /* demo mode */ }
    setPosting(false);
  }

  function toggleLike(postId: string) {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + (likedPosts.has(postId) ? -1 : 1) } : p
      )
    );
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-24">
      <div className="bg-[#060912] border-b border-[#1E2A3A] px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-black text-white">Community</h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setView('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'feed' ? 'bg-[#00D4FF] text-[#0A0E1A]' : 'text-gray-400 hover:text-white'}`}
          >
            <Users size={14} className="inline mr-1" />Feed
          </button>
          <button
            onClick={() => setView('leaderboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'leaderboard' ? 'bg-[#00D4FF] text-[#0A0E1A]' : 'text-gray-400 hover:text-white'}`}
          >
            <Trophy size={14} className="inline mr-1" />Board
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {view === 'feed' && (
          <>
            {/* Post composer — premium only */}
            {isPremium ? (
              <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-4">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share a win, encouragement, or insight... (anonymous)"
                  rows={3}
                  className="w-full bg-[#060912] border border-[#1E2A3A] rounded-xl p-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00D4FF] resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-gray-600 text-xs">Day {streakDays} · Anonymous post</p>
                  <button
                    onClick={handlePost}
                    disabled={!newPost.trim() || posting}
                    className="bg-[#00D4FF] text-[#0A0E1A] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#00B8E0] transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    <Plus size={14} /> Post
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#111827] border border-[#FFD700]/30 rounded-2xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-2">Premium members can post wins and connect</p>
                <button className="bg-[#FFD700] text-[#0A0E1A] font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-400 transition-all">
                  Upgrade to Post
                </button>
              </div>
            )}

            {/* Feed */}
            {posts.map((post) => (
              <div key={post.id} className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                    <span className="text-[#00D4FF] text-xs font-black">🔓</span>
                  </div>
                  <div>
                    <p className="text-[#00D4FF] text-xs font-bold">Day {post.streak_days} Warrior</p>
                    <p className="text-gray-600 text-xs">{timeAgo(post.created_at)}</p>
                  </div>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed mb-3">"{post.content}"</p>
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 text-xs transition-all ${likedPosts.has(post.id) ? 'text-red-400' : 'text-gray-600 hover:text-red-400'}`}
                >
                  <Heart size={14} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                  {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                </button>
              </div>
            ))}
          </>
        )}

        {view === 'leaderboard' && (
          <>
            <div className="bg-[#111827] border border-[#FFD700]/30 rounded-2xl p-5">
              <h3 className="text-[#FFD700] font-bold mb-4 flex items-center gap-2">
                <Trophy size={18} /> Weekly Streak Leaderboard
              </h3>
              <div className="space-y-3">
                {WEEKLY_LEADERS.map((leader) => (
                  <div key={leader.rank} className={`flex items-center gap-3 p-3 rounded-xl ${leader.rank === 1 ? 'bg-[#FFD700]/10 border border-[#FFD700]/30' : 'bg-[#060912]'}`}>
                    <span className="text-xl">{leader.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{leader.name}</p>
                      <div className="h-1.5 bg-[#1E2A3A] rounded-full mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-[#00D4FF] to-[#FFD700] rounded-full"
                          style={{ width: `${(leader.days / 94) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[#00D4FF] font-black text-sm">{leader.days}d</span>
                  </div>
                ))}
              </div>
              {streakDays > 0 && (
                <div className="mt-4 pt-4 border-t border-[#1E2A3A]">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/20">
                    <span className="text-xl">⚡</span>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">You</p>
                      <div className="h-1.5 bg-[#1E2A3A] rounded-full mt-1">
                        <div
                          className="h-full bg-[#00D4FF] rounded-full"
                          style={{ width: `${Math.min(100, (streakDays / 94) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[#00D4FF] font-black text-sm">{streakDays}d</span>
                  </div>
                </div>
              )}
            </div>

            {/* Battle buddy */}
            <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">🤝</div>
              <h3 className="text-white font-bold mb-1">Battle Buddy System</h3>
              <p className="text-gray-400 text-sm mb-4">Get matched with an accountability partner at a similar streak stage for weekly check-ins.</p>
              {isPremium ? (
                <button className="bg-[#00D4FF] text-[#0A0E1A] font-bold px-6 py-3 rounded-xl hover:bg-[#00B8E0] transition-all text-sm">
                  Find My Battle Buddy
                </button>
              ) : (
                <button className="bg-[#FFD700] text-[#0A0E1A] font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all text-sm">
                  Premium Feature — Upgrade
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
