import type { CSSProperties } from "react";
import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { MUTED_CAPTION } from "../../../styles/templates.style";

const { palette, softShadow } = theme;

type UrgencySurfaceKeyType = "idle" | "regular" | "urgent";

const URGENCY_OPTION_SURFACES = {
  idle: {
    color: palette.charcoal,
    backgroundColor: palette.iceWhite,
    boxShadow: softShadow.raisedCompact,
  },
  regular: {
    color: palette.charcoal,
    boxShadow: softShadow.inset,
    backgroundColor: palette.airBlue,
  },
  urgent: {
    color: palette.white,
    boxShadow: softShadow.inset,
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
    createLink: {
      color: palette.charcoal,
      textDecoration: "none",
      padding: "10px 16px",
      borderRadius: "999px",
      fontSize: 13,
      fontWeight: 600,
      boxShadow: softShadow.raisedCompact,
    },
    typeField: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      borderRadius: "20px",
      padding: "16px 18px",
      boxShadow: softShadow.inset,
    },
    fieldLabel: {
      gap: "4px",
      fontSize: 14,
      fontWeight: 700,
      display: "flex",
    },
    required: {
      color: palette.primary,
    },
    list: {
      gap: "6px",
      display: "flex",
      padding: "8px",
      borderRadius: "20px",
      flexDirection: "column",
      boxShadow: softShadow.inset,
    },
    option: {
      gap: "8px 14px",
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      textAlign: "start",
      alignItems: "center",
      borderRadius: "16px",
      padding: "10px 14px",
      justifyContent: "space-between",
      fontFamily: theme.font.body,
      color: palette.charcoal,
      "&:hover": { backgroundColor: palette.airBlue },
    },
    optionText: {
      gap: "2px",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    optionName: {
      fontSize: 15,
      fontWeight: 700,
    },
    caption: MUTED_CAPTION,
    selected: {
      gap: "12px",
      display: "flex",
      flexWrap: "wrap",
      padding: "14px 18px",
      borderRadius: "18px",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: softShadow.inset,
    },
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
      flex: "1 1 240px",
      display: "flex",
      cursor: "pointer",
      textAlign: "start",
      padding: "16px 18px",
      borderRadius: "20px",
      alignItems: "center",
      fontFamily: theme.font.body,
      ...URGENCY_OPTION_SURFACES[toUrgencySurfaceKey({ isSelected, isUrgent })],
    }),
    actionRow: {
      gap: "16px",
      display: "flex",
      flexWrap: "wrap",
    },
    urgencyOptions: {
      gap: "16px",
      display: "flex",
      flexWrap: "wrap",
    },
    urgencyText: {
      gap: "2px",
      display: "flex",
      flexDirection: "column",
    },
    context: {
      ...MUTED_CAPTION,
      gap: "10px",
      display: "flex",
      flexWrap: "wrap",
      padding: "10px 16px",
      borderRadius: "18px",
      alignItems: "center",
      boxShadow: softShadow.inset,
    },
    previewLead: {
      fontSize: 14,
      fontWeight: 700,
    },
  });
