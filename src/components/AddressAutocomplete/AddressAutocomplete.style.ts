import {
  ADDRESS_FIELD_STATUSES,
  type AddressFieldStatusType,
} from "../../constants/project-address.constant";

import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import { createFocusRing } from "../../utilities/shadow.utility";

const { palette, softShadow, radius } = theme;

interface IFieldSurface {
  outline: string;
  boxShadow: string;
  backgroundColor: string;
}

const RESTING_SURFACE: IFieldSurface = {
  outline: "none",
  boxShadow: softShadow.insetField,
  backgroundColor: palette.iceWhite,
};

const ACTIVE_SURFACE: IFieldSurface = {
  ...RESTING_SURFACE,
  boxShadow: `${softShadow.insetField}, ${createFocusRing(palette.airBlueOutline)}`,
};

const FIELD_SURFACE_BY_STATUS: Record<AddressFieldStatusType, IFieldSurface> = {
  [ADDRESS_FIELD_STATUSES.IDLE]: RESTING_SURFACE,
  [ADDRESS_FIELD_STATUSES.TYPING]: ACTIVE_SURFACE,
  [ADDRESS_FIELD_STATUSES.SUGGESTIONS]: ACTIVE_SURFACE,
  [ADDRESS_FIELD_STATUSES.UNVERIFIED]: {
    ...RESTING_SURFACE,
    outline: `2px dashed ${palette.danger}`,
  },
  [ADDRESS_FIELD_STATUSES.VERIFIED]: {
    outline: "none",
    backgroundColor: palette.errorSurface,
    boxShadow: `${softShadow.insetError}, ${createFocusRing(palette.primary)}`,
  },
};

const PILL_BADGE = {
  gap: "8px",
  height: 36,
  fontSize: 13,
  flexShrink: 0,
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: radius.pill,
};

const STATUS_PANEL = {
  gap: "10px",
  display: "flex",
  flexWrap: "wrap",
  padding: "12px 18px",
  alignItems: "center",
  borderRadius: radius.panel,
  justifyContent: "space-between",
} as const;

export const useStyles = () =>
  createStyles({
    container: {
      gap: "10px",
      display: "flex",
      position: "relative",
      flexDirection: "column",
    },
    field: (status: AddressFieldStatusType) => ({
      ...FIELD_SURFACE_BY_STATUS[status],
      gap: "12px",
      height: 60,
      display: "flex",
      padding: "0 20px",
      outlineOffset: -2,
      alignItems: "center",
      borderRadius: radius.pill,
      transition: "box-shadow 0.2s ease",
    }),
    input: {
      flex: 1,
      minWidth: 0,
      height: "100%",
      fontSize: 16,
      border: "none",
      outline: "none",
      textAlign: "start",
      color: palette.charcoal,
      fontFamily: "inherit",
      backgroundColor: "transparent",
      "&::placeholder": { color: palette.placeholder, opacity: 1 },
    },
    verifiedBadge: {
      ...PILL_BADGE,
      color: palette.white,
      padding: "0 6px 0 14px",
      backgroundColor: palette.primary,
    },
    verifiedMark: {
      width: 24,
      height: 24,
      fontSize: 15,
      fontWeight: 800,
      display: "inline-flex",
      alignItems: "center",
      color: palette.primary,
      justifyContent: "center",
      borderRadius: radius.pill,
      backgroundColor: palette.white,
    },
    unverifiedBadge: {
      ...PILL_BADGE,
      color: palette.danger,
      padding: "0 8px 0 14px",
      boxShadow: softShadow.insetSmall,
      backgroundColor: palette.iceWhite,
    },
    hint: {
      fontSize: 12,
      flexShrink: 0,
      color: palette.textMuted,
    },
    suggestions: {
      left: 0,
      right: 0,
      zIndex: 20,
      gap: "2px",
      padding: "8px",
      margin: 0,
      listStyle: "none",
      display: "flex",
      top: "calc(100% + 8px)",
      position: "absolute",
      flexDirection: "column",
      borderRadius: radius.card,
      boxShadow: softShadow.elevated,
      backgroundColor: palette.iceWhite,
    },
    suggestion: (isActive: boolean) => ({
      gap: "14px",
      display: "flex",
      cursor: "pointer",
      padding: "12px 14px",
      alignItems: "center",
      borderRadius: "18px",
      backgroundColor: isActive ? palette.airBlue : "transparent",
      "&:hover": { backgroundColor: palette.airBlue },
    }),
    suggestionText: {
      gap: "1px",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    suggestionMain: {
      fontSize: 15,
      fontWeight: 700,
    },
    suggestionSecondary: {
      fontSize: 13,
      color: palette.textMuted,
    },
    listMessage: {
      fontSize: 14,
      padding: "16px 14px",
      color: palette.textMuted,
    },
    listFooter: {
      fontSize: 11,
      display: "flex",
      padding: "8px 14px 6px",
      color: palette.textMuted,
      justifyContent: "space-between",
    },
    verifiedPanel: {
      ...STATUS_PANEL,
      backgroundColor: palette.airBlue,
    },
    failurePanel: {
      ...STATUS_PANEL,
      boxShadow: softShadow.inset,
    },
    panelText: {
      gap: "2px",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    panelTitle: (isFailure: boolean) => ({
      fontSize: 14,
      fontWeight: 700,
      color: isFailure ? palette.danger : palette.charcoal,
    }),
    panelLine: {
      fontSize: 13,
      overflowWrap: "anywhere",
    },
    panelHint: {
      fontSize: 13,
      color: palette.textMuted,
    },
  });
