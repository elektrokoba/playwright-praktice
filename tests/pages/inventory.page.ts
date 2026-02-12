import { type Page } from '@playwright/test';

export class InventoryPage {
  constructor(private readonly page: Page) {}

  private addButtonTestId(itemSlug: string) {
    return `add-to-cart-${itemSlug}`;
  }

  async addItems(itemSlugs: string[]) {
    for (const itemSlug of itemSlugs) {
      await this.page.getByTestId(this.addButtonTestId(itemSlug)).click();
    }
  }

  async openCart() {
    await this.page.locator('.shopping_cart_link').click();
  }

  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.page.locator('.product_sort_container').selectOption(value);
  }

  async itemNames() {
    return this.page.locator('.inventory_item_name').allTextContents();
  }

  async itemPrices() {
    const texts = await this.page.locator('.inventory_item_price').allTextContents();
    return texts.map((text) => Number.parseFloat(text.replace('$', '').trim()));
  }
}
