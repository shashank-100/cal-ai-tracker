# Cal AI Tracker

A calorie tracking app built with Expo (React Native).

## Screens (27 total)

Full onboarding flow → plan generation → home dashboard.

## Run locally

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Build for Android

```bash
npx eas login
npx eas build --platform android --profile preview
```

## Project structure

```
App.tsx              # Screen router + onboarding state
src/
  components/        # Shared UI (OnboardingLayout, OptionPill, ErrorBoundary)
  screens/           # All 27 screens
assets/              # Icons, splash screen
eas.json             # EAS build config
privacy-policy.html  # Privacy policy for Play Store
```
