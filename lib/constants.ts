export const CURRENCIES = {
  NGN: "NGN",
  USD: "USD",
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  NGN: 1,
  USD: 1700, // Update this centrally to affect the whole app
};

export const PAYSTACK_CONFIG = {
  FLAT_FEE_KOBO: 100,
  PERCENT_FEE: 0.015,
  FREE_FEE_THRESHOLD: 2500,
};

export const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  LIBRARY: "/library",
  ACADEMY: "/academy",
  SUCCESS: "/success",
};