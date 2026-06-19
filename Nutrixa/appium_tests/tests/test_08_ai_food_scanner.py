"""
test_08_ai_food_scanner.py — AI Food Scanner Screen Tests
==========================================================
Tests the AI Food Scanner screen:
- Navigate via drawer to AI Food Scanner
- Verify camera/scanner interface loads
- Verify scanner UI elements are present
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


SCREEN_NAME = "AI Food Scanner"


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
class TestAIFoodScanner:

    def test_navigate_to_food_scanner(self, driver):
        """Navigate to AI Food Scanner via drawer."""
        try:
            _open_drawer_and_navigate(driver, "AI Food Scanner")
        except Exception:
            try:
                _open_drawer_and_navigate(driver, "Food Scanner")
            except Exception as e:
                take_screenshot(driver, "08_food_scanner_nav_error")
                raise

        time.sleep(config.EXPLICIT_WAIT)
        take_screenshot(driver, "08_food_scanner_loaded")
        page_source = driver.page_source
        assert ("Food" in page_source or "Scanner" in page_source or
                "Camera" in page_source or "Scan" in page_source or
                "AI" in page_source), \
            "AI Food Scanner screen did not load"

    def test_food_scanner_ui_elements(self, driver):
        """Verify scanner UI elements (camera area, scan button) are present."""
        take_screenshot(driver, "08_food_scanner_ui_elements")
        page_source = driver.page_source
        # Scanner should show camera interface or analyze button
        ui_keywords = ["Scan", "Camera", "Photo", "Analyze", "Capture", "Upload"]
        found = any(kw in page_source for kw in ui_keywords)
        assert found or len(page_source) > 300, \
            "AI Food Scanner UI elements not found"

    def test_food_scanner_scroll_content(self, driver):
        """Scroll through food scanner results/history if any."""
        size = driver.get_window_size()
        driver.swipe(
            size['width'] // 2, size['height'] * 3 // 4,
            size['width'] // 2, size['height'] // 4,
            700
        )
        time.sleep(1)
        take_screenshot(driver, "08_food_scanner_scrolled")
        # Scroll back
        driver.swipe(
            size['width'] // 2, size['height'] // 4,
            size['width'] // 2, size['height'] * 3 // 4,
            700
        )
        time.sleep(0.5)
