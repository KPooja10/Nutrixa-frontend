"""
utils/screenshot.py — Screenshot Capture Helper
================================================
Captures screenshots during tests and saves them to the screenshots/ folder.
"""

import os
import time
from datetime import datetime

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config


def take_screenshot(driver, name: str) -> str:
    """
    Capture a screenshot and save it to the screenshots directory.
    
    Args:
        driver: Appium WebDriver instance
        name: Descriptive name for the screenshot (e.g. 'login_success')
    
    Returns:
        str: Absolute path to the saved screenshot file
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Sanitize name for filename
    safe_name = name.replace(" ", "_").replace("/", "-").replace("\\", "-")
    filename = f"{timestamp}_{safe_name}.png"
    filepath = os.path.join(config.SCREENSHOTS_DIR, filename)

    try:
        driver.save_screenshot(filepath)
        print(f"    📸 Screenshot saved: {filename}")
        return filepath
    except Exception as e:
        print(f"    ⚠️  Screenshot failed for '{name}': {e}")
        return ""


def take_screenshot_on_failure(driver, test_name: str) -> str:
    """
    Convenience wrapper — captures a screenshot specifically on test failure.
    """
    return take_screenshot(driver, f"FAIL_{test_name}")
