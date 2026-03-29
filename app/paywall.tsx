// ─────────────────────────────────────────────
// KEEPER — Paywall Screen
// Shown when a free user tries to take an action.
// Shows all three tiers and lets them upgrade.
// Design principle: transparent, no dark patterns.
// ─────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  formatPackageForDisplay,
} from '@/lib/revenuecat';
import { useAppStore } from '@/store/useAppStore';
import { Colors, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/theme';
import type { PurchasesPackage } from 'react-native-purchases';

const TIER_FEATURES = {
  free: [
    '1 bank account',
    'See all detected issues',
    '5 issue views per month',
  ],
  pro: [
    'Unlimited bank & email accounts',
    'One-tap cancellations',
    'Full issue history',
    'Priority AI analysis',
    'Negotiation scripts',
  ],
  keeper_plus: [
    'Everything in Pro',
    'Automated voice AI negotiation calls',
    'Insurance comparison',
    'Warranty claim filing',
    'Caregiver mode',
  ],
};

export default function PaywallScreen() {
  const { setSubscriptionTier } = useAppStore();

  const [packages,    setPackages]    = useState<PurchasesPackage[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [purchasing,  setPurchasing]  = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    const pkgs = await getOfferings();
    setPackages(pkgs);
    setLoading(false);
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    setSelectedPkg(pkg.identifier);
    try {
      const result = await purchasePackage(pkg);
      if (result.success) {
        Alert.alert(
          'Welcome to Keeper Pro! 🎉',
          'Your subscription is active. You now have full access to all features.',
          [{ text: 'Let\'s go!', onPress: () => router.back() }],
        );
        // Update tier in store
        // getCurrentTier() will reflect the new purchase
        setSubscriptionTier('pro');
      }
    } finally {
      setPurchasing(false);
      setSelectedPkg(null);
    }
  };

  const handleRestore = async () => {
    const info = await restorePurchases();
    if (info && Object.keys(info.entitlements.active).length > 0) {
      Alert.alert('Purchases restored', 'Your previous subscription has been restored.');
    } else {
      Alert.alert('Nothing to restore', 'No previous purchases found for this Apple/Google account.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View
        style={{
          flexDirection:   'row',
          alignItems:      'center',
          justifyContent:  'space-between',
          paddingHorizontal: 20,
          paddingVertical:  16,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.navy, fontSize: FontSize.base }}>✕</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.navy }}>
          Upgrade Keeper
        </Text>
        <TouchableOpacity onPress={handleRestore}>
          <Text style={{ color: Colors.textSecondary, fontSize: FontSize.sm }}>Restore</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Hero */}
        <LinearGradient
          colors={[Colors.navy, Colors.navyLight]}
          style={{ marginHorizontal: 20, borderRadius: BorderRadius.xl, padding: 24, marginBottom: 28 }}
        >
          <Text style={{ color: Colors.white, fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, textAlign: 'center', marginBottom: 8 }}>
            Take action.{'\n'}Get your money back.
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FontSize.base, textAlign: 'center', lineHeight: 24 }}>
            Free users can see every issue Keeper finds.{'\n'}
            Pro users can actually fix them.
          </Text>
        </LinearGradient>

        {/* Pricing cards */}
        {loading ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <ActivityIndicator color={Colors.emerald} size="large" />
            <Text style={{ color: Colors.textSecondary, marginTop: 12, fontSize: FontSize.sm }}>
              Loading plans...
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            {/* Pro Tier */}
            <PricingCard
              title="Keeper Pro"
              price="$9.99"
              period="month"
              annualPrice="$79.99/year (save 33%)"
              features={TIER_FEATURES.pro}
              isPopular
              onPress={() => {
                const pkg = packages.find((p) => p.identifier.includes('pro_monthly'));
                if (pkg) handlePurchase(pkg);
                else Alert.alert('Coming soon', 'Purchases will be available when the app launches on the App Store.');
              }}
              loading={purchasing && selectedPkg?.includes('pro')}
            />

            {/* Keeper+ Tier */}
            <PricingCard
              title="Keeper+"
              price="$19.99"
              period="month"
              features={TIER_FEATURES.keeper_plus}
              onPress={() => {
                const pkg = packages.find((p) => p.identifier.includes('plus_monthly'));
                if (pkg) handlePurchase(pkg);
                else Alert.alert('Coming soon', 'Purchases will be available when the app launches on the App Store.');
              }}
              loading={purchasing && selectedPkg?.includes('plus')}
            />

            {/* Free tier summary */}
            <View
              style={{
                backgroundColor: Colors.surfaceAlt,
                borderRadius:    BorderRadius.lg,
                padding:         16,
                marginTop:       4,
              }}
            >
              <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 8 }}>
                Free plan includes:
              </Text>
              {TIER_FEATURES.free.map((f) => (
                <Text key={f} style={{ fontSize: FontSize.sm, color: Colors.textTertiary, lineHeight: 22 }}>
                  • {f}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Performance fee note */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop:        20,
            backgroundColor:  Colors.white,
            borderRadius:     BorderRadius.lg,
            padding:          16,
            ...Shadow.sm,
          }}
        >
          <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 6 }}>
            Note about performance fees
          </Text>
          <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 }}>
            When Keeper recovers real money for you, we charge a 20% performance fee (capped at $50/month). This fee is only charged on verified savings — if we don't save you money, you pay nothing extra.
          </Text>
        </View>

        {/* Legal */}
        <Text style={{ paddingHorizontal: 20, marginTop: 20, fontSize: FontSize.xs, color: Colors.textTertiary, textAlign: 'center', lineHeight: 18 }}>
          Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. Manage subscriptions in App Store / Google Play settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Pricing Card ───────────────────────────────
