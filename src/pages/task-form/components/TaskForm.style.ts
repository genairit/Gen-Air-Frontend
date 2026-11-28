import type { CSSProperties } from "react";
import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MUTED_CAPTION } from "../../../styles/templates.style";

const { palette, glass } = theme;

type UrgencySurfaceKeyType = "idle" | "regular" | "urgent";

const URGENCY_OPTION_SURFACES = {
  idle: {
    color: palette.charcoal,
    backgroundColor: palette.iceWhite,
    boxShadow: glass.edge,
  },
  regular: {
    color: palette.charcoal,
    boxShadow: glass.selectedEdge,
    backgroundColor: palette.airBlue,
  },
  urgent: {
    color: palette.white,
    boxShadow: glass.edge,
    backgroundColor: palette.charcoal,
  },
} as const satisfies Record<UrgencySurfaceKeyType, CSSProperties>;

const toUrgencySurfaceKey = ({
  isSelected,
  isUrgent,
}: {
  isSelected: boolean;
  isUrgent: boolean;
}): UrgencySurfaceKeyType => {
  if (!isSelected) {
    return "idle";
  }

  return isUrgent ? "urgent" : "regular";
};

export const useStyles = () =>
  createStyles({
    projectContext: { ...MUTED_CAPTION, textAlign: "start" },
    error: {
      fontSize: 13,
      fontWeight: 600,
      color: palette.danger,
    },
    hint: {
      ...MUTED_CAPTION,
      fontSize: 12,
    },
    urgencyOption: ({ isSelected, isUrgent }: { isSelected: boolean; isUrgent: boolean }) => ({
      gap: "14px",
      flex: "1 1 180px",
      display: "flex",
      cursor: "pointer",
      textAlign: "start",
      padding: "10px 14px",
      borderRadius: "20px",
      alignItems: "center",
      fontFamily: theme.font.body,
      ...URGENCY_OPTION_SURFACES[toUrgencySurfaceKey({ isSelected, isUrgent })],
    }),
    urgencyOptions: {
      gap: "10px",
      display: "flex",
      flexWrap: "wrap",
    },
    urgencyText: {
      gap: "2px",
      display: "flex",
      flexDirection: "column",
    },
    previewLead: {
      fontSize: 14,
      fontWeight: 700,
    },
  });
