import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScrollPicker from '../components/ScrollPicker';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 100 }, (_, i) => String(2006 - i));

const ITEM_HEIGHT = 48;

interface Props {
  onContinue: (dob: string) => void;
  onBack: () => void;
}

export default function BirthdayScreen({ onContinue, onBack }: Props) {
  const [month, setMonth] = useState('January');
  const [day, setDay] = useState('1');
  const [year, setYear] = useState('1995');
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
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        <Text style={styles.title}>When were you born?</Text>
        <Text style={styles.subtitle}>This will be used to calibrate your custom plan.</Text>

        <View style={styles.pickersRow}>
          <View style={styles.selectionOverlay} pointerEvents="none" />
          <ScrollPicker items={MONTHS} selected={month} onSelect={setMonth} itemHeight={ITEM_HEIGHT} flex={2} />
          <ScrollPicker items={DAYS} selected={day} onSelect={setDay} itemHeight={ITEM_HEIGHT} flex={1} />
          <ScrollPicker items={YEARS} selected={year} onSelect={setYear} itemHeight={ITEM_HEIGHT} flex={1.5} />
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => {
            const monthIdx = MONTHS.indexOf(month);
            const dayNum = parseInt(day, 10);
            const yearNum = parseInt(year, 10);
            // Validate by constructing with numeric args (no locale-dependent string parsing)
            const d = new Date(yearNum, monthIdx, dayNum);
            if (d.getMonth() !== monthIdx || d.getDate() !== dayNum) return;
            const iso = `${yearNum}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            onContinue(iso);
          }}
          activeOpacity={0.85}
        >
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
  title: { fontSize: 30, fontWeight: '700', color: '#000', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 8, marginBottom: 32 },
  pickersRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  selectionOverlay: {
    position: 'absolute',
    left: 0, right: 0,
    top: '50%',
    marginTop: -ITEM_HEIGHT / 2,
    height: ITEM_HEIGHT,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
  },
  cta: {
    backgroundColor: '#000', borderRadius: 32, paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
