// ─────────────────────────────────────────────
// KEEPER — First Scan Screen
// The "wow" moment: Keeper runs its first analysis
// and shows the user what it found. This is the most
// important screen in the app — the first time users
// see real value.
// ─────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { View, Text, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useAppStore } from '@/store/useAppStore';
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme';

type ScanState = 'scanning' | 'complete' | 'error';

const SCAN_STEPS = [
  { id: 1, label: 'Fetching 90 days of transactions...',       duration: 1200 },
  { id: 2, label: 'Identifying recurring charges...',          duration: 1000 },
  { id: 3, label: 'Checking for price increases...',           duration: 900  },
  { id: 4, label: 'Looking for duplicate charges...',          duration: 800  },
  { id: 5, label: 'Running AI analysis with Claude...',        duration: 2000 },
  { id: 6, label: 'Ranking issues by dollar impact...',        duration: 600  },
];

export default function FirstScanScreen() {
  const { runAnalysis }     = useAnalysis();
  const { setOnboardingComplete } = useAppStore();

  const [scanState,        setScanState]        = useState<ScanState>('scanning');
  const [currentStep,      setCurrentStep]      = useState(0);
  const [issuesFound,      setIssuesFound]      = useState(0);
  const [potentialSavings, setPotentialSavings] = useState(0);
  const [errorMessage,     setErrorMessage]     = useState('');

  const progressAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    runScan();
  }, []);

  const runScan = async () => {
    setScanState('scanning');

    // Animate through scan steps visually
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setCurrentStep(i);
      Animated.timing(progressAnim, {
        toValue:         (i + 1) / SCAN_STEPS.length,
        duration:        SCAN_STEPS[i].duration,
        useNativeDriver: false,
      }).start();
      await new Promise((r) => setTimeout(r, SCAN_STEPS[i].duration));
    }

    // Run the actual AI analysis
    try {
      const result = await runAnalysis();
      setIssuesFound(result.issuesFound);
      setPotentialSavings(result.potentialSavings);
      setScanState('complete');
      setOnboardingComplete(true);
    } catch (err) {
      // Even if analysis fails, still complete onboarding
      // User can re-scan from home screen
      setScanState('complete');
      setIssuesFound(0);
      setOnboardingComplete(true);
    }
  };

  const formatMoney = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const progressWidth = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient colors={[Colors.navy, '#0A1229']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow:         1,
            paddingHorizontal: 24,
            paddingVertical:  40,
            justifyContent:   'center',
          }}
        >
          {scanState === 'scanning' && (
            <View style={{ alignItems: 'center', gap: 32 }}>
              {/* Animated logo */}
              <View
                style={{
                  width:           96,
                  height:          96,
                  borderRadius:    48,
                  backgroundColor: Colors.emerald,
                  alignItems:      'center',
                  justifyContent:  'center',
                }}
              >
                <Text style={{ fontSize: 44 }}>K</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: Colors.white, fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, textAlign: 'center', marginBottom: 8 }}>
                  Keeper is scanning...
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: FontSize.base, textAlign: 'center', lineHeight: 24 }}>
                  Analyzing your last 90 days of transactions for money you're losing.
                </Text>
              </View>

              {/* Progress bar */}
              <View style={{ width: '100%', gap: 12 }}>
                <View
                  style={{
                    height:          6,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius:    3,
                    overflow:        'hidden',
                  }}
                >
                  <Animated.View
                    style={{
                      height:          '100%',
                      width:           progressWidth,
                      backgroundColor: Colors.emerald,
                      borderRadius:    3,
                    }}
                  />
                </View>

                {/* Current step */}
                <Text style={{ color: Colors.emerald, fontSize: FontSize.sm, textAlign: 'center' }}>
                  {SCAN_STEPS[currentStep]?.label ?? 'Finishing up...'}
                </Text>
              </View>

              {/* Steps */}
              <View style={{ width: '100%', gap: 8 }}>
                {SCAN_STEPS.map((step, i) => (
                  <View
                    key={step.id}
                    style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
                  >
                    <View
                      style={{
                        width:           20,
                        height:          20,
                        borderRadius:    10,
                        backgroundColor: i < currentStep
                          ? Colors.emerald
                          : i === currentStep
                            ? 'rgba(0,196,140,0.4)'
                            : 'rgba(255,255,255,0.1)',
                        alignItems:      'center',
                        justifyContent:  'center',
                      }}
                    >
                      {i < currentStep && (
                        <Text style={{ color: Colors.white, fontSize: 10, fontWeight: '700' }}>✓</Text>
                      )}
                    </View>
                    <Text
                      style={{
                        color:     i <= currentStep ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
                        fontSize:  FontSize.sm,
                        fontWeight: i === currentStep ? FontWeight.medium : FontWeight.regular,
                      }}
                    >
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {scanState === 'complete' && (
            <View style={{ alignItems: 'center', gap: 28 }}>
              {/* Result */}
              {issuesFound > 0 ? (
                <>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 64 }}>💰</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: Colors.white, fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, textAlign: 'center', marginBottom: 8 }}>
                      Keeper found {issuesFound} {issuesFound === 1 ? 'issue' : 'issues'}
                    </Text>
                    {potentialSavings > 0 && (
                      <Text style={{ color: Colors.emerald, fontSize: FontSize.hero, fontWeight: FontWeight.heavy, marginBottom: 8 }}>
                        {formatMoney(potentialSavings)}
                      </Text>
                    )}
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FontSize.base, textAlign: 'center', lineHeight: 24 }}>
                      in potential monthly savings identified. Let's get it back.
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 64 }}>🔍</Text>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: Colors.white, fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, textAlign: 'center', marginBottom: 8 }}>
                      Scan complete
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FontSize.base, textAlign: 'center', lineHeight: 24 }}>
                      Connect your bank account so Keeper can analyze your transactions. The more data it has, the more it finds.
                    </Text>
                  </View>
                </>
              )}

              <Button
                label="See my issues →"
                size="lg"
                fullWidth
                onPress={() => router.replace('/(tabs)')}
              />

              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: FontSize.xs, textAlign: 'center' }}>
                Keeper will re-scan daily and notify you when new issues are found
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
