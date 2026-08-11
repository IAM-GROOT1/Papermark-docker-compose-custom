/**
 * [self-host] There is no billing here, so "free" is the wrong default.
 *
 * Papermark gates almost every link setting — password, expiry, email
 * verification, allow/deny lists, watermark, screenshot protection — on the
 * team's Stripe plan. A self-hosted instance has no Stripe account, so the team
 * sits on `free` forever and the settings people actually self-host *for* are
 * permanently behind an upgrade modal that can never be completed.
 *
 * Papermark, Inc. sells those features. Enabling them here is only defensible
 * because this fork exists to run the AGPL code on your own hardware for your
 * own documents — it is not a way to resell the product. If you are deploying
 * this commercially, buy a licence.
 *
 * Set SELF_HOSTED_PLAN="free" to opt back into upstream's gating.
 */

/** Plans as understood by lib/swr/use-billing.ts. */
export const SELF_HOSTED_DEFAULT_PLAN = "datarooms-plus";

export const getSelfHostedPlan = (): string =>
  process.env.SELF_HOSTED_PLAN?.trim() || SELF_HOSTED_DEFAULT_PLAN;

/** Whether to report the configured plan instead of whatever is in the DB. */
export const isSelfHostedPlanOverrideEnabled = (): boolean =>
  getSelfHostedPlan() !== "free";

const numberFromEnv = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  if (raw.trim().toLowerCase() === "unlimited") return Infinity;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Upload ceilings, in MB except where noted.
 *
 * These are served to the browser through /api/teams/[teamId]/limits, so they
 * can be changed with a container restart — no image rebuild.
 */
export const getSelfHostedFileSizeLimits = () => ({
  document: numberFromEnv("SELF_HOSTED_MAX_DOCUMENT_MB", 1024),
  video: numberFromEnv("SELF_HOSTED_MAX_VIDEO_MB", 2048),
  image: numberFromEnv("SELF_HOSTED_MAX_IMAGE_MB", 256),
  excel: numberFromEnv("SELF_HOSTED_MAX_EXCEL_MB", 256),
  maxFiles: numberFromEnv("SELF_HOSTED_MAX_FILES", 500),
  maxPages: numberFromEnv("SELF_HOSTED_MAX_PAGES", 10000),
});

/** Counts, not sizes. Infinity means "no cap". */
export const getSelfHostedPlanLimits = () => ({
  users: numberFromEnv("SELF_HOSTED_MAX_USERS", Infinity),
  links: numberFromEnv("SELF_HOSTED_MAX_LINKS", Infinity),
  documents: numberFromEnv("SELF_HOSTED_MAX_DOCUMENTS", Infinity),
  domains: numberFromEnv("SELF_HOSTED_MAX_DOMAINS", Infinity),
  datarooms: numberFromEnv("SELF_HOSTED_MAX_DATAROOMS", Infinity),
  customDomainOnPro: true,
  customDomainInDataroom: true,
  advancedLinkControlsOnPro: true,
  watermarkOnBusiness: true,
  agreementOnBusiness: true,
  conversationsInDataroom: true,
  linkCustomFields: numberFromEnv("SELF_HOSTED_MAX_LINK_CUSTOM_FIELDS", 100),
  fileSizeLimits: getSelfHostedFileSizeLimits(),
});
