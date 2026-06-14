# Eli Project

iLab Mobile Manager - A React Native mobile application for managing business operations (orders, clients, inventory, etc.) on iOS and Android.

## Quick Start

### Prerequisites
- Node.js (v12+)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

```bash
# Install dependencies
npm install

# Install pods for iOS
cd ios
pod install
cd ..
```

### Development

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Lint code
npm run lint
```

## Project Structure

See [APP_ARCHITECTURE_AND_UPDATES.md](APP_ARCHITECTURE_AND_UPDATES.md) for complete architecture documentation.

```
src/
├── actions/        # Redux action creators & API calls
├── components/     # Reusable UI components
├── reducers/       # Redux state management
├── scenes/         # Screen/page components
├── config/         # Configuration & constants
├── lang/          # Internationalization
└── utils/         # Helper functions
```

## Backend

API Endpoint: `https://app.ilabassistant.com/ApiForApp`

Features:
- User authentication with token-based security
- Order, client, and inventory management
- Firebase push notifications
- Real-time data synchronization

## Features

- ✅ Cross-platform (iOS & Android)
- ✅ Redux state management
- ✅ Firebase integration
- ✅ Offline support via AsyncStorage
- ✅ Multi-language support
- ✅ Gesture authentication
- ✅ Camera integration
- ✅ Signature capture

## Building for Release

### Android
```bash
cd android
./gradlew bundleRelease
```

### iOS
```bash
xcodebuild -workspace ios/imobile.xcworkspace \
  -scheme imobile \
  -configuration Release \
  -derivedDataPath build
```

See [APP_ARCHITECTURE_AND_UPDATES.md](APP_ARCHITECTURE_AND_UPDATES.md) for detailed deployment instructions.

## Documentation

- [APP_ARCHITECTURE_AND_UPDATES.md](APP_ARCHITECTURE_AND_UPDATES.md) - Complete architecture, backend system, and app store update guide

## License

Proprietary - All rights reserved
