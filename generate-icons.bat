@echo off
REM Android Icon Generation Script for BizFlow POS
REM Requires ImageMagick to be installed

echo BizFlow POS - Android Icon Generator
echo.

REM Check if ImageMagick is installed
where convert >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ImageMagick is not installed or not in PATH
    echo.
    echo Please install ImageMagick from: https://imagemagick.org/
    echo Make sure to add to system PATH during installation
    echo.
    pause
    exit /b 1
)

echo Converting SVG icon to PNG sizes...
echo.

REM Create directories
if not exist "android\app\src\main\res\mipmap-mdpi" mkdir android\app\src\main\res\mipmap-mdpi
if not exist "android\app\src\main\res\mipmap-hdpi" mkdir android\app\src\main\res\mipmap-hdpi
if not exist "android\app\src\main\res\mipmap-xhdpi" mkdir android\app\src\main\res\mipmap-xhdpi
if not exist "android\app\src\main\res\mipmap-xxhdpi" mkdir android\app\src\main\res\mipmap-xxhdpi
if not exist "android\app\src\main\res\mipmap-xxxhdpi" mkdir android\app\src\main\res\mipmap-xxxhdpi

REM Generate icons
echo Generating xxxhdpi (192x192)...
convert -density 300 public\app-icon.svg -resize 192x192 android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png

echo Generating xxhdpi (144x144)...
convert -density 300 public\app-icon.svg -resize 144x144 android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png

echo Generating xhdpi (96x96)...
convert -density 300 public\app-icon.svg -resize 96x96 android\app\src\main\res\mipmap-xhdpi\ic_launcher.png

echo Generating hdpi (72x72)...
convert -density 300 public\app-icon.svg -resize 72x72 android\app\src\main\res\mipmap-hdpi\ic_launcher.png

echo Generating mdpi (48x48)...
convert -density 300 public\app-icon.svg -resize 48x48 android\app\src\main\res\mipmap-mdpi\ic_launcher.png

echo.
echo ✓ Icon generation complete!
echo.
echo Next: Open Android Studio and rebuild
echo.
pause

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