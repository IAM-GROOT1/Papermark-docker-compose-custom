import baseX from "base-x";
import { randomUUID } from "@/lib/utils/random-uuid";

function encodeBase58(bytes: Uint8Array): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  return baseX(alphabet).encode(bytes);
}

/**
 * [self-host] Hex -> bytes without Buffer.
 *
 * This runs in the browser too (putFile() mints the document id client-side),
 * and Buffer is a Node global that is not guaranteed to be polyfilled there.
 * base-x accepts a plain Uint8Array, so there is no need for it.
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
/**
 * Generate ids similar to stripe
 */
export class IdGenerator<TPrefixes extends string> {
  private prefixes: Record<TPrefixes, string>;

  /**
   * Create a new id generator with fully typed prefixes
   * @param prefixes - Relevant prefixes for your domain
   */
  constructor(prefixes: Record<TPrefixes, string>) {
    this.prefixes = prefixes;
  }

  /**
   * Generate a new unique base58 encoded uuid with a defined prefix
   *
   * @returns xxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   */
  public id = (prefix: TPrefixes): string => {
    return [
      this.prefixes[prefix],
      encodeBase58(hexToBytes(randomUUID().replace(/-/g, ""))),
    ].join("_");
  };
}

export const newId = new IdGenerator({
  view: "view",
  videoView: "vview",
  linkView: "lview",
  inv: "inv", // invitation
  email: "email",
  doc: "doc",
  page: "page",
  dataroom: "dr",
  preview: "preview",
  webhook: "wh",
  webhookEvent: "evt",
  webhookSecret: "whsec",
  token: "pmk", // legacy dashboard token prefix (still accepted)
  tokenLive: "pm_live",
  clickEvent: "click",
  preset: "preset",
  pending: "pending", // for pending uploads
  upload: "upload", // opaque public upload session handle
}).id;
