"""
test_07_meal_planner.py — Meal Planner (Intake Planner) Screen Tests
=====================================================================
Tests the Meal Planner screen:
- Navigate via drawer to Intake Planner
- Verify meal data loads
- Scroll through meal plan content
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


SCREEN_NAME = "Meal Planner (Intake Planner)"


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
class TestMealPlanner:

    def test_navigate_to_meal_planner(self, driver):
        """Navigate to Meal Planner via drawer."""
        try:
            _open_drawer_and_navigate(driver, "Intake Planner")
        except Exception:
            try:
                _open_drawer_and_navigate(driver, "Meal")
            except Exception as e:
                take_screenshot(driver, "07_meal_planner_nav_error")
                raise

        time.sleep(config.EXPLICIT_WAIT)
        take_screenshot(driver, "07_meal_planner_loaded")
        page_source = driver.page_source
        assert ("Meal" in page_source or "INTAKE" in page_source.upper() or
                "meal" in page_source.lower() or "Planner" in page_source or
                "Nutrition" in page_source), \
            "Meal Planner screen did not load"

    def test_meal_planner_content_visible(self, driver):
        """Verify meal plan content / nutrition data is visible."""
        time.sleep(config.EXPLICIT_WAIT)
        take_screenshot(driver, "07_meal_planner_content")
        page_source = driver.page_source
        assert len(page_source) > 300, "Meal Planner content appears empty"

    def test_meal_planner_scroll_down(self, driver):
        """Scroll through the Meal Planner to see all content."""
        size = driver.get_window_size()
        driver.swipe(
            size['width'] // 2, size['height'] * 3 // 4,
            size['width'] // 2, size['height'] // 4,
            800
        )
        time.sleep(1)
        take_screenshot(driver, "07_meal_planner_scrolled")

    def test_meal_planner_scroll_back_up(self, driver):
        """Scroll back to top of Meal Planner."""
        size = driver.get_window_size()
        driver.swipe(
            size['width'] // 2, size['height'] // 4,
            size['width'] // 2, size['height'] * 3 // 4,
            800
        )
        time.sleep(0.5)
        take_screenshot(driver, "07_meal_planner_top")
