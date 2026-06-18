@echo off
REM ============================================================
REM  run_tests.bat — Nutrixa Appium E2E Test Runner
REM  Double-click this file to run the full test suite
REM ============================================================

title Nutrixa E2E Appium Tests

REM Pre-set Android SDK and Java paths in case they are not in the system-wide PATH
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set ANDROID_HOME=C:\Users\jerus\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=C:\Users\jerus\AppData\Local\Android\Sdk
set PATH=C:\Program Files\Android\Android Studio\jbr\bin;C:\Users\jerus\AppData\Local\Android\Sdk\platform-tools;C:\Users\jerus\AppData\Local\Android\Sdk\emulator;%PATH%

echo.
echo  ============================================================
echo   NUTRIXA PONIS - APPIUM END-TO-END TEST SUITE
echo  ============================================================
echo.

REM ─── Step 1: Check ADB device ────────────────────────────────
echo  [1/4] Checking for USB-connected Android device...
echo.
adb devices
echo.

REM Get device count (check if any device is connected)
for /f "skip=1 tokens=2" %%a in ('adb devices') do (
    if "%%a"=="device" (
        echo  [OK] Android device detected via USB!
        goto :device_found
    )
)
echo  [ERROR] No Android device found!
echo  Please:
echo    1. Connect your phone via USB cable
echo    2. Enable USB Debugging (Settings > Developer Options)
echo    3. Accept the USB Debugging prompt on your phone
echo    4. Run 'adb devices' to verify your phone shows as 'device'
pause
exit /b 1

:device_found
echo.

REM ─── Step 2: Start Appium Server ─────────────────────────────
echo  [2/4] Starting Appium Server on port 4723...
echo  (Appium will start in a new window - do NOT close it)
echo.

REM Check if Appium is already running
curl -s http://127.0.0.1:4723/status >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo  [OK] Appium already running on port 4723
) else (
    start "Appium Server" cmd /k "echo Starting Appium... && appium --port 4723 --log-level info"
    echo  [WAIT] Waiting 8 seconds for Appium to start...
    timeout /t 8 /nobreak >nul
    echo  [OK] Appium server started
)
echo.

REM ─── Step 3: Install Python dependencies ─────────────────────
echo  [3/4] Checking Python dependencies...
python -m pip install -r requirements.txt -q
echo  [OK] Dependencies installed
echo.

REM ─── Step 4: Run Tests ────────────────────────────────────────
echo  [4/4] Running E2E Tests on your Android device...
echo.
echo  WATCH YOUR PHONE - the app will open and test automatically!
echo.
echo  ============================================================

cd /d "%~dp0"
python -m pytest tests/ -v --tb=short --no-header -rA

echo.
echo  ============================================================
echo   TESTS COMPLETE - Check reports/ folder for Excel report
echo  ============================================================
echo.

REM ─── Open reports folder ────────────────────────────────────
echo  Opening reports folder...
start "" "%~dp0reports"

REM ─── Open the latest Excel report ───────────────────────────
for /f "delims=" %%i in ('dir /b /o-d "%~dp0reports\*.xlsx" 2^>nul') do (
    echo  Opening Excel report: %%i
    start "" "%~dp0reports\%%i"
    goto :done
)

:done
echo.
echo  Done! Press any key to exit.
pause >nul
