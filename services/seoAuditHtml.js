const lighthouse = require('lighthouse/core/index.cjs');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function auditSEOHtml(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options);
    const reportHtml = runnerResult.report;

    const timestamp = Date.now();
    const filePath = path.resolve(__dirname, `report-${timestamp}.html`);
    fs.writeFileSync(filePath, reportHtml);

    await chrome.kill();

    return {
      url,
      reportPath: filePath,
      message: 'Lighthouse HTML report generated successfully.'
    };
  } catch (err) {
    await chrome.kill();
    throw err;
  }
}

module.exports = { auditSEOHtml };
