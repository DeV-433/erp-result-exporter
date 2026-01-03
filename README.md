IIIT-NR ERP Result Scraper / Exporter

A lightweight, one-click Chrome extension that extracts academic results from the IIIT Naya Raipur ERP portal and exports them as a clean, well-formatted PDF transcript.

This project was built to improve the usability of the ERP system by automating result extraction, formatting, and export — without modifying or bypassing any backend systems.

🚀 Features

🔐 ERP-domain locked
Runs only on https://erp.iiitnr.edu.in/ to prevent accidental misuse.

📄 One-click PDF export
Fetches semester-wise course data, grades, credits, and marks, and exports them into a professional PDF.

📊 Accurate mark calculation
Automatically computes total marks from individual components when the ERP does not provide a final total.

🎓 Grade-aware
Extracts official grades (including forced grades where applicable).

🧭 Live progress indicator
Includes a non-intrusive floating HUD with a green progress bar to show export status in real time.

🧾 Transcript-style layout
Uses a Times-style font, structured tables, and clean spacing for readability.

🛡️ CSP-safe & MV3 compliant
Built correctly for Chrome Manifest V3 with proper script injection order and no external CDN dependencies at runtime.

🛠️ How It Works (High Level)

The extension injects a content script into the ERP page only when the user clicks the extension icon.

It calls the same internal ERP APIs used by the web interface to fetch:

semesters

registered courses

marks breakdown

grades and credits

Data is normalized and validated on the client side.

A PDF is generated locally using jsPDF (bundled with the extension).

The file is downloaded automatically to the user’s system.

No server, no external data storage, no credentials are collected.

📦 Installation (Developer Mode)

Since this extension is not published on the Chrome Web Store, install it manually:

Clone or download this repository:

git clone https://github.com/<your-username>/iiit-nr-erp-result-scraper-exporter.git


Open Chrome and go to:

chrome://extensions


Enable Developer mode (top right).

Click Load unpacked.

Select the project folder.

Pin the extension to the toolbar.

Open the IIIT-NR ERP portal and click the extension icon.

📁 Project Structure
├── manifest.json        # Chrome extension configuration (MV3)
├── background.js        # Handles icon click and script injection
├── content.js           # Main scraping + PDF generation logic
├── jspdf.umd.min.js     # Bundled jsPDF library (CSP-safe)
└── icon.png             # Extension icon

🔒 Security & Ethics

This project does not bypass authentication.

It only accesses data already visible to the logged-in student.

No admin or privileged APIs are used.

No data is sent to any external server.

All processing happens locally in the browser.

This tool is intended strictly for personal academic use.

⚠️ Disclaimer

This is an unofficial utility and is not affiliated with IIIT Naya Raipur or its ERP vendor.
ERP APIs, structures, or access rules may change at any time, which could break functionality.

🌱 Possible Future Enhancements

CSV export alongside PDF

Local SGPA recalculation & verification

Result-release detection

Custom filename formats

Optional watermark / disclaimer toggle

Firefox support

🙌 Acknowledgements

Built using Chrome Extension Manifest V3

PDF generation powered by jsPDF

📜 License

This project is released for educational and personal use.
You may fork or modify it for non-commercial purposes.