function PricingCard({
  title, price, period, annualPrice, features, isPopular, onPress, loading,
}: {
  title:        string;
  price:        string;
  period:       string;
  annualPrice?: string;
  features:     string[];
  isPopular?:   boolean;
  onPress:      () => void;
  loading:      boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: isPopular ? Colors.navy : Colors.white,
        borderRadius:    BorderRadius.xl,
        padding:         20,
        ...Shadow.md,
        borderWidth:     isPopular ? 0 : 1.5,
        borderColor:     Colors.border,
      }}
    >
      {isPopular && (
        <View
          style={{
            position:          'absolute',
            top:               -12,
            alignSelf:         'center',
            backgroundColor:   Colors.emerald,
            borderRadius:      BorderRadius.full,
            paddingHorizontal: 16,
            paddingVertical:   5,
          }}
        >
          <Text style={{ color: Colors.white, fontSize: FontSize.xs, fontWeight: FontWeight.bold }}>
            MOST POPULAR
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 4, marginTop: isPopular ? 8 : 0 }}>
        <Text style={{ color: isPopular ? Colors.white : Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.heavy }}>
          {title}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 }}>
        <Text style={{ color: isPopular ? Colors.emerald : Colors.textPrimary, fontSize: 36, fontWeight: FontWeight.heavy }}>
          {price}
        </Text>
        <Text style={{ color: isPopular ? 'rgba(255,255,255,0.5)' : Colors.textTertiary, fontSize: FontSize.sm, marginBottom: 6, marginLeft: 2 }}>
          /{period}
        </Text>
      </View>

      {annualPrice && (
        <Text style={{ color: Colors.emerald, fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginBottom: 16 }}>
          {annualPrice}
        </Text>
      )}

      <View style={{ gap: 8, marginBottom: 20, marginTop: annualPrice ? 0 : 16 }}>
        {features.map((f) => (
          <View key={f} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ color: Colors.emerald, fontSize: FontSize.sm }}>✓</Text>
            <Text style={{ color: isPopular ? 'rgba(255,255,255,0.85)' : Colors.textSecondary, fontSize: FontSize.sm, flex: 1, lineHeight: 20 }}>
              {f}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.85}
        style={{
          backgroundColor: Colors.emerald,
          borderRadius:    BorderRadius.md,
          paddingVertical: 14,
          alignItems:      'center',
        }}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={{ color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.base }}>
            Get {title}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
