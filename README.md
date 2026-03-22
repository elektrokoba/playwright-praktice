Playwright Tests

[![Playwright Tests](https://github.com/elektrokoba/playwright-praktice/actions/workflows/playwright.yml/badge.svg)](https://github.com/elektrokoba/playwright-praktice/actions/workflows/playwright.yml)

Overview
- End-to-end tests for https://www.saucedemo.com/ written with Playwright.
- Main specs live in tests/test.spec.ts.
- Auth setup lives in tests/auth.setup.ts.
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
- CI runs cross-browser projects: chromium, firefox, webkit, and mobile-chrome.
- Test tags: @smoke for fast PR gates, @regression for full/nightly coverage.

Environment variables (optional)
- SAUCEDEMO_USER (default: standard_user)
- SAUCEDEMO_PASS (default: secret_sauce)
- SEED_API_URL (default: https://dummyjson.com/users/1)
- PW_RETRIES (default local: 0, CI: 2)

Notes
- The affiliate test stores a storage state file at tulip_interfaces/affiliateStorage.json.
- Shared beforeEach in tests/fixtures/test-fixtures.ts opens the inventory page baseline.
- Playwright saves authenticated state to playwright/.auth/user.json and reuses it for spec tests.
- API+UI example test: tests/checkout/api-ui-checkout.spec.ts seeds checkout form data via API before validating UI flow.
- Quality gates: pull requests run @smoke tests, nightly schedule runs the full suite.
