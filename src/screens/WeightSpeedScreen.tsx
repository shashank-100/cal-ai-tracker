import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SPEEDS = [
  { value: 0.2, emoji: '🦥' },
  { value: 1.0, emoji: '🐂' },
  { value: 1.5, emoji: '🐂' },
  { value: 3.0, emoji: '🐆' },
];

interface Props {
  onContinue: (lbs: number) => void;
  onBack: () => void;
}

export default function WeightSpeedScreen({ onContinue, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(1.0);
  const [trackWidth, setTrackWidth] = useState(0);

  const index = SPEEDS.findIndex((s) => s.value === selected);
  const onTrackLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '20%' }]} />
          </View>
        </View>

        <Text style={styles.title}>How fast do you want{'\n'}to reach your goal?</Text>

        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>Gain weight speed per week</Text>
          <Text style={styles.sliderValue}>{selected.toFixed(1)} lbs</Text>

          <View style={styles.emojiRow}>
            {SPEEDS.map((s) => (
              <Text
                key={s.value}
                style={[styles.emoji, selected === s.value && styles.emojiActive]}
              >
                {s.emoji}
              </Text>
            ))}
          </View>

          {/* Track */}
          <View style={styles.track} onLayout={onTrackLayout}>
            <View style={[styles.trackFill, { width: trackWidth ? (index / (SPEEDS.length - 1)) * trackWidth : 0 }]} />
            {trackWidth > 0 && SPEEDS.map((s, i) => (
              <TouchableOpacity
                key={s.value}
                style={[
                  styles.dot,
                  { left: (i / (SPEEDS.length - 1)) * trackWidth },
                  selected === s.value && styles.dotActive,
                ]}
                onPress={() => setSelected(s.value)}
              />
            ))}
          </View>

          <View style={styles.tickLabels}>
            {SPEEDS.map((s) => (
              <Text key={s.value} style={styles.tickLabel}>{s.value} lbs</Text>
            ))}
          </View>

          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cta} onPress={() => onContinue(selected)} activeOpacity={0.85}>
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
  sliderSection: { flex: 1, alignItems: 'center' },
  sliderLabel: { fontSize: 14, color: '#888', marginBottom: 8 },
  sliderValue: { fontSize: 32, fontWeight: '700', color: '#000', marginBottom: 24 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  emoji: { fontSize: 28, opacity: 0.3 },
  emojiActive: { opacity: 1 },
  track: { width: '100%', height: 4, backgroundColor: '#eee', borderRadius: 2, position: 'relative', marginBottom: 8 },
  trackFill: { height: '100%', backgroundColor: '#000', borderRadius: 2 },
  dot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ccc',
    top: -7,
    marginLeft: -9,
  },
  dotActive: { backgroundColor: '#000' },
  tickLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 },
  tickLabel: { fontSize: 12, color: '#888' },
  recommendedBadge: {
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  recommendedText: { fontSize: 14, color: '#666', fontWeight: '500' },
  cta: {
    backgroundColor: '#000',
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
