/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile.
 *
 * Sample content for the dataroom branding preview. The preview page feeds
 * these rows straight into the real <FolderCard> and <DocumentCard>, so the
 * types are the Prisma ones rather than hand-written look-alikes — that way
 * the shapes cannot drift from what those components expect. The dataset
 * itself is empty, so the preview renders an empty room.
 */
import type { DataroomFolder, DocumentVersion } from "@prisma/client";

export type PreviewFolder = DataroomFolder;

export type PreviewDocument = {
  id: string;
  name: string;
  type: string;
  folderName: string | null;
  dataroomDocumentId: string;
  downloadOnly: boolean;
  canDownload: boolean;
  hierarchicalIndex: string | null;
  versions: DocumentVersion[];
};

export type DataroomPreviewDataset = {
  folders: PreviewFolder[];
  documents: PreviewDocument[];
};

export const getDataroomPreviewDataset = (
  _preset?: string,
): DataroomPreviewDataset => ({ folders: [], documents: [] });
