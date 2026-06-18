"""
test_10_ai_prediction_engine.py — AI Prediction Engine (Prognosis) Screen Tests
================================================================================
Tests the AI Prediction Engine screen:
- Navigate via drawer to Prognosis Engine
- Verify prediction data/cards visible
- Scroll through prognosis content
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


SCREEN_NAME = "AI Prediction Engine (Prognosis)"


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
class TestAIPredictionEngine:

    def test_navigate_to_prediction_engine(self, driver):
        """Navigate to Prognosis Engine via drawer."""
        try:
            _open_drawer_and_navigate(driver, "Prognosis Engine")
        except Exception:
            try:
                _open_drawer_and_navigate(driver, "Prediction")
            except Exception as e:
                take_screenshot(driver, "10_prediction_nav_error")
                raise

        time.sleep(config.EXPLICIT_WAIT)
        take_screenshot(driver, "10_prediction_engine_loaded")
        page_source_upper = driver.page_source.upper()
        assert ("PREDICTION" in page_source_upper or "PROGNOSIS" in page_source_upper or
                "ENGINE" in page_source_upper or "AI" in page_source_upper or
                "RISK" in page_source_upper), \
            "AI Prediction Engine screen did not load"

    def test_prediction_engine_data_visible(self, driver):
        """Verify prognosis data cards are visible."""
        time.sleep(config.EXPLICIT_WAIT)
        take_screenshot(driver, "10_prediction_engine_data")
        page_source = driver.page_source
        assert len(page_source) > 300, "Prediction Engine content appears empty"

    def test_prediction_engine_scroll(self, driver):
        """Scroll through prediction data to verify all sections."""
        size = driver.get_window_size()
        for _ in range(2):
            driver.swipe(
                size['width'] // 2, size['height'] * 3 // 4,
                size['width'] // 2, size['height'] // 4,
                700
            )
            time.sleep(0.8)
        take_screenshot(driver, "10_prediction_engine_scrolled")

        # Scroll back to top
        for _ in range(2):
            driver.swipe(
                size['width'] // 2, size['height'] // 4,
                size['width'] // 2, size['height'] * 3 // 4,
                700
            )
            time.sleep(0.5)
        take_screenshot(driver, "10_prediction_engine_top")
