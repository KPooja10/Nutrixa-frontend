# 📱 PONIS — Android Appium Mobile E2E Test Suite

**Predictive Oncology Nutrition Intelligence System**
Automated Android End-to-End Test Suite using **Appium + WebDriverIO + UiAutomator2**

---

## 📁 Folder Structure

```
appium-tests/
├── run-appium.js               ← Main test orchestrator (entry point)
├── package.json                ← Dependencies
├── README.md                   ← This file
├── app/
│   └── ponis.apk               ← ⚠️ Place your compiled Android APK here
├── reports/
│   └── ponis-mobile-test-report.xlsx  ← Auto-generated after each run
└── categories/
    ├── functional.js           ← TC-002  to TC-014  (13 tests)
    ├── ui_ux.js                ← TC-015  to TC-024  (10 tests)
    ├── navigation.js           ← TC-025  to TC-034  (10 tests)
    ├── performance.js          ← TC-035  to TC-044  (10 tests)
    ├── security.js             ← TC-045  to TC-054  (10 tests)
    ├── api.js                  ← TC-055  to TC-064  (10 tests)
    ├── patient.js              ← TC-065  to TC-074  (10 tests)
    ├── accessibility.js        ← TC-075  to TC-082  (8 tests)
    ├── gestures.js             ← TC-083  to TC-090  (8 tests)
    ├── regression.js           ← TC-091  to TC-100  (10 tests)
    └── e2e_flow.js             ← TC-101  to TC-110  (10 tests)
```

---

## 🧪 Test Categories (110 Test Cases)

| # | Category | Test IDs | Count | What it tests |
|---|----------|----------|-------|---------------|
| 1 | **Functional** | TC-002 → TC-014 | 13 | App launch, login, input fields, auth flows |
| 2 | **UI/UX** | TC-015 → TC-024 | 10 | Visual rendering, cards, layout, icons |
| 3 | **Navigation** | TC-025 → TC-034 | 10 | Screen-to-screen routing, back nav |
| 4 | **Performance** | TC-035 → TC-044 | 10 | Load times, scroll speed, stability |
| 5 | **Security** | TC-045 → TC-054 | 10 | Auth guards, SQL injection, XSS, session |
| 6 | **API** | TC-055 → TC-064 | 10 | Backend endpoints via axios HTTP calls |
| 7 | **Patient Management** | TC-065 → TC-074 | 10 | Registration, monitoring, list, stats |
| 8 | **Accessibility** | TC-075 → TC-082 | 8 | Content-desc, touch targets, TalkBack |
| 9 | **Gestures & Touch** | TC-083 → TC-090 | 8 | Swipe, scroll, long-press, double-tap |
| 10 | **Regression** | TC-091 → TC-100 | 10 | Guard known-good behaviours from breaking |
| 11 | **E2E Flow** | TC-101 → TC-110 | 10 | Complete clinical user journeys |
| | **TC-001** | | 1 | Appium driver initialization |
| | **Total** | | **110** | |

---

## ⚙️ Prerequisites

