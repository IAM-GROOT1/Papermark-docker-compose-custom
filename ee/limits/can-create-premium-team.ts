/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Team-count limits are a billing concept. Self-hosted has no billing, so nothing is capped and nobody is a billing admin.
 */
export const PREMIUM_TEAM_LIMIT = Number.POSITIVE_INFINITY;

export async function getPremiumTeamEligibility(_userId?: string) {
  return {
    eligible: true,
    canCreate: true,
    /** Whether the user is subject to the premium-admin team cap. */
    isPremiumAdmin: false,
    limit: PREMIUM_TEAM_LIMIT,
    count: 0,
    reason: null as string | null,
  };
}
