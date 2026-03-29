// ─────────────────────────────────────────────
// KEEPER — Onboarding Step 1: Welcome
// "What Keeper is, what it does, what it can't do."
// This screen is critical for trust. Users are about
// to connect their bank account. They need to feel safe.
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme';

const CAN_DO = [
  'See your bank transactions (read-only)',
  'Scan your email for receipts and billing notices',
  'Identify subscriptions and recurring charges',
  'Find billing errors and overcharges',
  'Alert you to price increases',
  'Help you cancel, dispute, or negotiate',
];

const CANNOT_DO = [
  'Move, transfer, or send your money',
  'See your bank username or password',
  'Access accounts you haven\'t connected',
  'Share your data with advertisers',
  'Make purchases on your behalf',
];

export default function OnboardingWelcomeScreen() {
  return (
    <LinearGradient colors={[Colors.navy, '#1A2F6B']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow:         1,
            paddingHorizontal: 24,
            paddingVertical:  32,
          }}
          showsVerticalScrollIndicator={false}
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
                  backgroundColor: i === 0 ? Colors.emerald : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </View>

          <Text
            style={{
              color:      Colors.emerald,
              fontSize:   FontSize.sm,
              fontWeight: FontWeight.semibold,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              marginBottom:  8,
            }}
          >
            Step 1 of 3
          </Text>

          <Text
            style={{
              color:      Colors.white,
              fontSize:   FontSize.xxl,
              fontWeight: FontWeight.heavy,
              marginBottom: 8,
              lineHeight: 36,
            }}
          >
            What Keeper can and cannot do
          </Text>

          <Text
            style={{
              color:      'rgba(255,255,255,0.7)',
              fontSize:   FontSize.base,
              lineHeight: 24,
              marginBottom: 32,
            }}
          >
            Before you connect anything, here's exactly what Keeper has access to.
          </Text>

          {/* Can Do */}
          <View
            style={{
              backgroundColor: 'rgba(0,196,140,0.12)',
              borderRadius:    BorderRadius.lg,
              padding:         20,
              marginBottom:    16,
              borderWidth:     1,
              borderColor:     'rgba(0,196,140,0.3)',
            }}
          >
            <Text
              style={{
                color:      Colors.emerald,
                fontSize:   FontSize.base,
                fontWeight: FontWeight.bold,
                marginBottom: 14,
              }}
            >
              ✓ What Keeper CAN do
            </Text>
            <View style={{ gap: 10 }}>
              {CAN_DO.map((item) => (
                <View key={item} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <Text style={{ color: Colors.emerald, fontSize: FontSize.base, marginTop: 1 }}>✓</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, flex: 1, lineHeight: 20 }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Cannot Do */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius:    BorderRadius.lg,
              padding:         20,
              marginBottom:    32,
              borderWidth:     1,
              borderColor:     'rgba(255,255,255,0.1)',
            }}
          >
            <Text
              style={{
                color:      'rgba(255,255,255,0.9)',
                fontSize:   FontSize.base,
                fontWeight: FontWeight.bold,
                marginBottom: 14,
              }}
            >
              ✗ What Keeper CANNOT do
            </Text>
            <View style={{ gap: 10 }}>
              {CANNOT_DO.map((item) => (
                <View key={item} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: FontSize.base, marginTop: 1 }}>✗</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: FontSize.sm, flex: 1, lineHeight: 20 }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Button
            label="I understand — Connect my bank"
            size="lg"
            fullWidth
            onPress={() => router.push('/(onboarding)/connect-bank')}
          />

          <Text
            style={{
              color:     'rgba(255,255,255,0.4)',
              fontSize:  FontSize.xs,
              textAlign: 'center',
              marginTop: 16,
              lineHeight: 18,
            }}
          >
            Bank connections are handled by Plaid, used by 7,000+ apps including Venmo and Robinhood.{'\n'}
            Keeper never sees your bank password.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
