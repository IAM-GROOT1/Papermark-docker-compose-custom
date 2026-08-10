/**
 * [self-host] Reconstructed module.
 *
 * Papermark's public repo imports this path but ships it only in their private
 * enterprise repo, so upstream `main` does not compile. The viewer's Q&A sidebar. The provider and layout pass their children straight through, and the hook reports 'no sidebar', which every consumer already handles via optional chaining.
 */
import { ReactNode } from "react";

export type ConversationSidebarContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export function ConversationSidebarProvider({
  children,
}: {
  children?: ReactNode;
}) {
  return <>{children}</>;
}

export function ConversationSidebarLayout({
  children,
}: {
  children?: ReactNode;
  [key: string]: any;
}) {
  return <>{children}</>;
}

/** Null means "no conversation sidebar mounted" — the safe variant by design. */
export function useConversationSidebarSafe(): ConversationSidebarContextValue | null {
  return null;
}
