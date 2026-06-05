import { useState } from 'react';
import { Text } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionPill from '../components/OptionPill';

const OPTIONS = [
  { label: 'Lack of consistency', emoji: '📊' },
  { label: 'Unhealthy eating habits', emoji: '🍔' },
  { label: 'Lack of support', emoji: '💎' },
  { label: 'Busy schedule', emoji: '📅' },
  { label: 'Lack of meal inspiration', emoji: '🍎' },
];

interface Props {
  onContinue: (blocker: string) => void;
  onBack: () => void;
}

export default function BlockersScreen({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState('Lack of consistency');

  return (
    <OnboardingLayout
      title="What's stopping you from reaching your goals?"
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
