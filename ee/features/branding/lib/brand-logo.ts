/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this from `ee/features/branding`, but that
 * directory only exists in their private enterprise repo — so upstream `main`
 * does not build. This is a faithful reimplementation derived from the Prisma
 * schema and every call site in the tree.
 *
 * Semantics come straight from the schema:
 *   Brand.logo           String?
 *   Brand.hideLogo       Boolean  @default(false)
 *   DataroomBrand.logo   String?
 *   DataroomBrand.hideLogo Boolean?  // null inherits the team-level value
 */

export type BrandLogoFields = {
  logo: string | null;
  hideLogo: boolean;
};

export type ResolvedBrandLogo =
  | { kind: "custom"; src: string }
  | { kind: "papermark" }
  | { kind: "none" };

type LogoSource = {
  logo?: string | null;
  hideLogo?: boolean | null;
} | null | undefined;

/**
 * Flattens dataroom-level branding over team-level branding.
 *
 * `hideLogo` is deliberately `??` and not `||`: a dataroom that explicitly sets
 * it to `false` must override a team-level `true`, and only `null`/`undefined`
 * inherits.
 */
export const mergeBrandLogoFields = ({
  dataroom,
  team,
}: {
  dataroom?: LogoSource;
  team?: LogoSource;
}): BrandLogoFields => ({
  logo: dataroom?.logo ?? team?.logo ?? null,
  hideLogo: dataroom?.hideLogo ?? team?.hideLogo ?? false,
});

/**
 * Decides what the viewer chrome should show.
 *
 * `hideLogo` wins over everything — that is the point of the setting: show no
 * logo at all, not even the Papermark fallback.
 */
export const resolveBrandLogo = (brand: LogoSource): ResolvedBrandLogo => {
  if (brand?.hideLogo) {
    return { kind: "none" };
  }

  if (brand?.logo) {
    return { kind: "custom", src: brand.logo };
  }

  return { kind: "papermark" };
};
