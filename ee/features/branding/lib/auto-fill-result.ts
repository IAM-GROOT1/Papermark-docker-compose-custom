/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Brand auto-fill scrapes a website for logo/colours. Without the enterprise service there is nothing to auto-fill.
 */
export const AUTO_FILL_NOT_FOUND_MESSAGE =
  "Automatic brand detection is not available on this self-hosted instance. Set your logo and colours manually.";

/** Whether an auto-fill run produced anything usable. Always false here. */
export const autoFillHasBrandAssets = (_result?: unknown): boolean => false;
