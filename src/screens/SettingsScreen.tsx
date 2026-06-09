import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import type { Profile, Plan } from '../lib/types';

interface Props {
  onBack: () => void;
}

const GOAL_LABELS: Record<string, string> = {
  lose: 'Lose weight',
  maintain: 'Maintain weight',
  gain: 'Gain weight',
};

export default function SettingsScreen({ onBack }: Props) {
  const { token, signOut } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [p, pl] = await Promise.all([
        api.profile.get(token),
        api.plans.getActive(token).catch(() => null),
      ]);
      setProfile(p);
      setPlan(pl);
    } catch {
      Alert.alert('Error', 'Could not load profile.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function toggle(field: 'rollover_calories' | 'add_calories_burned' | 'metric', value: boolean) {
    if (!token || !profile) return;
    setProfile(p => p ? { ...p, [field]: value } : p);
    setSaving(true);
    try {
      await api.profile.update(token, { [field]: value });
    } catch {
      setProfile(p => p ? { ...p, [field]: !value } : p);
      Alert.alert('Error', 'Could not save setting.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Profile info */}
          <Text style={styles.sectionLabel}>PROFILE</Text>
          <View style={styles.card}>
            <Row label="Name" value={profile?.full_name ?? '—'} />
            <Divider />
            <Row label="Email" value={profile?.email ?? '—'} />
            <Divider />
            <Row label="Goal" value={GOAL_LABELS[profile?.goal ?? ''] ?? '—'} />
            <Divider />
            <Row label="Diet" value={profile?.diet_preference ?? '—'} />
            <Divider />
            <Row label="Workouts/week" value={profile?.workouts_per_week != null ? String(profile.workouts_per_week) : '—'} />
          </View>

          {/* Active plan */}
          {plan && (
            <>
              <Text style={styles.sectionLabel}>ACTIVE PLAN</Text>
              <View style={styles.card}>
                <Row label="Calorie target" value={`${plan.calories_target} kcal`} />
                <Divider />
                <Row label="Protein" value={`${plan.protein_g}g`} />
                <Divider />
                <Row label="Carbs" value={`${plan.carbs_g}g`} />
                <Divider />
                <Row label="Fat" value={`${plan.fat_g}g`} />
                <Divider />
                <Row label="TDEE" value={`${plan.tdee} kcal`} />
                {plan.weeks_to_goal > 0 && (
                  <>
                    <Divider />
                    <Row label="Est. weeks to goal" value={String(plan.weeks_to_goal)} />
                  </>
                )}
              </View>
            </>
          )}

          {/* Preferences */}
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.card}>
            <ToggleRow
              label="Use metric units"
              value={profile?.metric ?? false}
              onToggle={v => toggle('metric', v)}
              disabled={saving}
            />
            <Divider />
            <ToggleRow
              label="Add calories burned"
              sub="Exercise calories count toward your goal"
              value={profile?.add_calories_burned ?? true}
              onToggle={v => toggle('add_calories_burned', v)}
              disabled={saving}
            />
            <Divider />
            <ToggleRow
              label="Rollover calories"
              sub="Unused calories carry to the next day"
              value={profile?.rollover_calories ?? false}
              onToggle={v => toggle('rollover_calories', v)}
              disabled={saving}
            />
          </View>

          {/* Account */}
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.signOutRow} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={row.wrap}>
      <Text style={row.label}>{label}</Text>
      <Text style={row.value}>{value}</Text>
    </View>
  );
}

function ToggleRow({ label, sub, value, onToggle, disabled }: {
  label: string; sub?: string; value: boolean; onToggle: (v: boolean) => void; disabled: boolean;
}) {
  return (
    <View style={row.wrap}>
      <View style={{ flex: 1 }}>
        <Text style={row.label}>{label}</Text>
        {sub && <Text style={row.sub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: '#ddd', true: '#000' }}
        thumbColor="#fff"
      />
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: '#F2F2F2' }} />;
}

const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  label: { flex: 1, fontSize: 15, color: '#000' },
  value: { fontSize: 15, color: '#888' },
  sub: { fontSize: 12, color: '#aaa', marginTop: 2 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#000' },
  title: { fontSize: 18, fontWeight: '700', color: '#000' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#aaa', marginTop: 20, marginBottom: 8, marginLeft: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    overflow: 'hidden',
  },
  signOutRow: { paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  signOutText: { fontSize: 15, color: '#E87070', fontWeight: '600' },
});
