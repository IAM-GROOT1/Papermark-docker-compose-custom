/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Restricted (subject-bound) API tokens. The schema and parser are real; revocation is a no-op because this instance never mints subject-bound tokens.
 */
import { z } from "zod";

export const RestrictedTokenSubjectTypeSchema = z.enum(["user", "team"]);

export type RestrictedTokenSubjectType = z.infer<
  typeof RestrictedTokenSubjectTypeSchema
>;

export const parseRestrictedTokenSubjectType = (
  value: unknown,
): RestrictedTokenSubjectType => {
  const parsed = RestrictedTokenSubjectTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : "user";
};

/** No user-bound team tokens exist here, so there is nothing to revoke. */
export async function revokeUserBoundTeamTokens(..._args: any[]) {
  return { count: 0 };
}
