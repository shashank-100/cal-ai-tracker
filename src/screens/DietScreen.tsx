import { useState } from 'react';
import { Text } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionPill from '../components/OptionPill';

const OPTIONS = [
  { label: 'Classic', emoji: '🍽️' },
  { label: 'Pescatarian', emoji: '🖥️' },
  { label: 'Vegetarian', emoji: '🥦' },
  { label: 'Vegan', emoji: '🌿' },
];

interface Props {
  onContinue: (diet: string) => void;
  onBack: () => void;
}

export default function DietScreen({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState('Classic');

  return (
    <OnboardingLayout
      title="Do you follow a specific diet?"
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
          icon={<Text style={{ fontSize: 18 }}>{opt.emoji}</Text>}
        />
      ))}
    </OnboardingLayout>
  );
}
