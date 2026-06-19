"""
test_02_forgot_password.py — Forgot Password Screen Tests
==========================================================
Tests the Forgot Password screen:
- Tap 'Forgot Password' link on login screen
- Verify forgot password screen opens
- Verify back to login navigation works
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


SCREEN_NAME = "Forgot Password Screen"


def _find_contains_text(driver, text, timeout=config.EXPLICIT_WAIT):
    wait = WebDriverWait(driver, timeout)
    return wait.until(EC.presence_of_element_located(
        (AppiumBy.ANDROID_UIAUTOMATOR, f'new UiSelector().textContains("{text}")')
    ))


@pytest.mark.screen(SCREEN_NAME)
class TestForgotPassword:

    def test_navigate_to_forgot_password(self, driver):
        """Tap Forgot Password link from login screen and verify screen opens."""
        try:
            # We need to be on login screen — log out first if needed
            page_source = driver.page_source
            if "Login" not in page_source and "Username" not in page_source:
                # We are logged in. Let's try to logout cleanly via drawer
                try:
                    # Open navigation drawer
                    try:
                        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Menu").click()
                    except Exception:
                        size = driver.get_window_size()
                        driver.swipe(10, size['height'] // 2, size['width'] // 3, size['height'] // 2, 600)
                    time.sleep(1.5)
                    
                    # Navigate to User Settings or Profile
                    try:
                        _find_contains_text(driver, "User Settings", timeout=6).click()
                    except Exception:
                        _find_contains_text(driver, "Profile", timeout=6).click()
                    time.sleep(config.SCREEN_TRANSITION_WAIT)
                    
                    # Tap Logout button
                    logout_clicked = False
                    for logout_text in ["Terminate Session", "Logout", "Log Out", "Sign Out"]:
                        try:
                            _find_contains_text(driver, logout_text, timeout=5).click()
                            logout_clicked = True
                            time.sleep(config.EXPLICIT_WAIT)
                            break
                        except Exception:
                            continue
                    
                    if not logout_clicked:
                        # Fallback
                        driver.back()
                        time.sleep(1)
                except Exception as e:
                    print(f"Error logging out in forgot password test: {e}")
                
                page_source = driver.page_source

            if "Forgot" in page_source:
                forgot_link = _find_contains_text(driver, "Forgot")
                forgot_link.click()
                time.sleep(config.SCREEN_TRANSITION_WAIT)
                take_screenshot(driver, "02_forgot_password_screen_opened")
                page_source_after = driver.page_source
                assert "Recovery" in page_source_after or "Credential" in page_source_after or \
                       "email" in page_source_after or "Gateway" in page_source_after, \
                    "Forgot Password screen did not open properly"
            else:
                pytest.skip("Forgot Password link not visible — may need to be on login screen first")

        except Exception as e:
            take_screenshot(driver, "02_forgot_password_error")
            raise

    def test_forgot_password_back_to_login(self, driver):
        """Verify back navigation returns to Login screen."""
        try:
            page_source = driver.page_source
            if "Recovery" not in page_source and "Credential" not in page_source:
                pytest.skip("Not on Forgot Password screen")

            # Try to find a Back button or use Android back
            try:
                back_btn = _find_contains_text(driver, "Gateway", timeout=5)
                back_btn.click()
            except Exception:
                try:
                    back_btn = _find_contains_text(driver, "Return", timeout=5)
                    back_btn.click()
                except Exception:
                    driver.back()  # Android hardware/gesture back

            time.sleep(config.SCREEN_TRANSITION_WAIT)
            take_screenshot(driver, "02_back_to_login")

            page_source = driver.page_source
            assert "Login" in page_source or "Username" in page_source or \
                   "PONIS" in page_source, \
                "Back navigation did not return to Login screen"

        except Exception as e:
            take_screenshot(driver, "02_back_to_login_error")
            raise
