import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function TrustScreen({ onContinue, onBack }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '85%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✋</Text>
          </View>

          <Text style={styles.title}>Thank you for{'\n'}trusting us</Text>
          <Text style={styles.subtitle}>Now let's personalize Cal AI for you...</Text>

          <View style={styles.privacyBox}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.privacyText}>
              Your privacy and security matter to us.{'\n'}
              We promise to always keep your personal information private and secure.
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#000' },
  progressBar: { flex: 1, height: 4, backgroundColor: '#eee', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#000', borderRadius: 2 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#F5F0FF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  iconText: { fontSize: 52 },
  title: { fontSize: 28, fontWeight: '700', color: '#000', textAlign: 'center', lineHeight: 36 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center' },
  privacyBox: {
    backgroundColor: '#F7F7F7', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 16,
  },
  lockIcon: { fontSize: 18, marginTop: 2 },
  privacyText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 20, textAlign: 'center' },
  cta: {
    backgroundColor: '#000', borderRadius: 32, paddingVertical: 18,
    alignItems: 'center', marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
