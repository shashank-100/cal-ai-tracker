import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function GainComparisonScreen({ onContinue, onBack }: Props) {
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
            <View style={[styles.progressFill, { width: '30%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Gain twice as much{'\n'}weight with Cal AI vs{'\n'}on your own</Text>

        <View style={styles.chartWrap}>
          <View style={styles.barGroup}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Without{'\n'}Cal AI</Text>
              <Text style={styles.barLabel}>With{'\n'}Cal AI</Text>
            </View>
            <View style={styles.bars}>
              <View style={styles.barSlot}>
                <View style={[styles.bar, styles.barGray, { height: 80 }]} />
                <Text style={styles.barValue}>20%</Text>
              </View>
              <View style={styles.barSlot}>
                <View style={[styles.bar, styles.barBlack, { height: 160 }]} />
                <Text style={[styles.barValue, { color: '#fff', marginTop: -24 }]}>2X</Text>
              </View>
            </View>
          </View>
          <Text style={styles.caption}>Cal AI makes it easy and holds{'\n'}you accountable.</Text>
        </View>

        <TouchableOpacity style={styles.cta} onPress={onContinue} activeOpacity={0.85}>
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
  title: { fontSize: 30, fontWeight: '700', color: '#000', lineHeight: 38, marginTop: 16, marginBottom: 32 },
  chartWrap: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  barGroup: { width: '100%', alignItems: 'center' },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-around', width: '60%', marginBottom: 12 },
  barLabel: { fontSize: 13, color: '#666', textAlign: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 24, marginBottom: 16 },
  barSlot: { alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 80, borderRadius: 8 },
  barGray: { backgroundColor: '#D0D0D0' },
  barBlack: { backgroundColor: '#000' },
  barValue: { fontSize: 16, fontWeight: '700', color: '#666', marginTop: 8 },
  caption: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },
  cta: {
    backgroundColor: '#000',
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
