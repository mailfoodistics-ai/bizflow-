# Generate Android Icons from SVG

## Quick Solution (Easiest):

### Using Online Icon Generator:
1. Go to https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Upload our `public/app-icon.svg`
3. Download the generated icons ZIP
4. Extract and copy to Android folders

## Step-by-Step:

### 1. Generate Icons Online:
- Visit: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
- Click "Image" tab
- Upload: `public/app-icon.svg`
- Set background color to `#1e40af` (BizFlow blue)
- Download the icons

### 2. Replace Android Icons:
Extract the ZIP and copy files to:

```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png
│   ├── ic_launcher_foreground.png
│   ├── ic_launcher_round.png
├── mipmap-hdpi/
├── mipmap-xhdpi/
├── mipmap-xxhdpi/
└── mipmap-xxxhdpi/
```

### 3. In Android Studio:
- Right-click on `android/app/src/main/res/`
- Select "New" → "Image Asset"
- Choose the PNG files
- Click "Create"

### 4. Rebuild in Android Studio:
- Click Build → Clean Project
- Click Build → Make Project
- Run the app (Shift + F10)

## Alternative: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Convert SVG to PNG at different sizes
convert -density 300 public/app-icon.svg -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
convert -density 300 public/app-icon.svg -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert -density 300 public/app-icon.svg -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert -density 300 public/app-icon.svg -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert -density 300 public/app-icon.svg -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
```

## Recommended: Use Capacitor's Asset Packer

```bash
npm install -g @capacitor/assets
cap copy
npx cap-assets generate --android
```

This will auto-generate all icon sizes from a single source image.
