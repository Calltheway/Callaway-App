import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RecoveryStyle = 'solo' | 'community';
export type Level = 0 | 1 | 2 | 3 | 4 | 5;

export const LEVEL_NAMES: Record<number, string> = {
  0: 'Slave',
  1: 'Awakened',
  2: 'Warrior',
  3: 'Champion',
  4: 'Legend',
  5: 'Free',
};

export const LEVEL_XP_THRESHOLDS = [0, 100, 300, 700, 1500, 3000];

function calcLevel(xp: number): Level {
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) return i as Level;
  }
  return 0;
}

export interface RelapseLog {
  id: string;
  trigger: string;
  mood: number;
  note: string;
  timestamp: string;
}

export interface DopamindState {
  // User profile
  userId: string | null;
  userName: string | null;
  sobrietyStartDate: string | null;
  habitType: string | null;
  motivations: string[];
  recoveryStyle: RecoveryStyle;
  dailyCommitmentMinutes: number;

  // Streak
  streakDays: number;
  streakHours: number;
  streakMinutes: number;
  streakSeconds: number;

  // Gamification
  xpTotal: number;
  level: Level;

  // Settings
  epilepsySafeMode: boolean;
  hasSeenEpilepsyWarning: boolean;
  isPremium: boolean;

  // Onboarding
  onboardingComplete: boolean;
  ybocsSeverity: number;

  // Relapse history
  relapseLog: RelapseLog[];

  // Actions
  setUserProfile: (profile: Partial<DopamindState>) => void;
  addXP: (amount: number) => void;
  setEpilepsySafeMode: (val: boolean) => void;
  markEpilepsyWarningShown: () => void;
  completeOnboarding: () => void;
  logRelapse: (data: { trigger: string; mood: number; note: string }) => void;
  tickStreak: () => void;
  signOut: () => void;
}

export const useDopamindStore = create<DopamindState>()(
  persist(
    (set, get) => ({
      // Defaults
      userId:                  null,
      userName:                null,
      sobrietyStartDate:       null,
      habitType:               null,
      motivations:             [],
      recoveryStyle:           'solo',
      dailyCommitmentMinutes:  15,
      streakDays:              0,
      streakHours:             0,
      streakMinutes:           0,
      streakSeconds:           0,
      xpTotal:                 0,
      level:                   0,
      epilepsySafeMode:        false,
      hasSeenEpilepsyWarning:  false,
      isPremium:               false,
      onboardingComplete:      false,
      ybocsSeverity:           0,
      relapseLog:              [],

      setUserProfile: (profile) => set((state) => ({ ...state, ...profile })),

      addXP: (amount) =>
        set((state) => {
          const newXP   = state.xpTotal + amount;
          const newLevel = calcLevel(newXP);
          return { xpTotal: newXP, level: newLevel };
        }),

      setEpilepsySafeMode: (val) => set({ epilepsySafeMode: val }),

      markEpilepsyWarningShown: () => set({ hasSeenEpilepsyWarning: true }),

      completeOnboarding: () => set({ onboardingComplete: true }),

      logRelapse: (data) =>
        set((state) => ({
          relapseLog: [
            {
              id:        crypto.randomUUID(),
              ...data,
              timestamp: new Date().toISOString(),
            },
            ...state.relapseLog,
          ],
          sobrietyStartDate: new Date().toISOString(),
          streakDays:        0,
          streakHours:       0,
          streakMinutes:     0,
          streakSeconds:     0,
        })),

      tickStreak: () => {
        const { sobrietyStartDate } = get();
        if (!sobrietyStartDate) return;

        const start = new Date(sobrietyStartDate).getTime();
        const now   = Date.now();
        const diff  = Math.max(0, now - start);

        const totalSeconds = Math.floor(diff / 1000);
        const days    = Math.floor(totalSeconds / 86400);
        const hours   = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        set({ streakDays: days, streakHours: hours, streakMinutes: minutes, streakSeconds: seconds });
      },

      signOut: () =>
        set({
          userId:                 null,
          userName:               null,
          sobrietyStartDate:      null,
          habitType:              null,
          motivations:            [],
          onboardingComplete:     false,
          xpTotal:                0,
          level:                  0,
          streakDays:             0,
          streakHours:            0,
          streakMinutes:          0,
          streakSeconds:          0,
          relapseLog:             [],
        }),
    }),
    {
      name: 'dopamind-store',
      partialize: (state) => ({
        userId:                 state.userId,
        userName:               state.userName,
        sobrietyStartDate:      state.sobrietyStartDate,
        habitType:              state.habitType,
        motivations:            state.motivations,
        recoveryStyle:          state.recoveryStyle,
        dailyCommitmentMinutes: state.dailyCommitmentMinutes,
        xpTotal:                state.xpTotal,
        level:                  state.level,
        epilepsySafeMode:       state.epilepsySafeMode,
        hasSeenEpilepsyWarning: state.hasSeenEpilepsyWarning,
        isPremium:              state.isPremium,
        onboardingComplete:     state.onboardingComplete,
        ybocsSeverity:          state.ybocsSeverity,
        relapseLog:             state.relapseLog,
      }),
    },
  ),
);
