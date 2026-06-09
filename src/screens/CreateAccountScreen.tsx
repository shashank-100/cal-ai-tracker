import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  scopes: ['profile', 'email'],
});

interface Props {
  onApple: () => void;
  onGoogle: () => void;
  onSkip: () => void;
  onBack: () => void;
}

function GoogleLogo() {
  return (
    <Svg width={22} height={22} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </Svg>
  );
}

function AppleLogo() {
  return (
    <Svg width={22} height={22} viewBox="0 0 814 1000">
      <Path fill="#fff" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46 790.7 0 663.4 0 541.8c0-207.4 135.4-316.9 269-316.9 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.7-49.1 188.2-49.1 30.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
    </Svg>
  );
}

export default function CreateAccountScreen({ onApple, onGoogle, onSkip, onBack }: Props) {
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);

  const handleGoogle = async () => {
    setLoading('google');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) throw new Error('No ID token returned');

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
      // onAuthStateChange in authStore fires → App.tsx navigates to home
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (err.code === statusCodes.IN_PROGRESS) return;
      Alert.alert('Error', err?.message ?? 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleApple = async () => {
    setLoading('apple');
    try {
      // Apple Sign-In requires expo-apple-authentication (needs Apple dev account)
      Alert.alert('Coming soon', 'Apple Sign-In will be available in a future update.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Save your plan and track your progress</Text>

        <View style={styles.btnGroup}>
          {/* Apple Sign-In — coming soon
          <TouchableOpacity style={styles.appleBtn} onPress={handleApple} activeOpacity={0.85} disabled={loading !== null}>
            {loading === 'apple' ? <ActivityIndicator color="#fff" /> : (
              <>
                <AppleLogo />
                <Text style={styles.appleText}>Sign in with Apple</Text>
              </>
            )}
          </TouchableOpacity>
          */}

          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.85} disabled={loading !== null}>
            {loading === 'google' ? <ActivityIndicator color="#000" /> : (
              <>
                <GoogleLogo />
                <Text style={styles.googleText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.85} disabled={loading !== null}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#000' },
  progressBar: { flex: 1, height: 4, backgroundColor: '#000', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#000', borderRadius: 2, width: '100%' },
  title: { fontSize: 30, fontWeight: '700', color: '#000', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 8, marginBottom: 32 },
  btnGroup: { flex: 1, justifyContent: 'center', gap: 16 },
  appleBtn: {
    backgroundColor: '#000', borderRadius: 32, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    minHeight: 56,
  },
  appleText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  googleBtn: {
    backgroundColor: '#fff', borderRadius: 32, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1.5, borderColor: '#E0E0E0', minHeight: 56,
  },
  googleText: { fontSize: 16, fontWeight: '600', color: '#000' },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 15, color: '#888', textDecorationLine: 'underline' },
});
