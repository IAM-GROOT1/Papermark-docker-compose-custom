import { tenant } from "@teamhanko/passkeys-next-auth-provider";

/**
 * [self-host] Never throws at import.
 *
 * Papermark's version threw at module scope when HANKO_API_KEY /
 * NEXT_PUBLIC_HANKO_TENANT_ID were unset. `next build` imports every route to
 * collect page data, so passkey sign-in — an optional provider — became a hard
 * requirement for building the app at all.
 *
 * Getting this right took three attempts, so the constraints are worth writing
 * down:
 *   - defaulting the credentials to "" doesn't work: tenant() itself rejects
 *     them with "No tenant ID provided";
 *   - throwing lazily doesn't work either, nor does a proxy stub, because
 *     lib/auth/auth-options.ts hands this to PasskeyProvider() at module scope
 *     and the passkeys package both calls into and string-coerces the tenant
 *     while setting itself up.
 *
 * So: always build a real tenant, using placeholder credentials when none are
 * configured. Nothing throws at import, and an actual passkey request fails
 * against the Hanko API — the only path that needs it.
 */
export const isHankoConfigured = () =>
  !!process.env.HANKO_API_KEY && !!process.env.NEXT_PUBLIC_HANKO_TENANT_ID;

const PLACEHOLDER_TENANT_ID = "00000000-0000-0000-0000-000000000000";

const hanko = tenant({
  apiKey: process.env.HANKO_API_KEY || "passkeys-not-configured",
  tenantId: process.env.NEXT_PUBLIC_HANKO_TENANT_ID || PLACEHOLDER_TENANT_ID,
});

export default hanko;
