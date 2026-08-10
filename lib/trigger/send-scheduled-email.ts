/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Scheduled lifecycle email. Shaped like a real task so imports and payloads typecheck, but it never runs without Trigger.dev.
 */
import { task } from "@trigger.dev/sdk";

export type ScheduledEmailPayload = {
  to?: string;
  teamId?: string;
  email?: string;
  [key: string]: unknown;
};

export const sendUpgradeOneMonthCheckinEmailTask = task({
  id: "send-upgrade-one-month-checkin-email",
  run: async (_payload: ScheduledEmailPayload) => ({
    skipped: "lifecycle emails are disabled on self-hosted",
  }),
});
