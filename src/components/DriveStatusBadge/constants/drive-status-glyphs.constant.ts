import type { FC } from "react";
import type { DriveStatusBadgeStateType } from "../../../constants/drive-folder.constant";
import { EmptyGlyph, UnknownGlyph, LoadingGlyph, HasContentGlyph } from "../DriveStatusGlyphs";

export const DRIVE_STATUS_GLYPHS: Record<DriveStatusBadgeStateType, FC> = {
  empty: EmptyGlyph,
  unknown: UnknownGlyph,
  loading: LoadingGlyph,
  has_content: HasContentGlyph,
};
