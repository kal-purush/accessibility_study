import fs from 'fs';
import { launch } from 'puppeteer';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import lighthouse from 'lighthouse';

const testPages = [
    "generated_html_pages/area-alt_missing.html",
    "generated_html_pages/area-alt_empty.html",
    "generated_html_pages/area-alt_diff_lang.html"
];

const outputDir = "lighthouse_reports";
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
    const browser = await launch({ headless: true });
    const port = new URL(browser.wsEndpoint()).port;

    for (let page of testPages) {
        const url = "file://" + resolve(page);
        console.log(`Running Lighthouse on: ${url}`);

        const { lhr } = await lighthouse(url, {
            onlyCategories: ['accessibility'],
            output: 'html',
            port: port
        });

        const reportPath = `${outputDir}/${page.replace("generated_html_pages/", "").replace(".html", ".report.html")}`;
        await writeFile(reportPath, lhr.report);
        console.log(`Report saved: ${reportPath}`);
    }

    await browser.close();
    console.log("✅ All Lighthouse tests completed!");
})();
