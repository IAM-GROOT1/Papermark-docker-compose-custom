/**
 * [self-host] Reconstructed module — see ./brand-logo.ts for why.
 *
 * Resolves the Open Graph / favicon metadata for a public link. Precedence,
 * taken from the call site in lib/api/links/link-data.ts:
 *
 *   1. the link's own custom metatags, when enableCustomMetatag is on
 *   2. the brand-level "custom link preview" (dataroom overrides team),
 *      when customLinkPreviewEnabled is on
 *   3. sensible defaults
 */

export type ResolvedPublicLinkMeta = {
  enableCustomMetatag: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaImage: string | null;
  metaFavicon: string | null;
};

type LinkMeta = {
  enableCustomMetatag?: boolean | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImage?: string | null;
  metaFavicon?: string | null;
};

type BrandLinkPreview = {
  customLinkPreviewEnabled?: boolean | null;
  linkPreviewTitle?: string | null;
  linkPreviewDescription?: string | null;
  linkPreviewImage?: string | null;
  linkPreviewFavicon?: string | null;
} | null | undefined;

const DEFAULT_FAVICON = "/favicon.ico";

export const resolvePublicLinkMeta = ({
  link,
  teamBrand,
  dataroomBrand,
  defaultTitle,
}: {
  link: LinkMeta;
  teamBrand?: BrandLinkPreview;
  dataroomBrand?: BrandLinkPreview;
  defaultTitle: string;
}): ResolvedPublicLinkMeta => {
  // Per-link overrides win outright.
  if (link.enableCustomMetatag) {
    return {
      enableCustomMetatag: true,
      metaTitle: link.metaTitle ?? defaultTitle,
      metaDescription: link.metaDescription ?? null,
      metaImage: link.metaImage ?? null,
      metaFavicon: link.metaFavicon ?? DEFAULT_FAVICON,
    };
  }

  // Otherwise the most specific brand that has the feature switched on.
  const brand = dataroomBrand?.customLinkPreviewEnabled
    ? dataroomBrand
    : teamBrand?.customLinkPreviewEnabled
      ? teamBrand
      : null;

  if (brand) {
    return {
      enableCustomMetatag: true,
      metaTitle: brand.linkPreviewTitle ?? defaultTitle,
      metaDescription: brand.linkPreviewDescription ?? null,
      metaImage: brand.linkPreviewImage ?? null,
      metaFavicon: brand.linkPreviewFavicon ?? DEFAULT_FAVICON,
    };
  }

  return {
    enableCustomMetatag: false,
    metaTitle: defaultTitle,
    metaDescription: null,
    metaImage: null,
    metaFavicon: DEFAULT_FAVICON,
  };
};
