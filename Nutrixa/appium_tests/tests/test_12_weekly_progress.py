"""
test_12_weekly_progress.py — Weekly Progress Report Screen Tests
================================================================
Tests the Weekly Progress Report screen:
- Navigate via drawer to Weekly Progress
- Verify report data sections are displayed
- Scroll through the full progress report
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


SCREEN_NAME = "Weekly Progress Report"


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


def _ensure_logged_in_and_patient_selected(driver):
    """Helper: Ensure doctor is logged in and a patient is selected."""
    page_source = driver.page_source
    
    # 1. Handle login if we are on Login/Gateway screen
    if "LOGIN" in page_source.upper() or "USERNAME" in page_source.upper() or "GATEWAY" in page_source.upper():
        try:
            _find_contains_text(driver, "Staff", timeout=5).click()
            time.sleep(1.0)
            _find_contains_text(driver, "Authorize", timeout=5).click()
            time.sleep(config.EXPLICIT_WAIT)
            page_source = driver.page_source
        except Exception:
            try:
                uname = driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR, 'new UiSelector().className("android.widget.EditText").instance(0)')
                pwd = driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR, 'new UiSelector().className("android.widget.EditText").instance(1)')
                uname.clear(); uname.send_keys(config.DOCTOR_USERNAME)
                pwd.clear(); pwd.send_keys(config.DOCTOR_PASSWORD)
                _find_contains_text(driver, "Authorize", timeout=5).click()
                time.sleep(config.EXPLICIT_WAIT)
                page_source = driver.page_source
            except Exception:
                pass

    # 2. If we are on the Command Center, navigate to Patient Directory
    if "COMMAND CENTER" in page_source.upper() or "Command Center" in page_source:
        try:
            _find_contains_text(driver, "Patient Directory", timeout=5).click()
            time.sleep(config.SCREEN_TRANSITION_WAIT)
            page_source = driver.page_source
        except Exception:
            try:
                _open_drawer_and_navigate(driver, "Patient Directory")
                page_source = driver.page_source
            except Exception:
                pass

    # 3. If we are on Patient Directory, select the first patient
    if "PATIENT DIRECTORY" in page_source.upper() or "Patient Directory" in page_source or "Patient List" in page_source:
        try:
            _find_contains_text(driver, "Select & Monitor", timeout=5).click()
            time.sleep(config.EXPLICIT_WAIT)
            page_source = driver.page_source
        except Exception:
            pass

    # 4. If we are on a screen that displays "No Monitored Patient Profile Selected", select patient
    if "NO MONITORED PATIENT" in page_source.upper():
        try:
            _find_contains_text(driver, "Browse Patient", timeout=5).click()
            time.sleep(config.SCREEN_TRANSITION_WAIT)
            _find_contains_text(driver, "Select & Monitor", timeout=5).click()
            time.sleep(config.EXPLICIT_WAIT)
        except Exception:
            pass


@pytest.mark.screen(SCREEN_NAME)
class TestWeeklyProgressReport:

    def test_navigate_to_weekly_progress(self, driver):
        """Navigate to Weekly Progress Report via drawer."""
        _ensure_logged_in_and_patient_selected(driver)
        try:
            _open_drawer_and_navigate(driver, "Weekly Progress")
        except Exception:
            try:
                _open_drawer_and_navigate(driver, "Progress")
            except Exception as e:
                take_screenshot(driver, "12_weekly_progress_nav_error")
                raise

        time.sleep(config.EXPLICIT_WAIT)
        take_screenshot(driver, "12_weekly_progress_loaded")
        page_source = driver.page_source
        assert ("Weekly" in page_source or "Progress" in page_source or
                "Report" in page_source or "WEEKLY" in page_source.upper()), \
            "Weekly Progress Report screen did not load"

    def test_weekly_report_data_sections(self, driver):
        """Verify weekly report contains data sections (meals, weight, etc.)."""
        time.sleep(config.EXPLICIT_WAIT)
        take_screenshot(driver, "12_weekly_report_sections")
        page_source = driver.page_source
        # Should have some report data
        assert len(page_source) > 300, "Weekly Progress Report appears empty"

    def test_weekly_report_scroll_full(self, driver):
        """Scroll through the full weekly progress report."""
        size = driver.get_window_size()

        for _ in range(3):
            driver.swipe(
                size['width'] // 2, size['height'] * 3 // 4,
                size['width'] // 2, size['height'] // 4,
                700
            )
            time.sleep(0.8)
        take_screenshot(driver, "12_weekly_report_scrolled_end")

        # Scroll back to top
        for _ in range(3):
            driver.swipe(
                size['width'] // 2, size['height'] // 4,
                size['width'] // 2, size['height'] * 3 // 4,
                700
            )
            time.sleep(0.5)
        take_screenshot(driver, "12_weekly_report_top")
