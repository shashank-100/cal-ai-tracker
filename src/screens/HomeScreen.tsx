import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import type { DailySummary, Streak } from '../lib/types';
import FoodLogModal from '../components/FoodLogModal';

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
  const { token } = useAuthStore();
  const insets = useSafeAreaInsets();
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
    { label: 'Protein left', value: proteinLeft != null ? `${Math.round(proteinLeft)}g` : '—', color: '#E87070', emoji: '🥩' },
    { label: 'Carbs left', value: carbsLeft != null ? `${Math.round(carbsLeft)}g` : '—', color: '#E8955A', emoji: '🌾' },
    { label: 'Fat left', value: fatLeft != null ? `${Math.round(fatLeft)}g` : '—', color: '#70A8E8', emoji: '💧' },
  ];

  const recentLogs = summary
    ? [
        ...(summary.entries_by_meal.breakfast ?? []),
        ...(summary.entries_by_meal.lunch ?? []),
        ...(summary.entries_by_meal.dinner ?? []),
        ...(summary.entries_by_meal.snack ?? []),
      ].slice(-5)
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
                      strokeDasharray={125} strokeDashoffset={40} strokeLinecap="round"
                      rotation="-90" origin="26,26" />
                  </Svg>
                  <Text style={styles.macroEmoji}>{m.emoji}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Recently logged</Text>
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
          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabIcon}>⊞</Text>
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('progress')}>
            <Text style={styles.tabIcon}>📊</Text>
            <Text style={styles.tabLabel}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('settings')}>
            <Text style={styles.tabIcon}>⚙️</Text>
            <Text style={styles.tabLabel}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
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
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 12,
    paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: '#eee',
    alignItems: 'center',
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: '#888' },
  tabLabelActive: { color: '#000', fontWeight: '600' },
  fab: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#000', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 16, color: '#444' },
  retryButton: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#000', borderRadius: 20 },
  retryText: { color: '#fff', fontWeight: '600' },
});
