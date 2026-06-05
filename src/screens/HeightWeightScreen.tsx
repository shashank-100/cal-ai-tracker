import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, ScrollView, Switch,
} from 'react-native';

interface Props {
  onContinue: (data: { height: string; weight: string; metric: boolean }) => void;
  onBack: () => void;
}

const HEIGHTS_IMPERIAL = ['3 ft', '4 ft', '5 ft', '6 ft', '7 ft'];
const INCHES = ['0 in', '1 in', '2 in', '3 in', '4 in', '5 in', '6 in', '7 in', '8 in', '9 in', '10 in', '11 in'];
const WEIGHTS_IMPERIAL = Array.from({ length: 200 }, (_, i) => `${i + 80} lb`);
const HEIGHTS_METRIC = Array.from({ length: 100 }, (_, i) => `${i + 100} cm`);
const WEIGHTS_METRIC = Array.from({ length: 200 }, (_, i) => `${i + 30} kg`);

export default function HeightWeightScreen({ onContinue, onBack }: Props) {
  const [metric, setMetric] = useState(false);
  const [height, setHeight] = useState('5 ft');
  const [inch, setInch] = useState('9 in');
  const [weight, setWeight] = useState('155 lb');
  const [heightCm, setHeightCm] = useState('170 cm');
  const [weightKg, setWeightKg] = useState('70 kg');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '45%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Height & weight</Text>
        <Text style={styles.subtitle}>This will be used to calibrate your custom plan.</Text>

        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, !metric && styles.toggleActive]}>Imperial</Text>
          <Switch
            value={metric}
            onValueChange={setMetric}
            trackColor={{ false: '#ddd', true: '#ddd' }}
            thumbColor="#fff"
          />
          <Text style={[styles.toggleLabel, metric && styles.toggleActive]}>Metric</Text>
        </View>

        <View style={styles.pickersRow}>
          {metric ? (
            <>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerHeader}>Height</Text>
                <ScrollPicker items={HEIGHTS_METRIC} selected={heightCm} onSelect={setHeightCm} />
              </View>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerHeader}>Weight</Text>
                <ScrollPicker items={WEIGHTS_METRIC} selected={weightKg} onSelect={setWeightKg} />
              </View>
            </>
          ) : (
            <>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerHeader}>Height</Text>
                <ScrollPicker items={HEIGHTS_IMPERIAL} selected={height} onSelect={setHeight} />
              </View>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerHeader}> </Text>
                <ScrollPicker items={INCHES} selected={inch} onSelect={setInch} />
              </View>
              <View style={styles.pickerCol}>
                <Text style={styles.pickerHeader}>Weight</Text>
                <ScrollPicker items={WEIGHTS_IMPERIAL} selected={weight} onSelect={setWeight} />
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => onContinue({
            height: metric ? heightCm : `${height} ${inch}`,
            weight: metric ? weightKg : weight,
            metric,
          })}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ScrollPicker({ items, selected, onSelect }: {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={picker.wrap}>
      {items.map((item) => (
        <TouchableOpacity key={item} onPress={() => onSelect(item)} style={picker.row}>
          <Text style={[picker.item, selected === item && picker.itemSelected]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const picker = StyleSheet.create({
  wrap: { alignItems: 'center' },
  row: { paddingVertical: 8 },
  item: { fontSize: 16, color: '#ccc' },
  itemSelected: { fontSize: 20, color: '#000', fontWeight: '600' },
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
  subtitle: { fontSize: 14, color: '#666', marginTop: 8, marginBottom: 24 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  toggleLabel: { fontSize: 15, color: '#999' },
  toggleActive: { color: '#000', fontWeight: '600' },
  pickersRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  pickerCol: { alignItems: 'center', flex: 1 },
  pickerHeader: { fontSize: 13, color: '#000', fontWeight: '600', marginBottom: 12 },
  cta: {
    backgroundColor: '#000',
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
