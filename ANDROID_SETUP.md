# BizFlow POS - Android Setup Guide

## Prerequisites

1. **Android Studio** - Download from https://developer.android.com/studio
2. **Java Development Kit (JDK)** - JDK 11 or higher
3. **Android SDK** - Installed through Android Studio
4. **Node.js & npm** - Already installed

## Setup Steps

### 1. Install Android Studio
- Download Android Studio from the official website
- Install and complete the setup wizard
- Install the latest Android SDK (API level 34+ recommended)

### 2. Set Environment Variables (Windows)

Add the following to your system environment variables:

```
ANDROID_SDK_ROOT = C:\Users\YourUsername\AppData\Local\Android\Sdk
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
```

Or from PowerShell:
```powershell
$env:ANDROID_SDK_ROOT = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
```

### 3. Update Web Assets
Before building, always run:
```bash
npm run build
npx cap sync android
```

### 4. Open in Android Studio
```bash
cd android
```

Then open the `android` folder in Android Studio.

### 5. Build & Run

**Option A: From Android Studio**
1. Open Android Studio
2. File → Open → Select the `android` folder
3. Click Run or press Shift + F10
4. Select your device/emulator

**Option B: From Command Line**
```bash
npx cap open android
```

Then click the green Play button in Android Studio.

## Development Workflow

### After Making Changes to Web Code:

1. **Rebuild the web assets:**
   ```bash
   npm run build
   ```

2. **Sync to Android:**
   ```bash
   npx cap sync android
   ```

3. **In Android Studio:**
   - Click Run (Shift + F10)
   - Or hot reload if available

### For Live Reload During Development:

Update `capacitor.config.json`:
```json
{
  "server": {
    "url": "http://192.168.1.X:5173",
    "cleartext": true
  }
}
```

Replace `192.168.1.X` with your computer's IP on the same network.

Then from project root:
```bash
npm run dev
npx cap open android
```

## Troubleshooting

### Gradle Build Issues
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### SDK Not Found
Make sure `ANDROID_SDK_ROOT` and `ANDROID_HOME` environment variables are set correctly.

### Android Studio Can't Find Project
Ensure you're opening the `android` folder, not the root project folder.

## Building APK for Distribution

1. In Android Studio, go to Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Follow the wizard
3. APK will be generated in `android/app/build/outputs/apk/`

## Useful Commands

```bash
# Sync web assets
npx cap sync android

# Copy only assets (no plugins update)
npx cap copy android

# Open in Android Studio
npx cap open android

# Clear and rebuild
npx cap sync android --no-cache
```

## Notes

- The app uses Supabase for backend (configured in .env)
- Auto-update system is available (see UpdateNotification component)
- App connects to API at `VITE_API_URL` from .env

For more info: https://capacitorjs.com/docs
