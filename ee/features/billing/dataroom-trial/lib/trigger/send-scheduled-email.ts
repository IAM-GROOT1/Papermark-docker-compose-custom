/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Dataroom trial lifecycle emails. Self-hosted has no trials or billing, so these tasks exist only to satisfy the imports.
 */
import { task } from "@trigger.dev/sdk";

type TrialEmailPayload = { teamId?: string; email?: string; dataroomId?: string };

const skip = async (_payload: TrialEmailPayload) => ({
  skipped: "dataroom trials are disabled on self-hosted",
});

export const sendDataroomTrialInfoEmailTask = task({
  id: "send-dataroom-trial-info-email",
  run: skip,
});

export const sendDataroomTrial24hReminderEmailTask = task({
  id: "send-dataroom-trial-24h-reminder-email",
  run: skip,
});

export const sendDataroomTrialExpiredEmailTask = task({
  id: "send-dataroom-trial-expired-email",
  run: skip,
});
