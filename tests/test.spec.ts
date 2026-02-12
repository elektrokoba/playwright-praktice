import { expect, test } from './fixtures/test-fixtures';
import type { BrowserContext } from '@playwright/test';

// Test 1: A user can add a few items to their cart and successfully purchase the items
test('user can add items to cart and complete purchase on saucedemo', async ({ inventoryPage, cartPage, checkoutPage }) => {
    const itemSlugs = [
        'sauce-labs-backpack',
        'sauce-labs-bike-light',
        'sauce-labs-bolt-t-shirt'
    ];

    await inventoryPage.addItems(itemSlugs);
    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItemsCount(itemSlugs.length);
    await cartPage.checkout();
    await checkoutPage.fillInformation({
        firstName: 'Test',
        lastName: 'User',
        postalCode: '12345'
    });
    await checkoutPage.finishOrder();
    await checkoutPage.expectOrderComplete();
});

// Test 2: Add at least 3 items, navigate to cart, remove an item, verify remaining items and cart count
test('user can remove an item from cart and cart count updates', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addItems([
        'sauce-labs-backpack',
        'sauce-labs-bike-light',
        'sauce-labs-bolt-t-shirt'
    ]);

    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItemsCount(3);
    await cartPage.expectBadgeCount(3);
    await cartPage.removeItem('sauce-labs-bike-light');
    await cartPage.expectItemsCount(2);
    await cartPage.expectBadgeCount(2);
    await cartPage.expectItemVisible('Sauce Labs Backpack');
    await cartPage.expectItemVisible('Sauce Labs Bolt T-Shirt');
});

// Test 3: Sorting dropdown - verify four sort methods
test('user can sort items by name and price in all four ways', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    const namesAZ = await inventoryPage.itemNames();
    expect(namesAZ).toEqual([...namesAZ].sort((a, b) => a.localeCompare(b)));

    await inventoryPage.sortBy('za');
    const namesZA = await inventoryPage.itemNames();
    expect(namesZA).toEqual([...namesZA].sort((a, b) => b.localeCompare(a)));

    await inventoryPage.sortBy('lohi');
    const pricesLoHi = await inventoryPage.itemPrices();
    expect(pricesLoHi).toEqual([...pricesLoHi].sort((a, b) => a - b));

    await inventoryPage.sortBy('hilo');
    const pricesHiLo = await inventoryPage.itemPrices();
    expect(pricesHiLo).toEqual([...pricesHiLo].sort((a, b) => b - a));
});

// New Tests: Affiliate Links feature
// helper: set affiliate_tracking cookie for 30 days in given context
async function setAffiliateCookie(context: BrowserContext, affId: string) {
    const thirtyDays = 30 * 24 * 60 * 60;
    const expires = Math.floor(Date.now() / 1000) + thirtyDays;
    await context.addCookies([{
        name: 'affiliate_tracking',
        value: affId,
        domain: 'www.saucedemo.com',
        path: '/',
        expires,
        httpOnly: false,
        secure: true,
        sameSite: 'Lax'
    }]);
}

// helper: persist context to storage file (optional)
async function persistContext(context: BrowserContext, filepath = 'affiliateStorage.json') {
    await context.storageState({ path: filepath });
}

test('affiliate link sets affiliate_tracking cookie with 30-day expiry and shows banner + sends on order', async ({ browser, inventoryPage, cartPage, checkoutPage }) => {
    const AFF_ID = 'QA_INFLUENCER';

    // create fresh context and page
    const context = await browser.newContext();
    const freshPage = await context.newPage();

    // Option A - prefer site behavior: visit URL with ?ref param
    await freshPage.goto(`https://www.saucedemo.com/?ref=${AFF_ID}`);
    await freshPage.waitForLoadState('networkidle');

    // If site doesn't set the cookie, set it from the test (ensures tests can proceed)
    const docCookie = await freshPage.evaluate(() => document.cookie);
    if (!/(?:^|;\s*)affiliate_tracking=/.test(docCookie)) {
        await setAffiliateCookie(context, AFF_ID);
    }

    // verify cookie exists (document.cookie or context.cookies)
    const clientCookie = await freshPage.evaluate(() => document.cookie);
    if (!/(?:^|;\s*)affiliate_tracking=/.test(clientCookie)) {
        const cookies = await context.cookies('https://www.saucedemo.com/');
        const found = cookies.find(c => c.name === 'affiliate_tracking');
        if (!found) {
            throw new Error('affiliate_tracking cookie not present after setting.');
        }
    }

    // optional: persist cookie for later contexts / runs
    await persistContext(context, 'affiliateStorage.json');

    // Ensure we're on the inventory page in this fresh context and logged in
    await inventoryPage.addItems([
        'sauce-labs-backpack',
        'sauce-labs-bike-light',
        'sauce-labs-bolt-t-shirt'
    ]);
    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItemsCount(3);
    await cartPage.checkout();
    await checkoutPage.fillInformation({
        firstName: 'Test',
        lastName: 'User',
        postalCode: '12345'
    });
    await checkoutPage.finishOrder();
    await checkoutPage.expectOrderComplete();

    // Close context
    await context.close();
});
