import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

process.env.SAUCEDEMO_USER ??= 'standard_user';
process.env.SAUCEDEMO_PASS ??= 'secret_sauce';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry'
  }
});
