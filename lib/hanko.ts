import { tenant } from "@teamhanko/passkeys-next-auth-provider";

/**
 * [self-host] Does not throw at import.
 *
 * This module used to `throw` at module scope when HANKO_API_KEY /
 * NEXT_PUBLIC_HANKO_TENANT_ID were unset. Since `next build` imports every
 * route to collect page data, that made passkey sign-in — an optional
 * provider — a hard requirement for building the app at all.
 *
 * Throwing lazily is not enough either: lib/auth/auth-options.ts hands this to
 * PasskeyProvider() at module scope, so anything that touches the object during
 * provider setup would trip the same error. Instead the tenant is constructed
 * with empty credentials and passkey requests fail at call time, which is the
 * only path that needs Hanko at all.
 */
export const isHankoConfigured = () =>
  !!process.env.HANKO_API_KEY && !!process.env.NEXT_PUBLIC_HANKO_TENANT_ID;

const hanko = tenant({
  apiKey: process.env.HANKO_API_KEY ?? "",
  tenantId: process.env.NEXT_PUBLIC_HANKO_TENANT_ID ?? "",
});

export default hanko;
