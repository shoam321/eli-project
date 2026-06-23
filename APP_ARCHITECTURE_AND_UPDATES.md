# iLab Mobile Manager - Complete Architecture & Update Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend System](#backend-system)
4. [App Store Updates & Distribution](#app-store-updates--distribution)
5. [Data Flow Diagram](#data-flow-diagram)
6. [Development & Deployment Workflow](#development--deployment-workflow)

---

## Project Overview

**iLab Mobile Manager** is a cross-platform React Native mobile application (iOS & Android) designed for managing business operations including:
- Order management
- Client/Customer management
- Inventory & parts tracking
- Sales history
- Supplier management
- Cashier operations
- Project tracking

**Tech Stack:**
- **Frontend:** React Native, Redux, Axios
- **Backend:** Custom REST API at `https://app.ilabassistant.com/ApiForApp`
- **Real-time Services:** Firebase (push notifications, messaging)
- **Local Storage:** AsyncStorage
- **Build Tools:** Gradle (Android), Xcode (iOS)

---

## Frontend Architecture

### Directory Structure

```
src/
├── actions/          # Redux action creators (API calls)
│   ├── orders.js
│   ├── user.js
│   ├── clients.js
│   ├── parts.js
│   └── ...
├── components/       # Reusable UI components
│   ├── Button.js
│   ├── TextInput.js
│   ├── ModalDialog.js
│   └── RootScene.js
├── reducers/         # Redux state management
│   ├── main.js
│   ├── user.js
│   └── index.js
├── scenes/           # Screen/page components
│   ├── auth/
│   ├── orders/
│   ├── clients/
│   ├── cashiers/
│   └── ...
├── config/           # Configuration files
│   ├── axios.js      # API client setup
│   ├── constants.js  # API endpoints & constants
│   └── styles.js
└── utils/            # Helper functions
```

### State Management Flow

1. **User Interaction** → Component dispatches Redux action
2. **Redux Action** → Makes API call via Axios
3. **Backend Response** → Reducer updates Redux store
4. **Store Update** → Components re-render with new data

### Example: Fetching Orders

```javascript
// File: src/actions/orders.js
export const getOrders = () => dispatch => restClient.getAxios().post(remote.api, { tag: 'get_orders' })
  .then(({ data }) => {
    dispatch({ type: mainTypes.DATA_LOADED, payload: data.orders, key: 'orders' });
    return Promise.resolve(data);
  })
  .catch(error => Promise.reject(error));
```

**Flow:**
1. Component calls `dispatch(getOrders())`
2. Action creator makes POST to backend with `tag: 'get_orders'`
3. Backend returns orders array
4. Reducer receives dispatch with `DATA_LOADED` type
5. Orders stored in Redux state
6. Components subscribed to `orders` state re-render

---

## Backend System

### API Endpoint Structure

**Base URL:** `https://app.ilabassistant.com/ApiForApp`

**Request Format:**
```javascript
POST /ApiForApp
Content-Type: multipart/form-data

Body: {
  data: {
    token: "user_auth_token",
    tag: "action_name",
    ...other_parameters
  }
}
```

**Response Format:**
```json
{
  "success": 1,
  "data": {...},
  "message": "Success message"
}
```

### Authentication Flow

1. **Login Request:**
   ```javascript
   export const logIn = credentials => (/* dispatch */) => 
     restClient.getAxios().post(remote.api, { 
       ...credentials, 
       tag: 'login_user' 
     })
   ```
   - Sends email & password
   - Backend validates credentials
   - Returns `token`

2. **Token Storage:**
   ```javascript
   export const saveToken = token => (/* dispatch */) => 
     AsyncStorage.setItem('access_token', token);
   ```
   - Token saved locally on device
   - Persists across app restarts

3. **Token Usage:**
   - Every API request includes token in FormData
   - Backend validates token for authorization
   - Expired tokens trigger re-login

### Key API Actions (Tags)

| Tag | Description |
|-----|-------------|
| `login_user` | User authentication |
| `logout_user` | User logout |
| `get_user_info` | Fetch current user details |
| `get_orders` | Fetch all orders |
| `add_order` | Create new order |
| `get_order_parts` | Fetch parts for specific order |
| `add_part_to_order` | Add part to order |
| `set_order_received` | Mark part as received |
| `set_order_expected` | Mark part as expected |
| `set_order_missing` | Mark part as missing |
| `update_order` | Update order quantity/price |
| `add_user_dev_key` | Register device for push notifications |
| `get_clients` | Fetch customer list |
| `add_client` | Create new customer |
| ... | *Many more actions* |

### Configuration Files

**File:** `src/config/constants.js`
```javascript
export const remote = {
  host: 'https://app.ilabassistant.com',
  api: 'https://app.ilabassistant.com/ApiForApp',
  sharing: 'https://app.ilabassistant.com',
};
```

**Development vs Production:**
```javascript
// DEVELOPMENT
// host: 'https://dev.ilabassistant.com',
// api: 'https://dev.ilabassistant.com/ApiForApp',

// PRODUCTION
// host: 'https://app.ilabassistant.com',
// api: 'https://app.ilabassistant.com/ApiForApp',
```

### Axios Client Configuration

**File:** `src/config/axios.js`
```javascript
class axiosClient {
  constructor() {
    this.token = null;
    this.axios = axios.create();
    this.axios.defaults.timeout = 15000;  // 15 second timeout
    this.axios.defaults.transformRequest = this.requestMiddleware.bind(this);
    this.axios.defaults.transformResponse = Array.prototype.concat(
      axios.defaults.transformResponse, 
      axiosClient.responseMiddleware,
    );
  }

  requestMiddleware(data) {
    // Wrap data in FormData with token
    const formData = new FormData();
    formData.append('data', JSON.stringify({ token: this.token, ...data }));
    return formData;
  }

  static responseMiddleware(data) {
    // Check for success flag
    if (data.success === 1) return data;
    else throw (data);
  }
}
```

---

## Firebase Integration

### Push Notifications Setup

**File:** `src/actions/user.js`

1. **Request Permission:**
   ```javascript
   import messaging from '@react-native-firebase/messaging';
   messaging().requestPermission();
   ```

2. **Get FCM Token:**
   ```javascript
   export const getFcmToken = () => () => firebase.messaging().getToken()
     .then(token => Promise.resolve(token))
     .catch(error => Promise.reject(error));
   ```

3. **Register Device with Backend:**
   ```javascript
   export const postFcmToken = dev_key => (/* dispatch */) => 
     restClient.getAxios().post(remote.api, { 
       dev_key, 
       tag: 'add_user_dev_key' 
     })
   ```

4. **On Login - Auto-Register:**
   ```javascript
   export const logIn = credentials => (/* dispatch */) => 
     restClient.getAxios().post(remote.api, { 
       ...credentials, 
       tag: 'login_user' 
     })
     .then(({ data }) => {
       saveToken(data.token)();
       // Auto-register device for notifications
       getFcmToken()()
         .then(token => postFcmToken(token)())
         .catch((res) => {console.log(res)});
       return Promise.resolve(data);
     })
   ```

### How Backend Sends Notifications

1. Backend stores user's FCM token from `add_user_dev_key` request
2. When event occurs (new order, message, etc.), backend sends via Firebase:
   - User receives notification even if app is closed
   - Tap notification opens app to relevant screen

---

## Local Storage & Offline Functionality

**File:** `src/actions/user.js`

### Stored Data

| Key | Purpose |
|-----|---------|
| `access_token` | User authentication token |
| `_login` | Last logged-in email address |
| `app_language` | Selected app language preference |

### Local Storage Helpers

```javascript
// Get saved token (on app startup)
export const getSavedToken = () => () => 
  AsyncStorage.getItem('access_token')
    .then((token) => {
      restClient.setToken(token);
      return Promise.resolve(token);
    });

// Auto-login with saved credentials
export const getSavedLogin = () => (/* dispatch */) => 
  AsyncStorage.getItem('_login')
    .then((login) => {
      if (!login) return Promise.reject('Login is null');
      else return Promise.resolve(login);
    });

// Save user preference
export const setAppLanguage = data => () => 
  AsyncStorage.setItem('app_language', JSON.stringify(data));
```

### Offline Caching

- Redux state persists orders, clients, inventory data in memory
- On reconnection, app syncs with backend
- New/modified data marked for sync when connection restored

---

## App Store Updates & Distribution

### Step 1: Development & Testing

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android emulator/device
npm run android

# Run on iOS simulator
npm run ios

# Run tests
npm test

# Run linter
npm run lint
```

### Step 2: Build for Release

#### Android Build

**Build Configuration:** `android/app/build.gradle`

**Steps:**
1. Update version number in `android/app/build.gradle`:
   ```gradle
   defaultConfig {
       versionCode 1        // Increment for each release
       versionName "1.0.0"  // Semantic versioning
   }
   ```

2. Generate signed APK/AAB:
   ```bash
   cd android
   ./gradlew assembleRelease    # Generate APK
   ./gradlew bundleRelease      # Generate AAB (preferred for Play Store)
   ```

3. Outputs:
   - APK: `android/app/build/outputs/apk/release/app-release.apk`
   - AAB: `android/app/build/outputs/bundle/release/app-release.aab`

**Android App Store Flow:**
1. Create app on [Google Play Console](https://play.google.com/console)
2. Complete store listing (description, screenshots, etc.)
3. Upload AAB bundle
4. Set up pricing & distribution
5. Submit for review (usually approved within 2-4 hours)
6. When approved, auto-published to Play Store
7. Users see "Update Available" notification
8. Automatic download on app next launch or manual from Play Store

#### iOS Build

**Build Configuration:** `ios/imobile.xcodeproj`

**Steps:**
1. Update version in Xcode:
   - Open `ios/imobile.xcodeproj` in Xcode
   - Select "imobile" target
   - Go to "Build Settings"
   - Update "Bundle Version" (CFBundleVersion)
   - Update "Version" (CFBundleShortVersionString)

2. Build for release:
   ```bash
   cd ios
   xcodebuild -workspace imobile.xcworkspace \
     -scheme imobile \
     -configuration Release \
     -derivedDataPath build
   ```

3. Create IPA (Xcode archive):
   - Xcode → Product → Archive
   - Create signed archive
   - Export for distribution

**iOS App Store Flow:**
1. Create app on [App Store Connect](https://appstoreconnect.apple.com)
2. Complete app information (description, screenshots, etc.)
3. Set pricing & availability
4. Upload IPA using Xcode or Transporter
5. Submit for review (typically 1-2 days)
6. Once approved, app appears on App Store
7. Users see "Update" button or auto-update (based on settings)

### Step 3: Version Management

**Version Scheme:** `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

- **MAJOR:** Breaking changes, significant features
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes

**Update Checklist:**
- [ ] Update version in `android/app/build.gradle`
- [ ] Update version in Xcode (iOS target settings)
- [ ] Update `versionCode` (Android) - must increment
- [ ] Test on both iOS & Android devices
- [ ] Run linter: `npm run lint`
- [ ] Run tests: `npm test`
- [ ] Create git tag: `git tag v1.2.3`
- [ ] Build release artifacts
- [ ] Upload to app stores

### Step 4: Monitoring Updates

**Backend tracks:**
- App version installed on user devices (via API call)
- Usage analytics via Firebase
- Error logs (if implemented)

**Users receive updates via:**
- Google Play Store (Android)
- App Store (iOS)
- Optional in-app update notifications (if backend triggers)

---

## Development & Deployment Workflow

### Local Development

```bash
# 1. Setup
npm install

# 2. Start development server
npm start

# 3. Run on device (Android)
npm run android

# 4. Run on device (iOS)
npm run ios

# 5. Make changes to src/ files
# 6. Auto-reload triggers (hot reload)

# 7. Test
npm test

# 8. Lint
npm run lint
```

### Production Deployment

```bash
# 1. Update version numbers (Android & iOS)

# 2. Build release for Android
cd android
./gradlew bundleRelease

# 3. Build release for iOS
cd ios
xcodebuild -workspace imobile.xcworkspace -scheme imobile -configuration Release -derivedDataPath build

# 4. Upload to Play Store & App Store
#    - Use Play Console for Android AAB
#    - Use App Store Connect for iOS IPA

# 5. Monitor releases
#    - Check app store reviews
#    - Monitor Firebase analytics
#    - Track crash logs
```

### Key Files for Deployment

| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts |
| `android/app/build.gradle` | Android version & build config |
| `ios/imobile.xcodeproj` | iOS version & build config |
| `babel.config.js` | JavaScript transpilation |
| `metro.config.js` | React Native bundler config |
| `.env` (if exists) | Environment variables |

---

## Troubleshooting Common Issues

### App Won't Connect to Backend
- Check internet connection
- Verify API endpoint in `src/config/constants.js`
- Check token expiration (requires new login)
- Verify backend server is running

### Push Notifications Not Working
- Ensure Firebase config files are present:
  - Android: `android/app/google-services.json`
  - iOS: `ios/GoogleService-Info.plist`
- Verify app requested notification permissions
- Check device FCM token registered with backend

### App Crashes on Startup
- Check Redux reducer for syntax errors
- Verify AsyncStorage data isn't corrupted
- Check console logs: `react-native log-android` or `react-native log-ios`
- Clear app cache/data and restart

### Update Not Showing in App Store
- Verify build was signed correctly
- Check if previous version still processing
- Ensure version code/number incremented
- Wait 24+ hours for app store indexing

---

## Summary

**The Complete Flow:**

1. **User opens app** → Loads saved token from local storage
2. **If token valid** → Auto-logs in, fetches user data
3. **User navigates** → Redux actions fetch data from backend API
4. **Backend processes** → Validates token, returns data, triggers notifications
5. **Firebase delivers** → Push notifications to device's FCM token
6. **App displays** → Components render Redux state
7. **User updates app** → New version uploaded to app stores
8. **Users download** → Get latest features/fixes via Play Store or App Store

This architecture ensures **real-time data sync**, **offline caching**, **secure authentication**, and **seamless updates** across both iOS and Android platforms.

