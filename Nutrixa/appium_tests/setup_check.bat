@echo off
REM ============================================================
REM  setup_check.bat — Prerequisites Checker for Appium Testing
REM  Run this FIRST before running tests to verify your setup
REM ============================================================

title Nutrixa Appium Setup Checker

echo.
echo  ============================================================
echo   NUTRIXA APPIUM SETUP CHECKER
echo   Verifying all prerequisites are installed correctly
echo  ============================================================
echo.

REM Pre-set Android SDK and Java paths in case they are not in the system-wide PATH
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set ANDROID_HOME=C:\Users\jerus\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=C:\Users\jerus\AppData\Local\Android\Sdk
set PATH=C:\Program Files\Android\Android Studio\jbr\bin;C:\Users\jerus\AppData\Local\Android\Sdk\platform-tools;C:\Users\jerus\AppData\Local\Android\Sdk\emulator;%PATH%

set PASS=0
set FAIL=0

REM ─── Check Java ──────────────────────────────────────────────
echo  [CHECK] Java JDK...
java -version >nul 2>&1
set RES=%ERRORLEVEL%
if "%RES%"=="0" (
    echo  [PASS] Java is installed
    java -version 2>&1 | findstr /i "version"
    set /a PASS+=1
) else (
    echo  [FAIL] Java NOT found - Install JDK from https://adoptium.net/
    set /a FAIL+=1
)
echo.

REM ─── Check Node.js ───────────────────────────────────────────
echo  [CHECK] Node.js...
node --version >nul 2>&1
set RES=%ERRORLEVEL%
if "%RES%"=="0" (
    echo  [PASS] Node.js is installed:
    node --version
    set /a PASS+=1
) else (
    echo  [FAIL] Node.js NOT found - Install from https://nodejs.org/
    set /a FAIL+=1
)
echo.

REM ─── Check npm ────────────────────────────────────────────────
echo  [CHECK] npm...
call npm --version >nul 2>&1
set RES=%ERRORLEVEL%
if "%RES%"=="0" (
    echo  [PASS] npm is installed:
    call npm --version
    set /a PASS+=1
) else (
    echo  [FAIL] npm NOT found - comes with Node.js
    set /a FAIL+=1
)
echo.

REM ─── Check Appium ────────────────────────────────────────────
echo  [CHECK] Appium Server...
call appium --version >nul 2>&1
set RES=%ERRORLEVEL%
if "%RES%"=="0" (
    echo  [PASS] Appium is installed:
    call appium --version
    set /a PASS+=1
) else (
    echo  [FAIL] Appium NOT found - Run: npm install -g appium
    set /a FAIL+=1
)
echo.

REM ─── Check Appium UiAutomator2 Driver ────────────────────────
echo  [CHECK] Appium UiAutomator2 Driver...
call appium driver list --installed 2>&1 | findstr /i "uiautomator2" >nul
set RES=%ERRORLEVEL%
if "%RES%"=="0" (
    echo  [PASS] UiAutomator2 driver is installed
    set /a PASS+=1
) else (
    echo  [FAIL] UiAutomator2 NOT installed - Run: appium driver install uiautomator2
    set /a FAIL+=1
)
echo.

REM ─── Check Python ────────────────────────────────────────────
echo  [CHECK] Python...
python --version >nul 2>&1
set RES=%ERRORLEVEL%
if "%RES%"=="0" (
    echo  [PASS] Python is installed:
    python --version
    set /a PASS+=1
) else (
    echo  [FAIL] Python NOT found - Install from https://python.org/
    set /a FAIL+=1
)
echo.

REM ─── Check pip packages ──────────────────────────────────────
echo  [CHECK] Python packages (Appium-Python-Client, pytest, openpyxl)...
python -c "import appium; import pytest; import openpyxl; print('All packages installed')" >nul 2>&1
set RES=%ERRORLEVEL%
if "%RES%"=="0" (
    echo  [PASS] All Python packages are installed
    set /a PASS+=1
) else (
    echo  [FAIL] Some Python packages missing - Run: python -m pip install -r requirements.txt
    set /a FAIL+=1
)
echo.

REM ─── Check ADB ───────────────────────────────────────────────
echo  [CHECK] ADB (Android Debug Bridge)...
adb version >nul 2>&1
set RES=%ERRORLEVEL%
if "%RES%"=="0" (
    echo  [PASS] ADB is installed:
    adb version | findstr /i "version"
    set /a PASS+=1
) else (
    echo  [FAIL] ADB NOT found - Install Android SDK Platform Tools
    set /a FAIL+=1
)
echo.

REM ─── Check Connected Device ──────────────────────────────────
echo  [CHECK] USB Android device connection...
adb devices >nul 2>&1
set HAS_DEVICE=0
for /f "skip=1 tokens=1,2" %%a in ('adb devices 2^>nul') do (
    if "%%b"=="device" (
        echo  [PASS] Android device connected via USB:
        echo         Serial: %%a
        set HAS_DEVICE=1
        set /a PASS+=1
        goto :device_done
    )
    if "%%b"=="unauthorized" (
        echo  [WARN] Device found but UNAUTHORIZED - Check your phone for USB debugging prompt!
        echo         Serial: %%a
        set HAS_DEVICE=1
        goto :device_done
    )
)
:device_done
if "%HAS_DEVICE%"=="0" (
    echo  [FAIL] No Android device detected
    echo         1. Connect phone via USB
    echo         2. Enable Developer Options - tap Build Number 7 times
    echo         3. Enable USB Debugging
    echo         4. Accept the USB Debugging prompt on your phone
    echo         Run 'adb devices' to verify
    set /a FAIL+=1
)
echo.

REM ─── Get device info (for config.py) ─────────────────────────
echo  [INFO] Your device details (copy to config.py):
echo.
for /f "skip=1 tokens=1" %%a in ('adb devices 2^>nul') do (
    echo         Device Serial: %%a
    echo         Android Version:
    adb -s %%a shell getprop ro.build.version.release 2>nul
    echo         Device Model:
    adb -s %%a shell getprop ro.product.model 2>nul
    echo.
    goto :info_done
)
:info_done

REM ─── SUMMARY ─────────────────────────────────────────────────
echo  ============================================================
echo   SETUP CHECK SUMMARY
echo  ============================================================
echo   PASSED: %PASS%
echo   FAILED: %FAIL%
echo  ============================================================
echo.

if %FAIL% == 0 (
    echo  ALL CHECKS PASSED! You are ready to run Appium tests.
    echo  Run: run_tests.bat
) else (
    echo  Please fix the FAILED items above before running tests.
    echo  After fixing, run this script again to verify.
)
echo.

echo  NEXT STEPS:
echo  1. Update appium_tests\config.py with your credentials
echo  2. Double-click run_tests.bat to start testing
echo.

pause
