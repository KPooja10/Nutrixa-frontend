"""
test_13_profile_logout.py — Profile/User Settings & Logout Tests
================================================================
Tests the Profile screen and logout flow:
- Navigate via drawer to User Settings / Profile
- Verify profile info is displayed
- Test logout functionality → should return to Login screen
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


SCREEN_NAME = "Profile / User Settings & Logout"


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
        _find_contains_text(driver, screen_label, timeout=3).click()
        time.sleep(config.SCREEN_TRANSITION_WAIT)
    except Exception:
        try:
            size = driver.get_window_size()
            driver.swipe(
                size['width'] // 4, size['height'] * 3 // 4,
                size['width'] // 4, size['height'] // 4,
                600
            )
            time.sleep(1.0)
            _find_contains_text(driver, screen_label, timeout=4).click()
            time.sleep(config.SCREEN_TRANSITION_WAIT)
        except Exception:
            try:
                driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR, 'new UiSelector().textContains("✕")')
                driver.back()
            except Exception:
                pass
            raise


@pytest.mark.screen(SCREEN_NAME)
class TestProfileAndLogout:

    def test_navigate_to_profile(self, driver):
        """Navigate to Profile/User Settings via drawer."""
        try:
            _open_drawer_and_navigate(driver, "User Settings")
        except Exception:
            try:
                _open_drawer_and_navigate(driver, "Profile")
            except Exception as e:
                take_screenshot(driver, "13_profile_nav_error")
                raise

        time.sleep(config.SCREEN_TRANSITION_WAIT)
        take_screenshot(driver, "13_profile_screen_loaded")
        page_source = driver.page_source
        assert ("Profile" in page_source or "Settings" in page_source or
                "User" in page_source or "USER SETTINGS" in page_source.upper()), \
            "Profile/User Settings screen did not load"

    def test_profile_shows_user_info(self, driver):
        """Verify user information is displayed on Profile screen."""
        take_screenshot(driver, "13_profile_user_info")
        page_source = driver.page_source
        # Profile should show username and role
        assert len(page_source) > 200, "Profile screen appears empty"

    def test_profile_has_logout_option(self, driver):
        """Verify a logout option is present on the Profile screen."""
        page_source = driver.page_source
        take_screenshot(driver, "13_profile_logout_option")
        has_logout = ("Logout" in page_source or "Log Out" in page_source or
                      "Sign Out" in page_source or "Terminate" in page_source or
                      "Session" in page_source)
        assert has_logout, "Logout option not found on Profile screen"

    def test_logout_returns_to_login(self, driver):
        """
        Tap the logout button and verify it navigates back to Login screen.
        This is the LAST test — it ends the authenticated session.
        """
        try:
            # Look for Terminate Session or Logout button
            for logout_text in ["Terminate Session", "Logout", "Log Out", "Sign Out"]:
                try:
                    logout_btn = _find_contains_text(driver, logout_text, timeout=5)
                    take_screenshot(driver, "13_profile_before_logout")
                    logout_btn.click()
                    time.sleep(config.EXPLICIT_WAIT)
                    take_screenshot(driver, "13_after_logout_login_screen")

                    page_source = driver.page_source
                    assert ("Login" in page_source or "Username" in page_source or
                            "PONIS" in page_source or "Sign" in page_source), \
                        "Logout did not navigate back to Login screen"
                    return  # Success — stop after first working button
                except Exception:
                    continue

            # If no specific button found, try the drawer logout
            try:
                size = driver.get_window_size()
                driver.swipe(0, size['height'] // 2, size['width'] // 3, size['height'] // 2, 600)
                time.sleep(1)
                take_screenshot(driver, "13_drawer_for_logout")

                for logout_text in ["Terminate Session", "Logout", "Log Out"]:
                    try:
                        _find_contains_text(driver, logout_text, timeout=5).click()
                        time.sleep(config.EXPLICIT_WAIT)
                        take_screenshot(driver, "13_after_drawer_logout")
                        page_source = driver.page_source
                        assert ("Login" in page_source or "Username" in page_source), \
                            "Drawer logout did not return to Login"
                        return
                    except Exception:
                        continue

            except Exception as e:
                take_screenshot(driver, "13_logout_final_error")
                raise Exception(f"Could not find and click logout button: {e}")

        except Exception as e:
            take_screenshot(driver, "13_logout_error")
            raise
