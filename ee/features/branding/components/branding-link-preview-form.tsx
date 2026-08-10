/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Editor for the custom link preview (OG tags + favicon). Enterprise-only, so it renders nothing — but the props are typed, because callers pass inline callbacks that would otherwise be implicitly `any`.
 */
export function BrandingLinkPreviewForm(_props: {
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  title?: string | null;
  onTitleChange?: (title: string) => void;
  description?: string | null;
  onDescriptionChange?: (description: string) => void;
  imageUrl?: string | null;
  onImageChange?: (url: string | null) => void;
  faviconUrl?: string | null;
  onFaviconChange?: (url: string | null) => void;
  inheritanceHint?: string;
  [key: string]: unknown;
}) {
  return null;
}
