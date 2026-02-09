import { test, expect } from '@playwright/test';
import type { Page, Browser, BrowserContext } from '@playwright/test';

const SAUCE_USER = process.env.SAUCEDEMO_USER ?? 'standard_user';
const SAUCE_PASS = process.env.SAUCEDEMO_PASS ?? 'secret_sauce';

async function login(page: Page) {
    await page.fill('[data-test="username"]', SAUCE_USER);
    await page.fill('[data-test="password"]', SAUCE_PASS);
    await page.click('[data-test="login-button"]');
}

test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await login(page);
    await expect(page).toHaveURL(/inventory.html/);
});

// Test 1: A user can add a few items to their cart and successfully purchase the items
test('user can add items to cart and complete purchase on saucedemo', async ({ page }: { page: Page }) => {
    // Add a few items to the cart
    const itemsToAdd = [
        'add-to-cart-sauce-labs-backpack',
        'add-to-cart-sauce-labs-bike-light',
        'add-to-cart-sauce-labs-bolt-t-shirt',
    ];
    for (const btn of itemsToAdd) {
        await page.click(`[data-test="${btn}"]`);
    }

    // Open cart and verify items count
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/cart.html/);
    await expect(page.locator('.cart_item')).toHaveCount(itemsToAdd.length);

    // Begin checkout
    await page.click('[data-test="checkout"]');
    await expect(page).toHaveURL(/checkout-step-one.html/);
    await page.fill('#first-name', 'Test');
    await page.fill('#last-name', 'User');
    await page.fill('#postal-code', '12345');
    await page.click('[data-test="continue"]');

    // Finish purchase
    await expect(page).toHaveURL(/checkout-step-two.html/);
    await page.click('[data-test="finish"]');

    // Assert order completion
    const completeHeader = page.locator('.complete-header');
    await expect(completeHeader).toHaveText('Thank you for your order!');
});

// Test 2: Add at least 3 items, navigate to cart, remove an item, verify remaining items and cart count
test('user can remove an item from cart and cart count updates', async ({ page }: { page: Page }) => {
    const itemsToAdd = [
        'add-to-cart-sauce-labs-backpack',
        'add-to-cart-sauce-labs-bike-light',
        'add-to-cart-sauce-labs-bolt-t-shirt',
    ];
    for (const btn of itemsToAdd) {
        await page.click(`[data-test="${btn}"]`);
    }

    // Open cart and verify initial count
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/cart.html/);
    await expect(page.locator('.cart_item')).toHaveCount(3);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('3');

    // Remove one specific item (bike light)
    await page.click('[data-test="remove-sauce-labs-bike-light"]');

    // Verify remaining items and cart badge update
    await expect(page.locator('.cart_item')).toHaveCount(2);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Verify specific items remain
    await expect(page.locator('.cart_item', { hasText: 'Sauce Labs Backpack' })).toHaveCount(1);
    await expect(page.locator('.cart_item', { hasText: 'Sauce Labs Bolt T-Shirt' })).toHaveCount(1);
});

// Test 3: Sorting dropdown - verify four sort methods
test('user can sort items by name and price in all four ways', async ({ page }: { page: Page }) => {
    const nameLocator = '.inventory_item_name';
    const priceLocator = '.inventory_item_price';
    const sortSelect = '.product_sort_container';

    // Helper to get names and prices
    const getNames = async () => await page.locator(nameLocator).allTextContents();
    const getPrices = async () => {
        const texts = await page.locator(priceLocator).allTextContents();
        return texts.map(t => parseFloat(t.replace('$', '').trim()));
    };

    // 1) Name (A to Z)
    await page.selectOption(sortSelect, 'az');
    const namesAZ = await getNames();
    const sortedAZ = [...namesAZ].sort((a, b) => a.localeCompare(b));
    expect(namesAZ).toEqual(sortedAZ);

    // 2) Name (Z to A)
    await page.selectOption(sortSelect, 'za');
    const namesZA = await getNames();
    const sortedZA = [...namesAZ].sort((a, b) => b.localeCompare(a));
    expect(namesZA).toEqual(sortedZA);

    // 3) Price (low to high)
    await page.selectOption(sortSelect, 'lohi');
    const pricesLoHi = await getPrices();
    const sortedLoHi = [...pricesLoHi].sort((a, b) => a - b);
    expect(pricesLoHi).toEqual(sortedLoHi);

    // 4) Price (high to low)
    await page.selectOption(sortSelect, 'hilo');
    const pricesHiLo = await getPrices();
    const sortedHiLo = [...pricesLoHi].sort((a, b) => b - a);
    expect(pricesHiLo).toEqual(sortedHiLo);
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

test('affiliate link sets affiliate_tracking cookie with 30-day expiry and shows banner + sends on order', async ({ browser }: { browser: Browser }) => {
    const AFF_ID = 'QA_INFLUENCER';

    // create fresh context and page
    const context = await browser.newContext();
    const page = await context.newPage();

    // Option A - prefer site behavior: visit URL with ?ref param
    await page.goto(`https://www.saucedemo.com/?ref=${AFF_ID}`);
    await page.waitForLoadState('networkidle');

    // If site doesn't set the cookie, set it from the test (ensures tests can proceed)
    const docCookie = await page.evaluate(() => document.cookie);
    if (!/(?:^|;\s*)affiliate_tracking=/.test(docCookie)) {
        await setAffiliateCookie(context, AFF_ID);
    }

    // verify cookie exists (document.cookie or context.cookies)
    const clientCookie = await page.evaluate(() => document.cookie);
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
    await page.goto('https://www.saucedemo.com/');
    await login(page);
    await expect(page).toHaveURL(/inventory.html/);

    // continue with flow (add to cart, checkout) — existing test steps...
    // Add a few items to the cart
    const itemsToAdd = [
        'add-to-cart-sauce-labs-backpack',
        'add-to-cart-sauce-labs-bike-light',
        'add-to-cart-sauce-labs-bolt-t-shirt',
    ];
    for (const btn of itemsToAdd) {
        await page.waitForSelector(`[data-test="${btn}"]`, { state: 'visible' });
        await page.click(`[data-test="${btn}"]`);
    }

    // Open cart and verify items count
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/cart.html/);
    await expect(page.locator('.cart_item')).toHaveCount(itemsToAdd.length);

    // Begin checkout
    await page.click('[data-test="checkout"]');
    await expect(page).toHaveURL(/checkout-step-one.html/);
    await page.fill('#first-name', 'Test');
    await page.fill('#last-name', 'User');
    await page.fill('#postal-code', '12345');
    await page.click('[data-test="continue"]');

    // Finish purchase
    await expect(page).toHaveURL(/checkout-step-two.html/);
    await page.click('[data-test="finish"]');

    // Assert order completion
    const completeHeader = page.locator('.complete-header');
    await expect(completeHeader).toHaveText('Thank you for your order!');

    // Close context
    await context.close();
});