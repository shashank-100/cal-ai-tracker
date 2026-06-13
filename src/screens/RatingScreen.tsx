import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function RatingScreen({ onContinue, onBack }: Props) {
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
            <View style={[styles.progressFill, { width: '94%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Give us a rating</Text>
          <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>

          <Text style={styles.headline}>Cal AI was made for{'\n'}people like you</Text>

          <View style={styles.avatarRow}>
            <Text style={styles.avatars}>👤👩🧑</Text>
            <Text style={styles.userCount}>+2M Cal AI users</Text>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewAvatar}>👩</Text>
              <View>
                <Text style={styles.reviewName}>Marley Bryle</Text>
                <Text style={styles.reviewStars}>⭐⭐⭐⭐⭐</Text>
              </View>
            </View>
            <Text style={styles.reviewText}>
              "I lost 15 lbs in 2 months! I was about to go on Ozempic but decided to give this app a shot and it worked :)"
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
  content: { flex: 1, paddingTop: 8 },
  title: { fontSize: 30, fontWeight: '700', color: '#000', marginBottom: 12 },
  stars: { fontSize: 32, marginBottom: 24 },
  headline: { fontSize: 22, fontWeight: '700', color: '#000', lineHeight: 30, marginBottom: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  avatars: { fontSize: 28 },
  userCount: { fontSize: 13, color: '#666' },
  reviewCard: {
    backgroundColor: '#F2F2F2', borderRadius: 16, padding: 16, gap: 10,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { fontSize: 32 },
  reviewName: { fontSize: 15, fontWeight: '600', color: '#000' },
  reviewStars: { fontSize: 13 },
  reviewText: { fontSize: 14, color: '#444', lineHeight: 22 },
  cta: {
    backgroundColor: '#000', borderRadius: 32, paddingVertical: 18,
    alignItems: 'center', marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
