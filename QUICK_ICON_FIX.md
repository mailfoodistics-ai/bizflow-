# Quick Fix: Generate Icons Using Online Tool

## Fastest Method (5 minutes):

### Step 1: Go to Android Icon Generator
👉 https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

### Step 2: Upload SVG
1. Click **"Image"** tab (top)
2. Click **"Upload image"**
3. Select `public/app-icon.svg` from your project
4. Wait for preview

### Step 3: Customize (Optional)
- **Shape**: Rounded Square or Circle (your choice)
- **Background**: Custom Color
  - Paste: `#1e40af` (BizFlow Blue)
- **Foreground Scale**: 75-85%

### Step 4: Download
1. Click **"Download .zip"** button at bottom
2. Wait for download

### Step 5: Extract & Copy
1. Extract the ZIP file
2. Copy all PNG files from:
   - `res/mipmap-mdpi/ic_launcher.png` → `android/app/src/main/res/mipmap-mdpi/`
   - `res/mipmap-hdpi/ic_launcher.png` → `android/app/src/main/res/mipmap-hdpi/`
   - `res/mipmap-xhdpi/ic_launcher.png` → `android/app/src/main/res/mipmap-xhdpi/`
   - `res/mipmap-xxhdpi/ic_launcher.png` → `android/app/src/main/res/mipmap-xxhdpi/`
   - `res/mipmap-xxxhdpi/ic_launcher.png` → `android/app/src/main/res/mipmap-xxxhdpi/`

### Step 6: Sync with Android Studio
1. In Android Studio, click **File** → **Sync with Files**
2. Or just rebuild: **Build** → **Make Project**
3. The new icon will appear! ✅

---

## Alternative: Using ImageMagick (Windows)

If you have ImageMagick installed:

```bash
cd your-project-folder
generate-icons.bat
```

This will auto-generate all icon sizes.

---

## Still Shows Green Android Icon?

This happens because Capacitor generates a default icon. After copying your PNG files:

1. **Clean Android Project**
   - In Android Studio: **Build** → **Clean Project**

2. **Make Project**
   - In Android Studio: **Build** → **Make Project**

3. **Rebuild App**
   - Run again: **Shift + F10**

4. **Uninstall Old App**
   - On your phone/emulator, uninstall the old BizFlow app
   - Then run the new build

The new icon should appear! 🚀
