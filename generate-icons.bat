@echo off
REM Script to generate app icons using Windows tools
REM Requirements: ImageMagick or alternative image tool

echo Generating App Icons...
echo.

REM Check if public folder exists
if not exist "public" mkdir public

REM Create Android icon directories
if not exist "android\app\src\main\res\mipmap-ldpi" mkdir android\app\src\main\res\mipmap-ldpi
if not exist "android\app\src\main\res\mipmap-mdpi" mkdir android\app\src\main\res\mipmap-mdpi
if not exist "android\app\src\main\res\mipmap-hdpi" mkdir android\app\src\main\res\mipmap-hdpi
if not exist "android\app\src\main\res\mipmap-xhdpi" mkdir android\app\src\main\res\mipmap-xhdpi
if not exist "android\app\src\main\res\mipmap-xxhdpi" mkdir android\app\src\main\res\mipmap-xxhdpi
if not exist "android\app\src\main\res\mipmap-xxxhdpi" mkdir android\app\src\main\res\mipmap-xxxhdpi

echo Icon directories created.
echo.
echo IMPORTANT: To generate PNG icons from SVG, use one of these tools:
echo   1. ImageMagick (Windows installer from https://imagemagick.org/script/download.php)
echo   2. Online tool: https://convertio.co/svg-png/
echo   3. In Android Studio: Right-click icon.svg ^> Convert to PNG
echo.
echo After conversion, place PNG files in:
echo   - android/app/src/main/res/mipmap-ldpi/ic_launcher.png (36x36)
echo   - android/app/src/main/res/mipmap-mdpi/ic_launcher.png (48x48)
echo   - android/app/src/main/res/mipmap-hdpi/ic_launcher.png (72x72)
echo   - android/app/src/main/res/mipmap-xhdpi/ic_launcher.png (96x96)
echo   - android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png (144x144)
echo   - android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png (192x192)