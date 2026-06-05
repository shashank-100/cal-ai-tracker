import { useState } from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionPill from '../components/OptionPill';

const OPTIONS = ['Lose weight', 'Maintain', 'Gain weight'];

interface Props {
  onContinue: (goal: string) => void;
  onBack: () => void;
}

export default function GoalScreen({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState('Gain weight');

  return (
    <OnboardingLayout
      title="What is your goal?"
      subtitle="This helps us generate a plan for your calorie intake."
      onContinue={() => onContinue(selected)}
      onBack={onBack}
      showLanguage={false}
    >
      {OPTIONS.map((opt) => (
        <OptionPill
          key={opt}
          label={opt}
          selected={selected === opt}
          onPress={() => setSelected(opt)}
        />
      ))}
    </OnboardingLayout>
  );
}
