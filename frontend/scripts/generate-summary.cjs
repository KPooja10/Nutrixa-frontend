const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const reportPath = path.join(__dirname, '../public/e2e-test-report.xlsx');
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (!fs.existsSync(reportPath)) {
  console.error('Report file not found:', reportPath);
  process.exit(1);
}

if (!summaryPath) {
  console.error('GITHUB_STEP_SUMMARY environment variable not set.');
  process.exit(1);
}

try {
  const workbook = XLSX.readFile(reportPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  let markdown = `### 🧬 E2E Clinical Test Cases Details\n\n`;
  markdown += `| Test ID | Test Case Name | Description | Status | Duration (ms) | Error Message |\n`;
  markdown += `| :--- | :--- | :--- | :---: | :---: | :--- |\n`;

  let passes = 0;
  let fails = 0;
  let skipped = 0;

  data.forEach(row => {
    const id = row['Test ID'] || '';
    const name = row['Test Case Name'] || '';
    const desc = row['Description'] || '';
    const status = row['Status'] || '';
    const duration = row['Duration (ms)'] || '';
    const error = row['Error Message'] || '';

    let statusEmoji = status;
    if (status === 'PASS') {
      statusEmoji = '🟢 PASS';
      passes++;
    } else if (status === 'FAIL') {
      statusEmoji = '🔴 FAIL';
      fails++;
    } else {
      statusEmoji = '🟡 SKIPPED';
      skipped++;
    }

    markdown += `| **${id}** | ${name} | ${desc} | ${statusEmoji} | ${duration} | ${error} |\n`;
  });

  const total = passes + fails + skipped;
  let summaryStats = `## 📊 PONIS E2E Efficacy Tests Summary\n\n`;
  summaryStats += `* **Total Test Cases**: ${total}\n`;
  summaryStats += `* **Passed**: 🟢 ${passes}\n`;
  summaryStats += `* **Failed**: 🔴 ${fails}\n`;
  summaryStats += `* **Skipped**: 🟡 ${skipped}\n\n`;

  fs.writeFileSync(summaryPath, summaryStats + markdown);
  console.log('Successfully wrote step summary to GitHub Actions.');
} catch (error) {
  console.error('Error generating summary:', error);
  process.exit(1);
}
