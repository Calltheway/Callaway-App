// Legacy file - not used in Unhooked app
export {};
/*
// ─────────────────────────────────────────────
// KEEPER — Biometric Authentication (legacy)
// ─────────────────────────────────────────────
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENROLLED_KEY = 'keeper_biometric_enrolled';
const LAST_AUTH_KEY = 'keeper_last_auth_ts';

// Session timeout: 15 minutes (in milliseconds)
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

// ─────────────────────────────────────────────
// Check if biometrics are available
// ─────────────────────────────────────────────
export async function getBiometricSupport(): Promise<{
  isAvailable:   boolean;
  biometricType: 'face' | 'fingerprint' | 'iris' | 'none';
}> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled   = await LocalAuthentication.isEnrolledAsync();

  if (!compatible || !enrolled) {
    return { isAvailable: false, biometricType: 'none' };
  }

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

  let biometricType: 'face' | 'fingerprint' | 'iris' = 'fingerprint';
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    biometricType = 'face';
  } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    biometricType = 'iris';
  }

  return { isAvailable: true, biometricType };
}

// ─────────────────────────────────────────────
// Authenticate with biometrics
// ─────────────────────────────────────────────
export async function authenticateWithBiometrics(
  reason = 'Verify your identity to access Keeper',
): Promise<{ success: boolean; error?: string }> {
  const { isAvailable } = await getBiometricSupport();

  if (!isAvailable) {
    // Fall back gracefully if biometrics aren't available
    return { success: true };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage:              reason,
    disableDeviceFallback:      false,  // Allow PIN fallback
    cancelLabel:                'Cancel',
    fallbackLabel:              'Use PIN',
  });

  if (result.success) {
    // Record the auth timestamp so we can check session timeout
    await SecureStore.setItemAsync(LAST_AUTH_KEY, Date.now().toString());
    return { success: true };
  }

  return {
    success: false,
    error:   result.error,
  };
}

// ─────────────────────────────────────────────
// Check if session is still valid
// Returns true if user authenticated within the last 15 mins
// ─────────────────────────────────────────────
export async function isSessionValid(): Promise<boolean> {
  const lastAuthTs = await SecureStore.getItemAsync(LAST_AUTH_KEY);
  if (!lastAuthTs) return false;

  const elapsed = Date.now() - parseInt(lastAuthTs, 10);
  return elapsed < SESSION_TIMEOUT_MS;
}

// ─────────────────────────────────────────────
// Clear session (logout / timeout)
// ─────────────────────────────────────────────
export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(LAST_AUTH_KEY);
}

// ─────────────────────────────────────────────
// Mark biometric enrollment preference
// ─────────────────────────────────────────────
export async function setBiometricEnrolled(enrolled: boolean): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_ENROLLED_KEY, enrolled ? '1' : '0');
}

export async function isBiometricEnrolled(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(BIOMETRIC_ENROLLED_KEY);
  return val === '1';
}
*/
