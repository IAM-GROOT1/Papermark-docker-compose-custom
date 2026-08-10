/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Seat/team limits are billing concepts. Self-hosted has no billing, so nothing is capped.
 */
export const PREMIUM_TEAM_LIMIT = Number.POSITIVE_INFINITY;

export async function getPremiumTeamEligibility(..._args: any[]) {
  return {
    eligible: true,
    canCreate: true,
    limit: PREMIUM_TEAM_LIMIT,
    count: 0,
    reason: null as string | null,
  };
}
