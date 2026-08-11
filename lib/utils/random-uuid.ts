/**
 * [self-host] A UUID v4 that also works over plain HTTP.
 *
 * `crypto.randomUUID()` is only exposed in a *secure context* — HTTPS, or
 * localhost. A self-hosted instance reached at http://192.168.1.80:9009 is
 * neither, so in the browser the function is simply absent and every call site
 * throws "crypto.randomUUID is not a function". That took out document uploads
 * entirely: selecting a file crashed the page.
 *
 * `crypto.getRandomValues()` has no such restriction, so we derive the UUID
 * from it when the shortcut is unavailable. Same randomness source, same
 * RFC 4122 v4 layout.
 */

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export function randomUUID(): string {
  const webcrypto = globalThis.crypto;

  if (webcrypto && typeof webcrypto.randomUUID === "function") {
    return webcrypto.randomUUID();
  }

  if (webcrypto && typeof webcrypto.getRandomValues === "function") {
    const bytes = webcrypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
    const hex = toHex(bytes);
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join("-");
  }

  // Every browser and Node version this app supports provides one of the two
  // above; falling back to Math.random() would silently weaken ids used as
  // storage keys, so fail loudly instead.
  throw new Error(
    "No cryptographic random source available (crypto.getRandomValues missing).",
  );
}
