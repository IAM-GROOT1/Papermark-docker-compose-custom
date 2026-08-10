/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Reads branding-preview overrides out of the query string on the internal preview pages.
 */
import { useRouter } from "next/router";
import { useMemo } from "react";

export type BrandingPreviewParams = Record<string, string>;

/** Flattens the current query string; the preview pages read keys off it. */
export function useBrandingPreviewParams(): BrandingPreviewParams {
  const router = useRouter();

  return useMemo(() => {
    const out: BrandingPreviewParams = {};
    for (const [key, value] of Object.entries(router.query ?? {})) {
      if (typeof value === "string") out[key] = value;
      else if (Array.isArray(value) && typeof value[0] === "string")
        out[key] = value[0];
    }
    return out;
  }, [router.query]);
}
