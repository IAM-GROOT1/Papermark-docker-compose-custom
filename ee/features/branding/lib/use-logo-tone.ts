/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Samples an uploaded logo to decide whether surrounding chrome should go light or dark. Without the enterprise image analysis we report 'unknown', which callers treat as 'leave the chrome alone'.
 */
export type LogoTone = "light" | "dark" | "unknown";

export function useLogoTone(_src?: string | null): LogoTone {
  return "unknown";
}
