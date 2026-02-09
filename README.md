Tulip Interfaces Playwright Tests

Overview
- End-to-end tests for https://www.saucedemo.com/ written with Playwright.
- Tests live in tulip_interfaces/test.spec.ts.

Requirements
- Node.js 18+ recommended.

Install
From the workspace root:
1) npm i -D @playwright/test
2) npx playwright install

Run tests
From the workspace root:
- npx playwright test tulip_interfaces/test.spec.ts

Environment variables (optional)
- SAUCEDEMO_USER (default: standard_user)
- SAUCEDEMO_PASS (default: secret_sauce)

Notes
- The affiliate test stores a storage state file at tulip_interfaces/affiliateStorage.json.
