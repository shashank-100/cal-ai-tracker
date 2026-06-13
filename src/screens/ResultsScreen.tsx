import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function ResultsScreen({ onContinue, onBack }: Props) {
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
            <View style={styles.progressFill} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Cal AI creates{'\n'}long-term results</Text>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Your weight</Text>
            <WeightChart />
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#000' }]} />
                <Text style={styles.legendText}>Cal AI</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ccc' }]} />
                <Text style={styles.legendText}>Traditional diet</Text>
              </View>
            </View>
            <View style={styles.xLabels}>
              <Text style={styles.xLabel}>Month 1</Text>
              <Text style={styles.xLabel}>Month 6</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statText}>
              80% of Cal AI users maintain their weight loss even 6 months later
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

function WeightChart() {
  return (
    <Svg width="100%" height={160} viewBox="0 0 300 160">
      {/* Grid lines */}
      <Line x1="0" y1="40" x2="300" y2="40" stroke="#eee" strokeWidth="1" />
      <Line x1="0" y1="80" x2="300" y2="80" stroke="#eee" strokeWidth="1" />
      <Line x1="0" y1="120" x2="300" y2="120" stroke="#eee" strokeWidth="1" />

      {/* Traditional diet curve — drops then rebounds */}
      <Path
        d="M 0,40 C 60,50 100,90 150,110 C 200,130 250,120 300,115"
        stroke="#ddd"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="6,3"
      />

      {/* Cal AI curve — drops and stays low */}
      <Path
        d="M 0,40 C 60,60 120,100 180,128 C 220,140 260,142 300,143"
        stroke="#000"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Start dot */}
      <Circle cx="0" cy="40" r="5" fill="#000" />
      {/* End dot Cal AI */}
      <Circle cx="300" cy="143" r="5" fill="#000" />
      {/* End dot traditional */}
      <Circle cx="300" cy="115" r="5" fill="#ccc" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#000' },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  content: { flex: 1, paddingTop: 16 },
  title: { fontSize: 30, fontWeight: '700', color: '#000', lineHeight: 38, marginBottom: 32 },
  chartContainer: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#666' },
  xLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  xLabel: { fontSize: 11, color: '#999' },
  statBox: {
    backgroundColor: '#F2F2F2',
    borderRadius: 14,
    padding: 16,
  },
  statText: { fontSize: 15, color: '#000', fontWeight: '500', lineHeight: 22, textAlign: 'center' },
  cta: {
    backgroundColor: '#000',
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
