import { expect, type Page } from '@playwright/test';

type CheckoutInfo = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async fillInformation(info: CheckoutInfo) {
    await expect(this.page).toHaveURL(/checkout-step-one.html/);
    await this.page.locator('#first-name').fill(info.firstName);
    await this.page.locator('#last-name').fill(info.lastName);
    await this.page.locator('#postal-code').fill(info.postalCode);
    await this.page.getByTestId('continue').click();
  }

  async finishOrder() {
    await expect(this.page).toHaveURL(/checkout-step-two.html/);
    await this.page.getByTestId('finish').click();
  }

  async expectOrderComplete() {
    await expect(this.page.locator('.complete-header')).toHaveText('Thank you for your order!');
  }
}
