// ─────────────────────────────────────────────
// KEEPER — Onboarding Step 3: Connect Email
// OAuth connection to Gmail / Outlook.
// Read-only, scoped to financial emails only.
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme';

export default function ConnectEmailScreen() {
  const [gmailConnected,   setGmailConnected]   = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [loadingGmail,     setLoadingGmail]     = useState(false);
  const [loadingOutlook,   setLoadingOutlook]   = useState(false);

  const handleConnectGmail = async () => {
    setLoadingGmail(true);
    try {
      // In production: trigger Google OAuth via expo-auth-session
      // Scopes: gmail.readonly (filtered to financial senders)
      // Store refresh token encrypted in Supabase
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setGmailConnected(true);
    } catch {
      Alert.alert('Connection failed', 'Could not connect Gmail. Please try again.');
    } finally {
      setLoadingGmail(false);
    }
  };

  const handleConnectOutlook = async () => {
    setLoadingOutlook(true);
    try {
      // In production: trigger Microsoft OAuth via expo-auth-session
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setOutlookConnected(true);
    } catch {
      Alert.alert('Connection failed', 'Could not connect Outlook. Please try again.');
    } finally {
      setLoadingOutlook(false);
    }
  };

  const handleContinue = () => {
    router.push('/(onboarding)/first-scan');
  };

  const anyConnected = gmailConnected || outlookConnected;

  return (
    <LinearGradient colors={[Colors.navy, '#1A2F6B']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 }}
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
                  backgroundColor: Colors.emerald,
                }}
              />
            ))}
          </View>

          <Text style={{ color: Colors.emerald, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
            Step 3 of 3
          </Text>

          <Text style={{ color: Colors.white, fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, marginBottom: 8, lineHeight: 36 }}>
            Connect your email
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FontSize.base, lineHeight: 24, marginBottom: 12 }}>
            Keeper scans for receipts, price change notices, and renewal emails to catch problems your bank alone can't show.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm, lineHeight: 20, marginBottom: 32 }}>
            This is optional but significantly improves Keeper's ability to find issues. You can always add it later.
          </Text>

          {/* Email provider options */}
          <View style={{ gap: 12, marginBottom: 32 }}>
            {/* Gmail */}
            <TouchableOpacity
              onPress={gmailConnected ? undefined : handleConnectGmail}
              activeOpacity={0.85}
              style={{
                backgroundColor: gmailConnected ? 'rgba(0,196,140,0.15)' : 'rgba(255,255,255,0.1)',
                borderRadius:    BorderRadius.lg,
                padding:         20,
                flexDirection:   'row',
                alignItems:      'center',
                gap:             16,
                borderWidth:     1,
                borderColor:     gmailConnected ? 'rgba(0,196,140,0.4)' : 'rgba(255,255,255,0.15)',
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#EA4335', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold }}>G</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.white, fontSize: FontSize.base, fontWeight: FontWeight.semibold }}>
                  {gmailConnected ? 'Gmail connected ✓' : 'Connect Gmail'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: FontSize.sm, marginTop: 2 }}>
                  {gmailConnected ? 'Keeper is scanning for receipts' : 'Read-only · Financial emails only'}
                </Text>
              </View>
              {!gmailConnected && (
                loadingGmail ? (
                  <Text style={{ color: Colors.emerald, fontSize: FontSize.sm }}>Connecting...</Text>
                ) : (
                  <Text style={{ color: Colors.emerald, fontSize: FontSize.base }}>→</Text>
                )
              )}
            </TouchableOpacity>

            {/* Outlook */}
            <TouchableOpacity
              onPress={outlookConnected ? undefined : handleConnectOutlook}
              activeOpacity={0.85}
              style={{
                backgroundColor: outlookConnected ? 'rgba(0,196,140,0.15)' : 'rgba(255,255,255,0.1)',
                borderRadius:    BorderRadius.lg,
                padding:         20,
                flexDirection:   'row',
                alignItems:      'center',
                gap:             16,
                borderWidth:     1,
                borderColor:     outlookConnected ? 'rgba(0,196,140,0.4)' : 'rgba(255,255,255,0.15)',
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#0078D4', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold }}>◻</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.white, fontSize: FontSize.base, fontWeight: FontWeight.semibold }}>
                  {outlookConnected ? 'Outlook connected ✓' : 'Connect Outlook / Hotmail'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: FontSize.sm, marginTop: 2 }}>
                  {outlookConnected ? 'Keeper is scanning for receipts' : 'Read-only · Financial emails only'}
                </Text>
              </View>
              {!outlookConnected && (
                loadingOutlook ? (
                  <Text style={{ color: Colors.emerald, fontSize: FontSize.sm }}>Connecting...</Text>
                ) : (
                  <Text style={{ color: Colors.emerald, fontSize: FontSize.base }}>→</Text>
                )
              )}
            </TouchableOpacity>
          </View>

          {/* Privacy note */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius:    BorderRadius.md,
              padding:         16,
              marginBottom:    32,
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: FontSize.xs, lineHeight: 18, textAlign: 'center' }}>
              Keeper only reads emails from financial senders (banks, subscription services, retailers).
              We do not read personal emails. Access is read-only and can be revoked at any time.
            </Text>
          </View>

          <Button
            label={anyConnected ? "See my first scan →" : "Skip — just use bank data"}
            size="lg"
            fullWidth
            onPress={handleContinue}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
