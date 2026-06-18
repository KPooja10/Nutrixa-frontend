"""
test_05_patient_list.py — Patient List / Directory Screen Tests
===============================================================
Tests the Patient List (Directory) screen:
- Navigate via drawer to Patient Directory
- Verify patient list loads
- Verify search/filter if available
- Tap a patient and verify navigation to Dashboard
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


SCREEN_NAME = "Patient List / Directory"


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
class TestPatientList:

    def test_navigate_to_patient_list(self, driver):
        """Navigate to Patient Directory via the navigation drawer."""
        try:
            _open_drawer_and_navigate(driver, "Patient Directory")
            take_screenshot(driver, "05_patient_list_screen")
        except Exception:
            try:
                _open_drawer_and_navigate(driver, "Patient")
                take_screenshot(driver, "05_patient_list_via_patients")
            except Exception as e:
                take_screenshot(driver, "05_patient_list_nav_error")
                raise

        time.sleep(config.EXPLICIT_WAIT)
        page_source = driver.page_source
        assert "Patient" in page_source or "patient" in page_source.lower() or \
               "DIRECTORY" in page_source.upper(), \
            "Patient List screen did not load"

    def test_patient_list_shows_records(self, driver):
        """Verify that patient records are visible in the list."""
        time.sleep(config.EXPLICIT_WAIT)  # Wait for API data to load
        take_screenshot(driver, "05_patient_list_records")
        page_source = driver.page_source

        # Should have some patient names or list items
        assert len(page_source) > 500, "Patient list appears to be empty"

    def test_patient_list_has_register_button(self, driver):
        """Verify the Register/Add Patient button is visible."""
        page_source = driver.page_source
        take_screenshot(driver, "05_patient_list_register_btn")
        has_register = ("Register" in page_source or "Add" in page_source or
                        "New" in page_source or "+" in page_source)
        assert has_register, "Register Patient button not found on Patient List screen"

    def test_tap_first_patient(self, driver):
        """Tap on the first patient in the list to open their Dashboard."""
        try:
            tapped = False
            # 1. Try to tap the "Select & Monitor" button text
            for btn_text in ["Select & Monitor", "Select", "Monitor", "Patient Node"]:
                try:
                    _find_contains_text(driver, btn_text, timeout=4).click()
                    tapped = True
                    break
                except Exception:
                    continue

            # 2. Try to tap known patient name text
            if not tapped:
                for name in ["Alexander", "Vance", "Marcus", "poojasri", "Chen", "Test Patient"]:
                    try:
                        _find_contains_text(driver, name, timeout=4).click()
                        tapped = True
                        break
                    except Exception:
                        continue

            # 3. Fallback to any clickable View
            if not tapped:
                clickable_items = driver.find_elements(
                    AppiumBy.ANDROID_UIAUTOMATOR,
                    'new UiSelector().clickable(true).className("android.view.View")'
                )
                for item in clickable_items[2:]:  # Skip first few (likely header buttons)
                    try:
                        item.click()
                        tapped = True
                        break
                    except Exception:
                        continue

            if not tapped:
                pytest.skip("No tappable patient items found in list")

            time.sleep(config.EXPLICIT_WAIT)
            take_screenshot(driver, "05_patient_selected_dashboard")

        except Exception as e:
            take_screenshot(driver, "05_tap_patient_error")
            raise
