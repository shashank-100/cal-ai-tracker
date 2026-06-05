import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const DAYS = [
  { letter: 'T', num: 22 }, { letter: 'W', num: 23 }, { letter: 'T', num: 24 },
  { letter: 'F', num: 25 }, { letter: 'S', num: 26 }, { letter: 'S', num: 27, active: true },
  { letter: 'M', num: 28, future: true },
];

const MACROS = [
  { label: 'Protein left', value: '166g', color: '#E87070', emoji: '🥩' },
  { label: 'Carbs left', value: '295g', color: '#E8955A', emoji: '🌾' },
  { label: 'Fat left', value: '68g', color: '#70A8E8', emoji: '💧' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Text style={styles.brandIcon}>🍎</Text>
            <Text style={styles.brandName}>Cal AI</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 0</Text>
          </View>
        </View>

        {/* Week strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekStrip}>
          {DAYS.map((d) => (
            <View key={d.num} style={[styles.dayCol, d.active && styles.dayColActive]}>
              <View style={[styles.dayCircle, d.active && styles.dayCircleActive, d.future && styles.dayCircleFuture]}>
                <Text style={[styles.dayLetter, d.active && styles.dayLetterActive, d.future && styles.dayLetterFuture]}>
                  {d.letter}
                </Text>
              </View>
              <Text style={[styles.dayNum, d.active && styles.dayNumActive, d.future && styles.dayNumFuture]}>
                {d.num}
              </Text>
            </View>
          ))}
        </ScrollView>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Calories card */}
          <View style={styles.calorieCard}>
            <View>
              <Text style={styles.calorieNum}>2465</Text>
              <Text style={styles.calorieLabel}>Calories left</Text>
            </View>
            <View style={styles.ringWrap}>
              <Svg width={80} height={80}>
                <Circle cx={40} cy={40} r={32} stroke="#eee" strokeWidth={6} fill="none" />
                <Circle cx={40} cy={40} r={32} stroke="#000" strokeWidth={6} fill="none"
                  strokeDasharray={200} strokeDashoffset={50} strokeLinecap="round"
                  rotation="-90" origin="40,40" />
              </Svg>
              <Text style={styles.ringIcon}>🔥</Text>
            </View>
          </View>

          {/* Macros */}
          <View style={styles.macroRow}>
            {MACROS.map((m) => (
              <View key={m.label} style={styles.macroCard}>
                <Text style={styles.macroValue}>{m.value}</Text>
                <Text style={styles.macroLabel}>{m.label}</Text>
                <View style={styles.macroRingWrap}>
                  <Svg width={52} height={52}>
                    <Circle cx={26} cy={26} r={20} stroke="#eee" strokeWidth={4} fill="none" />
                    <Circle cx={26} cy={26} r={20} stroke={m.color} strokeWidth={4} fill="none"
                      strokeDasharray={125} strokeDashoffset={40} strokeLinecap="round"
                      rotation="-90" origin="26,26" />
                  </Svg>
                  <Text style={styles.macroEmoji}>{m.emoji}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Recently logged */}
          <Text style={styles.sectionTitle}>Recently logged</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>You haven't uploaded any food</Text>
            <Text style={styles.emptyBody}>Start tracking today's meals by taking a quick picture.</Text>
            <Text style={styles.arrowDoodle}>↙</Text>
          </View>
        </ScrollView>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabIcon}>⊞</Text>
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabIcon}>📊</Text>
            <Text style={styles.tabLabel}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabIcon}>⚙️</Text>
            <Text style={styles.tabLabel}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fab}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandIcon: { fontSize: 22 },
  brandName: { fontSize: 20, fontWeight: '700', color: '#000' },
  streakBadge: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  streakText: { fontSize: 14, fontWeight: '600' },
  weekStrip: { paddingHorizontal: 12, marginBottom: 12, flexGrow: 0 },
  dayCol: { alignItems: 'center', marginHorizontal: 8, paddingVertical: 4 },
  dayColActive: {},
  dayCircle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: '#ddd', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  dayCircleActive: { borderColor: '#000', borderStyle: 'solid', borderWidth: 2 },
  dayCircleFuture: { borderColor: 'transparent' },
  dayLetter: { fontSize: 13, color: '#888' },
  dayLetterActive: { color: '#000', fontWeight: '700' },
  dayLetterFuture: { color: '#ccc' },
  dayNum: { fontSize: 13, color: '#888' },
  dayNumActive: { color: '#000', fontWeight: '700' },
  dayNumFuture: { color: '#ccc' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  calorieCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  calorieNum: { fontSize: 40, fontWeight: '800', color: '#000' },
  calorieLabel: { fontSize: 14, color: '#888' },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringIcon: { position: 'absolute', fontSize: 22 },
  macroRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  macroCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12,
    alignItems: 'flex-start',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  macroValue: { fontSize: 18, fontWeight: '700', color: '#000' },
  macroLabel: { fontSize: 11, color: '#888', marginBottom: 8 },
  macroRingWrap: { alignItems: 'center', justifyContent: 'center' },
  macroEmoji: { position: 'absolute', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 12 },
  emptyCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 8, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  arrowDoodle: { fontSize: 28, marginTop: 8, transform: [{ rotate: '20deg' }] },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 12,
    paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: '#eee',
    alignItems: 'center',
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: '#888' },
  tabLabelActive: { color: '#000', fontWeight: '600' },
  fab: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#000', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});
