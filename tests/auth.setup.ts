import { test as setup } from '@playwright/test';
import { LoginPage } from './pages/login.page';

const authFile = 'playwright/.auth/user.json';
const SAUCE_USER = process.env.SAUCEDEMO_USER ?? 'standard_user';
const SAUCE_PASS = process.env.SAUCEDEMO_PASS ?? 'secret_sauce';

setup('authenticate user @smoke @regression', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(SAUCE_USER, SAUCE_PASS);
  await page.context().storageState({ path: authFile });
});
