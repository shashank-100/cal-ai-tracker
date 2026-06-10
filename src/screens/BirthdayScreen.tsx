import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, FlatList, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 100 }, (_, i) => String(2006 - i));

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

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
          <ScrollPicker items={MONTHS} selected={month} onSelect={setMonth} flex={2} />
          <ScrollPicker items={DAYS} selected={day} onSelect={setDay} flex={1} />
          <ScrollPicker items={YEARS} selected={year} onSelect={setYear} flex={1.5} />
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => {
            const d = new Date(`${month} ${day}, ${year}`);
            const monthIdx = MONTHS.indexOf(month);
            if (isNaN(d.getTime()) || d.getMonth() !== monthIdx) return;
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

function ScrollPicker({ items, selected, onSelect, flex }: {
  items: string[]; selected: string; onSelect: (v: string) => void; flex: number;
}) {
  const initialIndex = items.indexOf(selected);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const mid = viewableItems[Math.floor(viewableItems.length / 2)];
    if (mid?.item) onSelect(mid.item);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  return (
    <View style={{ flex, height: PICKER_HEIGHT }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * 2 + ITEM_HEIGHT * index, index })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        renderItem={({ item }) => {
          const isSelected = item === selected;
          return (
            <View style={picker.row}>
              <Text style={[picker.item, isSelected && picker.itemSelected]}>{item}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const picker = StyleSheet.create({
  row: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  item: { fontSize: 15, color: '#ccc', textAlign: 'center' },
  itemSelected: { fontSize: 17, color: '#000', fontWeight: '600' },
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
