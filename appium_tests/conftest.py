"""
conftest.py — Pytest Fixtures for Appium Testing
=================================================
This file is automatically loaded by pytest.
Provides the `driver` fixture used by all test files,
and the `results_collector` fixture that accumulates results
for the final Excel report.
"""

import pytest
import time
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.driver_factory import create_driver, quit_driver
from utils.screenshot import take_screenshot_on_failure
from utils.report_generator import generate_excel_report


# ── Global result storage ─────────────────────────────────────────────────────
_test_results = []
_suite_start_time = None


def pytest_sessionstart(session):
    """Called when test session starts — record start time."""
    global _suite_start_time
    _suite_start_time = datetime.now()
    print(f"\n{'='*60}")
    print(f"  🧬 NUTRIXA APPIUM E2E TEST SUITE STARTED")
    print(f"  📅 {_suite_start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


def pytest_sessionfinish(session, exitstatus):
    """Called when all tests finish — generate the Excel report."""
    end_time = datetime.now()
    print(f"\n{'='*60}")
    print(f"  ✅ ALL TESTS COMPLETE — Generating Excel Report...")
    print(f"{'='*60}")

    if _test_results:
        report_path = generate_excel_report(_test_results, _suite_start_time, end_time)
        print(f"\n  📂 Open your report at:\n  {report_path}\n")
    else:
        print("  ⚠️  No test results to report.\n")


# ── Session-scoped driver (shared across all tests for speed) ─────────────────
@pytest.fixture(scope="session")
def driver():
    """
    Creates ONE Appium driver session for the entire test suite.
    This is faster — the app launches once and all 14 test modules run in sequence
    (including security & vulnerability tests).
    """
    drv = create_driver()
    yield drv
    quit_driver(drv)


# ── Results collector fixture ─────────────────────────────────────────────────
@pytest.fixture(scope="function", autouse=True)
def collect_result(request, driver):
    """
    Automatically wraps every test to:
    1. Record start time
    2. Capture pass/fail status
    3. Screenshot on failure
    4. Append result to _test_results list
    """
    # Safety Check: ensure the application is in the foreground
    try:
        import config
        driver.activate_app(config.APP_PACKAGE)
        time.sleep(1)
    except Exception as e:
        print(f"  ⚠️  Failed to activate app in foreground: {e}")

    test_start = time.time()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    yield  # ← test runs here

    duration = time.time() - test_start

    # Determine status
    rep = getattr(request.node, "rep_call", None)
    if rep is None:
        status = "SKIP"
        error = ""
        screenshot = take_screenshot_on_failure(driver, request.node.name)
    elif rep.passed:
        status = "PASS"
        error = ""
        screenshot = ""
    elif rep.failed:
        status = "FAIL"
        error = str(rep.longrepr)[:500] if rep.longrepr else ""
        screenshot = take_screenshot_on_failure(driver, request.node.name)
    else:
        status = "SKIP"
        error = ""
        screenshot = ""

    # Get screen name from test markers (set via @pytest.mark.screen)
    screen_marker = request.node.get_closest_marker("screen")
    screen = screen_marker.args[0] if screen_marker else request.node.name

    _test_results.append({
        "test_id": len(_test_results) + 1,
        "test_name": request.node.name.replace("test_", "").replace("_", " ").title(),
        "screen": screen,
        "status": status,
        "duration": duration,
        "error": error,
        "screenshot": screenshot,
        "timestamp": timestamp,
    })

    icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⏭️"
    print(f"  {icon} [{status}] {request.node.name} ({duration:.2f}s)")


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Capture the test report so conftest can read pass/fail status."""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)
