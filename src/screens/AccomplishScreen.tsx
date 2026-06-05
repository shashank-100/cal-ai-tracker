import { useState } from 'react';
import { Text } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionPill from '../components/OptionPill';

const OPTIONS = [
  { label: 'Eat and live healthier', emoji: '🍎' },
  { label: 'Boost my energy and mood', emoji: '☀️' },
  { label: 'Stay motivated and consistent', emoji: '💪' },
  { label: 'Feel better about my body', emoji: '🧘' },
];

interface Props {
  onContinue: (goal: string) => void;
  onBack: () => void;
}

export default function AccomplishScreen({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState('Feel better about my body');

  return (
    <OnboardingLayout
      title="What would you like to accomplish?"
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
