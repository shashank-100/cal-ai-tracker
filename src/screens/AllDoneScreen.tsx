import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function AllDoneScreen({ onContinue, onBack }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🤞</Text>
          </View>
          <View style={styles.doneBadge}>
            <Text style={styles.doneText}>✅ All done!</Text>
          </View>
          <Text style={styles.title}>Time to generate{'\n'}your custom plan!</Text>
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
  progressBar: { flex: 1, height: 4, backgroundColor: '#000', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#000', borderRadius: 2, width: '100%' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  iconCircle: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: '#F0EEFF', alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 60 },
  doneBadge: {
    backgroundColor: '#F2F2F2', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  doneText: { fontSize: 14, color: '#666' },
  title: { fontSize: 28, fontWeight: '700', color: '#000', textAlign: 'center', lineHeight: 36 },
  cta: {
    backgroundColor: '#000', borderRadius: 32, paddingVertical: 18,
    alignItems: 'center', marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
