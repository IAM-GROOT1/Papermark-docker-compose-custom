/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Decorative browser chrome around a branding preview iframe. Kept as a light wrapper so the preview itself still renders.
 */
import { ReactNode } from "react";

export function BrandingPreviewChrome({
  urlLabel,
  children,
}: {
  /** Preview identity, used by the enterprise version to pick a demo route. */
  name?: string;
  basePath?: string;
  urlLabel?: string;
  params?: Record<string, string>;
  children?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      {urlLabel ? (
        <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs text-muted-foreground dark:border-gray-800 dark:bg-gray-900">
          {urlLabel}
        </div>
      ) : null}
      {children}
    </div>
  );
}
