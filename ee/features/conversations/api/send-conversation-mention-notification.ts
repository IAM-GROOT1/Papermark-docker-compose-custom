/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Background job for @-mention notifications in dataroom Q&A.
 */
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  // Nothing to notify about: Q&A conversations are not available here.
  return res.status(200).json({ skipped: "conversations not available" });
}
