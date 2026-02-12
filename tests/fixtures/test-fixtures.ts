import { test as base } from '@playwright/test';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { InventoryPage } from '../pages/inventory.page';
import { LoginPage } from '../pages/login.page';

type AppFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

const SAUCE_USER = process.env.SAUCEDEMO_USER ?? 'standard_user';
const SAUCE_PASS = process.env.SAUCEDEMO_PASS ?? 'secret_sauce';

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  }
});

export { expect } from '@playwright/test';

test.beforeEach(async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login(SAUCE_USER, SAUCE_PASS);
});
