/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Feature gate for request lists — off on a self-hosted instance.
 */
export function useRequestListFeatureEnabled(): boolean {
  return false;
}
