#!/bin/bash
# Script to generate app icons from SVG
# Run: bash generate-icons.sh

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is required but not installed."
    echo "Install it with: brew install imagemagick (Mac) or apt-get install imagemagick (Linux)"
    exit 1
fi

# Create icon directories if they don't exist
mkdir -p android/app/src/main/res/mipmap-{ldpi,mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}

# Convert SVG to PNG icons for Android
echo "Generating Android icons..."

# ldpi (low) - 36x36
convert public/icon.svg -density 72 -resize 36x36 android/app/src/main/res/mipmap-ldpi/ic_launcher.png

# mdpi (medium) - 48x48
convert public/icon.svg -density 72 -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png

# hdpi (high) - 72x72
convert public/icon.svg -density 72 -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png

# xhdpi (extra high) - 96x96
convert public/icon.svg -density 72 -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png

# xxhdpi (extra extra high) - 144x144
convert public/icon.svg -density 72 -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png

# xxxhdpi (extra extra extra high) - 192x192
convert public/icon.svg -density 72 -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Playstore icon - 512x512
convert public/icon.svg -density 72 -resize 512x512 public/icon-512.png

echo "Icons generated successfully!"
echo "Icon locations:"
echo "  - Android: android/app/src/main/res/mipmap-*/ic_launcher.png"
echo "  - PlayStore: public/icon-512.png"