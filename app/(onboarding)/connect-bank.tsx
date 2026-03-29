// ─────────────────────────────────────────────
// KEEPER — Onboarding Step 2: Connect Bank
// Launches Plaid Link to connect a bank account.
// ─────────────────────────────────────────────
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { createLinkToken, exchangePublicToken, syncTransactions } from '@/lib/plaid';
import { accountsDb } from '@/lib/supabase';
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme';

// Note: In a real build, you'd use react-native-plaid-link-sdk here.
// For the scaffold, we simulate the Plaid Link flow so you can see
// the full architecture. Replace the simulatePlaidLink function with
// the real Plaid SDK call when you install it.

export default function ConnectBankScreen() {
  const { user } = useAuth();
  const { addConnectedAccount, setSyncingBank } = useAppStore();

  const [loading,   setLoading]   = useState(false);
  const [connected, setConnected] = useState(false);

  // ── Simulate Plaid Link (replace with real SDK) ──
  // In production, call PlaidLink component with the link_token.
  // Here we use a mock so the rest of the flow works end-to-end.
  const handleConnectBank = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Step 1: Get a link token from Plaid
      // const linkToken = await createLinkToken(user.id);

      // Step 2: In production, open PlaidLink with this token.
      // The user logs in to their bank directly inside Plaid's
      // secure interface — we never see their credentials.

      // Step 3: Plaid calls back with a public_token.
      // We exchange it for a permanent access_token.

      // FOR SCAFFOLD: Simulate a successful connection
      // Replace this entire block with the real Plaid SDK integration.
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate API call

      const mockConnection = {
        user_id:          user.id,
        plaid_item_id:    'sandbox_item_' + Date.now(),
        institution_name: 'Chase Bank',
        institution_color: '#0A66C2',
        account_name:     'Chase Checking',
        account_type:     'checking' as const,
        mask:             '4242',
        last_synced:      new Date().toISOString(),
        is_active:        true,
      };

      // Save to Supabase
      const saved = await accountsDb.create(mockConnection);
      addConnectedAccount(saved);

      // Sync transactions (would normally happen here with real access_token)
      // await syncTransactions(accessToken, saved.id, user.id);

      setConnected(true);
    } catch (err) {
      Alert.alert(
        'Connection failed',
        err instanceof Error ? err.message : 'Could not connect to your bank. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setLoading(false);
    }
  }, [user, addConnectedAccount]);

  return (
    <LinearGradient colors={[Colors.navy, '#1A2F6B']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow:         1,
            paddingHorizontal: 24,
            paddingVertical:  32,
          }}
        >
          {/* Step indicator */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 32 }}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  height:          3,
                  flex:            1,
                  borderRadius:    2,
                  backgroundColor: i <= 1 ? Colors.emerald : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </View>

          <Text style={{ color: Colors.emerald, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
            Step 2 of 3
          </Text>

          <Text style={{ color: Colors.white, fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, marginBottom: 8, lineHeight: 36 }}>
            Connect your bank
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FontSize.base, lineHeight: 24, marginBottom: 40 }}>
            Keeper uses Plaid — the same technology used by Venmo, Robinhood, and 7,000 other apps — to securely connect your bank.
          </Text>

          {/* Security callout */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius:    BorderRadius.lg,
              padding:         20,
              marginBottom:    32,
              gap:             14,
            }}
          >
            <SecurityItem icon="🔒" text="You log in directly to your bank — Keeper never sees your password" />
            <SecurityItem icon="👁" text="Read-only access. We can see transactions but cannot move money" />
            <SecurityItem icon="🏦" text="Works with 11,000+ banks including Chase, BofA, Wells Fargo, Citi" />
            <SecurityItem icon="⚡" text="Keeper analyzes the last 90 days of transactions" />
          </View>

          {connected ? (
            <View>
              {/* Success state */}
              <View
                style={{
                  backgroundColor: 'rgba(0,196,140,0.15)',
                  borderRadius:    BorderRadius.lg,
                  padding:         20,
                  alignItems:      'center',
                  marginBottom:    24,
                  borderWidth:     1,
                  borderColor:     'rgba(0,196,140,0.4)',
                }}
              >
                <Text style={{ fontSize: 40, marginBottom: 12 }}>✓</Text>
                <Text style={{ color: Colors.emerald, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: 6 }}>
                  Bank connected!
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, textAlign: 'center' }}>
                  Chase Bank (••••4242) is connected. Keeper will now analyze your transactions.
                </Text>
              </View>

              <Button
                label="Continue"
                size="lg"
                fullWidth
                onPress={() => router.push('/(onboarding)/connect-email')}
              />
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <Button
                label="Connect my bank securely"
                size="lg"
                fullWidth
                loading={loading}
                onPress={handleConnectBank}
              />

              <Button
                label="Skip for now"
                variant="ghost"
                size="md"
                fullWidth
                onPress={() => router.push('/(onboarding)/connect-email')}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SecurityItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, flex: 1, lineHeight: 20 }}>
        {text}
      </Text>
    </View>
  );
}
