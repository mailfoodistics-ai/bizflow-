# App Icon Setup Guide

## Quick Start

Your app icon SVG is ready at: `public/icon.svg`

This is a stylish BizFlow logo with blue gradient and "BizFlow" text.

## Converting SVG to PNG Icons

### Option 1: Using Android Studio (Easiest for Windows)

1. Open Android Studio
2. Right-click on `public/icon.svg`
3. Select "New" → "Image Asset"
4. Choose "Image (PNG)"
5. Select the SVG file as source
6. Android Studio will automatically generate all required sizes
7. Icons will be placed in `android/app/src/main/res/mipmap-*/`

### Option 2: Using Online Tools

1. Go to https://convertio.co/svg-png/
2. Upload `public/icon.svg`
3. Convert to PNG at these sizes:
   - 36x36 (ldpi)
   - 48x48 (mdpi)
   - 72x72 (hdpi)
   - 96x96 (xhdpi)
   - 144x144 (xxhdpi)
   - 192x192 (xxxhdpi)
   - 512x512 (playstore)

4. Save files to corresponding `android/app/src/main/res/mipmap-*/ic_launcher.png`

### Option 3: Using ImageMagick (Advanced)

```bash
# Install ImageMagick
# Windows: https://imagemagick.org/script/download.php
# Mac: brew install imagemagick
# Linux: apt-get install imagemagick

# Run the script
bash generate-icons.sh  # macOS/Linux
# or
generate-icons.bat     # Windows (after installing ImageMagick)
```

## Icon Directory Structure

After conversion, your icons should be at:

```
android/app/src/main/res/
├── mipmap-ldpi/
│   └── ic_launcher.png (36x36)
├── mipmap-mdpi/
│   └── ic_launcher.png (48x48)
├── mipmap-hdpi/
│   └── ic_launcher.png (72x72)
├── mipmap-xhdpi/
│   └── ic_launcher.png (96x96)
├── mipmap-xxhdpi/
│   └── ic_launcher.png (144x144)
├── mipmap-xxxhdpi/
│   └── ic_launcher.png (192x192)
└── web_hi_res_512.png (512x512 for Play Store)
```

## Icon Specifications

- **Format**: PNG with transparent background
- **DPI**: 72 DPI recommended
- **Dimensions**: See above for each size
- **Color**: Blue gradient (#3b82f6 to #1e40af) with white text
- **Style**: Stylish, modern, recognizable at all sizes

## Testing Icons

After adding icons:

1. Rebuild Android project:
   ```bash
   npx cap sync android
   cd android
   ./gradlew clean build
   ```

2. Install and run:
   ```bash
   flutter run
   # or from Android Studio: Run > Run 'app'
   ```

## Icon Preview

Your icon features:
- 🎨 Blue gradient background
- 🛒 Shopping cart symbol
- ✍️ "BizFlow" text
- ✨ Modern, clean design
- 📱 Works at all resolutions

## Need Help?

- SVG Source: `public/icon.svg`
- Android Docs: https://developer.android.com/guide/topics/ui/notifiers/notifications
- Capacitor Icons: https://capacitorjs.com/docs/guides/deploying-capacitor-apps
