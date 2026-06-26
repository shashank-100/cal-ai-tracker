import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import type { PlanGenerateRequest } from '../lib/types';

interface OnboardingData {
  gender?: string;
  birthday?: string;
  height?: string;
  weight?: string;
  metric?: boolean;
  goal?: string;
  desiredWeightLbs?: number;
  weightSpeedLbs?: number;
  workouts?: string;
  diet?: string;
  addCaloriesBurned?: boolean;
  rolloverCalories?: boolean;
}

interface Props {
  onboardingData: OnboardingData;
  onComplete: () => void;
}

const ITEMS = ['Calories', 'Carbs', 'Protein', 'Fats', 'Health Score'];

function parseHeightToCm(height: string, metric: boolean): number {
  if (metric) return parseFloat(height) || 170;
  const match = height.match(/(\d+)\s*ft\s*(\d+)\s*in/);
  if (match) return Math.round(parseInt(match[1]) * 30.48 + parseInt(match[2]) * 2.54);
  return 170;
}

function parseWeightToKg(weight: string, metric: boolean): number {
  if (metric) return parseFloat(weight) || 70;
  return Math.round((parseFloat(weight) || 154) * 0.453592);
}

function mapGoal(goal?: string): 'lose' | 'maintain' | 'gain' {
  if (!goal) return 'maintain';
  const g = goal.toLowerCase();
  if (g.includes('lose')) return 'lose';
  if (g.includes('gain')) return 'gain';
  return 'maintain';
}

function mapWorkouts(workouts?: string): number {
  if (!workouts) return 3;
  const w = workouts.toLowerCase();
  // A leading number in the label is authoritative (e.g. "3-5 times" → 3).
  const match = w.match(/\d+/);
  if (match) return Math.min(parseInt(match[0], 10), 7);
  if (w.includes('never')) return 0;
  if (w.includes('rarely') || w.includes('lightly')) return 2;
  if (w.includes('often') || w.includes('very')) return 5;
  return 3;
}

export default function LoadingScreen({ onboardingData, onComplete }: Props) {
  const [percent, setPercent] = useState(0);
  const [checked, setChecked] = useState<number[]>([]);
  const called = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const { token } = useAuthStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((p) => {
        const next = Math.min(p + 2, 92);
        if (next === 92) clearInterval(interval);
        return next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const thresholds = [20, 40, 60, 80, 92];
    thresholds.forEach((t, i) => {
      if (percent >= t && !checked.includes(i)) {
        setChecked((c) => [...c, i]);
      }
    });
  }, [percent]);

  useEffect(() => {
    if (percent < 30 || called.current || !token) return;
    called.current = true;

    const isMetric = onboardingData.metric ?? false;
    const heightCm = parseHeightToCm(onboardingData.height ?? '5 ft 9 in', isMetric);
    const weightKg = parseWeightToKg(onboardingData.weight ?? '155 lb', isMetric);
    const desiredWeightKg = Math.round(
      (onboardingData.desiredWeightLbs ?? 145) * 0.453592
    );
    const weightSpeedKgWeek = Math.round(
      (onboardingData.weightSpeedLbs ?? 1) * 0.453592 * 10
    ) / 10;

    const body: PlanGenerateRequest = {
      gender: onboardingData.gender ?? 'other',
      birthday: onboardingData.birthday ?? '1990-01-01',
      height_cm: heightCm,
      weight_kg: weightKg,
      goal: mapGoal(onboardingData.goal),
      desired_weight_kg: desiredWeightKg,
      weight_speed_kg_week: weightSpeedKgWeek,
      workouts_per_week: mapWorkouts(onboardingData.workouts),
      diet_preference: onboardingData.diet ?? 'balanced',
    };

    api.plans.generate(token, body)
      .then(() => {
        setPercent(100);
        setTimeout(() => onCompleteRef.current(), 400);
      })
      .catch(() => {
        setPercent(100);
        Alert.alert(
          'Setup incomplete',
          'Could not generate your plan. You can set it up from Settings.',
          [{ text: 'Continue', onPress: () => onCompleteRef.current() }],
          { cancelable: false }
        );
      });
  }, [percent, token]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.percent}>{percent}%</Text>
          <Text style={styles.subtitle}>We're setting{'\n'}everything up for you</Text>

          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.status}>Finalizing results...</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily recommendation for</Text>
          {ITEMS.map((item, i) => (
            <View key={item} style={styles.cardRow}>
              <Text style={styles.cardItem}>• {item}</Text>
              {checked.includes(i) && <Text style={styles.check}>✅</Text>}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60, gap: 32 },
  top: { alignItems: 'center', gap: 12 },
  percent: { fontSize: 64, fontWeight: '800', color: '#000' },
  subtitle: { fontSize: 24, fontWeight: '700', color: '#000', textAlign: 'center', lineHeight: 32 },
  barTrack: {
    width: '100%', height: 8, backgroundColor: '#eee',
    borderRadius: 4, overflow: 'hidden',
  },
  barFill: {
    height: '100%', borderRadius: 4,
    backgroundColor: '#000',
  },
  status: { fontSize: 14, color: '#888' },
  card: { backgroundColor: '#000', borderRadius: 20, padding: 20, gap: 10 },
  cardTitle: { fontSize: 14, color: '#aaa', marginBottom: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardItem: { fontSize: 16, color: '#fff' },
  check: { fontSize: 16 },
});
