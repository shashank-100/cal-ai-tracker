import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

interface Props {
  question: 'burned' | 'rollover';
  onYes: () => void;
  onNo: () => void;
  onBack: () => void;
}

export default function CaloriesRolloverScreen({ question, onYes, onNo, onBack }: Props) {
  const isBurned = question === 'burned';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: isBurned ? '90%' : '92%' }]} />
          </View>
        </View>

        <Text style={styles.title}>
          {isBurned
            ? 'Add calories burned back to your daily goal?'
            : 'Rollover extra calories to the next day?'}
        </Text>

        {!isBurned && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Rollover up to <Text style={styles.badgeHighlight}>200 cals</Text></Text>
          </View>
        )}

        <View style={styles.mockupArea}>
          {isBurned ? <BurnedMockup /> : <RolloverMockup />}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, styles.btnNo]} onPress={onNo} activeOpacity={0.85}>
            <Text style={styles.btnText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnYes]} onPress={onYes} activeOpacity={0.85}>
            <Text style={[styles.btnText, { color: '#fff' }]}>Yes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function BurnedMockup() {
  return (
    <View style={mockup.card}>
      <Text style={mockup.label}>Today's Goal</Text>
      <Text style={mockup.fire}>🔥 500 Cals</Text>
      <Text style={mockup.sub}>Running</Text>
      <Text style={mockup.sub}>+100 cals</Text>
    </View>
  );
}

function RolloverMockup() {
  return (
    <View style={{ gap: 12 }}>
      <View style={[mockup.card, { backgroundColor: '#F7F7F7' }]}>
        <Text style={mockup.dayLabel}>🔥 Yesterday</Text>
        <Text style={mockup.bigNum}>350<Text style={mockup.denom}>/500</Text></Text>
        <Text style={mockup.calsLeft}>Cals left{'\n'}150</Text>
      </View>
      <View style={mockup.card}>
        <Text style={mockup.dayLabel}>Today</Text>
        <Text style={mockup.bigNum}>350<Text style={mockup.denom}>/650</Text></Text>
        <Text style={mockup.calsLeft}>Cals left{'\n'}150 + 150</Text>
      </View>
    </View>
  );
}

const mockup = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  label: { fontSize: 12, color: '#888', marginBottom: 4 },
  fire: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 13, color: '#666' },
  dayLabel: { fontSize: 13, color: '#888', marginBottom: 6 },
  bigNum: { fontSize: 28, fontWeight: '700', color: '#000' },
  denom: { fontSize: 16, fontWeight: '400', color: '#888' },
  calsLeft: { fontSize: 12, color: '#888', marginTop: 4 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#000' },
  progressBar: { flex: 1, height: 4, backgroundColor: '#eee', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#000', borderRadius: 2 },
  title: { fontSize: 28, fontWeight: '700', color: '#000', lineHeight: 36, marginTop: 12, marginBottom: 16 },
  badge: {
    alignSelf: 'flex-start', backgroundColor: '#E8F4FD', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, marginBottom: 20,
  },
  badgeText: { fontSize: 13, color: '#555' },
  badgeHighlight: { color: '#4A90D9', fontWeight: '600' },
  mockupArea: { flex: 1, justifyContent: 'center' },
  btnRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  btn: { flex: 1, borderRadius: 32, paddingVertical: 18, alignItems: 'center' },
  btnNo: { backgroundColor: '#F2F2F2' },
  btnYes: { backgroundColor: '#000' },
  btnText: { fontSize: 16, fontWeight: '600', color: '#000' },
});
