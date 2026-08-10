/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. The redaction editor page. Shows an explanation instead of a blank screen, since a route renders this directly.
 */
export function RedactionWorkspace(_props: any) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <p className="max-w-md text-center text-sm text-muted-foreground">
        Document redaction is an enterprise feature and is not available on this
        self-hosted instance.
      </p>
    </div>
  );
}
