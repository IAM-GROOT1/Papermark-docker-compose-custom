/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Scheduled lifecycle email (one-month check-in). Defined as a real task so the module shape matches, but it never runs without Trigger.dev.
 */
import { task } from "@trigger.dev/sdk";

export const sendUpgradeOneMonthCheckinEmailTask = task({
  id: "send-upgrade-one-month-checkin-email",
  run: async (_payload: { teamId?: string; email?: string }) => {
    return { skipped: "lifecycle emails are disabled on self-hosted" };
  },
});
