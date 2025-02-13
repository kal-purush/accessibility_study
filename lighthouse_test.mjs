import fs from 'fs';
import { launch } from 'puppeteer';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import lighthouse from 'lighthouse';

const BASE_URL = "http://localhost:8080/generated_html_pages/"; // Local server URL
const outputDir = "lighthouse_reports";
fs.mkdirSync(outputDir, { recursive: true });

// List of test pages
const testPages = [
    "area-alt_missing.html",
    "area-alt_empty.html",
    "area-alt_diff_lang.html"
];

(async () => {
    const browser = await launch({ headless: true });
    const port = new URL(browser.wsEndpoint()).port;

    for (let page of testPages) {
        const url = `${BASE_URL}${page}`;
        console.log(`Running Lighthouse on: ${url}`);

        const { lhr } = await lighthouse(url, {
            onlyCategories: ['accessibility'],
            output: 'html',
            port: port
        });

        const reportPath = `${outputDir}/${page.replace(".html", ".report.html")}`;
        await writeFile(reportPath, lhr.report);
        console.log(`Report saved: ${reportPath}`);
    }

    await browser.close();
    console.log("✅ All Lighthouse tests completed!");
})();
