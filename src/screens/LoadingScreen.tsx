import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

interface Props {
  onComplete: () => void;
}

const ITEMS = ['Calories', 'Carbs', 'Protein', 'Fats', 'Health Score'];

export default function LoadingScreen({ onComplete }: Props) {
  const [percent, setPercent] = useState(0);
  const [checked, setChecked] = useState<number[]>([]);
  const called = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((p) => {
        const next = Math.min(p + 2, 92);
        if (next === 92) clearInterval(interval);
        return next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const thresholds = [20, 40, 60, 80, 92];
    thresholds.forEach((t, i) => {
      if (percent >= t && !checked.includes(i)) {
        setChecked((c) => [...c, i]);
      }
    });
    if (percent >= 92 && !called.current) {
      called.current = true;
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
  }, [percent]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.percent}>{percent}%</Text>
          <Text style={styles.subtitle}>We're setting{'\n'}everything up for you</Text>

          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.status}>Finalizing results...</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily recommendation for</Text>
          {ITEMS.map((item, i) => (
            <View key={item} style={styles.cardRow}>
              <Text style={styles.cardItem}>• {item}</Text>
              {checked.includes(i) && <Text style={styles.check}>✅</Text>}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60, gap: 32 },
  top: { alignItems: 'center', gap: 12 },
  percent: { fontSize: 64, fontWeight: '800', color: '#000' },
  subtitle: { fontSize: 24, fontWeight: '700', color: '#000', textAlign: 'center', lineHeight: 32 },
  barTrack: {
    width: '100%', height: 8, backgroundColor: '#eee',
    borderRadius: 4, overflow: 'hidden',
  },
  barFill: {
    height: '100%', borderRadius: 4,
    backgroundColor: '#000',
  },
  status: { fontSize: 14, color: '#888' },
  card: { backgroundColor: '#000', borderRadius: 20, padding: 20, gap: 10 },
  cardTitle: { fontSize: 14, color: '#aaa', marginBottom: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardItem: { fontSize: 16, color: '#fff' },
  check: { fontSize: 16 },
});
