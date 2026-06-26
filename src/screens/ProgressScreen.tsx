import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import FloatingTabBar, { makeTabHandler, profileInitials, type NavTarget } from '../components/FloatingTabBar';

interface DayProgress {
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  goal_calories: number;
  on_target: boolean;
}

interface WeeklyData {
  week_start: string;
  week_end: string;
  goal_calories: number;
  daily: DayProgress[];
  days_logged: number;
  days_on_target: number;
  avg_calories: number;
}

interface MonthlyData {
  year: number;
  month: number;
  goal_calories: number;
  days_in_month: number;
  days_logged: number;
  days_on_target: number;
  adherence_pct: number;
  avg_calories: number;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Label a bar from its own date (YYYY-MM-DD), parsed as local time, so labels
// always match the data regardless of which weekday the API's week starts on.
function dayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return '';
  return WEEKDAY_LABELS[new Date(y, m - 1, d).getDay()];
}

interface Props {
  onBack: () => void;
  onNavigate?: (target: NavTarget) => void;
}

export default function ProgressScreen({ onBack, onNavigate }: Props) {
  const { token, user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const initials = profileInitials(
    (user?.user_metadata as any)?.full_name ?? (user?.user_metadata as any)?.name,
    user?.email
  );
  const tabBarClearance = 76 + Math.max(insets.bottom, 10);
  const [weekly, setWeekly] = useState<WeeklyData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    // No token (e.g. "Skip for now"): don't get stuck on the spinner.
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const [w, m] = await Promise.all([
        api.progress.weekly(token),
        api.progress.monthly(token),
      ]);
      setWeekly(w);
      setMonthly(m);
    } catch (err) {
      console.warn('ProgressScreen load failed:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const maxCalories = weekly
    ? Math.max(...weekly.daily.map(d => d.calories), weekly.goal_calories, 1)
    : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Progress</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Couldn't load progress.</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Weekly bar chart */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>This Week</Text>
            <Text style={styles.cardSub}>
              {weekly?.days_logged ?? 0} days logged · avg {Math.round(weekly?.avg_calories ?? 0)} kcal
            </Text>
            <View style={styles.barChart}>
              {(weekly?.daily ?? []).map((d) => {
                const height = Math.max((d.calories / maxCalories) * 120, d.calories > 0 ? 4 : 0);
                const goalLine = (weekly!.goal_calories / maxCalories) * 120;
                return (
                  <View key={d.date} style={styles.barCol}>
                    <View style={styles.barWrap}>
                      <View style={[styles.goalLine, { bottom: goalLine }]} />
                      <View style={[
                        styles.bar,
                        { height },
                        d.calories > 0 && (d.on_target ? styles.barGood : styles.barOver),
                      ]} />
                    </View>
                    <Text style={styles.barLabel}>{dayLabel(d.date)}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>On target</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E87070' }]} />
                <Text style={styles.legendText}>Over</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ccc' }]} />
                <Text style={styles.legendText}>Goal</Text>
              </View>
            </View>
          </View>

          {/* Monthly stats */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {MONTH_NAMES[(monthly?.month ?? 1) - 1]} {monthly?.year}
            </Text>
            <View style={styles.statGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{monthly?.days_logged ?? 0}</Text>
                <Text style={styles.statLabel}>Days logged</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{monthly?.days_on_target ?? 0}</Text>
                <Text style={styles.statLabel}>On target</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{Math.round(monthly?.adherence_pct ?? 0)}%</Text>
                <Text style={styles.statLabel}>Adherence</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{Math.round(monthly?.avg_calories ?? 0)}</Text>
                <Text style={styles.statLabel}>Avg kcal</Text>
              </View>
            </View>

            {/* Adherence ring */}
            <View style={styles.adherenceRow}>
              <View style={styles.adherenceBar}>
                <View style={[styles.adherenceFill, { width: `${monthly?.adherence_pct ?? 0}%` as any }]} />
              </View>
              <Text style={styles.adherencePct}>{Math.round(monthly?.adherence_pct ?? 0)}%</Text>
            </View>
          </View>

          <View style={{ height: tabBarClearance }} />
        </ScrollView>
      )}

      <FloatingTabBar
        active="progress"
        initials={initials}
        onSelect={makeTabHandler((target) => {
          if (target === 'home') onBack();
          else onNavigate?.(target);
        })}
        onAdd={() => onNavigate?.('home')}
      />
    </SafeAreaView>
  );
}

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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 15, color: '#444' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#000', borderRadius: 20 },
  retryText: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#888', marginBottom: 20 },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 },
  barCol: { flex: 1, alignItems: 'center' },
  barWrap: { width: 28, height: 120, justifyContent: 'flex-end', position: 'relative' },
  bar: { width: 28, borderRadius: 6, backgroundColor: '#ddd' },
  barGood: { backgroundColor: '#4CAF50' },
  barOver: { backgroundColor: '#E87070' },
  goalLine: {
    position: 'absolute', left: 0, right: 0, height: 1.5,
    backgroundColor: '#ccc',
  },
  barLabel: { fontSize: 11, color: '#888', marginTop: 6 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#666' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statBox: {
    flex: 1, minWidth: '40%', backgroundColor: '#F7F7F7', borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  statNum: { fontSize: 24, fontWeight: '800', color: '#000' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  adherenceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adherenceBar: {
    flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden',
  },
  adherenceFill: { height: '100%', backgroundColor: '#000', borderRadius: 4 },
  adherencePct: { fontSize: 14, fontWeight: '700', color: '#000', width: 40, textAlign: 'right' },
});
