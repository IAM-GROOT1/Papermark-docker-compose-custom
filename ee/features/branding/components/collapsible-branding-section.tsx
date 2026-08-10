/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. A collapsible wrapper on the branding page. Kept as a plain always-open section so the controls inside remain reachable.
 */
import { ReactNode } from "react";

export function CollapsibleBrandingSection({
  title,
  description,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  [key: string]: any;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </section>
  );
}
