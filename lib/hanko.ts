import { tenant } from "@teamhanko/passkeys-next-auth-provider";

/**
 * [self-host] Never throws at import.
 *
 * Two separate problems had to be solved here:
 *
 *  1. The module used to `throw` at module scope when HANKO_API_KEY /
 *     NEXT_PUBLIC_HANKO_TENANT_ID were unset. `next build` imports every route
 *     to collect page data, so passkey sign-in — an optional provider — became
 *     a hard requirement for building the app at all.
 *
 *  2. `tenant()` itself throws "No tenant ID provided" when handed empty
 *     credentials, so simply defaulting them to "" moves the same failure one
 *     line down.
 *
 * Throwing lazily is not an option either, because lib/auth/auth-options.ts
 * passes this object to PasskeyProvider() at module scope. So when Hanko is not
 * configured we hand back a stub that tolerates any property access and only
 * rejects if something actually calls it — which only the passkey flow does.
 */
export const isHankoConfigured = () =>
  !!process.env.HANKO_API_KEY && !!process.env.NEXT_PUBLIC_HANKO_TENANT_ID;

const NOT_CONFIGURED =
  "Passkey sign-in is not configured on this instance. Set HANKO_API_KEY and NEXT_PUBLIC_HANKO_TENANT_ID to enable it.";

/**
 * Accepts `stub.anything.nested` and rejects only on invocation, so provider
 * setup can inspect the object freely.
 */
const unconfiguredStub = (): any =>
  new Proxy(function () {} as any, {
    get: () => unconfiguredStub(),
    apply: () => Promise.reject(new Error(NOT_CONFIGURED)),
  });

const hanko: ReturnType<typeof tenant> = isHankoConfigured()
  ? tenant({
      apiKey: process.env.HANKO_API_KEY!,
      tenantId: process.env.NEXT_PUBLIC_HANKO_TENANT_ID!,
    })
  : unconfiguredStub();

export default hanko;
