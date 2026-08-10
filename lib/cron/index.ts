import { Receiver } from "@upstash/qstash";
import { Client } from "@upstash/qstash";
import Bottleneck from "bottleneck";

import { lazyClient } from "@/lib/self-host/lazy-client";

// we're using Bottleneck to avoid running into Resend's rate limit of 10 req/s
export const limiter = new Bottleneck({
  maxConcurrent: 1, // maximum concurrent requests
  minTime: 100, // minimum time between requests in ms
});

// we're using Upstash's Receiver to verify the request signature
export const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
});

/**
 * [self-host] Whether QStash is available to schedule background jobs.
 *
 * A self-hosted instance normally has no QStash account, and callers that
 * publish unconditionally turn every signup into a logged stack trace.
 */
export const isQstashConfigured = () => !!process.env.QSTASH_TOKEN;

// [self-host] Lazy: the QStash client throws from its constructor when no token
// is set, which aborted `next build` while collecting page data. QStash is only
// used for scheduled jobs, which a self-hosted instance does not run.
export const qstash = lazyClient(
  () =>
    new Client({
      token: process.env.QSTASH_TOKEN || "",
    }),
);
