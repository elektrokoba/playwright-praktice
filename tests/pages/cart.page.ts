import { expect, type Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  async expectLoaded() {
    await expect(this.page).toHaveURL(/cart.html/);
  }

  async expectItemsCount(count: number) {
    await expect(this.page.locator('.cart_item')).toHaveCount(count);
  }

  async expectBadgeCount(count: number) {
    await expect(this.page.locator('.shopping_cart_badge')).toHaveText(String(count));
  }

  async removeItem(itemSlug: string) {
    await this.page.getByTestId(`remove-${itemSlug}`).click();
  }

  async expectItemVisible(itemName: string) {
    await expect(this.page.locator('.cart_item', { hasText: itemName })).toHaveCount(1);
  }

  async checkout() {
    await this.page.getByTestId('checkout').click();
  }
}
