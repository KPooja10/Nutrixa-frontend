"""
utils/driver_factory.py — Appium Driver Factory
=================================================
Creates and configures the Appium UiAutomator2 driver for
a physical Android device connected via USB.
"""

import time
from appium import webdriver

# Verified correct import path for Appium-Python-Client 3.1.0
# (appium.options top-level does NOT re-export UiAutomator2Options in v3.x)
try:
    from appium.options.android.uiautomator2.base import UiAutomator2Options
except ImportError:
    # Older client versions exposed it at the top level
    try:
        from appium.options import UiAutomator2Options  # type: ignore[no-redef]
    except ImportError:
        UiAutomator2Options = None  # type: ignore[assignment,misc]
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config


def create_driver() -> webdriver.Remote:
    """
    Create and return a configured Appium WebDriver for the USB-connected device.
    This is equivalent to webdriver.Chrome() for Selenium.
    """
    if UiAutomator2Options is not None:
        # Modern path: Appium-Python-Client >= 2.0
        options = UiAutomator2Options()
        options.platform_name = "Android"
        options.platform_version = config.PLATFORM_VERSION
        options.device_name = config.DEVICE_NAME
        if config.UDID:
            options.udid = config.UDID
        options.app_package = config.APP_PACKAGE
        options.app_activity = config.APP_ACTIVITY
        options.no_reset = True
        options.full_reset = False
        options.auto_grant_permissions = True
        options.new_command_timeout = 300
    else:
        # Legacy fallback: Appium-Python-Client 1.x — use plain capabilities dict
        options = {
            "platformName": "Android",
            "appium:platformVersion": config.PLATFORM_VERSION,
            "appium:deviceName": config.DEVICE_NAME,
            "appium:appPackage": config.APP_PACKAGE,
            "appium:appActivity": config.APP_ACTIVITY,
            "appium:automationName": "UiAutomator2",
            "appium:noReset": True,
            "appium:fullReset": False,
            "appium:autoGrantPermissions": True,
            "appium:newCommandTimeout": 300,
        }
        if config.UDID:
            options["appium:udid"] = config.UDID

    # UiAutomator2 specific timeouts (only available on Options object, not legacy dict)
    if UiAutomator2Options is not None:
        options.uiautomator2_server_launch_timeout = 60000  # 60s server launch timeout
        options.adb_exec_timeout = 30000                    # 30s ADB timeout
    else:
        options["appium:uiautomator2ServerLaunchTimeout"] = 60000
        options["appium:adbExecTimeout"] = 30000

    print(f"\n{'='*60}")
    print(f"  🚀 Connecting to Android device via USB...")
    print(f"  📱 Device: {config.DEVICE_NAME} (Android {config.PLATFORM_VERSION})")
    print(f"  📦 App: {config.APP_PACKAGE}")
    print(f"  🌐 Appium: {config.APPIUM_URL}")
    print(f"{'='*60}\n")

    driver = webdriver.Remote(config.APPIUM_URL, options=options)
    driver.implicitly_wait(config.IMPLICIT_WAIT)

    # Wait for app to fully launch
    time.sleep(config.APP_LAUNCH_WAIT)

    print(f"  ✅ App launched successfully on device!")
    return driver


def quit_driver(driver: webdriver.Remote) -> None:
    """Safely quit the Appium driver session."""
    try:
        if driver:
            driver.quit()
            print(f"\n  🔌 Appium session closed.\n")
    except Exception as e:
        print(f"\n  ⚠️  Error closing driver: {e}\n")
