/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Sample dataroom content used to populate the branding preview. An empty dataset renders an empty preview.
 */
export type DataroomPreviewDataset = {
  folders: { id: string; name: string }[];
  documents: { id: string; name: string; type: string }[];
};

export const getDataroomPreviewDataset = (
  _preset?: string,
): DataroomPreviewDataset => ({ folders: [], documents: [] });
