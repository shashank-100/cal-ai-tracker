import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  onGetStarted: () => void;
  onBack: () => void;
  goal?: string;
  desiredWeightLbs?: number;
  birthday?: string;
}

function calcMacros(goal: string, weightLbs: number) {
  // Rough estimate: maintenance ~15 cal/lb, adjust by goal
  const base = Math.round(weightLbs * 15);
  const calories = goal === 'Gain weight' ? base + 300 : goal === 'Lose weight' ? base - 500 : base;
  const protein = Math.round(weightLbs * 0.8);
  const fats = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);
  return { calories, protein, fats, carbs };
}

function calcTargetDate(weightLbs: number, goal: string, speedLbs = 1.0): string {
  const weeks = Math.ceil(Math.abs(weightLbs) / speedLbs);
  const date = new Date();
  date.setDate(date.getDate() + weeks * 7);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export default function PlanReadyScreen({ onGetStarted, onBack, goal = 'Gain weight', desiredWeightLbs = 10, birthday }: Props) {
  const insets = useSafeAreaInsets();
  const currentWeight = 155; // default until we collect current weight
  const targetDiff = Math.abs(desiredWeightLbs - currentWeight);
  const macros = calcMacros(goal, currentWeight);
  const targetDate = calcTargetDate(targetDiff, goal);
  const goalVerb = goal === 'Gain weight' ? 'gain' : goal === 'Lose weight' ? 'lose' : 'maintain';

  const MACROS = [
    { label: 'Calories', value: String(macros.calories), unit: '', color: '#000', emoji: '🔥' },
    { label: 'Carbs', value: String(macros.carbs), unit: 'g', color: '#E8955A', emoji: '🌾' },
    { label: 'Protein', value: String(macros.protein), unit: 'g', color: '#E87070', emoji: '🥩' },
    { label: 'Fats', value: String(macros.fats), unit: 'g', color: '#70A8E8', emoji: '💧' },
  ];
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.checkCircle}><Text style={styles.checkIcon}>✓</Text></View>
          <Text style={styles.title}>Congratulations{'\n'}your custom plan is ready!</Text>

          <View style={styles.gainBadge}>
            <Text style={styles.gainText}>You should {goalVerb}:</Text>
          </View>
          <View style={styles.targetBadge}>
            <Text style={styles.targetText}>{targetDiff} lbs by {targetDate}</Text>
          </View>

          <View style={styles.macroBox}>
            <Text style={styles.macroTitle}>Daily recommendation</Text>
            <Text style={styles.macroSubtitle}>You can edit this anytime</Text>

            <View style={styles.macroGrid}>
              {MACROS.map((m) => (
                <View key={m.label} style={styles.macroCard}>
                  <Text style={styles.macroEmoji}>{m.emoji}</Text>
                  <Text style={styles.macroLabel}>{m.label}</Text>
                  <MacroRing color={m.color} />
                  <Text style={styles.macroValue}>
                    {m.value}<Text style={styles.macroUnit}>{m.unit}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.cta} onPress={onGetStarted} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Let's get started!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function MacroRing({ color }: { color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  return (
    <Svg width={70} height={70} viewBox="0 0 70 70">
      <Circle cx={35} cy={35} r={r} stroke="#eee" strokeWidth={5} fill="none" />
      <Circle
        cx={35} cy={35} r={r}
        stroke={color} strokeWidth={5} fill="none"
        strokeDasharray={circ}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        rotation="-90"
        origin="35,35"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#000' },
  progressBar: { flex: 1, height: 4, backgroundColor: '#eee', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#000', borderRadius: 2, width: '100%' },
  content: { flex: 1, alignItems: 'center', paddingTop: 8 },
  checkCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  checkIcon: { color: '#fff', fontSize: 24, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#000', textAlign: 'center', lineHeight: 30, marginBottom: 16 },
  gainBadge: { marginBottom: 4 },
  gainText: { fontSize: 15, fontWeight: '600', color: '#000' },
  targetBadge: {
    backgroundColor: '#F2F2F2', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, marginBottom: 20,
  },
  targetText: { fontSize: 15, color: '#444' },
  macroBox: {
    backgroundColor: '#F7F7F7', borderRadius: 20, padding: 16,
    width: '100%',
  },
  macroTitle: { fontSize: 15, fontWeight: '700', color: '#000' },
  macroSubtitle: { fontSize: 13, color: '#888', marginBottom: 12 },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  macroCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 16,
    padding: 12, alignItems: 'center', gap: 4,
  },
  macroEmoji: { fontSize: 18 },
  macroLabel: { fontSize: 13, color: '#666' },
  macroValue: { fontSize: 22, fontWeight: '700', color: '#000' },
  macroUnit: { fontSize: 14, fontWeight: '400' },
  cta: {
    backgroundColor: '#000', borderRadius: 32, paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
