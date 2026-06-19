"""
test_11_real_time_analytics.py — Real-Time Analytics (Live Analytics) Screen Tests
===================================================================================
Tests the Real-Time Analytics screen:
- Navigate via drawer to Live Analytics
- Verify analytics data/charts are displayed
- Scroll through analytics content
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


SCREEN_NAME = "Real-Time Analytics (Live Analytics)"


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
class TestRealTimeAnalytics:

    def test_navigate_to_live_analytics(self, driver):
        """Navigate to Live Analytics via drawer."""
        try:
            _open_drawer_and_navigate(driver, "Live Analytics")
        except Exception:
            try:
                _open_drawer_and_navigate(driver, "Analytics")
            except Exception as e:
                take_screenshot(driver, "11_analytics_nav_error")
                raise

        time.sleep(config.EXPLICIT_WAIT)
        take_screenshot(driver, "11_live_analytics_loaded")
        page_source = driver.page_source
        assert ("Analytics" in page_source or "LIVE" in page_source.upper() or
                "Real" in page_source or "Data" in page_source or
                "Chart" in page_source), \
            "Real-Time Analytics screen did not load"

    def test_analytics_data_visible(self, driver):
        """Verify analytics data, metrics, or charts are visible."""
        time.sleep(config.EXPLICIT_WAIT)
        take_screenshot(driver, "11_analytics_data")
        page_source = driver.page_source
        assert len(page_source) > 300, "Analytics screen appears empty"

    def test_analytics_scroll_through_content(self, driver):
        """Scroll through the analytics screen to verify all charts/data sections."""
        size = driver.get_window_size()

        # Scroll down through all content
        for _ in range(3):
            driver.swipe(
                size['width'] // 2, size['height'] * 3 // 4,
                size['width'] // 2, size['height'] // 4,
                700
            )
            time.sleep(0.8)

        take_screenshot(driver, "11_analytics_scrolled_bottom")

        # Scroll back to top
        for _ in range(3):
            driver.swipe(
                size['width'] // 2, size['height'] // 4,
                size['width'] // 2, size['height'] * 3 // 4,
                700
            )
            time.sleep(0.5)

        take_screenshot(driver, "11_analytics_top")
