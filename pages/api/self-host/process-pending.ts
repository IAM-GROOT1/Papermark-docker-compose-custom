import { NextApiRequest, NextApiResponse } from "next";

import { ONE_HOUR } from "@/lib/constants";
import { getFile } from "@/lib/files/get-file";
import prisma from "@/lib/prisma";

/**
 * [self-host] Stand-in for the Trigger.dev `convert-pdf-to-image-route` task.
 *
 * The hosted product dispatches PDF page rendering to Trigger.dev. A self-hosted
 * stack has no Trigger.dev, so uploaded PDFs would sit forever with
 * `hasPages = false` and never render in the viewer.
 *
 * This endpoint performs the same orchestration in-process: for each document
 * version that is still waiting on conversion it asks `/api/mupdf/get-pages`
 * for the page count, then walks the pages through `/api/mupdf/convert-page`
 * (which renders each page and writes the `DocumentPage` rows), and finally
 * flips `hasPages`.
 *
 * The `worker` container in docker-compose.yml polls this endpoint. It is a
 * loop, not a queue: it is deliberately simple, single-flight and idempotent.
 *
 * POST with `Authorization: Bearer ${INTERNAL_API_KEY}`.
 */

export const config = {
  // Rendering a large PDF page by page takes a while.
  maxDuration: 3600,
};

// How many document versions to pick up in one poll.
const BATCH_SIZE = 3;
// Give up on a version that has been failing for longer than this, so a single
// broken upload cannot block the queue forever.
const MAX_AGE_HOURS = 24;

// Pages rendered per request. A 520-page document takes minutes to convert, and
// Node closes a request after `server.requestTimeout` (5 minutes by default),
// which would kill the run mid-document. Rendering a bounded slice per poll and
// resuming on the next one keeps every request short. Already-rendered pages
// are skipped, so this is naturally resumable.
const MAX_PAGES_PER_RUN = Number(
  process.env.SELF_HOSTED_PAGES_PER_RUN || 40,
);

let running = false;

type PendingVersion = {
  id: string;
  documentId: string;
  versionNumber: number;
  file: string;
  storageType: any;
  numPages: number | null;
  teamId: string | null;
};

const internalFetch = (path: string, body: unknown) =>
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
    },
  });

async function convertVersion(version: PendingVersion) {
  const { id: documentVersionId, documentId, teamId } = version;

  if (!teamId) {
    throw new Error(`Document ${documentId} has no team`);
  }

  const signedUrl = await getFile({
    type: version.storageType,
    data: version.file,
    expiresIn: ONE_HOUR,
  });

  if (!signedUrl) {
    throw new Error(`Could not sign a URL for version ${documentVersionId}`);
  }

  let numPages = version.numPages;

  if (!numPages || numPages === 1) {
    const response = await internalFetch("/api/mupdf/get-pages", {
      url: signedUrl,
    });

    if (!response.ok) {
      throw new Error(
        `get-pages failed for ${documentVersionId} (status ${response.status})`,
      );
    }

    const { numPages: numPagesResult } = (await response.json()) as {
      numPages: number;
    };

    if (!numPagesResult || numPagesResult < 1) {
      throw new Error(`get-pages returned no pages for ${documentVersionId}`);
    }

    numPages = numPagesResult;
  }

  // Pages already rendered by an earlier, interrupted run are skipped so a
  // restart resumes instead of redoing the whole document.
  const existingPages = await prisma.documentPage.findMany({
    where: { versionId: documentVersionId },
    select: { pageNumber: true },
  });
  const done = new Set(existingPages.map((page) => page.pageNumber));

  let renderedThisRun = 0;

  for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
    if (done.has(pageNumber)) continue;

    if (renderedThisRun >= MAX_PAGES_PER_RUN) {
      // Out of budget for this request; the next poll picks up where we left
      // off. Deliberately leaves hasPages false so the document is not shown
      // half-rendered.
      console.log(
        `[self-host worker] ${documentVersionId}: ${done.size + renderedThisRun}/${numPages} pages, continuing next poll`,
      );
      return { numPages, complete: false };
    }

    const response = await internalFetch("/api/mupdf/convert-page", {
      documentVersionId,
      pageNumber,
      url: signedUrl,
      teamId,
    });

    if (!response.ok) {
      throw new Error(
        `convert-page ${pageNumber}/${numPages} failed for ${documentVersionId} (status ${response.status})`,
      );
    }

    renderedThisRun++;
    if (pageNumber % 25 === 0 || pageNumber === numPages) {
      console.log(
        `[self-host worker] ${documentVersionId}: page ${pageNumber}/${numPages}`,
      );
    }
  }

  // Every page is present — safe to publish.
  await prisma.documentVersion.update({
    where: { id: documentVersionId },
    data: { numPages, hasPages: true, isPrimary: true },
  });

  await prisma.documentVersion.updateMany({
    where: {
      documentId,
      versionNumber: { not: version.versionNumber },
    },
    data: { isPrimary: false },
  });

  try {
    await fetch(
      `${process.env.NEXTAUTH_URL}/api/revalidate?secret=${process.env.REVALIDATE_TOKEN}&documentId=${documentId}`,
    );
  } catch (error) {
    // The pages are stored either way; a stale cache is not worth failing over.
    console.error("[self-host worker] revalidate failed:", error);
  }

  return { numPages, complete: true };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (process.env.SELF_HOSTED_WORKER !== "true") {
    return res.status(404).json({ error: "Not found" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!process.env.INTERNAL_API_KEY || token !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Single-flight. The worker polls on a fixed interval and a big document can
  // easily outlast one interval; overlapping runs would duplicate work.
  if (running) {
    return res.status(200).json({ skipped: "already running" });
  }
  running = true;

  try {
    const pending = (await prisma.documentVersion.findMany({
      where: {
        hasPages: false,
        type: "pdf",
        createdAt: {
          gte: new Date(Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE,
      select: {
        id: true,
        documentId: true,
        versionNumber: true,
        file: true,
        storageType: true,
        numPages: true,
        document: { select: { teamId: true } },
      },
    })) as any[];

    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const row of pending) {
      const version: PendingVersion = { ...row, teamId: row.document?.teamId };
      try {
        const { numPages, complete } = await convertVersion(version);
        if (complete) {
          console.log(
            `[self-host worker] converted ${version.id} (${numPages} pages)`,
          );
        }
        results.push({ id: version.id, ok: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`[self-host worker] ${version.id} failed: ${message}`);
        results.push({ id: version.id, ok: false, error: message });
      }
    }

    return res.status(200).json({ processed: results.length, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[self-host worker] poll failed:", message);
    return res.status(500).json({ error: message });
  } finally {
    running = false;
  }
}
