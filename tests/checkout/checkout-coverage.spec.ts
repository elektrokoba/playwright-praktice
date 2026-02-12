import { expect, test } from '../fixtures/test-fixtures';

const checkoutInfo = {
  firstName: 'Checkout',
  lastName: 'Tester',
  postalCode: '12345'
};

const cartItem = 'sauce-labs-backpack';

async function goToCheckoutStepOne(
  inventoryPage: { addItems: (itemSlugs: string[]) => Promise<void>; openCart: () => Promise<void> },
  cartPage: { expectLoaded: () => Promise<void>; checkout: () => Promise<void> }
) {
  await inventoryPage.addItems([cartItem]);
  await inventoryPage.openCart();
  await cartPage.expectLoaded();
  await cartPage.checkout();
}

test('happy path checkout completes successfully @smoke @regression', async ({ inventoryPage, cartPage, checkoutPage }) => {
  await goToCheckoutStepOne(inventoryPage, cartPage);
  await checkoutPage.fillInformation(checkoutInfo);
  await checkoutPage.finishOrder();
  await checkoutPage.expectOrderComplete();
});

test('invalid promo code is rejected or capability is explicitly absent @regression', async ({ inventoryPage, cartPage, checkoutPage }) => {
  await goToCheckoutStepOne(inventoryPage, cartPage);
  await checkoutPage.fillInformation(checkoutInfo);

  const hasPromoCode = await checkoutPage.hasPromoCodeCapability();
  if (hasPromoCode) {
    await checkoutPage.applyPromoCode('INVALID_PROMO_CODE');
    await checkoutPage.expectPromoErrorVisible();
    return;
  }

  await checkoutPage.expectPromoCapabilityAbsent();
});

test('empty cart checkout keeps zero-item summary @regression', async ({ inventoryPage, cartPage, page, checkoutPage }) => {
  await inventoryPage.openCart();
  await cartPage.expectLoaded();
  await cartPage.expectItemsCount(0);

  await expect(page.getByTestId('checkout')).toHaveCount(1);
  await cartPage.checkout();
  await checkoutPage.fillInformation(checkoutInfo);
  await checkoutPage.expectStepTwoLoaded();
  await expect(page.locator('.cart_item')).toHaveCount(0);
});

test('payment failure is surfaced or payment step capability is explicitly absent @regression', async ({ inventoryPage, cartPage, checkoutPage }) => {
  await goToCheckoutStepOne(inventoryPage, cartPage);
  await checkoutPage.fillInformation(checkoutInfo);

  const hasPayment = await checkoutPage.hasPaymentCapability();
  if (hasPayment) {
    await checkoutPage.submitPayment('4000000000000002');
    await checkoutPage.expectPaymentErrorVisible();
    return;
  }

  await checkoutPage.expectStepTwoLoaded();
});

test('order confirmation displays expected content @smoke @regression', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
  await goToCheckoutStepOne(inventoryPage, cartPage);
  await checkoutPage.fillInformation(checkoutInfo);
  await checkoutPage.finishOrder();
  await checkoutPage.expectOrderComplete();

  await expect(page.locator('.complete-text')).toContainText('Your order has been dispatched');
});
