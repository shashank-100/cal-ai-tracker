import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

interface Props {
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function AppleHealthScreen({ onContinue, onSkip, onBack }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '88%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.graphic}>
            <View style={styles.activityBubble}><Text style={styles.activityText}>Walking</Text></View>
            <View style={[styles.activityBubble, { top: 50, left: 10 }]}><Text style={styles.activityText}>Running</Text></View>
            <View style={styles.healthIcon}><Text style={styles.healthIconText}>🍎</Text></View>
            <View style={[styles.activityBubble, { top: 0, right: 0 }]}><Text style={styles.activityText}>Yoga</Text></View>
            <View style={[styles.activityBubble, { top: 60, right: 20 }]}><Text style={styles.activityText}>Sleep</Text></View>
            <View style={styles.heartIcon}><Text>❤️</Text></View>
          </View>

          <Text style={styles.title}>Connect to{'\n'}Apple Health</Text>
          <Text style={styles.body}>
            Sync your daily activity between Cal AI and the Health app to have the most thorough data.
          </Text>
        </View>

        <TouchableOpacity style={styles.cta} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Not now</Text>
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
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  graphic: { width: 200, height: 120, position: 'relative', marginBottom: 16 },
  activityBubble: {
    position: 'absolute', backgroundColor: '#F2F2F2',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  activityText: { fontSize: 13, color: '#444' },
  healthIcon: {
    position: 'absolute', top: 20, right: 60,
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  healthIconText: { fontSize: 28 },
  heartIcon: { position: 'absolute', bottom: 10, left: 60 },
  title: { fontSize: 28, fontWeight: '700', color: '#000', textAlign: 'center', lineHeight: 36 },
  body: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  cta: {
    backgroundColor: '#000', borderRadius: 32, paddingVertical: 18,
    alignItems: 'center', marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skipBtn: { alignItems: 'center', paddingVertical: 12, marginBottom: 4 },
  skipText: { fontSize: 15, color: '#666' },
});
