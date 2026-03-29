// ─────────────────────────────────────────────
// KEEPER — Root Layout
// This is the very first file that runs.
// It sets up fonts, splash screen, auth routing,
// and global providers.
// ─────────────────────────────────────────────
import '../global.css';

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { initRevenueCat } from '@/lib/revenuecat';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';

// Keep the splash screen visible until we're ready
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const { user, isOnboardingComplete } = useAppStore();

  useEffect(() => {
    // Initialize RevenueCat with the user's ID (if logged in)
    initRevenueCat(user?.id).catch(console.error);
    // Hide splash screen
    SplashScreen.hideAsync();
  }, [user?.id]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      {/* Auth screens (sign in, welcome) */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* Onboarding flow */}
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />

      {/* Main app tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Issue detail — slides up */}
      <Stack.Screen
        name="issue/[id]"
        options={{
          headerShown:  false,
          presentation: 'modal',
          animation:    'slide_from_bottom',
        }}
      />

      {/* Paywall — slides up */}
      <Stack.Screen
        name="paywall"
        options={{
          headerShown:  false,
          presentation: 'modal',
          animation:    'slide_from_bottom',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={Colors.navy} />
        <RootLayoutNav />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
