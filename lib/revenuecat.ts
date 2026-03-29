// ─────────────────────────────────────────────
// KEEPER — RevenueCat Integration
// Handles all in-app subscriptions and paywalls.
// RevenueCat sits on top of Apple/Google payments and
// gives us a unified API for all platforms.
// ─────────────────────────────────────────────
import Purchases, {
  type PurchasesPackage,
  type CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import type { SubscriptionTier, SubscriptionProduct } from '@/types';

// ── RevenueCat Product Identifiers ────────────
// These must match exactly what you set up in RevenueCat dashboard
export const ENTITLEMENT_IDS = {
  pro:        'keeper_pro',
  keeperPlus: 'keeper_plus',
} as const;

export const PRODUCT_IDS = {
  pro_monthly:       'keeper_pro_monthly',
  pro_annual:        'keeper_pro_annual',
  plus_monthly:      'keeper_plus_monthly',
} as const;

export const OFFERING_IDS = {
  default:    '$rc_default',
  paywall:    'keeper_paywall',
} as const;

// ─────────────────────────────────────────────
// Initialize RevenueCat
// Call this once in the root layout
// ─────────────────────────────────────────────
export async function initRevenueCat(userId?: string): Promise<void> {
  const apiKey = Platform.select({
    ios:     process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  });

  if (!apiKey) {
    console.warn('[Keeper] Missing RevenueCat API key. Subscriptions will not work.');
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  await Purchases.configure({ apiKey });

  if (userId) {
    await Purchases.logIn(userId);
  }
}

// ─────────────────────────────────────────────
// Get Available Packages
// Returns the packages the user can subscribe to
// ─────────────────────────────────────────────
export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    const current   = offerings.current;
    if (!current) return [];
    return current.availablePackages;
  } catch (err) {
    console.error('[RevenueCat] Failed to fetch offerings:', err);
    return [];
  }
}

// ─────────────────────────────────────────────
// Get Customer Info
// Returns what the user has purchased
// ─────────────────────────────────────────────
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (err) {
    console.error('[RevenueCat] Failed to fetch customer info:', err);
    return null;
  }
}

// ─────────────────────────────────────────────
// Check Entitlement
// "Does this user have Pro access?"
// ─────────────────────────────────────────────
export async function hasEntitlement(
  entitlementId: string,
): Promise<boolean> {
  const info = await getCustomerInfo();
  if (!info) return false;
  return !!info.entitlements.active[entitlementId]?.isActive;
}

// ─────────────────────────────────────────────
// Get User's Current Subscription Tier
// ─────────────────────────────────────────────
export async function getCurrentTier(): Promise<SubscriptionTier> {
  const info = await getCustomerInfo();
  if (!info) return 'free';

  const active = info.entitlements.active;
  if (active[ENTITLEMENT_IDS.keeperPlus]?.isActive) return 'keeper_plus';
  if (active[ENTITLEMENT_IDS.pro]?.isActive)         return 'pro';
  return 'free';
}

// ─────────────────────────────────────────────
// Purchase a Package
// ─────────────────────────────────────────────
export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success:      boolean;
  customerInfo: CustomerInfo | null;
  error?:       string;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (err: unknown) {
    // User cancelled — not an error
    if ((err as { userCancelled?: boolean }).userCancelled) {
      return { success: false, customerInfo: null };
    }
    console.error('[RevenueCat] Purchase failed:', err);
    return {
      success:      false,
      customerInfo: null,
      error:        err instanceof Error ? err.message : 'Purchase failed',
    };
  }
}

// ─────────────────────────────────────────────
// Restore Purchases
// For users who already subscribed and reinstalled the app
// ─────────────────────────────────────────────
export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.restorePurchases();
  } catch (err) {
    console.error('[RevenueCat] Restore failed:', err);
    return null;
  }
}

// ─────────────────────────────────────────────
// Helpers: Format package for display
// ─────────────────────────────────────────────
export function formatPackageForDisplay(pkg: PurchasesPackage): SubscriptionProduct {
  const p = pkg.product;
  return {
    identifier:    pkg.identifier,
    title:         p.title,
    description:   p.description,
    price:         p.priceString,
    pricePerMonth: pkg.packageType === 'ANNUAL'
      ? `$${(p.price / 12).toFixed(2)}/mo`
      : p.priceString,
    period: pkg.packageType === 'ANNUAL' ? 'annual' : 'monthly',
  };
}

// ─────────────────────────────────────────────
// Tier feature gates
// Use these throughout the app to check access
// ─────────────────────────────────────────────
export const TIER_FEATURES: Record<SubscriptionTier, {
  maxBankAccounts:    number;
  maxEmailAccounts:   number;
  canTakeAction:      boolean;
  monthlyIssueViews:  number;
  hasVoiceNegotiation: boolean;
  hasInsuranceCompare: boolean;
  hasCaregiverMode:   boolean;
}> = {
  free: {
    maxBankAccounts:     1,
    maxEmailAccounts:    0,
    canTakeAction:       false,
    monthlyIssueViews:   5,
    hasVoiceNegotiation: false,
    hasInsuranceCompare: false,
    hasCaregiverMode:    false,
  },
  pro: {
    maxBankAccounts:     10,
    maxEmailAccounts:    5,
    canTakeAction:       true,
    monthlyIssueViews:   Infinity,
    hasVoiceNegotiation: false,
    hasInsuranceCompare: false,
    hasCaregiverMode:    false,
  },
  keeper_plus: {
    maxBankAccounts:     Infinity,
    maxEmailAccounts:    Infinity,
    canTakeAction:       true,
    monthlyIssueViews:   Infinity,
    hasVoiceNegotiation: true,
    hasInsuranceCompare: true,
    hasCaregiverMode:    true,
  },
};
