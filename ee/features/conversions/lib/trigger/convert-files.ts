/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Office/Keynote -> PDF conversion runs on Trigger.dev with a LibreOffice image. Only the task *types* are imported by the shipped code (for tasks.trigger<typeof ...>), so type-compatible declarations are enough; the dispatches themselves are guarded by lib/self-host/trigger-dispatch.ts.
 */
import { task } from "@trigger.dev/sdk";

type ConvertPayload = {
  documentId: string;
  documentVersionId: string;
  teamId: string;
};

export const convertFilesToPdfTask = task({
  id: "convert-files-to-pdf",
  run: async (_payload: ConvertPayload) => {
    throw new Error(
      "Office-to-PDF conversion is not available on this self-hosted instance.",
    );
  },
});

export const convertKeynoteToPdfTask = task({
  id: "convert-keynote-to-pdf",
  run: async (_payload: ConvertPayload) => {
    throw new Error(
      "Keynote-to-PDF conversion is not available on this self-hosted instance.",
    );
  },
});
