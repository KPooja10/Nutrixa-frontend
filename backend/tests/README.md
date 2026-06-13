# PONIS E2E Testing Suite (Selenium)

This folder contains the End-to-End (E2E) automated testing suite for the Predictive Oncology Nutrition Intelligence System (PONIS). The suite automates user behavior across key pages, verifies database interactions, and exports a detailed report to an Excel spreadsheet.

## Prerequisites

1. **Google Chrome**: Ensure you have Google Chrome installed on your machine.
2. **Active App Instance**:
   - The **backend** server must be running (normally at `http://localhost:5000`).
   - The **frontend** server must be running (normally at `http://localhost:5173/PONIS-`).

## Installation

Before running the tests for the first time, install the required testing dependencies in the `backend` folder:

```bash
cd backend
npm install
```

This will install:
- `selenium-webdriver`: Browser automation control library.
- `xlsx` (SheetJS): Excel spreadsheet parser and builder.

## Running the E2E Tests

To trigger the automated E2E test suite, run the following npm command inside the `backend` directory:

```bash
npm run test:e2e
```

### Headless Execution
By default, the script executes Chrome in **headless mode** (`--headless`) to ensure high execution speed and run seamlessly without popping up visual windows.

## Outputs & Reports

Once execution completes, a file named **`e2e-test-report.xlsx`** is created or updated inside this `backend/tests/` directory.

### Report Structure:
The generated Excel spreadsheet contains the following columns for clinical auditing:
* **Test ID**: A unique identifier (e.g., `TC-001`).
* **Test Case Name**: Name of the tested feature.
* **Description**: Clinical user action and goal.
* **Status**: `PASS`, `FAIL`, or `SKIPPED`.
* **Duration (ms)**: Exact speed and performance metric of the step.
* **Error Message**: Complete debugging traces for failed checkpoints.
* **Timestamp**: Time of execution.
