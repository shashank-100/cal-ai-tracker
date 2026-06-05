import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

interface Props {
  onApple: () => void;
  onGoogle: () => void;
  onBack: () => void;
}

export default function CreateAccountScreen({ onApple, onGoogle, onBack }: Props) {
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);

  const handleGoogle = async () => {
    setLoading('google');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'calai://auth'
        );
        if (result.type === 'success') {
          const url = new URL(result.url);
          const access_token = url.searchParams.get('access_token') ?? '';
          const refresh_token = url.searchParams.get('refresh_token') ?? '';
          if (access_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
            onGoogle();
          }
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleApple = async () => {
    setLoading('apple');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'calai://auth'
        );
        if (result.type === 'success') {
          const url = new URL(result.url);
          const access_token = url.searchParams.get('access_token') ?? '';
          const refresh_token = url.searchParams.get('refresh_token') ?? '';
          if (access_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
            onApple();
          }
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Apple sign-in failed. Please try again.');
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
          <TouchableOpacity style={styles.appleBtn} onPress={handleApple} activeOpacity={0.85} disabled={loading !== null}>
            {loading === 'apple' ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.appleLogo}> </Text>
                <Text style={styles.appleText}>Sign in with Apple</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.85} disabled={loading !== null}>
            {loading === 'google' ? <ActivityIndicator color="#000" /> : (
              <>
                <Text style={styles.googleLogo}>G</Text>
                <Text style={styles.googleText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={onGoogle} activeOpacity={0.85} disabled={loading !== null}>
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
  appleLogo: { fontSize: 20, color: '#fff' },
  appleText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  googleBtn: {
    backgroundColor: '#fff', borderRadius: 32, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1.5, borderColor: '#E0E0E0', minHeight: 56,
  },
  googleLogo: { fontSize: 20, fontWeight: '700', color: '#4285F4' },
  googleText: { fontSize: 16, fontWeight: '600', color: '#000' },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 15, color: '#888', textDecorationLine: 'underline' },
});
