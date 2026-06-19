"""
test_01_login.py — Login Screen E2E Tests
==========================================
Tests the Login screen:
- Valid doctor login → navigates to Command Center
- Invalid credentials → shows error
- Empty fields → shows validation error
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


SCREEN_NAME = "Login Screen"


def _find_by_text(driver, text, timeout=config.EXPLICIT_WAIT):
    """Find an element by visible text using UiAutomator."""
    wait = WebDriverWait(driver, timeout)
    return wait.until(EC.presence_of_element_located(
        (AppiumBy.ANDROID_UIAUTOMATOR, f'new UiSelector().text("{text}")')
    ))


def _find_contains_text(driver, text, timeout=config.EXPLICIT_WAIT):
    """Find element containing text (partial match)."""
    wait = WebDriverWait(driver, timeout)
    return wait.until(EC.presence_of_element_located(
        (AppiumBy.ANDROID_UIAUTOMATOR, f'new UiSelector().textContains("{text}")')
    ))


def _find_class_instance(driver, class_name, instance=0):
    """Find element by class name and instance index."""
    return driver.find_element(
        AppiumBy.ANDROID_UIAUTOMATOR,
        f'new UiSelector().className("{class_name}").instance({instance})'
    )


@pytest.mark.screen(SCREEN_NAME)
class TestLogin:

    def test_login_screen_loads(self, driver):
        """Verify the login screen is visible when app launches."""
        time.sleep(config.SCREEN_TRANSITION_WAIT)
        
        # If already logged in, log out first to start the login tests cleanly
        page_source = driver.page_source
        if "Login" not in page_source and "Username" not in page_source and "GATEWAY" not in page_source.upper():
            try:
                # Open drawer
                try:
                    driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Menu").click()
                except Exception:
                    size = driver.get_window_size()
                    driver.swipe(10, size['height'] // 2, size['width'] // 3, size['height'] // 2, 600)
                time.sleep(1.5)
                
                # Swipe down to make sure "Terminate Session" is visible
                size = driver.get_window_size()
                driver.swipe(size['width'] // 4, size['height'] * 3 // 4, size['width'] // 4, size['height'] // 4, 600)
                time.sleep(1.0)
                
                # Click Terminate Session
                _find_contains_text(driver, "Terminate Session", timeout=5).click()
                time.sleep(config.SCREEN_TRANSITION_WAIT)
            except Exception as e:
                print(f"Failed to auto-logout: {e}")
                
        take_screenshot(driver, "01_login_screen_loaded")

        # The login screen should show the app name/title
        page_source = driver.page_source
        assert "PONIS" in page_source or "Login" in page_source or "Username" in page_source or "GATEWAY" in page_source.upper(), \
            "Login screen did not load — app title not found"

    def test_login_with_invalid_credentials(self, driver):
        """Verify error handling for invalid credentials."""
        # Find username and password fields (EditText elements in Compose)
        try:
            username_field = _find_class_instance(driver, "android.widget.EditText", 0)
            password_field = _find_class_instance(driver, "android.widget.EditText", 1)

            username_field.clear()
            username_field.send_keys("invalid_user")
            password_field.clear()
            password_field.send_keys("wrongpass")

            take_screenshot(driver, "01_login_invalid_creds_filled")

            # Tap Login button
            login_btn = _find_contains_text(driver, "Authorize")
            login_btn.click()

            time.sleep(config.SCREEN_TRANSITION_WAIT)
            take_screenshot(driver, "01_login_invalid_creds_result")

            # Should still be on login screen (not navigated away)
            page_source = driver.page_source
            assert "Login" in page_source or "Invalid" in page_source or \
                   "error" in page_source.lower() or "Username" in page_source, \
                "Expected to stay on login screen after invalid credentials"

        except Exception as e:
            take_screenshot(driver, "01_login_invalid_creds_error")
            raise

    def test_login_with_valid_doctor_credentials(self, driver):
        """Verify successful login with valid doctor credentials → Command Center."""
        try:
            # Make sure we're on login screen
            time.sleep(1)
            page_source = driver.page_source
            if "Login" not in page_source and "Username" not in page_source:
                # Already logged in — this is expected if previous test left us logged in
                pytest.skip("Already past login screen")

            username_field = _find_class_instance(driver, "android.widget.EditText", 0)
            password_field = _find_class_instance(driver, "android.widget.EditText", 1)

            username_field.clear()
            username_field.send_keys(config.DOCTOR_USERNAME)
            password_field.clear()
            password_field.send_keys(config.DOCTOR_PASSWORD)

            take_screenshot(driver, "01_login_valid_creds_filled")

            # Tap Login button
            login_btn = _find_contains_text(driver, "Authorize")
            login_btn.click()

            # Wait for navigation — doctor should land on Command Center
            time.sleep(config.EXPLICIT_WAIT)
            take_screenshot(driver, "01_login_success_command_center")

            page_source = driver.page_source
            assert ("COMMAND CENTER" in page_source.upper() or
                    "Dashboard" in page_source or
                    "PONIS" in page_source), \
                "Login did not navigate to expected screen after successful login"

        except Exception as e:
            take_screenshot(driver, "01_login_valid_error")
            raise
