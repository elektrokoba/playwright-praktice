Tulip Interfaces Playwright Tests

Overview
- End-to-end tests for https://www.saucedemo.com/ written with Playwright.
- Main specs live in tests/test.spec.ts.
- Reusable fixtures live in tests/fixtures/test-fixtures.ts.
- Page objects live in tests/pages/.

Requirements
- Node.js 18+ recommended.

Install
From the workspace root:
1) npm i -D @playwright/test
2) npx playwright install

Run tests
From the workspace root:
- npx playwright test

Environment variables (optional)
- SAUCEDEMO_USER (default: standard_user)
- SAUCEDEMO_PASS (default: secret_sauce)

Notes
- The affiliate test stores a storage state file at tulip_interfaces/affiliateStorage.json.
- Base login setup is centralized in a shared beforeEach hook in tests/fixtures/test-fixtures.ts.
