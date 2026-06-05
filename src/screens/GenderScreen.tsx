import React, { useState } from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionPill from '../components/OptionPill';

const OPTIONS = ['Male', 'Female', 'Other'] as const;
type Gender = (typeof OPTIONS)[number];

interface Props {
  onContinue: (gender: Gender) => void;
  onBack: () => void;
}

export default function GenderScreen({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState<Gender>('Female');

  return (
    <OnboardingLayout
      title="Choose your Gender"
      subtitle="This will be used to calibrate your custom plan."
      onContinue={() => onContinue(selected)}
      onBack={onBack}
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
