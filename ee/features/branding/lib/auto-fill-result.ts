/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Brand auto-fill scrapes a website for a logo and colours. There is no such service here, so a run never yields usable assets.
 */
export const AUTO_FILL_NOT_FOUND_MESSAGE =
  "Automatic brand detection is not available on this self-hosted instance. Set your logo and colours manually.";

export function autoFillHasBrandAssets(
  _result?: unknown,
  _options?: { allowBanner?: boolean },
): boolean {
  return false;
}
