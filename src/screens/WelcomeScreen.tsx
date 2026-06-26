import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

interface Props {
  onGetStarted: () => void;
  // Web sign-in for returning users — to be wired up later.
  onSignIn?: () => void;
  signingIn?: boolean;
}

export default function WelcomeScreen({ onGetStarted }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.mockupWrap}>
          <AppMockup />
        </View>

        <View style={styles.bottom}>
          <Text style={styles.headline}>Calorie tracking{'\n'}made easy</Text>
          <TouchableOpacity style={styles.cta} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Get Started</Text>
          </TouchableOpacity>
          {/* Web sign-in for returning users — to be set up later.
          {signingIn ? (
            <ActivityIndicator color="#000" style={styles.signInSpinner} />
          ) : (
            <Text style={styles.signInText}>
              Purchased on the web?{' '}
              <Text style={styles.signInLink} onPress={onSignIn}>
                Sign In
              </Text>
            </Text>
          )}
          */}
        </View>
      </View>
    </SafeAreaView>
  );
}

function AppMockup() {
  return (
    <View style={mockup.phone}>
      <View style={mockup.notch} />
      <View style={mockup.screen}>
        <View style={mockup.header}>
          <Text style={mockup.appName}>Cal AI</Text>
          <Text style={mockup.tabLabel}>Today  Yesterday</Text>
        </View>

        <View style={mockup.calorieRow}>
          <Text style={mockup.calorieNum}>1739</Text>
          <View style={mockup.ring} />
        </View>

        <View style={mockup.macroRow}>
          {[
            { label: '136g', sub: 'Protein left' },
            { label: '206g', sub: 'Carbs left' },
            { label: '41g', sub: 'Fat left' },
          ].map((m) => (
            <View key={m.label} style={mockup.macro}>
              <Text style={mockup.macroNum}>{m.label}</Text>
              <Text style={mockup.macroSub}>{m.sub}</Text>
            </View>
          ))}
        </View>

        <View style={mockup.divider} />

        <Text style={mockup.sectionLabel}>Recently eaten</Text>
        <View style={mockup.foodRow}>
          <View style={mockup.foodImg} />
          <View style={mockup.foodInfo}>
            <Text style={mockup.foodName}>Turkey Sandwich Wi...</Text>
            <Text style={mockup.foodMacros}>480 calories</Text>
          </View>
        </View>

        <View style={mockup.tabBar}>
          {['⊞', '☰', '◎', '+'].map((icon, i) => (
            <Text key={i} style={mockup.tabIcon}>{icon}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  mockupWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bottom: { width: '100%', paddingBottom: 16, alignItems: 'center' },
  headline: { fontSize: 32, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 24, lineHeight: 40 },
  cta: {
    backgroundColor: '#000',
    borderRadius: 32,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  signInText: { fontSize: 13, color: '#666' },
  signInLink: { fontWeight: '600', color: '#000', textDecorationLine: 'underline' },
  signInSpinner: { height: 18 },
});

const mockup = StyleSheet.create({
  phone: {
    width: 200,
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  notch: {
    width: 70,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  screen: { flex: 1, paddingHorizontal: 12, paddingTop: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  appName: { fontSize: 11, fontWeight: '700' },
  tabLabel: { fontSize: 8, color: '#888' },
  calorieRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calorieNum: { fontSize: 28, fontWeight: '700' },
  ring: { width: 40, height: 40, borderRadius: 20, borderWidth: 4, borderColor: '#000' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  macro: { alignItems: 'center' },
  macroNum: { fontSize: 10, fontWeight: '600' },
  macroSub: { fontSize: 7, color: '#888' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  sectionLabel: { fontSize: 9, fontWeight: '600', color: '#888', marginBottom: 6 },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  foodImg: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#e8e8e8' },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 8, fontWeight: '500' },
  foodMacros: { fontSize: 7, color: '#888' },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
    marginTop: 'auto',
  },
  tabIcon: { fontSize: 14 },
});
