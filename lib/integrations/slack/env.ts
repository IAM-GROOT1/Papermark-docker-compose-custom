import { z } from "zod";

export const envSchema = z.object({
  SLACK_APP_INSTALL_URL: z.string(),
  SLACK_CLIENT_ID: z.string(),
  SLACK_CLIENT_SECRET: z.string(),
  SLACK_INTEGRATION_ID: z.string(),
});

type SlackEnv = z.infer<typeof envSchema>;

let env: SlackEnv | undefined;

/**
 * [self-host] Whether a Slack app is configured at all.
 *
 * Callers used to discover this by catching the throw below, which meant a
 * stack trace in the logs on every document view for an integration nobody
 * had set up.
 */
export const isSlackConfigured = () => envSchema.safeParse(process.env).success;

export const getSlackEnv = () => {
  if (env) {
    return env;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      "Slack app environment variables are not configured properly.",
    );
  }

  env = parsed.data;

  return env;
};
