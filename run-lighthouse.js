import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '../data/bd.csv');
const htmlDir = path.join(__dirname, 'bd');
const reportDir = path.join(__dirname, 'reports');

if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

function sanitizeFilename(url) {
  return url.replace(/[^a-zA-Z0-9_-]/g, '_') + '_full.html';
}

// Start local server in background
console.log('🚀 Starting local HTTP server...');
const serverProcess = exec('npx http-server ' + htmlDir + ' -p 8080 -s');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runLighthouse(url) {
  const htmlFileName = sanitizeFilename(url);
  const localUrl = `http://localhost:8080/${htmlFileName}`;
  const safeName = url.replace(/[^a-zA-Z0-9_-]/g, '_');
  const outputPath = path.join(reportDir, `${safeName}.report.json`);
  const cmd = `lighthouse ${localUrl} --config-path=custom-config.js --output json --output-path="${outputPath}" --output html --chrome-flags="--headless"`;

  console.log(`📍 Auditing ${localUrl}`);
  return execAsync(cmd).catch(err => {
    console.error(`❌ Failed to audit ${url}: ${err.message}`);
  });
}

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

setTimeout(() => {
  const urls = [];

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      if (row.url) urls.push(row.url);
    })
    .on('end', async () => {
      console.log(`✅ Loaded ${urls.length} URLs.`);
      const batches = chunkArray(urls, 10);

      for (const batch of batches) {
        await Promise.all(batch.map(url => runLighthouse(url)));
      }

      console.log('🏁 All audits completed.');
      process.kill(-serverProcess.pid); // kill HTTP server
      process.exit(0);
    });
}, 2000); // wait for server to start
