# Nutrixa (PONIS) — Appium E2E Test Suite

> Automated end-to-end testing for the Nutrixa Android mobile application using **Appium + Python + pytest**, running directly on a **physical Android device connected via USB cable**.

---

## 📱 How It Works

Just like Selenium opens Chrome automatically and tests websites — **Appium opens your app on the phone and tests every screen automatically**.

```
Your Laptop (Python + pytest)
        │
        ▼
Appium Server (port 4723)   ← Bridge between Python and Android
        │
        ▼  (USB Cable)
Android Phone
        │
        ▼
Nutrixa App opens → Each screen tested → Screenshots captured → Excel Report generated
```

---

## 📁 Folder Structure

```
appium_tests/
├── config.py                   ← ⚠️ UPDATE THIS with your credentials & device info
├── conftest.py                 ← Appium driver setup + auto report generation
├── requirements.txt            ← Python dependencies
├── run_tests.bat               ← ✅ Double-click to run all tests
├── setup_check.bat             ← Run first to verify prerequisites
├── utils/
│   ├── driver_factory.py       ← Creates Appium connection to your phone
│   ├── screenshot.py           ← Screenshot capture helper
│   └── report_generator.py     ← Excel report generator (3 sheets)
├── tests/
│   ├── test_01_login.py
│   ├── test_02_forgot_password.py
│   ├── test_03_command_center.py
│   ├── test_04_patient_registration.py
│   ├── test_05_patient_list.py
│   ├── test_06_dashboard.py
│   ├── test_07_meal_planner.py
│   ├── test_08_ai_food_scanner.py
│   ├── test_09_ai_face_analysis.py
│   ├── test_10_ai_prediction_engine.py
│   ├── test_11_real_time_analytics.py
│   ├── test_12_weekly_progress.py
│   └── test_13_profile_logout.py
├── screenshots/                ← Auto-created during test run
└── reports/                    ← Excel reports saved here
```

---

## ✅ STEP-BY-STEP SETUP GUIDE

### Step 1 — Prepare Your Android Phone

1. **Enable Developer Options**:
   - Go to: `Settings → About Phone → Build Number`
   - Tap **Build Number 7 times** rapidly
   - You'll see: *"You are now a developer!"*

2. **Enable USB Debugging**:
   - Go to: `Settings → Developer Options`
   - Turn **ON: USB Debugging**

3. **Connect via USB**:
   - Connect your phone to your laptop using the USB cable
   - On your phone: tap **"Allow"** when the USB Debugging popup appears

4. **Verify connection**:
   ```powershell
   adb devices
   ```
   You should see:
   ```
   List of devices attached
   ABC123XYZ    device
   ```
   *(If it shows `unauthorized`, accept the popup on your phone)*

---

### Step 2 — Install Node.js + Appium Server

1. **Install Node.js** from https://nodejs.org/ (LTS version)

2. **Install Appium** (open PowerShell as Administrator):
   ```powershell
   npm install -g appium@2
   ```

3. **Install UiAutomator2 driver** (for Android):
   ```powershell
   appium driver install uiautomator2
   ```

4. **Verify**:
   ```powershell
   appium --version
   # Expected: 2.x.x
   ```

---

### Step 3 — Install Python Dependencies

```powershell
cd C:\Users\jerus\AndroidStudioProjects\Nutrixa\appium_tests
pip install -r requirements.txt
```

---

### Step 4 — Configure Your Device Info

Open [`config.py`](config.py) and update these values:

```python
# Your device name (from adb devices -l)
DEVICE_NAME = "Redmi Note 10"   # ← Change this to your phone name

# Your Android version (Settings > About Phone > Android Version)
PLATFORM_VERSION = "13"          # ← Change to your phone's Android version

# Your test login credentials
DOCTOR_USERNAME = "your_doctor_username"   # ← Change this
DOCTOR_PASSWORD = "your_password"          # ← Change this
```

