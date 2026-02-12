import { expect, type Page } from '@playwright/test';

type CheckoutInfo = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  private promoInput() {
    return this.page.locator('[data-test="promo-code"], #promo-code, input[name="promoCode"], input[name="promo"]');
  }

  private promoApplyButton() {
    return this.page.locator('[data-test="apply-promo"], #apply-promo, button:has-text("Apply"), button:has-text("Apply Promo")');
  }

  private promoError() {
    return this.page.locator('[data-test="promo-error"], #promo-error, .promo-error, text=/invalid promo|promo code is invalid/i');
  }

  private paymentField() {
    return this.page.locator('[data-test="card-number"], #card-number, input[name="cardNumber"]');
  }

  private paymentSubmitButton() {
    return this.page.locator('[data-test="submit-payment"], #submit-payment, button:has-text("Pay"), button:has-text("Submit Payment")');
  }

  private paymentError() {
    return this.page.locator('[data-test="payment-error"], #payment-error, .payment-error, text=/payment failed|card declined/i');
  }

  async expectStepOneLoaded() {
    await expect(this.page).toHaveURL(/checkout-step-one.html/);
  }

  async fillInformation(info: CheckoutInfo) {
    await this.expectStepOneLoaded();
    await this.page.locator('#first-name').fill(info.firstName);
    await this.page.locator('#last-name').fill(info.lastName);
    await this.page.locator('#postal-code').fill(info.postalCode);
    await this.page.getByTestId('continue').click();
  }

  async continueWithoutInformation() {
    await this.expectStepOneLoaded();
    await this.page.getByTestId('continue').click();
  }

  async expectValidationError(message: string) {
    await expect(this.page.getByTestId('error')).toHaveText(message);
  }

  async hasPromoCodeCapability() {
    return (await this.promoInput().count()) > 0;
  }

  async applyPromoCode(code: string) {
    await this.promoInput().first().fill(code);
    await this.promoApplyButton().first().click();
  }

  async expectPromoErrorVisible() {
    await expect(this.promoError().first()).toBeVisible();
  }

  async expectPromoCapabilityAbsent() {
    await expect(this.promoInput()).toHaveCount(0);
  }

  async hasPaymentCapability() {
    return (await this.paymentField().count()) > 0;
  }

  async submitPayment(cardNumber: string) {
    await this.paymentField().first().fill(cardNumber);
    await this.paymentSubmitButton().first().click();
  }

  async expectPaymentErrorVisible() {
    await expect(this.paymentError().first()).toBeVisible();
  }

  async expectStepTwoLoaded() {
    await expect(this.page).toHaveURL(/checkout-step-two.html/);
  }

  async finishOrder() {
    await this.expectStepTwoLoaded();
    await this.page.getByTestId('finish').click();
  }

  async expectOrderComplete() {
    await expect(this.page).toHaveURL(/checkout-complete.html/);
    await expect(this.page.locator('.complete-header')).toHaveText('Thank you for your order!');
    await expect(this.page.getByTestId('back-to-products')).toBeVisible();
  }
}
