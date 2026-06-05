import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionPill from '../components/OptionPill';

const OPTIONS = [
  { label: 'Instagram', emoji: '📸' },
  { label: 'Facebook', emoji: '👤' },
  { label: 'TikTok', emoji: '🎵' },
  { label: 'Youtube', emoji: '▶️' },
  { label: 'Google', emoji: '🔍' },
  { label: 'TV', emoji: '📺' },
];

interface Props {
  onContinue: (source: string) => void;
  onBack: () => void;
}

export default function ReferralScreen({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState('Instagram');

  return (
    <OnboardingLayout
      title="Where did you hear about us?"
      onContinue={() => onContinue(selected)}
      onBack={onBack}
      showLanguage={false}
    >
      {OPTIONS.map((opt) => (
        <OptionPill
          key={opt.label}
          label={opt.label}
          selected={selected === opt.label}
          onPress={() => setSelected(opt.label)}
          icon={<Text style={styles.emoji}>{opt.emoji}</Text>}
        />
      ))}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 20 },
});
