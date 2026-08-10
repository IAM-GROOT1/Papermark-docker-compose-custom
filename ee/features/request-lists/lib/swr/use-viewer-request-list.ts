/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. SWR hook for the viewer's request list. Reports the feature as off.
 */
export type ViewerRequestList = {
  id: string;
  name: string;
  items: unknown[];
} | null;

export type UseViewerRequestListArgs = {
  linkId?: string;
  dataroomId?: string;
  viewerId?: string;
  isPreview?: boolean;
};

export function useViewerRequestList(_args?: UseViewerRequestListArgs) {
  return {
    /** Drives whether the viewer renders any request-list affordances. */
    enabled: false,
    requestList: null as ViewerRequestList,
    items: [] as unknown[],
    loading: false,
    error: undefined as unknown,
    mutate: async () => undefined,
  };
}
