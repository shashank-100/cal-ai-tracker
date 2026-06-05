import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 100 }, (_, i) => String(2006 - i));

interface Props {
  onContinue: (dob: string) => void;
  onBack: () => void;
}

export default function BirthdayScreen({ onContinue, onBack }: Props) {
  const [month, setMonth] = useState('January');
  const [day, setDay] = useState('1');
  const [year, setYear] = useState('1995');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
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
          <ScrollPicker items={MONTHS} selected={month} onSelect={setMonth} flex={2} />
          <ScrollPicker items={DAYS} selected={day} onSelect={setDay} flex={1} />
          <ScrollPicker items={YEARS} selected={year} onSelect={setYear} flex={1.5} />
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => onContinue(`${month} ${day}, ${year}`)}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ScrollPicker({ items, selected, onSelect, flex }: {
  items: string[]; selected: string; onSelect: (v: string) => void; flex: number;
}) {
  const selectedIdx = items.indexOf(selected);
  const visible = items.slice(Math.max(0, selectedIdx - 2), selectedIdx + 4);

  return (
    <View style={[picker.col, { flex }]}>
      {visible.map((item) => {
        const isSelected = item === selected;
        return (
          <TouchableOpacity key={item} onPress={() => onSelect(item)} style={picker.row}>
            <Text style={[picker.item, isSelected && picker.itemSelected]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const picker = StyleSheet.create({
  col: { alignItems: 'center' },
  row: { paddingVertical: 8 },
  item: { fontSize: 15, color: '#ccc', textAlign: 'center' },
  itemSelected: {
    fontSize: 17, color: '#000', fontWeight: '600',
    backgroundColor: '#F2F2F2', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
});

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
  pickersRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  cta: {
    backgroundColor: '#000', borderRadius: 32, paddingVertical: 18,
    alignItems: 'center', marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
