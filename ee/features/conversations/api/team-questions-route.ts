/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Dataroom Q&A API. Reports the feature as unavailable.
 */
import { NextApiRequest, NextApiResponse } from "next";

export async function handleRoute(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return res.status(501).json({
    error:
      "Dataroom Q&A is an enterprise feature and is not available on this self-hosted instance.",
  });
}
