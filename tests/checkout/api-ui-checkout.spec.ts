import { test } from '../fixtures/test-fixtures';
import { fetchCheckoutSeed } from '../api/seed-client';

test('seeds checkout data via API and validates purchase in UI', async ({ request, inventoryPage, cartPage, checkoutPage }) => {
  const seed = await fetchCheckoutSeed(request);

  await inventoryPage.addItems(['sauce-labs-backpack']);
  await inventoryPage.openCart();
  await cartPage.expectLoaded();
  await cartPage.expectItemsCount(1);
  await cartPage.checkout();

  await checkoutPage.fillInformation({
    firstName: seed.firstName,
    lastName: seed.lastName,
    postalCode: seed.postalCode
  });

  await checkoutPage.finishOrder();
  await checkoutPage.expectOrderComplete();
});
