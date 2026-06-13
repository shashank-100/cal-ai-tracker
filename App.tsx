import { useState, useEffect } from 'react';
import { BackHandler, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import { useAuthStore } from './src/stores/authStore';
import WelcomeScreen from './src/screens/WelcomeScreen';
import GenderScreen from './src/screens/GenderScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import ReferralScreen from './src/screens/ReferralScreen';
import OtherAppsScreen from './src/screens/OtherAppsScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import WeightSpeedScreen from './src/screens/WeightSpeedScreen';
import GainComparisonScreen from './src/screens/GainComparisonScreen';
import BlockersScreen from './src/screens/BlockersScreen';
import DietScreen from './src/screens/DietScreen';
import AccomplishScreen from './src/screens/AccomplishScreen';
import PotentialScreen from './src/screens/PotentialScreen';
import HeightWeightScreen from './src/screens/HeightWeightScreen';
import BirthdayScreen from './src/screens/BirthdayScreen';
import GoalScreen from './src/screens/GoalScreen';
import DesiredWeightScreen from './src/screens/DesiredWeightScreen';
import RealisticTargetScreen from './src/screens/RealisticTargetScreen';
import TrustScreen from './src/screens/TrustScreen';
import AppleHealthScreen from './src/screens/AppleHealthScreen';
import CaloriesRolloverScreen from './src/screens/CaloriesRolloverScreen';
import RatingScreen from './src/screens/RatingScreen';
import ReferralCodeScreen from './src/screens/ReferralCodeScreen';
import AllDoneScreen from './src/screens/AllDoneScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import PlanReadyScreen from './src/screens/PlanReadyScreen';
import CreateAccountScreen from './src/screens/CreateAccountScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type Screen =
  | 'welcome' | 'gender' | 'workouts' | 'referral' | 'otherApps' | 'results'
  | 'weightSpeed' | 'gainComparison' | 'blockers' | 'diet' | 'accomplish' | 'potential'
  | 'heightWeight' | 'birthday' | 'goal' | 'desiredWeight' | 'realisticTarget'
  | 'trust' | 'appleHealth' | 'caloriesBurned' | 'rollover'
  | 'rating' | 'referralCode' | 'allDone' | 'loading' | 'planReady'
  | 'createAccount' | 'home' | 'progress' | 'settings';

interface OnboardingData {
  gender?: string;
  workouts?: string;
  referralSource?: string;
  triedOtherApps?: string;
  weightSpeedLbs?: number;
  blocker?: string;
  diet?: string;
  accomplish?: string;
  height?: string;
  weight?: string;
  metric?: boolean;
  birthday?: string;
  goal?: string;
  desiredWeightLbs?: number;
  addCaloriesBurned?: boolean;
  rolloverCalories?: boolean;
  referralCode?: string;
}

const FLOW: Screen[] = [
  'welcome', 'gender', 'workouts', 'referral', 'otherApps', 'results',
  'weightSpeed', 'gainComparison', 'blockers', 'diet', 'accomplish', 'potential',
  'heightWeight', 'birthday', 'goal', 'desiredWeight', 'realisticTarget',
  'trust', 'appleHealth', 'caloriesBurned', 'rollover',
  'rating', 'referralCode', 'allDone', 'createAccount', 'loading', 'planReady',
  'home',
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [data, setData] = useState<OnboardingData>({});
  const { loading: authLoading, session, initialize } = useAuthStore();

  useEffect(() => {
    const unsub = initialize();
    return unsub;
  }, []);

  useEffect(() => {
    if (!authLoading && session) {
      const postAuthScreens: Screen[] = ['home', 'progress', 'settings'];
      const onboardingComplete = postAuthScreens.includes(screen) || FLOW.indexOf(screen) >= FLOW.indexOf('loading');
      if (!onboardingComplete) setScreen('home');
    }
  }, [authLoading, session]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'progress' || screen === 'settings') { setScreen('home'); return true; }
      if (screen === 'home') return false;
      const idx = FLOW.indexOf(screen);
      if (idx > 0) { setScreen(FLOW[idx - 1]); return true; }
      return false;
    });
    return () => sub.remove();
  }, [screen]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const next = () => {
    const idx = FLOW.indexOf(screen);
    if (idx < FLOW.length - 1) setScreen(FLOW[idx + 1]);
  };

  const back = () => {
    const idx = FLOW.indexOf(screen);
    if (idx > 0) setScreen(FLOW[idx - 1]);
  };

  const save = (patch: Partial<OnboardingData>) => {
    setData((d) => ({ ...d, ...patch }));
    next();
  };

  return <SafeAreaProvider><ErrorBoundary>{renderScreen()}</ErrorBoundary></SafeAreaProvider>;

  function renderScreen() { switch (screen) {
    case 'welcome':
      return <WelcomeScreen onGetStarted={next} onSignIn={() => {}} />;
    case 'gender':
      return <GenderScreen onContinue={(gender) => save({ gender })} onBack={back} />;
    case 'workouts':
      return <WorkoutsScreen onContinue={(workouts) => save({ workouts })} onBack={back} />;
    case 'referral':
      return <ReferralScreen onContinue={(referralSource) => save({ referralSource })} onBack={back} />;
    case 'otherApps':
      return <OtherAppsScreen onContinue={(triedOtherApps) => save({ triedOtherApps })} onBack={back} />;
    case 'results':
      return <ResultsScreen onContinue={next} onBack={back} />;
    case 'weightSpeed':
      return <WeightSpeedScreen onContinue={(weightSpeedLbs) => save({ weightSpeedLbs })} onBack={back} />;
    case 'gainComparison':
      return <GainComparisonScreen onContinue={next} onBack={back} />;
    case 'blockers':
      return <BlockersScreen onContinue={(blocker) => save({ blocker })} onBack={back} />;
    case 'diet':
      return <DietScreen onContinue={(diet) => save({ diet })} onBack={back} />;
    case 'accomplish':
      return <AccomplishScreen onContinue={(accomplish) => save({ accomplish })} onBack={back} />;
    case 'potential':
      return <PotentialScreen onContinue={next} onBack={back} />;
    case 'heightWeight':
      return <HeightWeightScreen onContinue={({ height, weight, metric }) => save({ height, weight, metric })} onBack={back} />;
    case 'birthday':
      return <BirthdayScreen onContinue={(birthday) => save({ birthday })} onBack={back} />;
    case 'goal':
      return <GoalScreen onContinue={(goal) => save({ goal })} onBack={back} />;
    case 'desiredWeight':
      return <DesiredWeightScreen onContinue={(desiredWeightLbs) => save({ desiredWeightLbs })} onBack={back} />;
    case 'realisticTarget':
      return <RealisticTargetScreen targetLbs={data.desiredWeightLbs} onContinue={next} onBack={back} />;
    case 'trust':
      return <TrustScreen onContinue={next} onBack={back} />;
    case 'appleHealth':
      return <AppleHealthScreen onContinue={next} onSkip={next} onBack={back} />;
    case 'caloriesBurned':
      return <CaloriesRolloverScreen question="burned"
        onYes={() => save({ addCaloriesBurned: true })}
        onNo={() => save({ addCaloriesBurned: false })}
        onBack={back} />;
    case 'rollover':
      return <CaloriesRolloverScreen question="rollover"
        onYes={() => save({ rolloverCalories: true })}
        onNo={() => save({ rolloverCalories: false })}
        onBack={back} />;
    case 'rating':
      return <RatingScreen onContinue={next} onBack={back} />;
    case 'referralCode':
      return <ReferralCodeScreen onContinue={(referralCode) => save({ referralCode })} onBack={back} />;
    case 'allDone':
      return <AllDoneScreen onContinue={next} onBack={back} />;
    case 'planReady':
      return <PlanReadyScreen
        onGetStarted={next}
        onBack={back}
        goal={data.goal}
        desiredWeightLbs={data.desiredWeightLbs}
        birthday={data.birthday}
      />;
    case 'createAccount':
      return <CreateAccountScreen onApple={next} onGoogle={next} onSkip={() => setScreen('home')} onBack={back} />;
    case 'loading':
      return <LoadingScreen onboardingData={data} onComplete={next} />;
    case 'home':
      return <HomeScreen onNavigate={(s: 'progress' | 'settings') => setScreen(s)} />;
    case 'progress':
      return <ProgressScreen onBack={() => setScreen('home')} />;
    case 'settings':
      return <SettingsScreen onBack={() => setScreen('home')} />;
  } }
}
