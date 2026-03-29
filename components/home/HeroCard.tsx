// ─────────────────────────────────────────────
// KEEPER — Hero Card (Home Screen)
// The big card at the top of the home screen that
// shows total issues found and potential savings.
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/theme';

interface HeroCardProps {
  issueCount:       number;
  monthlyCost:      number;
  savedThisMonth:   number;
  isLoading?:       boolean;
}

export function HeroCard({
  issueCount,
  monthlyCost,
  savedThisMonth,
  isLoading = false,
}: HeroCardProps) {
  const formatMoney = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <LinearGradient
      colors={[Colors.navy, Colors.navyLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: BorderRadius.xl,
        padding:      24,
        ...Shadow.lg,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <View
          style={{
            width:           8,
            height:          8,
            borderRadius:    4,
            backgroundColor: Colors.emerald,
          }}
        />
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, fontWeight: FontWeight.medium }}>
          Keeper is watching
        </Text>
      </View>

      {/* Main stat */}
      {issueCount > 0 ? (
        <>
          <Text style={{ color: Colors.white, fontSize: FontSize.xxxl, fontWeight: FontWeight.heavy, lineHeight: 40 }}>
            {formatMoney(monthlyCost)}
            <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.regular, color: 'rgba(255,255,255,0.7)' }}>
              {' '}/ month
            </Text>
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: FontSize.base, marginTop: 8, lineHeight: 22 }}>
            found in {issueCount} {issueCount === 1 ? 'issue' : 'issues'} costing you money
          </Text>
        </>
      ) : (
        <>
          <Text style={{ color: Colors.white, fontSize: FontSize.xl, fontWeight: FontWeight.bold, lineHeight: 32 }}>
            Scanning your accounts...
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FontSize.base, marginTop: 8 }}>
            Keeper is looking for money you're losing
          </Text>
        </>
      )}

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 20 }} />

      {/* Saved this month */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: FontSize.xs, fontWeight: FontWeight.medium, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Saved this month
          </Text>
          <Text style={{ color: Colors.emerald, fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginTop: 4 }}>
            {formatMoney(savedThisMonth)}
          </Text>
        </View>

        {savedThisMonth > 0 && (
          <View
            style={{
              backgroundColor: 'rgba(0, 196, 140, 0.2)',
              borderRadius:    BorderRadius.full,
              paddingHorizontal: 12,
              paddingVertical:   6,
            }}
          >
            <Text style={{ color: Colors.emerald, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>
              ↑ Keeper saved this
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}
