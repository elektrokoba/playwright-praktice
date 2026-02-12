import { expect, type APIRequestContext } from '@playwright/test';

type CheckoutSeed = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

const DEFAULT_SEED: CheckoutSeed = {
  firstName: 'Seeded',
  lastName: 'User',
  postalCode: '12345'
};

export async function fetchCheckoutSeed(request: APIRequestContext): Promise<CheckoutSeed> {
  const seedApiUrl = process.env.SEED_API_URL ?? 'https://dummyjson.com/users/1';
  const response = await request.get(seedApiUrl, { timeout: 10_000 });

  expect(response.ok()).toBeTruthy();
  const payload = await response.json() as {
    firstName?: string;
    lastName?: string;
    maidenName?: string;
    address?: { postalCode?: string };
  };

  const firstName = payload.firstName?.trim() || DEFAULT_SEED.firstName;
  const lastName = payload.lastName?.trim() || payload.maidenName?.trim() || DEFAULT_SEED.lastName;
  const postalCode = String(payload.address?.postalCode ?? DEFAULT_SEED.postalCode).trim();

  return {
    firstName,
    lastName,
    postalCode: postalCode || DEFAULT_SEED.postalCode
  };
}
