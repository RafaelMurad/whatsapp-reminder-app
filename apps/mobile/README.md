# WhatsApp Reminders - Mobile App

A React Native mobile app for managing WhatsApp reminders with native location-based geofencing support.

## Features

- **Time-based Reminders**: Create reminders that send WhatsApp messages at scheduled times
- **Location-based Reminders**: Set up geofences that trigger reminders when you arrive or leave locations
- **Native Geofencing**: Uses Expo Location for reliable background geofencing
- **Push Notifications**: Get notified even when the app is closed
- **Secure Authentication**: JWT-based authentication with secure token storage
- **Beautiful UI**: Modern design system matching the web app

## Tech Stack

- **Framework**: React Native with Expo (SDK 51)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Styling**: Custom theme system (matching Tailwind)
- **Location**: Expo Location with background tracking
- **Notifications**: Expo Notifications
- **Maps**: React Native Maps
- **Storage**: Expo Secure Store

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# From the monorepo root
cd apps/mobile

# Install dependencies
pnpm install

# Start the development server
pnpm start
```

### Running on Device/Emulator

```bash
# iOS
pnpm ios

# Android
pnpm android

# Web (limited features)
pnpm web
```

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home/Reminders tab
│   │   ├── locations.tsx  # Location reminders tab
│   │   └── profile.tsx    # Profile tab
│   ├── reminder/[id].tsx  # Reminder detail page
│   ├── create-reminder.tsx # Create reminder modal
│   ├── create-geofence.tsx # Create geofence modal
│   ├── login.tsx          # Login page
│   ├── register.tsx       # Register page
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── screens/           # Screen components
│   ├── services/          # API and native services
│   ├── store/             # Zustand stores
│   ├── theme/             # Design tokens
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── assets/                # Images, fonts, etc.
├── app.json               # Expo configuration
├── package.json
└── tsconfig.json
```

## Configuration

### API Endpoints

Update the API URLs in `src/services/api.ts`:

```typescript
const CONFIG = {
  API_BASE_URL: __DEV__
    ? 'http://localhost:3000/api/trpc'
    : 'https://your-production-url.com/api/trpc',
  WORKER_BASE_URL: __DEV__
    ? 'http://localhost:3001'
    : 'https://your-worker-url.com',
};
```

### Environment Setup

For development, make sure the web backend is running:

```bash
# From monorepo root
pnpm dev  # Starts web app on :3000 and worker on :3001
```

## Location Permissions

The app requires the following permissions for location-based reminders:

### iOS
- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`
- `UIBackgroundModes`: location, fetch, remote-notification

### Android
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `RECEIVE_BOOT_COMPLETED`

## Building for Production

### Expo EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure the project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Standalone APK/IPA

See [Expo Build documentation](https://docs.expo.dev/build/introduction/) for detailed instructions.

## Key Components

### Theme System

The app uses a custom theme system that mirrors the web app's Tailwind configuration:

```typescript
import { colors, spacing, typography } from '../theme';

// Use consistent design tokens
style={{ backgroundColor: colors.primary[500], padding: spacing[4] }}
```

### State Management

Zustand stores for different domains:

- `useAuthStore` - Authentication state
- `useReminderStore` - Reminders CRUD
- `useLocationStore` - Geofences and location tracking

### Services

- `api` - HTTP client for backend communication
- `locationService` - Native geofencing and tracking
- `notificationService` - Push and local notifications

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new files
3. Add proper error handling
4. Test on both iOS and Android

## Troubleshooting

### Location not working in background

1. Ensure background permissions are granted
2. Check that location tracking is started
3. On iOS, enable "Always" location permission
4. On Android, disable battery optimization for the app

### Notifications not appearing

1. Check notification permissions
2. Ensure the device is not in Do Not Disturb mode
3. On Android, check notification channel settings

## License

MIT
