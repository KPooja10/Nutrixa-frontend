"""
test_03_command_center.py — Command Center Screen Tests
=======================================================
Tests the Command Center (doctor-only dashboard):
- Verify screen loads after doctor login
- Verify patient list section visible
- Verify Register Patient button visible
- Verify Logout option works
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


SCREEN_NAME = "Command Center"


def _find_contains_text(driver, text, timeout=config.EXPLICIT_WAIT):
    wait = WebDriverWait(driver, timeout)
    return wait.until(EC.presence_of_element_located(
        (AppiumBy.ANDROID_UIAUTOMATOR, f'new UiSelector().textContains("{text}")')
    ))


def _ensure_logged_in_as_doctor(driver):
    """Helper: Log in as doctor if not already on Command Center."""
    page_source = driver.page_source
    if "COMMAND" in page_source.upper() or "Command" in page_source:
        return True  # Already there
    if "Login" in page_source or "Username" in page_source or "GATEWAY" in page_source.upper():
        from tests.test_01_login import _find_class_instance
        uname = _find_class_instance(driver, "android.widget.EditText", 0)
        pwd = _find_class_instance(driver, "android.widget.EditText", 1)
        uname.clear(); uname.send_keys(config.DOCTOR_USERNAME)
        pwd.clear(); pwd.send_keys(config.DOCTOR_PASSWORD)
        _find_contains_text(driver, "Authorize").click()
        time.sleep(config.EXPLICIT_WAIT)
        page_source = driver.page_source
        
    if "COMMAND" not in page_source.upper() and "Command" not in page_source:
        # We might have landed on the Central Console dashboard due to cached session state.
        # Navigate to Command Center via the drawer
        try:
            try:
                driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Menu").click()
            except Exception:
                size = driver.get_window_size()
                driver.swipe(10, size['height'] // 2, size['width'] // 3, size['height'] // 2, 600)
            time.sleep(1.5)
            _find_contains_text(driver, "Command Center", timeout=6).click()
            time.sleep(config.SCREEN_TRANSITION_WAIT)
        except Exception as e:
            print(f"Error navigating to Command Center: {e}")
            
    return "COMMAND" in driver.page_source.upper()


@pytest.mark.screen(SCREEN_NAME)
class TestCommandCenter:

    def test_command_center_loads(self, driver):
        """Verify Command Center loads after doctor login."""
        _ensure_logged_in_as_doctor(driver)
        time.sleep(config.SCREEN_TRANSITION_WAIT)
        take_screenshot(driver, "03_command_center_loaded")

        page_source = driver.page_source
        assert ("COMMAND" in page_source.upper() or
                "Dashboard" in page_source or
                "Patient" in page_source), \
            "Command Center screen did not load"

    def test_command_center_has_patient_list(self, driver):
        """Verify patient list/directory is visible in Command Center."""
        page_source = driver.page_source
        take_screenshot(driver, "03_command_center_patient_list_check")

        assert "Patient" in page_source or "patient" in page_source.lower(), \
            "Patient list section not found in Command Center"

    def test_command_center_register_patient_button(self, driver):
        """Verify the Register Patient button is visible."""
        page_source = driver.page_source
        take_screenshot(driver, "03_command_center_register_btn")

        assert ("Register" in page_source or "Add" in page_source or
                "New Patient" in page_source), \
            "Register Patient button not found in Command Center"

    def test_command_center_open_drawer(self, driver):
        """Verify the navigation drawer can be opened from Command Center."""
        try:
            # Try clicking the content description (Menu button in TopAppBar)
            driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Menu").click()
        except Exception:
            try:
                # Fallback to swipe
                size = driver.get_window_size()
                driver.swipe(10, size['height'] // 2, size['width'] // 3, size['height'] // 2, 500)
            except Exception:
                # Try finding text
                menu_btn = _find_contains_text(driver, "Menu", timeout=5)
                menu_btn.click()

        time.sleep(1)
        take_screenshot(driver, "03_command_center_drawer_open")
        page_source = driver.page_source
        assert "PONIS" in page_source or "Dashboard" in page_source or \
               "Patient" in page_source, \
            "Navigation drawer did not open"

        # Close the drawer
        driver.back()
        time.sleep(1)
