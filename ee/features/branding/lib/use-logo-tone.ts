/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Samples an uploaded logo to decide whether the surrounding chip should be light or dark. Without the enterprise image analysis we return the same shape with a fixed tone; callers destructure { tone, imgProps }.
 */
import type { ImgHTMLAttributes } from "react";

export type LogoToneValue = "light" | "dark";

export type LogoTone = {
  tone: LogoToneValue;
  /** Spread onto the <img> that renders the logo. */
  imgProps: ImgHTMLAttributes<HTMLImageElement>;
};

/**
 * "dark" is the documented default at the call sites: it yields a white chip,
 * which suits the majority of logos and avoids a black flash on first paint.
 */
export function useLogoTone(_src?: string | null): LogoTone {
  return { tone: "dark", imgProps: {} };
}
