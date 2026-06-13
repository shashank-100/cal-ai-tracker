import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  targetLbs?: number;
  onContinue: () => void;
  onBack: () => void;
}

export default function RealisticTargetScreen({ targetLbs = 10, onContinue, onBack }: Props) {
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
            <View style={[styles.progressFill, { width: '80%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            Gaining{' '}
            <Text style={styles.highlight}>{targetLbs} lbs</Text>
            {' '}is a{'\n'}realistic target. It's{'\n'}not hard at all!
          </Text>

          <Text style={styles.body}>
            90% of users say that the change is obvious after using Cal AI and it is not easy to rebound.
          </Text>
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
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '700', color: '#000', lineHeight: 42, marginBottom: 20 },
  highlight: { color: '#E8955A' },
  body: { fontSize: 15, color: '#666', lineHeight: 24 },
  cta: {
    backgroundColor: '#000', borderRadius: 32, paddingVertical: 18,
    alignItems: 'center', marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
