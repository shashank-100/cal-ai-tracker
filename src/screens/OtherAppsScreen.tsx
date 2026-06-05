import React, { useState } from 'react';
import { Text } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionPill from '../components/OptionPill';

const OPTIONS = [
  { label: 'No', emoji: '👎' },
  { label: 'Yes', emoji: '👍' },
];

interface Props {
  onContinue: (answer: string) => void;
  onBack: () => void;
}

export default function OtherAppsScreen({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState('No');

  return (
    <OnboardingLayout
      title="Have you tried other calorie tracking apps?"
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
          icon={<Text style={{ fontSize: 20 }}>{opt.emoji}</Text>}
        />
      ))}
    </OnboardingLayout>
  );
}
