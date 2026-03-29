// ─────────────────────────────────────────────
// KEEPER — Settings (Tab 4)
// Connected accounts, notifications, subscription,
// security settings.
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { Colors, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/theme';

const TIER_LABELS = {
  free:        { label: 'Free',        color: Colors.textSecondary },
  pro:         { label: 'Pro',         color: Colors.emerald       },
  keeper_plus: { label: 'Keeper+',     color: '#9C27B0'            },
} as const;

export default function SettingsScreen() {
  const { user, signOut }                  = useAuth();
  const { connectedAccounts, emailConnections, subscriptionTier } = useAppStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyReportEnabled,  setWeeklyReportEnabled]  = useState(true);

  const tier = TIER_LABELS[subscriptionTier];

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out of Keeper?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: signOut },
      ],
    );
  };

  const handleDisconnectAccount = (accountId: string, name: string) => {
    Alert.alert(
      `Disconnect ${name}?`,
      'Keeper will no longer scan this account. Your saved issue history will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text:    'Disconnect',
          style:   'destructive',
          onPress: () => {
            // TODO: call accountsDb.disconnect(accountId) and update store
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}>
          <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, color: Colors.navy }}>
            Settings
          </Text>
          {user && (
            <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 }}>
              {user.email}
            </Text>
          )}
        </View>

        {/* Subscription */}
        <Section title="Subscription">
          <TouchableOpacity
            onPress={() => router.push('/paywall')}
            style={{
              flexDirection:   'row',
              alignItems:      'center',
              justifyContent:  'space-between',
              paddingVertical: 14,
            }}
          >
            <View>
              <Text style={rowLabel}>Current plan</Text>
              <Text style={{ fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 }}>
                {subscriptionTier === 'free' ? 'Upgrade to take actions' : 'Full access'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  backgroundColor: `${tier.color}15`,
                  borderRadius:    BorderRadius.full,
                  paddingHorizontal: 12,
                  paddingVertical:   5,
                }}
              >
                <Text style={{ color: tier.color, fontSize: FontSize.sm, fontWeight: FontWeight.bold }}>
                  {tier.label}
                </Text>
              </View>
              <Text style={{ color: Colors.textTertiary }}>›</Text>
            </View>
          </TouchableOpacity>
        </Section>

        {/* Connected Bank Accounts */}
        <Section title="Connected bank accounts">
          {connectedAccounts.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 }}>
                No bank accounts connected.{'\n'}Connect one to start scanning.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(onboarding)/connect-bank')}
                style={{ marginTop: 12 }}
              >
                <Text style={{ color: Colors.emerald, fontWeight: FontWeight.semibold, fontSize: FontSize.sm }}>
                  + Connect bank account
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            connectedAccounts.map((account) => (
              <View
                key={account.id}
                style={{
                  flexDirection:   'row',
                  alignItems:      'center',
                  justifyContent:  'space-between',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={rowLabel}>{account.institution_name}</Text>
                  <Text style={{ fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 }}>
                    {account.account_name} ••••{account.mask}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDisconnectAccount(account.id, account.institution_name)}
                >
                  <Text style={{ color: Colors.error, fontSize: FontSize.sm }}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </Section>

        {/* Connected Email */}
        <Section title="Connected email accounts">
          {emailConnections.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 }}>
                No email connected.{'\n'}Email scanning finds 40% more issues.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(onboarding)/connect-email')}
                style={{ marginTop: 12 }}
              >
                <Text style={{ color: Colors.emerald, fontWeight: FontWeight.semibold, fontSize: FontSize.sm }}>
                  + Connect email
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            emailConnections.map((conn) => (
              <View
                key={conn.id}
                style={{
                  flexDirection:   'row',
                  alignItems:      'center',
                  justifyContent:  'space-between',
                  paddingVertical: 14,
                }}
              >
                <View>
                  <Text style={rowLabel}>{conn.email_address}</Text>
                  <Text style={{ fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 }}>
                    {conn.provider === 'gmail' ? 'Gmail' : 'Outlook'}
                  </Text>
                </View>
                <Text style={{ color: Colors.error, fontSize: FontSize.sm }}>Disconnect</Text>
              </View>
            ))
          )}
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <ToggleRow
            label="New issues found"
            description="Get notified when Keeper finds a new problem"
            value={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
          <ToggleRow
            label="Weekly summary"
            description="A weekly digest of your savings and open issues"
            value={weeklyReportEnabled}
            onToggle={setWeeklyReportEnabled}
          />
        </Section>

        {/* Security */}
        <Section title="Security">
          <SettingsRow label="Change password"       onPress={() => {}} />
          <SettingsRow label="Biometric lock"        onPress={() => {}} />
          <SettingsRow label="Active sessions"       onPress={() => {}} />
          <SettingsRow label="Data & privacy"        onPress={() => {}} />
        </Section>

        {/* About */}
        <Section title="About">
          <SettingsRow label="How Keeper works"      onPress={() => router.push('/(onboarding)')} />
          <SettingsRow label="Terms of Service"      onPress={() => {}} />
          <SettingsRow label="Privacy Policy"        onPress={() => {}} />
          <SettingsRow label="Version 1.0.0"         onPress={() => {}} disabled />
        </Section>

        {/* Sign out */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              paddingVertical: 16,
              alignItems:      'center',
              borderRadius:    BorderRadius.md,
              borderWidth:     1.5,
              borderColor:     Colors.error,
            }}
          >
            <Text style={{ color: Colors.error, fontWeight: FontWeight.semibold, fontSize: FontSize.base }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ paddingHorizontal: 20, paddingVertical: 10, fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: Colors.white, marginHorizontal: 20, borderRadius: BorderRadius.lg, paddingHorizontal: 16, ...Shadow.sm }}>
        {children}
      </View>
    </View>
  );
}

function SettingsRow({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingVertical:   14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}
      activeOpacity={0.7}
    >
      <Text style={{ ...rowLabel, color: disabled ? Colors.textTertiary : Colors.textPrimary }}>
        {label}
      </Text>
      {!disabled && <Text style={{ color: Colors.textTertiary, fontSize: 18 }}>›</Text>}
    </TouchableOpacity>
  );
}

function ToggleRow({ label, description, value, onToggle }: {
  label:       string;
  description: string;
  value:       boolean;
  onToggle:    (v: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingVertical:   14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap:               16,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={rowLabel}>{label}</Text>
        <Text style={{ fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 }}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.emerald }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

const rowLabel = {
  fontSize:   FontSize.base,
  fontWeight: FontWeight.medium,
  color:      Colors.textPrimary,
} as const;
