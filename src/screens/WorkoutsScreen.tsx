import React, { useState } from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionPill from '../components/OptionPill';

const OPTIONS = [
  { label: '0-2', sublabel: 'Workouts now and then' },
  { label: '3-5', sublabel: 'A few workouts per week' },
  { label: '6+', sublabel: 'Dedicated athlete' },
];

interface Props {
  onContinue: (workouts: string) => void;
  onBack: () => void;
}

export default function WorkoutsScreen({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState('3-5');

  return (
    <OnboardingLayout
      title="How many workouts do you do per week?"
      subtitle="This will be used to calibrate your custom plan."
      onContinue={() => onContinue(selected)}
      onBack={onBack}
    >
      {OPTIONS.map((opt) => (
        <OptionPill
          key={opt.label}
          label={opt.label}
          sublabel={opt.sublabel}
          selected={selected === opt.label}
          onPress={() => setSelected(opt.label)}
        />
      ))}
    </OnboardingLayout>
  );
}
