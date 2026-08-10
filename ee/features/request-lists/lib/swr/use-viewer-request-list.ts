/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. SWR hook for the viewer's request list. Reports 'nothing to show'.
 */
export type ViewerRequestList = {
  id: string;
  name: string;
  items: unknown[];
} | null;

export function useViewerRequestList(..._args: any[]) {
  return {
    requestList: null as ViewerRequestList,
    items: [] as unknown[],
    loading: false,
    error: undefined as unknown,
    mutate: async () => undefined,
  };
}
