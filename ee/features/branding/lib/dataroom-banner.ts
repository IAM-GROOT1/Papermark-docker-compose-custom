/**
 * [self-host] Reconstructed module — see ./brand-logo.ts for why.
 *
 * A dataroom banner is stored as a single string column, so the renderer has to
 * work out what it is: an uploaded image, an uploaded video, a YouTube link, or
 * nothing at all. Consumers: components/view/dataroom/dataroom-banner-media.tsx
 * and pages/room_ppreview_demo.tsx.
 */

export type DataroomBannerKind = "none" | "image" | "video" | "youtube";

export type ClassifiedDataroomBanner = {
  kind: DataroomBannerKind;
  src: string | null;
  youtubeId: string | null;
};

const NONE: ClassifiedDataroomBanner = {
  kind: "none",
  src: null,
  youtubeId: null,
};

// Sentinel written by the branding UI to mean "explicitly no banner", as
// distinct from "never set one".
const NO_BANNER_SENTINEL = "no-banner";

const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i;

/** Extracts the id from the YouTube URL shapes people actually paste. */
const parseYoutubeId = (url: URL): string | null => {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id || null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = url.searchParams.get("v");
    if (v) return v;

    // /embed/<id>, /shorts/<id>, /live/<id>
    const m = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/);
    if (m) return m[1];
  }

  return null;
};

export const classifyDataroomBanner = (
  src: string | null | undefined,
): ClassifiedDataroomBanner => {
  if (!src || src === NO_BANNER_SENTINEL) return NONE;

  const trimmed = src.trim();
  if (!trimmed) return NONE;

  let url: URL | null = null;
  try {
    url = new URL(trimmed, "http://localhost");
  } catch {
    url = null;
  }

  if (url) {
    const youtubeId = parseYoutubeId(url);
    if (youtubeId) {
      return { kind: "youtube", src: trimmed, youtubeId };
    }
  }

  if (VIDEO_EXTENSIONS.test(trimmed)) {
    return { kind: "video", src: trimmed, youtubeId: null };
  }

  return { kind: "image", src: trimmed, youtubeId: null };
};
