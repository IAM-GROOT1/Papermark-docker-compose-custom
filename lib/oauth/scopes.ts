/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Scope vocabulary for API tokens. These strings are the ones the token UI offers and the v1 API checks against.
 */
export const GRANULAR_SCOPES = [
  "documents.read",
  "documents.write",
  "links.read",
  "links.write",
  "datarooms.read",
  "datarooms.write",
  "analytics.read",
  "webhooks.read",
  "webhooks.write",
  "teams.read",
] as const;

export type GranularScope = (typeof GRANULAR_SCOPES)[number];

export const PRESET_SCOPES: Record<string, readonly string[]> = {
  all: GRANULAR_SCOPES,
  read_only: GRANULAR_SCOPES.filter((s) => s.endsWith(".read")),
};
