// ─────────────────────────────────────────────
// KEEPER — Welcome Screen
// First screen new users see. Explains the value
// proposition in plain English. Trustworthy design.
// ─────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/ui/Button';
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme';

const FEATURES = [
  {
    emoji: '🔍',
    title: 'Finds hidden money leaks',
    desc:  'Keeper scans your bank and email to find every subscription, billing error, and overcharge.',
  },
  {
    emoji: '💸',
    title: 'Recovers real money',
    desc:  'Keeper cancels forgotten subscriptions, disputes wrong charges, and files refunds for you.',
  },
  {
    emoji: '🔒',
    title: 'Read-only. Always.',
    desc:  'Keeper can see your transactions but can NEVER move your money. Bank-level security.',
  },
];

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={[Colors.navy, Colors.navyLight, '#1A2F6B']}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow:         1,
            paddingHorizontal: 28,
            paddingVertical:  32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / wordmark */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                width:           72,
                height:          72,
                borderRadius:    36,
                backgroundColor: Colors.emerald,
                alignItems:      'center',
                justifyContent:  'center',
                marginBottom:    16,
              }}
            >
              <Text style={{ fontSize: 32 }}>K</Text>
            </View>
            <Text
              style={{
                color:       Colors.white,
                fontSize:    FontSize.xxxl,
                fontWeight:  FontWeight.heavy,
                letterSpacing: 1,
              }}
            >
              Keeper
            </Text>
            <Text
              style={{
                color:      'rgba(255,255,255,0.65)',
                fontSize:   FontSize.base,
                marginTop:  6,
                textAlign:  'center',
              }}
            >
              Your AI Money Agent
            </Text>
          </View>

          {/* Hero statement */}
          <Text
            style={{
              color:      Colors.white,
              fontSize:   FontSize.xl,
              fontWeight: FontWeight.bold,
              textAlign:  'center',
              lineHeight: 32,
              marginBottom: 12,
            }}
          >
            Americans lose $3,000–$5,000 a year to bills they don't notice.
          </Text>
          <Text
            style={{
              color:      'rgba(255,255,255,0.75)',
              fontSize:   FontSize.base,
              textAlign:  'center',
              lineHeight: 24,
              marginBottom: 40,
            }}
          >
            Keeper finds it and gets it back.
          </Text>

          {/* Feature list */}
          <View style={{ gap: 16, marginBottom: 40 }}>
            {FEATURES.map((f) => (
              <View
                key={f.title}
                style={{
                  flexDirection:     'row',
                  alignItems:        'flex-start',
                  gap:               16,
                  backgroundColor:   'rgba(255,255,255,0.08)',
                  borderRadius:      BorderRadius.lg,
                  padding:           16,
                }}
              >
                <Text style={{ fontSize: 28 }}>{f.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color:      Colors.white,
                      fontSize:   FontSize.base,
                      fontWeight: FontWeight.semibold,
                      marginBottom: 4,
                    }}
                  >
                    {f.title}
                  </Text>
                  <Text
                    style={{
                      color:      'rgba(255,255,255,0.65)',
                      fontSize:   FontSize.sm,
                      lineHeight: 20,
                    }}
                  >
                    {f.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA buttons */}
          <View style={{ gap: 12 }}>
            <Button
              label="Get Started — It's Free"
              size="lg"
              fullWidth
              onPress={() => router.push('/(auth)/sign-in')}
            />
            <TouchableOpacity
              onPress={() => router.push('/(auth)/sign-in')}
              style={{ alignItems: 'center', paddingVertical: 12 }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: FontSize.sm }}>
                Already have an account?{' '}
                <Text style={{ color: Colors.emerald, fontWeight: FontWeight.semibold }}>
                  Sign in
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trust footer */}
          <Text
            style={{
              color:     'rgba(255,255,255,0.4)',
              fontSize:  FontSize.xs,
              textAlign: 'center',
              marginTop: 24,
              lineHeight: 18,
            }}
          >
            256-bit encryption • Read-only bank access{'\n'}
            We never see your login credentials
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
