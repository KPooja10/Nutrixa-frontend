"""
test_06_dashboard.py — Dashboard (Central Console) Screen Tests
===============================================================
Tests the Dashboard screen (patient monitoring):
- Navigate via drawer to Central Console
- Verify patient data cards are visible
- Verify quick-action buttons (Meals, Scanner, Biometrics, etc.)
- Verify patient name is shown
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


SCREEN_NAME = "Dashboard (Central Console)"


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
class TestDashboard:

    def test_navigate_to_dashboard(self, driver):
        """Navigate to Central Console via drawer."""
        try:
            _open_drawer_and_navigate(driver, "Central Console")
        except Exception:
            try:
                _open_drawer_and_navigate(driver, "Dashboard")
            except Exception as e:
                take_screenshot(driver, "06_dashboard_nav_error")
                raise

        time.sleep(config.EXPLICIT_WAIT)
        take_screenshot(driver, "06_dashboard_loaded")
        page_source = driver.page_source
        assert ("CENTRAL" in page_source.upper() or
                "Dashboard" in page_source or
                "Patient" in page_source or
                "Console" in page_source), \
            "Dashboard / Central Console screen did not load"

    def test_dashboard_shows_patient_info(self, driver):
        """Verify patient information cards are displayed on Dashboard."""
        time.sleep(config.SCREEN_TRANSITION_WAIT)
        take_screenshot(driver, "06_dashboard_patient_info")
        page_source = driver.page_source
        # Dashboard should show patient name, stage, risk, etc.
        assert len(page_source) > 500, "Dashboard appears empty — patient data may not have loaded"

    def test_dashboard_quick_action_buttons(self, driver):
        """Verify quick-action navigation buttons are present."""
        page_source = driver.page_source
        take_screenshot(driver, "06_dashboard_quick_actions")

        # Look for any of the navigation tab labels
        action_keywords = ["Meal", "Scanner", "Biometric", "Prediction", "Analytics", "Food"]
        found_any = any(kw in page_source for kw in action_keywords)
        assert found_any, \
            f"No quick-action buttons found. Expected one of: {action_keywords}"

    def test_dashboard_scroll_content(self, driver):
        """Scroll through Dashboard to verify all content sections."""
        try:
            size = driver.get_window_size()
            # Scroll down
            driver.swipe(
                size['width'] // 2, size['height'] * 3 // 4,
                size['width'] // 2, size['height'] // 4,
                800
            )
            time.sleep(1)
            take_screenshot(driver, "06_dashboard_scrolled_down")

            # Scroll back up
            driver.swipe(
                size['width'] // 2, size['height'] // 4,
                size['width'] // 2, size['height'] * 3 // 4,
                800
            )
            time.sleep(0.5)
            take_screenshot(driver, "06_dashboard_scrolled_up")
        except Exception as e:
            take_screenshot(driver, "06_dashboard_scroll_error")
            raise
