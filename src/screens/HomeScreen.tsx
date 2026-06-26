import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import type { DailySummary, Streak } from '../lib/types';
import FoodLogModal from '../components/FoodLogModal';
import FloatingTabBar from '../components/FloatingTabBar';

// Derive up-to-2-letter initials for the Profile avatar from name or email.
function getInitials(name?: string | null, email?: string | null): string {
  const source = (name ?? '').trim() || (email ?? '').split('@')[0] || '';
  if (!source) return 'ME';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

const MACRO_RING_CIRC = 2 * Math.PI * 20; // macro ring radius = 20

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function weekDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return {
      letter: letters[d.getDay()],
      num: d.getDate(),
      active: i === 3,
      future: i > 3,
    };
  });
}

interface Props {
  onNavigate?: (screen: 'progress' | 'settings') => void;
}

export default function HomeScreen({ onNavigate }: Props) {
  const { token, user } = useAuthStore();
  const insets = useSafeAreaInsets();
  // Floating bar = pill/FAB (~76) + bottom inset; pad the scroll so the last
  // row clears it on every device instead of using a fixed magic number.
  const tabBarClearance = 76 + Math.max(insets.bottom, 10);
  const initials = getInitials(
    (user?.user_metadata as any)?.full_name ?? (user?.user_metadata as any)?.name,
    user?.email
  );
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [todayStr, setTodayStr] = useState(todayISO);
  const DAYS = useMemo(() => weekDays(), [todayStr]);

  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const t = setTimeout(() => setTodayStr(todayISO()), msUntilMidnight);
    return () => clearTimeout(t);
  }, [todayStr]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadError(false);
    try {
      const [s, st, plan] = await Promise.all([
        api.foodLogs.dailySummary(token, todayISO()),
        api.streaks.get(token),
        api.plans.getActive(token).catch(() => null),
      ]);
      setSummary({
        ...s,
        goal_protein_g: plan?.protein_g ?? undefined,
        goal_carbs_g: plan?.carbs_g ?? undefined,
        goal_fat_g: plan?.fat_g ?? undefined,
      });
      setStreak(st);
    } catch (err) {
      console.warn('HomeScreen load failed:', err);
      setLoadError(true);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const caloriesLeft = summary
    ? Math.max(0, summary.calories_remaining)
    : null;
  const caloriesGoal = summary?.goal_calories ?? 2000;
  const caloriesEaten = summary?.total_calories ?? 0;
  const ringProgress = caloriesGoal > 0
    ? Math.min(caloriesEaten / caloriesGoal, 1)
    : 0;
  const circumference = 2 * Math.PI * 32;
  const offset = circumference * (1 - ringProgress);

  // ratio = consumed / goal, clamped 0..1 — used to fill each macro ring.
  const macroProgress = (consumed: number, goal?: number) =>
    goal != null && goal > 0 ? Math.min(consumed / goal, 1) : 0;

  const proteinLeft = summary?.goal_protein_g != null
    ? Math.max(0, summary.goal_protein_g - summary.total_protein_g)
    : null;
  const carbsLeft = summary?.goal_carbs_g != null
    ? Math.max(0, summary.goal_carbs_g - summary.total_carbs_g)
    : null;
  const fatLeft = summary?.goal_fat_g != null
    ? Math.max(0, summary.goal_fat_g - summary.total_fat_g)
    : null;

  const MACROS = [
    { label: 'Protein left', value: proteinLeft != null ? `${Math.round(proteinLeft)}g` : '—', color: '#E87070', emoji: '🥩',
      progress: macroProgress(summary?.total_protein_g ?? 0, summary?.goal_protein_g) },
    { label: 'Carbs left', value: carbsLeft != null ? `${Math.round(carbsLeft)}g` : '—', color: '#E8955A', emoji: '🌾',
      progress: macroProgress(summary?.total_carbs_g ?? 0, summary?.goal_carbs_g) },
    { label: 'Fat left', value: fatLeft != null ? `${Math.round(fatLeft)}g` : '—', color: '#70A8E8', emoji: '💧',
      progress: macroProgress(summary?.total_fat_g ?? 0, summary?.goal_fat_g) },
  ];

  // Most-recent-first across all meals, by logged_at timestamp.
  const recentLogs = summary
    ? [
        ...(summary.entries_by_meal.breakfast ?? []),
        ...(summary.entries_by_meal.lunch ?? []),
        ...(summary.entries_by_meal.dinner ?? []),
        ...(summary.entries_by_meal.snack ?? []),
      ]
        .sort((a, b) => (b.logged_at ?? '').localeCompare(a.logged_at ?? ''))
        .slice(0, 5)
    : [];

  if (loadError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Couldn't load your data.</Text>
          <TouchableOpacity onPress={load} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Text style={styles.brandIcon}>🍎</Text>
            <Text style={styles.brandName}>Cal AI</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak?.current_streak ?? 0}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekStrip}>
          {DAYS.map((d) => (
            <View key={d.num} style={[styles.dayCol, d.active && styles.dayColActive]}>
              <View style={[styles.dayCircle, d.active && styles.dayCircleActive, d.future && styles.dayCircleFuture]}>
                <Text style={[styles.dayLetter, d.active && styles.dayLetterActive, d.future && styles.dayLetterFuture]}>
                  {d.letter}
                </Text>
              </View>
              <Text style={[styles.dayNum, d.active && styles.dayNumActive, d.future && styles.dayNumFuture]}>
                {d.num}
              </Text>
            </View>
          ))}
        </ScrollView>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.calorieCard}>
            <View>
              <Text style={styles.calorieNum}>{caloriesLeft ?? caloriesGoal}</Text>
              <Text style={styles.calorieLabel}>Calories left</Text>
            </View>
            <View style={styles.ringWrap}>
              <Svg width={80} height={80}>
                <Circle cx={40} cy={40} r={32} stroke="#eee" strokeWidth={6} fill="none" />
                <Circle cx={40} cy={40} r={32} stroke="#000" strokeWidth={6} fill="none"
                  strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                  rotation="-90" origin="40,40" />
              </Svg>
              <Text style={styles.ringIcon}>🔥</Text>
            </View>
          </View>

          <View style={styles.macroRow}>
            {MACROS.map((m) => (
              <View key={m.label} style={styles.macroCard}>
                <Text style={styles.macroValue}>{m.value}</Text>
                <Text style={styles.macroLabel}>{m.label}</Text>
                <View style={styles.macroRingWrap}>
                  <Svg width={52} height={52}>
                    <Circle cx={26} cy={26} r={20} stroke="#eee" strokeWidth={4} fill="none" />
                    <Circle cx={26} cy={26} r={20} stroke={m.color} strokeWidth={4} fill="none"
                      strokeDasharray={MACRO_RING_CIRC}
                      strokeDashoffset={MACRO_RING_CIRC * (1 - m.progress)}
                      strokeLinecap="round"
                      rotation="-90" origin="26,26" />
                  </Svg>
                  <Text style={styles.macroEmoji}>{m.emoji}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Recently uploaded</Text>
          {recentLogs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>You haven't uploaded any food</Text>
              <Text style={styles.emptyBody}>Start tracking today's meals by taking a quick picture.</Text>
              <Text style={styles.arrowDoodle}>↙</Text>
            </View>
          ) : (
            recentLogs.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <View>
                  <Text style={styles.logName}>{log.food_name}</Text>
                  <Text style={styles.logMeta}>{log.meal_type} · {log.serving_qty} {log.serving_unit}</Text>
                </View>
                <Text style={styles.logCal}>{log.calories} kcal</Text>
              </View>
            ))
          )}
          {/* Spacer so content clears the floating tab bar (derived from insets). */}
          <View style={{ height: tabBarClearance }} />
        </ScrollView>

        <FloatingTabBar
          active="home"
          initials={initials}
          onSelect={(tab) => {
            if (tab === 'progress') onNavigate?.('progress');
            else if (tab === 'profile') onNavigate?.('settings');
            else if (tab === 'groups') Alert.alert('Coming soon', 'Groups will be available in a future update.');
          }}
          onAdd={() => setModalVisible(true)}
        />
      </View>

      <FoodLogModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLogged={() => { setModalVisible(false); load(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandIcon: { fontSize: 22 },
  brandName: { fontSize: 20, fontWeight: '700', color: '#000' },
  streakBadge: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  streakText: { fontSize: 14, fontWeight: '600' },
  weekStrip: { paddingHorizontal: 12, marginBottom: 12, flexGrow: 0 },
  dayCol: { alignItems: 'center', marginHorizontal: 8, paddingVertical: 4 },
  dayColActive: {},
  dayCircle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: '#ddd', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  dayCircleActive: { borderColor: '#000', borderStyle: 'solid', borderWidth: 2 },
  dayCircleFuture: { borderColor: 'transparent' },
  dayLetter: { fontSize: 13, color: '#888' },
  dayLetterActive: { color: '#000', fontWeight: '700' },
  dayLetterFuture: { color: '#ccc' },
  dayNum: { fontSize: 13, color: '#888' },
  dayNumActive: { color: '#000', fontWeight: '700' },
  dayNumFuture: { color: '#ccc' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  calorieCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  calorieNum: { fontSize: 40, fontWeight: '800', color: '#000' },
  calorieLabel: { fontSize: 14, color: '#888' },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringIcon: { position: 'absolute', fontSize: 22 },
  macroRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  macroCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12,
    alignItems: 'flex-start',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  macroValue: { fontSize: 18, fontWeight: '700', color: '#000' },
  macroLabel: { fontSize: 11, color: '#888', marginBottom: 8 },
  macroRingWrap: { alignItems: 'center', justifyContent: 'center' },
  macroEmoji: { position: 'absolute', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 12 },
  emptyCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 8, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  arrowDoodle: { fontSize: 28, marginTop: 8, transform: [{ rotate: '20deg' }] },
  logRow: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  logName: { fontSize: 14, fontWeight: '600', color: '#000' },
  logMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  logCal: { fontSize: 14, fontWeight: '700', color: '#000' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 16, color: '#444' },
  retryButton: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#000', borderRadius: 20 },
  retryText: { color: '#fff', fontWeight: '600' },
});