### 1. Install Java & Android SDK
- [Java JDK 11+](https://adoptium.net/)
- [Android Studio](https://developer.android.com/studio) (includes SDK & `adb`)
- Set environment variables:
  ```
  JAVA_HOME = C:\Program Files\Java\jdk-xx
  ANDROID_HOME = C:\Users\<you>\AppData\Local\Android\Sdk
  ```

### 2. Install Appium & UiAutomator2 Driver
```powershell
npm install -g appium
appium driver install uiautomator2
```

### 3. Start Android Emulator
Open Android Studio → **Device Manager** → Start an emulator (Android 13 recommended).

Or use AVD from command line:
```powershell
emulator -avd Pixel_6_API_33
```

Verify device is connected:
```powershell
adb devices
# Should show: emulator-5554   device
```

### 4. Install Test Dependencies
```powershell
cd appium-tests
npm install
```

### 5. Place Your APK
Copy your compiled PONIS Android APK to:
```
appium-tests/app/ponis.apk
```

> **Update** the `'appium:appPackage'` and `'appium:appActivity'` values in `run-appium.js`
> to match your actual app's package name and main activity.

### 6. Update App Config in `run-appium.js`
```js
const CAPABILITIES = {
  'appium:app'          : path.join(__dirname, 'app', 'ponis.apk'),
  'appium:appPackage'   : 'com.ponis.app',          // ← Your package name
  'appium:appActivity'  : 'com.ponis.app.MainActivity', // ← Your main activity
  'appium:platformVersion': '13.0',                 // ← Match your emulator
};
```

To find your package name and activity:
```powershell
adb shell pm list packages | findstr ponis
adb shell dumpsys package com.ponis.app | findstr Activity
```

---

## 🚀 Running the Tests

### Step 1 — Start Appium Server
```powershell
npx appium
# Appium server should start on http://127.0.0.1:4723
```

### Step 2 — Run the Full Suite
```powershell
cd appium-tests
npm run test:mobile
```

---

## 📊 Excel Report

After each run, a detailed Excel report is automatically generated at:
```
appium-tests/reports/ponis-mobile-test-report.xlsx
```

The report contains **two sheets**:

### Sheet 1 — Summary
| Metric | Value |
|--------|-------|
| Total Test Cases | 110 |
| Passed ✅ | N |
| Failed ❌ | N |
| Skipped ⏭ | N |
| Pass Rate (%) | XX% |
| Run Date | ... |
| Platform | Android (Appium UiAutomator2) |

### Sheet 2 — All Test Results
| Column | Description |
|--------|-------------|
| Test ID | TC-001 to TC-110 |
| Category | Functional / UI-UX / Navigation / etc. |
| Test Case Name | Short title |
| Description | Full test description |
| Status | PASS / FAIL / SKIPPED |
| Duration (ms) | How long the test took |
| Error Message | Failure details (if any) |
| Timestamp | ISO timestamp of execution |

---

## 🔧 Configuration Reference

| Setting | Location | Default |
|---------|----------|---------|
| Appium Host | `run-appium.js` → `WDIO_OPTIONS.hostname` | `127.0.0.1` |
| Appium Port | `run-appium.js` → `WDIO_OPTIONS.port` | `4723` |
| Backend URL | `run-appium.js` → `BACKEND_URL` | `http://10.0.2.2:3000` |
| APK Path | `run-appium.js` → `CAPABILITIES['appium:app']` | `./app/ponis.apk` |
| Android Version | `run-appium.js` → `CAPABILITIES['appium:platformVersion']` | `13.0` |
| Report Path | `run-appium.js` → `REPORT_PATH` | `./reports/ponis-mobile-test-report.xlsx` |

> **`10.0.2.2`** is the special Android emulator loopback IP that maps to your PC's `localhost`.
> If testing on a real device, use your PC's actual LAN IP (e.g., `192.168.1.x`).

---

## 🛠 Troubleshooting

| Problem | Solution |
|---------|----------|
| `Could not connect to Appium` | Run `npx appium` first |
| `No devices found` | Run `adb devices` — ensure emulator is running |
| `APK not found` | Place `ponis.apk` in `appium-tests/app/` folder |
| `Element not found` | Add `accessibility ID` or `resource-id` to your Android app's UI components |
| `401 API errors` | Ensure backend server is running on port 3000 |
| Report file locked | Close Excel before re-running — or a timestamped fallback is auto-generated |

---

## 🔑 Element Locator Strategy

The tests use Appium's Android locators in priority order:

1. **Accessibility ID** (`~element-id`) — Best for TalkBack-labelled elements
2. **UiSelector by text** (`textContains("...")`) — Used for most nav/button elements
3. **UiSelector by class + index** — Fallback for generic inputs
4. **Resource ID** (`resourceId("...")`) — For specifically tagged form fields

To improve test stability, add `accessibilityLabel` / `contentDescription` to your React Native/WebView components.

---

*Generated for PONIS v1.0 — Predictive Oncology Nutrition Intelligence System*
