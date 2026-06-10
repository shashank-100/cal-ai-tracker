import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Rect } from 'react-native-svg';

interface Props {
  onContinue: (weight: number) => void;
  onBack: () => void;
}

const MIN = 100;
const MAX = 250;

export default function DesiredWeightScreen({ onContinue, onBack }: Props) {
  const [weight, setWeight] = useState(165);
  const insets = useSafeAreaInsets();

  const ticks = Array.from({ length: 31 }, (_, i) => MIN + i * 5);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '70%' }]} />
          </View>
        </View>

        <Text style={styles.title}>What is your{'\n'}desired weight?</Text>

        <View style={styles.weightDisplay}>
          <Text style={styles.gainLabel}>Gain weight</Text>
          <Text style={styles.weightNum}>{weight.toFixed(1)} lbs</Text>
        </View>

        {/* Ruler / slider */}
        <View style={styles.rulerWrap}>
          <Svg width="100%" height={80} viewBox="0 0 320 80">
            {ticks.map((tick, i) => {
              const x = (i / (ticks.length - 1)) * 320;
              const isSelected = tick === weight;
              const isMajor = tick % 10 === 0;
              return (
                <Line
                  key={tick}
                  x1={x} y1={isMajor ? 20 : 35}
                  x2={x} y2={60}
                  stroke={isSelected ? '#000' : '#ccc'}
                  strokeWidth={isSelected ? 3 : 1}
                />
              );
            })}
            {/* Center indicator line */}
            <Line x1={160} y1={0} x2={160} y2={80} stroke="#000" strokeWidth={2} />
          </Svg>

          <View style={styles.rulerBtns}>
            <TouchableOpacity onPress={() => setWeight(w => Math.max(MIN, w - 0.5))} style={styles.nudge}>
              <Text style={styles.nudgeText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setWeight(w => Math.min(MAX, w + 0.5))} style={styles.nudge}>
              <Text style={styles.nudgeText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.cta} onPress={() => onContinue(weight)} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>
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
  progressBar: { flex: 1, height: 4, backgroundColor: '#eee', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#000', borderRadius: 2 },
  title: { fontSize: 30, fontWeight: '700', color: '#000', lineHeight: 38, marginTop: 16, marginBottom: 40 },
  weightDisplay: { alignItems: 'center', marginBottom: 32 },
  gainLabel: { fontSize: 14, color: '#888', marginBottom: 8 },
  weightNum: { fontSize: 40, fontWeight: '700', color: '#000' },
  rulerWrap: { flex: 1, justifyContent: 'center' },
  rulerBtns: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 16 },
  nudge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center',
  },
  nudgeText: { fontSize: 24, fontWeight: '300' },
  cta: {
    backgroundColor: '#000', borderRadius: 32, paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
