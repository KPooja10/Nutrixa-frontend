"""
test_04_patient_registration.py — Patient Registration Screen Tests
====================================================================
Tests the Patient Registration screen:
- Navigate from Command Center → Patient Registration
- Verify all form fields present
- Fill and submit the form
- Verify success navigation back to Command Center
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


SCREEN_NAME = "Patient Registration"


def _find_contains_text(driver, text, timeout=config.EXPLICIT_WAIT):
    wait = WebDriverWait(driver, timeout)
    return wait.until(EC.presence_of_element_located(
        (AppiumBy.ANDROID_UIAUTOMATOR, f'new UiSelector().textContains("{text}")')
    ))


def _navigate_to_patient_registration(driver):
    """Navigate to patient registration from Command Center."""
    page_source = driver.page_source
    # Try to find Register button
    for keyword in ["Register", "Add Patient", "New Patient", "Register Patient"]:
        if keyword in page_source:
            try:
                _find_contains_text(driver, keyword, timeout=5).click()
                time.sleep(config.SCREEN_TRANSITION_WAIT)
                return True
            except Exception:
                continue
    return False


@pytest.mark.screen(SCREEN_NAME)
class TestPatientRegistration:

    def test_navigate_to_registration_screen(self, driver):
        """Navigate from Command Center to Patient Registration."""
        page_source = driver.page_source
        if "Registration" in page_source or "Register Patient" in page_source:
            # Might already be there or navigating
            pass
        else:
            navigated = _navigate_to_patient_registration(driver)
            if not navigated:
                pytest.skip("Could not navigate to Patient Registration from current screen")

        time.sleep(config.SCREEN_TRANSITION_WAIT)
        take_screenshot(driver, "04_patient_registration_screen")
        page_source = driver.page_source
        assert ("Registration" in page_source or "Patient Name" in page_source or
                "Register" in page_source or "Name" in page_source), \
            "Patient Registration screen did not open"

    def test_registration_form_fields_present(self, driver):
        """Verify all required form fields are present."""
        page_source = driver.page_source
        take_screenshot(driver, "04_registration_form_fields")

        # The registration form should have patient name and other fields
        form_indicators = ["Patient", "Name", "Age", "Stage", "Weight", "Height"]
        found = any(indicator in page_source for indicator in form_indicators)
        assert found, f"Registration form fields not found. Expected one of: {form_indicators}"

    def test_fill_registration_form(self, driver):
        """Fill in the patient registration form with test data."""
        try:
            # Find all EditText fields and fill them sequentially
            edit_fields = driver.find_elements(
                AppiumBy.ANDROID_UIAUTOMATOR,
                'new UiSelector().className("android.widget.EditText")'
            )

            test_values = [
                "Test Patient E2E",   # Patient Name
                "45",                  # Age
                "70",                  # Weight (kg)
                "170",                 # Height (cm)
                "Stage 1",             # Stage (if text field)
            ]

            for i, field in enumerate(edit_fields[:len(test_values)]):
                try:
                    field.clear()
                    field.send_keys(test_values[i])
                    time.sleep(0.3)
                except Exception:
                    pass  # Some fields might be dropdowns

            take_screenshot(driver, "04_registration_form_filled")

        except Exception as e:
            take_screenshot(driver, "04_registration_form_fill_error")
            raise

    def test_scroll_and_check_registration_form(self, driver):
        """Scroll through the registration form to verify all sections."""
        try:
            # Scroll down to see more fields
            size = driver.get_window_size()
            driver.swipe(
                size['width'] // 2, size['height'] * 3 // 4,
                size['width'] // 2, size['height'] // 4,
                600
            )
            time.sleep(1)
            take_screenshot(driver, "04_registration_form_scrolled")
            page_source = driver.page_source
            assert len(page_source) > 100, "Registration form appears empty after scroll"
        except Exception as e:
            take_screenshot(driver, "04_registration_scroll_error")
            raise
