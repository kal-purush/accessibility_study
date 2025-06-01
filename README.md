<p align="center">
  <img src="logo.png" alt="Kizuki Logo" width="120" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/contributors/kal-purush/accessibility_study?color=green&label=contributors" />
  <img src="https://img.shields.io/github/forks/kal-purush/accessibility_study?label=forks" />
  <img src="https://img.shields.io/github/stars/kal-purush/accessibility_study?label=stars" />
  <img src="https://img.shields.io/github/issues/kal-purush/accessibility_study?label=issues" />
  <img src="https://img.shields.io/github/license/kal-purush/accessibility_study?label=license" />
</p>

<h1 align="center">Kizuki</h1>

<p align="center">
  A tool for checking language mismatches in web accessibility.
</p>

<p align="center">
  <a href="https://github.com/kal-purush/accessibility_study">GitHub Repo</a> • 
  <a href="#-running-kizuki">Usage</a> • 
  <a href="#-how-to-contribute">Contribute</a>
</p>

---

## 🔍 What is Kizuki?

**Kizuki** is a prototype accessibility auditing tool built on top of Google Lighthouse.  
It adds custom checks to evaluate language mismatches between visible content and accessibility metadata.

This tool is designed to support analysis in multilingual environments, especially in non-Latin-script websites.  
---

## ⚙️ What It Does

Kizuki analyzes:
- What language the visible content is in
- What language is used in:
  - `alt` attributes
  - `aria-label` fields
  - form `label` elements
- Whether these languages match
- If accessibility text is missing, empty, or generic

---

## 🛠️ How It Works

The main entry point is:

```bash
node run-lighthouse.js
```
It accepts either a CSV file containing multiple URLs.

Kizuki will:
- Run Lighthouse with custom audits
- Save results in the reports/ folder
  - HTML (for visual inspection)
  - JSON (for programmatic use)

You can find some sample reports already inside reports/.

--- 
## 🚀 Running Kizuki

For a list of URLs (CSV file):
```
node run-lighthouse.js --csv=websites.csv

```
CSV must contain one URL per line.

📁 Output

Kizuki stores all results in reports/.
Each site produces two files:
```
    example.com.json

    example.com.html
```
The JSON can be parsed for metrics, and the HTML is Lighthouse's full visual report with added audits.

---

## 🔧 Add a New Audit

To define and register a new custom audit:

    Create your audit in the audits/ folder.
    Use existing files as a reference (e.g., alt-text-language-audit.js).

    Edit index.js
    Add your audit to the list of audits being exported.

    Update custom-config.js
    Register the new audit under the audits and categories fields.

    Verify in run-lighthouse.js
    Ensure the run uses custom-config.js (already set by default).

Your audit will now run for every URL, and results will appear in both .json and .html output.

---

## 🧪 Prototype Status

This is an early-stage tool. Expect:
- limited language detection for mixed content
- brittle performance with dynamic or SPA websites
- minimal config options

It is intended as a research prototype, not a production-ready audit framework.

---

## 🤝 Contribute

Ways to help:
- Add new language-sensitive accessibility checks
- Improve accuracy of language detection
- Support additional output formats
- Extend support for international scripts

Open a pull request or issue to get started.

---

## 📄 License

Apache 2.0

---

## 📬 Contact

Email: langcrux@protonmail.com
