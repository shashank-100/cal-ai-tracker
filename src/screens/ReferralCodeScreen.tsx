import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, TextInput } from 'react-native';

interface Props {
  onContinue: (code: string) => void;
  onBack: () => void;
}

export default function ReferralCodeScreen({ onContinue, onBack }: Props) {
  const [code, setCode] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '96%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Do you have a{'\n'}referral code?</Text>
        <Text style={styles.subtitle}>You can skip this step.</Text>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Referral Code"
            placeholderTextColor="#ccc"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity style={styles.cta} onPress={() => onContinue(code)} activeOpacity={0.85}>
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
  title: { fontSize: 30, fontWeight: '700', color: '#000', lineHeight: 38, marginTop: 16 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 8, marginBottom: 40 },
  inputWrap: { flex: 1 },
  input: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 16,
    fontSize: 16, color: '#000', backgroundColor: '#FAFAFA',
  },
  cta: {
    backgroundColor: '#000', borderRadius: 32, paddingVertical: 18,
    alignItems: 'center', marginBottom: 12,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
