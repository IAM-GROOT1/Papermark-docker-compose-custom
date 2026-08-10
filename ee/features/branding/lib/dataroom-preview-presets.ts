/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Sample content used to populate the dataroom branding preview. An empty dataset renders an empty preview; the shape matches what the preview page reads off it.
 */
export type PreviewFolder = {
  id: string;
  name: string;
  parentId: string | null;
};

export type PreviewDocument = {
  id: string;
  name: string;
  type: string;
  folderName: string | null;
  dataroomDocumentId: string;
  downloadOnly: boolean;
  canDownload: boolean;
  hierarchicalIndex: string | null;
  versions: { id: string; hasPages: boolean; numPages: number | null }[];
};

export type DataroomPreviewDataset = {
  folders: PreviewFolder[];
  documents: PreviewDocument[];
};

export const getDataroomPreviewDataset = (
  _preset?: string,
): DataroomPreviewDataset => ({ folders: [], documents: [] });
