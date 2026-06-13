import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function PotentialScreen({ onContinue, onBack }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '90%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            You have great potential to crush{'\n'}your goal
          </Text>

          <View style={styles.chartBox}>
            <Text style={styles.chartTitle}>Your weight transition</Text>
            <WeightTransitionChart />
            <View style={styles.xLabels}>
              <Text style={styles.xLabel}>3 Days</Text>
              <Text style={styles.xLabel}>7 Days</Text>
              <Text style={styles.xLabel}>30 Days</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statText}>
              Based on Cal AI's historical data, weight gain is usually delayed at first, but after 7 days, you can reach your goal quickly!
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cta} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function WeightTransitionChart() {
  return (
    <Svg width="100%" height={120} viewBox="0 0 300 120">
      {/* Background fill area */}
      <Path
        d="M 0,100 C 60,98 100,90 150,70 C 200,50 250,20 300,5 L 300,120 L 0,120 Z"
        fill="#f5e8d8"
        opacity="0.6"
      />
      {/* Curve line */}
      <Path
        d="M 0,100 C 60,98 100,90 150,70 C 200,50 250,20 300,5"
        stroke="#E8955A"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Dots */}
      <Circle cx="0" cy="100" r="5" fill="#fff" stroke="#ccc" strokeWidth="2" />
      <Circle cx="90" cy="95" r="5" fill="#fff" stroke="#ccc" strokeWidth="2" />
      <Circle cx="180" cy="60" r="5" fill="#fff" stroke="#ccc" strokeWidth="2" />
      <Circle cx="300" cy="5" r="8" fill="#E8955A" />
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
  progressFill: { height: '100%', backgroundColor: '#000', borderRadius: 2 },
  content: { flex: 1, paddingTop: 16 },
  title: { fontSize: 30, fontWeight: '700', color: '#000', lineHeight: 38, marginBottom: 28 },
  chartBox: {
    backgroundColor: '#FDF6EE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 },
  xLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  xLabel: { fontSize: 11, color: '#999' },
  statBox: { backgroundColor: '#F2F2F2', borderRadius: 14, padding: 16 },
  statText: { fontSize: 14, color: '#444', lineHeight: 22 },
  cta: {
    backgroundColor: '#000',
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