**To find your device name and Android version**, run:
```powershell
adb devices -l                               # Device serial and name
adb shell getprop ro.build.version.release   # Android version
adb shell getprop ro.product.model           # Phone model name
```

---

### Step 5 — Run the Setup Checker

Before running tests, run the prerequisite checker:
```
Double-click: setup_check.bat
```
All items should show `[PASS]`. Fix any `[FAIL]` items.

---

### Step 6 — Run the Tests!

```
Double-click: run_tests.bat
```

**OR** run manually in PowerShell:
```powershell
cd C:\Users\jerus\AndroidStudioProjects\Nutrixa\appium_tests

# Terminal 1: Start Appium server
appium --port 4723

# Terminal 2: Run tests
pytest tests/ -v --tb=short
```

**Watch your phone** — the app will open automatically and each screen will be tested!

---

## 📊 Excel Report

After tests complete, the report is automatically generated in the `reports/` folder:

**`reports/Nutrixa_E2E_Report_YYYY-MM-DD_HH-MM-SS.xlsx`**

| Sheet | Contents |
|-------|----------|
| 📊 Summary | Total pass/fail counts, duration, pass rate %, pie chart |
| 🧪 Detailed Results | Every test: name, status, duration, error, screenshot file |
| 📱 Screen Coverage | All 13 screens: whether covered and their result |

The report is **color-coded**:
- 🟢 Green = PASS
- 🔴 Red = FAIL
- 🟡 Orange = SKIP

---

## 🧪 Screens Tested (13 Total)

| # | Screen | Test File |
|---|--------|-----------|
| 1 | Login Screen | test_01_login.py |
| 2 | Forgot Password | test_02_forgot_password.py |
| 3 | Command Center | test_03_command_center.py |
| 4 | Patient Registration | test_04_patient_registration.py |
| 5 | Patient List/Directory | test_05_patient_list.py |
| 6 | Dashboard (Central Console) | test_06_dashboard.py |
| 7 | Meal Planner (Intake Planner) | test_07_meal_planner.py |
| 8 | AI Food Scanner | test_08_ai_food_scanner.py |
| 9 | AI Face Analysis (Biometric) | test_09_ai_face_analysis.py |
| 10 | AI Prediction Engine | test_10_ai_prediction_engine.py |
| 11 | Real-Time Analytics | test_11_real_time_analytics.py |
| 12 | Weekly Progress Report | test_12_weekly_progress.py |
| 13 | Profile & Logout | test_13_profile_logout.py |

---

## 🔧 Troubleshooting

### "No Android device found" error
- Check USB cable is properly connected
- Accept USB Debugging prompt on your phone
- Run `adb kill-server` then `adb start-server`

### "Appium not found" error
- Run `npm install -g appium@2` in PowerShell (as Administrator)
- Restart PowerShell after installation

### App doesn't open on phone
- Verify the app is installed: `adb shell pm list packages | findstr nutrixa`
- Check `config.py`: `APP_PACKAGE = "com.example.nutrixa"` is correct
- Make sure Appium server is running (check the Appium terminal window)

### "unauthorized" in adb devices
- Disconnect and reconnect the USB cable
- On your phone, accept the USB Debugging authorization popup
- Check "Always allow from this computer"

### Tests are slow / timing out
- Increase `EXPLICIT_WAIT` in `config.py` (default: 20 seconds)
- Ensure backend server is running (`https://nutrixa-backend.onrender.com`)

---

## 📸 Screenshots

Screenshots are automatically captured:
- On every important action (login, navigation, form fill)
- On every test failure (for debugging)
- Saved in `screenshots/` folder with timestamp

---

## 🚀 Quick Reference Commands

```powershell
# Check device
adb devices

# Get device info for config.py
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release

# Start Appium
appium --port 4723

# Run all tests
pytest tests/ -v

# Run a specific test file
pytest tests/test_01_login.py -v

# Run a single test
pytest tests/test_01_login.py::TestLogin::test_login_screen_loads -v

# Run with detailed output
pytest tests/ -v --tb=long
```
