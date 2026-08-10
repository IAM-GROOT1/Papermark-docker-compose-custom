/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Scope vocabulary for API tokens. Both lists are spread into one allow-list at the call site, so both must be flat arrays of scope strings.
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

/**
 * Coarse presets. "full-access" is the legacy value kept as an alias for
 * "apis.all" so tokens minted by older integrations keep working.
 */
export const PRESET_SCOPES = ["apis.all", "apis.read", "full-access"] as const;

export type PresetScope = (typeof PRESET_SCOPES)[number];
