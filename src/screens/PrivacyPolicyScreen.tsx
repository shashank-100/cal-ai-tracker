import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

interface Props {
  onBack: () => void;
}

export default function PrivacyPolicyScreen({ onBack }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.date}>Last updated: June 2026</Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.body}>
          We collect information you provide directly, including your gender, date of birth, height, weight, fitness goals, and dietary preferences. This data is used solely to generate your personalized calorie and nutrition plan.
        </Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.body}>
          Your data is used to:{'\n'}
          • Calculate your daily calorie and macro targets{'\n'}
          • Personalize your onboarding experience{'\n'}
          • Improve app features and accuracy{'\n'}
          We do not sell your personal data to third parties.
        </Text>

        <Text style={styles.heading}>3. Data Storage</Text>
        <Text style={styles.body}>
          Your data is stored securely. We use industry-standard encryption to protect your personal information both in transit and at rest.
        </Text>

        <Text style={styles.heading}>4. Third-Party Services</Text>
        <Text style={styles.body}>
          We use Google Sign-In and Apple Sign-In for authentication. These services have their own privacy policies. We do not store your Google or Apple credentials.
        </Text>

        <Text style={styles.heading}>5. Health Data</Text>
        <Text style={styles.body}>
          Cal AI Tracker may integrate with Apple Health and Google Fit to sync activity data. This data is used only to improve your calorie recommendations and is never shared with third parties.
        </Text>

        <Text style={styles.heading}>6. Children's Privacy</Text>
        <Text style={styles.body}>
          Cal AI Tracker is not intended for children under 13. We do not knowingly collect data from children under 13.
        </Text>

        <Text style={styles.heading}>7. Your Rights</Text>
        <Text style={styles.body}>
          You may request deletion of your account and all associated data at any time by contacting us at support@calaitracker.com.
        </Text>

        <Text style={styles.heading}>8. Changes to This Policy</Text>
        <Text style={styles.body}>
          We may update this policy from time to time. We will notify you of significant changes via the app.
        </Text>

        <Text style={styles.heading}>9. Contact</Text>
        <Text style={styles.body}>
          For any privacy-related questions, contact us at:{'\n'}
          support@calaitracker.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#000' },
  title: { fontSize: 17, fontWeight: '700', color: '#000' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  date: { fontSize: 13, color: '#888', marginBottom: 20 },
  heading: { fontSize: 16, fontWeight: '700', color: '#000', marginTop: 20, marginBottom: 8 },
  body: { fontSize: 14, color: '#444', lineHeight: 22 },
});
