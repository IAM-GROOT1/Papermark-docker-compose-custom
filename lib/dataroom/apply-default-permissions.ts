/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. Group/permission defaults for newly attached dataroom documents. Granular dataroom permissions are an enterprise feature; without them every viewer already sees everything the link grants, so applying defaults is a no-op.
 */
export async function applyDataroomDocumentPermissionDefaults(
  ..._args: any[]
): Promise<void> {
  // No granular permission groups on this instance — nothing to apply.
}

export async function onDataroomDocumentsAttached(
  ..._args: any[]
): Promise<void> {
  // Hook point for permission propagation; intentionally inert.
}
