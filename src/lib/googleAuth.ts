import { Platform } from 'react-native';
import { supabase } from './supabase';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

export type GoogleSignInResult =
  | { ok: true }
  | { ok: false; cancelled?: boolean; message: string };

/**
 * Native Google Sign-In via @react-native-google-signin + Supabase id-token.
 * Imported lazily so the native module is never required on web (it has no
 * web implementation and throws at import time on some setups).
 */
async function signInNative(): Promise<GoogleSignInResult> {
  const { GoogleSignin, statusCodes } = await import(
    '@react-native-google-signin/google-signin'
  );

  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, scopes: ['profile', 'email'] });

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;
    if (!idToken) return { ok: false, message: 'No ID token returned from Google.' };

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  } catch (err: any) {
    if (err?.code === statusCodes.SIGN_IN_CANCELLED) return { ok: false, cancelled: true, message: 'Cancelled' };
    if (err?.code === statusCodes.IN_PROGRESS) return { ok: false, cancelled: true, message: 'Sign-in already in progress' };
    if (err?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { ok: false, message: 'Google Play Services is required. Please update it and try again.' };
    }
    // DEVELOPER_ERROR (code 10) = SHA-1 / OAuth client configuration mismatch.
    // Not exposed on `statusCodes` in v16, so match the raw numeric code.
    if (String(err?.code) === '10') {
      return {
        ok: false,
        message: 'Google sign-in is temporarily unavailable. Please try again later.',
      };
    }
    return { ok: false, message: err?.message ?? 'Google sign-in failed. Please try again.' };
  }
}

/** Web Google Sign-In via Supabase OAuth redirect. */
async function signInWeb(): Promise<GoogleSignInResult> {
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  // On success the browser redirects away, so we only reach here on error.
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export function signInWithGoogle(): Promise<GoogleSignInResult> {
  return Platform.OS === 'web' ? signInWeb() : signInNative();
}
