// ─────────────────────────────────────────────
// KEEPER — Sign In / Sign Up Screen
// Email + password auth via Supabase.
// Clean, trustworthy design.
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme';

type Mode = 'signin' | 'signup';

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();

  const [mode,     setMode]     = useState<Mode>('signin');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email.trim().toLowerCase(), password);
        // New users go through onboarding
        router.replace('/(onboarding)');
      } else {
        await signIn(email.trim().toLowerCase(), password);
        // Returning users go straight to the app
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(friendlyError(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, paddingHorizontal: 28, paddingVertical: 24 }}>

            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginBottom: 32 }}
            >
              <Text style={{ color: Colors.navy, fontSize: FontSize.base }}>← Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <Text
              style={{
                fontSize:   FontSize.xxxl,
                fontWeight: FontWeight.heavy,
                color:      Colors.navy,
                marginBottom: 8,
              }}
            >
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </Text>
            <Text
              style={{
                fontSize:   FontSize.base,
                color:      Colors.textSecondary,
                marginBottom: 40,
                lineHeight:  22,
              }}
            >
              {mode === 'signin'
                ? 'Sign in to see what Keeper found for you.'
                : 'Set up your account. It takes 2 minutes.'}
            </Text>

            {/* Form */}
            <View style={{ gap: 16 }}>
              <View>
                <Text style={labelStyle}>Email address</Text>
                <TextInput
                  style={inputStyle}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  accessibilityLabel="Email address"
                />
              </View>

              <View>
                <Text style={labelStyle}>Password</Text>
                <TextInput
                  style={inputStyle}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType={mode === 'signup' ? 'newPassword' : 'password'}
                  accessibilityLabel="Password"
                />
              </View>

              {/* Error message */}
              {error ? (
                <View
                  style={{
                    backgroundColor: '#FFEBEE',
                    borderRadius:    BorderRadius.sm,
                    padding:         12,
                  }}
                >
                  <Text style={{ color: Colors.error, fontSize: FontSize.sm, lineHeight: 18 }}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Submit */}
              <Button
                label={mode === 'signin' ? 'Sign In' : 'Create Account'}
                size="lg"
                fullWidth
                loading={loading}
                onPress={handleSubmit}
                style={{ marginTop: 8 }}
              />
            </View>

            {/* Toggle mode */}
            <TouchableOpacity
              onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
              style={{ alignItems: 'center', marginTop: 24, paddingVertical: 12 }}
            >
              <Text style={{ color: Colors.textSecondary, fontSize: FontSize.sm }}>
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <Text style={{ color: Colors.emerald, fontWeight: FontWeight.semibold }}>
                  {mode === 'signin' ? 'Sign up free' : 'Sign in'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Legal */}
            <Text
              style={{
                color:     Colors.textTertiary,
                fontSize:  FontSize.xs,
                textAlign: 'center',
                marginTop: 'auto',
                paddingTop: 24,
                lineHeight: 18,
              }}
            >
              By continuing, you agree to Keeper's Terms of Service and Privacy Policy.{'\n'}
              Your bank credentials are never seen or stored by Keeper.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────
const labelStyle = {
  fontSize:     FontSize.sm,
  fontWeight:   FontWeight.semibold,
  color:        Colors.textPrimary,
  marginBottom: 8,
} as const;

const inputStyle = {
  backgroundColor: Colors.white,
  borderWidth:     1.5,
  borderColor:     Colors.border,
  borderRadius:    BorderRadius.md,
  paddingHorizontal: 16,
  paddingVertical:   14,
  fontSize:        FontSize.base,
  color:           Colors.textPrimary,
} as const;

// Convert Supabase error messages to plain English
function friendlyError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link we sent you.';
  }
  if (message.includes('User already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (message.includes('Password should be at least')) {
    return 'Your password must be at least 8 characters long.';
  }
  return message;
}
