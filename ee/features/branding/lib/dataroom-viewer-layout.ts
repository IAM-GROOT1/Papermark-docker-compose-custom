/**
 * [self-host] Reconstructed module — see ./brand-logo.ts for why.
 *
 * The vocabulary of the dataroom viewer layout. Every value below is one the
 * rest of the tree already compares against (dataroom-viewer.tsx, document-card,
 * folder-card, nav-dataroom, branding.tsx) or that the Prisma schema defaults
 * to, so these unions are the real ones rather than a guess.
 */
import { z } from "zod";

export const DataroomCardLayoutSchema = z.enum(["LIST", "GRID", "COMPACT"]);
export type DataroomCardLayout = z.infer<typeof DataroomCardLayoutSchema>;

export const DataroomViewerHeaderStyleSchema = z.enum([
  "DEFAULT",
  "SPLIT",
  "NOTION",
]);
export type DataroomViewerHeaderStyle = z.infer<
  typeof DataroomViewerHeaderStyleSchema
>;

export const DataroomViewerLayoutPresetSchema = z.enum([
  "STANDARD",
  "STRICT",
  "MODERN",
  "NOTION",
  "CUSTOM",
]);
export type DataroomViewerLayoutPreset = z.infer<
  typeof DataroomViewerLayoutPresetSchema
>;

/** The presets a user can actually pick; CUSTOM is only ever inferred. */
export type DataroomLayoutCardId = Exclude<DataroomViewerLayoutPreset, "CUSTOM">;

export const CARD_LAYOUT_OPTIONS: {
  value: DataroomCardLayout;
  label: string;
}[] = [
  { value: "LIST", label: "List" },
  { value: "GRID", label: "Grid" },
  { value: "COMPACT", label: "Compact" },
];

/** Coerce a free-form DB string into the union, falling back to the default. */
export const asDataroomCardLayout = (value: unknown): DataroomCardLayout => {
  const parsed = DataroomCardLayoutSchema.safeParse(value);
  return parsed.success ? parsed.data : "LIST";
};

export const asDataroomViewerHeaderStyle = (
  value: unknown,
): DataroomViewerHeaderStyle => {
  const parsed = DataroomViewerHeaderStyleSchema.safeParse(value);
  return parsed.success ? parsed.data : "DEFAULT";
};

type LayoutShape = {
  cardLayout: DataroomCardLayout;
  showFolderTree: boolean;
  hideFolderIconsInMain: boolean;
  viewerHeaderStyle: DataroomViewerHeaderStyle;
};

// Mirrors applyLayoutPreset() in pages/branding.tsx exactly — the two have to
// agree or the UI would show "Custom" immediately after applying a preset.
const PRESETS: Record<DataroomLayoutCardId, LayoutShape> = {
  STANDARD: {
    cardLayout: "LIST",
    showFolderTree: true,
    viewerHeaderStyle: "DEFAULT",
    hideFolderIconsInMain: false,
  },
  STRICT: {
    cardLayout: "COMPACT",
    showFolderTree: false,
    viewerHeaderStyle: "DEFAULT",
    hideFolderIconsInMain: true,
  },
  MODERN: {
    cardLayout: "COMPACT",
    showFolderTree: false,
    viewerHeaderStyle: "SPLIT",
    hideFolderIconsInMain: true,
  },
  NOTION: {
    cardLayout: "GRID",
    showFolderTree: false,
    viewerHeaderStyle: "NOTION",
    hideFolderIconsInMain: false,
  },
};

/** Which named preset (if any) a given combination of settings corresponds to. */
export const inferDataroomViewerLayoutPreset = (
  layout: LayoutShape,
): DataroomViewerLayoutPreset => {
  for (const [id, preset] of Object.entries(PRESETS) as [
    DataroomLayoutCardId,
    LayoutShape,
  ][]) {
    if (
      preset.cardLayout === layout.cardLayout &&
      preset.showFolderTree === layout.showFolderTree &&
      preset.viewerHeaderStyle === layout.viewerHeaderStyle &&
      preset.hideFolderIconsInMain === layout.hideFolderIconsInMain
    ) {
      return id;
    }
  }
  return "CUSTOM";
};
