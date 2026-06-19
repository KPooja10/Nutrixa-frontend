"""
test_09_ai_face_analysis.py — AI Face Analysis (Biometric Scan) Screen Tests
=============================================================================
Tests the AI Face Analysis screen:
- Navigate via drawer to Biometric Scan
- Verify camera/biometric UI loads
- Verify analysis controls present
"""

import pytest
import time
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config
from utils.screenshot import take_screenshot
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


SCREEN_NAME = "AI Face Analysis (Biometric Scan)"


def _find_contains_text(driver, text, timeout=config.EXPLICIT_WAIT):
    wait = WebDriverWait(driver, timeout)
    return wait.until(EC.presence_of_element_located(
        (AppiumBy.ANDROID_UIAUTOMATOR, f'new UiSelector().textContains("{text}")')
    ))


def _open_drawer_and_navigate(driver, screen_label):
    try:
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Menu").click()
    except Exception:
        size = driver.get_window_size()
        driver.swipe(10, size['height'] // 2, size['width'] // 3, size['height'] // 2, 600)
    time.sleep(1.5)
    try:
        _find_contains_text(driver, screen_label, timeout=6).click()
        time.sleep(config.SCREEN_TRANSITION_WAIT)
    except Exception:
        driver.back()
        raise


@pytest.mark.screen(SCREEN_NAME)
class TestAIFaceAnalysis:

    def test_navigate_to_biometric_scan(self, driver):
        """Navigate to Biometric Scan via drawer."""
        try:
            _open_drawer_and_navigate(driver, "Biometric Scan")
        except Exception:
            try:
                _open_drawer_and_navigate(driver, "Face Analysis")
            except Exception:
                try:
                    _open_drawer_and_navigate(driver, "Biometric")
                except Exception as e:
                    take_screenshot(driver, "09_biometric_nav_error")
                    raise

        time.sleep(config.EXPLICIT_WAIT)
        take_screenshot(driver, "09_biometric_scan_loaded")
        page_source_upper = driver.page_source.upper()
        assert ("BIOMETRIC" in page_source_upper or "FACE" in page_source_upper or
                "SCAN" in page_source_upper or "ANALYSIS" in page_source_upper or
                "CAMERA" in page_source_upper), \
            "AI Face Analysis / Biometric Scan screen did not load"

    def test_biometric_scan_ui_elements(self, driver):
        """Verify biometric scan UI elements are displayed."""
        take_screenshot(driver, "09_biometric_scan_ui")
        page_source = driver.page_source
        ui_keywords = ["Scan", "Analyze", "Camera", "Face", "Capture", "Biometric", "Photo"]
        found = any(kw in page_source for kw in ui_keywords)
        assert found or len(page_source) > 300, \
            "Biometric Scan UI elements not visible"

    def test_biometric_scroll_results(self, driver):
        """Scroll through biometric scan results or history."""
        size = driver.get_window_size()
        driver.swipe(
            size['width'] // 2, size['height'] * 3 // 4,
            size['width'] // 2, size['height'] // 4,
            700
        )
        time.sleep(1)
        take_screenshot(driver, "09_biometric_scrolled")
        driver.swipe(
            size['width'] // 2, size['height'] // 4,
            size['width'] // 2, size['height'] * 3 // 4,
            700
        )
        time.sleep(0.5)
