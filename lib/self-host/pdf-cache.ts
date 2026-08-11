/**
 * [self-host] Keeps the source PDF in memory across page renders.
 *
 * /api/mupdf/convert-page takes a signed URL and downloads the whole document
 * to render one page. That is fine on the hosted product, where pages fan out
 * across parallel workers close to the bucket. Converting a 520-page, 100MB PDF
 * on one box, though, means downloading 52GB to produce 520 images.
 *
 * Every page in a run is signed with the same URL, so a one-entry cache removes
 * effectively all of that. Deliberately one entry: the whole point is to bound
 * memory, and documents convert one at a time here.
 */

type CacheEntry = {
  url: string;
  data: ArrayBuffer;
  expiresAt: number;
};

const TTL_MS = Number(process.env.SELF_HOSTED_PDF_CACHE_TTL_MS || 15 * 60_000);

// Above this, skip the cache entirely rather than pin a huge buffer in memory.
const MAX_CACHEABLE_BYTES = Number(
  process.env.SELF_HOSTED_PDF_CACHE_MAX_BYTES || 600 * 1024 * 1024,
);

let entry: CacheEntry | null = null;
// Collapses concurrent requests for the same URL into a single download.
let inFlight: { url: string; promise: Promise<ArrayBuffer> } | null = null;

const isFresh = (candidate: CacheEntry | null, url: string): boolean =>
  !!candidate && candidate.url === url && candidate.expiresAt > Date.now();

export const clearPdfCache = () => {
  entry = null;
};

export async function fetchPdfCached(url: string): Promise<ArrayBuffer> {
  if (isFresh(entry, url)) {
    return entry!.data;
  }

  if (inFlight && inFlight.url === url) {
    return inFlight.promise;
  }

  const promise = (async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF (HTTP ${response.status} ${response.statusText})`,
      );
    }

    const data = await response.arrayBuffer();

    if (data.byteLength <= MAX_CACHEABLE_BYTES) {
      // Replaces any previous document; only one is ever held.
      entry = { url, data, expiresAt: Date.now() + TTL_MS };
    } else {
      entry = null;
    }

    return data;
  })();

  inFlight = { url, promise };
  try {
    return await promise;
  } finally {
    if (inFlight?.promise === promise) inFlight = null;
  }
}
