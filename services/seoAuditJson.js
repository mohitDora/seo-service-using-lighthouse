const lighthouse = require('lighthouse/core/index.cjs');
const chromeLauncher = require('chrome-launcher');

async function auditSEOJson(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options);
    const report = JSON.parse(runnerResult.report);
    const categories = report.categories;
    const audits = report.audits;

    await chrome.kill();

    const issues = [];

    for (const [key, category] of Object.entries(categories)) {
      category.auditRefs.forEach((ref) => {
        const audit = audits[ref.id];
        if (!audit) return;

        // Show only if score is < 1 (i.e., failed or needs improvement)
        if (audit.score !== 1) {
          issues.push({
            category: category.title,
            id: ref.id,
            title: audit.title,
            score: audit.score,
            displayValue: audit.displayValue || null,
            description: audit.description,
          });
        }
      });
    }

    return {
      url,
      scoreSummary: {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
      },
      issues, // These are the points you can raise with your client
    };
  } catch (err) {
    await chrome.kill();
    throw err;
  }
}

module.exports = { auditSEOJson };
