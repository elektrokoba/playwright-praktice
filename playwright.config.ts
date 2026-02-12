import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

process.env.SAUCEDEMO_USER ??= 'standard_user';
process.env.SAUCEDEMO_PASS ??= 'secret_sauce';

const authFile = 'playwright/.auth/user.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts'
    },
    {
      name: 'e2e',
      testMatch: '**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        storageState: authFile
      }
    }
  ]
});
