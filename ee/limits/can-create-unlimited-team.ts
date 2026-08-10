/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. See ./can-create-premium-team.ts — no billing, no cap.
 */
export async function canCreateUnlimitedTeam(..._args: any[]): Promise<boolean> {
  return true;
}
