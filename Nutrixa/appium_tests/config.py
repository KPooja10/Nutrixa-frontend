"""
config.py — Central configuration for Nutrixa Appium Test Suite
================================================================
UPDATE THESE VALUES before running tests:
  1. DEVICE_NAME  → from `adb devices -l` (the name/serial of your phone)
  2. PLATFORM_VERSION → your phone's Android version (Settings → About Phone)
  3. DOCTOR_USERNAME / DOCTOR_PASSWORD → valid doctor login credentials
  4. PATIENT_USERNAME / PATIENT_PASSWORD → valid patient login credentials
"""

import os

# ─────────────────────────────────────────────────────────
# 📱 DEVICE CONFIGURATION (USB Connected Phone)
# ─────────────────────────────────────────────────────────
DEVICE_NAME = "RMX3990"                 # Realme RMX3990
PLATFORM_VERSION = "16"                 # Android 16
UDID = "7cc68663"                      # Device serial (from adb devices)

# ─────────────────────────────────────────────────────────
# 📦 APP CONFIGURATION
# ─────────────────────────────────────────────────────────
APP_PACKAGE = "com.example.nutrixa"
APP_ACTIVITY = "com.example.nutrixa.MainActivity"

# ─────────────────────────────────────────────────────────
# 🔑 TEST CREDENTIALS
# ─────────────────────────────────────────────────────────
DOCTOR_USERNAME = "doctor"          # ← UPDATE with your doctor login username
DOCTOR_PASSWORD = "doctor123"         # ← UPDATE with your doctor login password

PATIENT_USERNAME = "patient"        # ← UPDATE with your patient login username
PATIENT_PASSWORD = "patient123"        # ← UPDATE with your patient login password

# ─────────────────────────────────────────────────────────
# ⏱️ TIMEOUT SETTINGS (seconds)
# ─────────────────────────────────────────────────────────
IMPLICIT_WAIT = 15          # Default element wait time
EXPLICIT_WAIT = 20          # Explicit wait for slow operations (network calls)
APP_LAUNCH_WAIT = 5         # Wait after app launches
SCREEN_TRANSITION_WAIT = 3  # Wait between screen transitions

# ─────────────────────────────────────────────────────────
# 🌐 APPIUM SERVER
# ─────────────────────────────────────────────────────────
APPIUM_HOST = "127.0.0.1"
APPIUM_PORT = 4723
APPIUM_URL = f"http://{APPIUM_HOST}:{APPIUM_PORT}"

# ─────────────────────────────────────────────────────────
# 📁 OUTPUT DIRECTORIES
# ─────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

# Auto-create directories
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)
