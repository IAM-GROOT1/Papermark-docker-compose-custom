/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Currency labels for the billing UI. Kept real so any price that does render is formatted sensibly.
 */
export type Currency = "usd" | "eur" | "gbp";

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  usd: "$",
  eur: "\u20ac",
  gbp: "\u00a3",
};

export const CURRENCY_LABEL: Record<Currency, string> = {
  usd: "USD",
  eur: "EUR",
  gbp: "GBP",
};
