import { createStyles } from "../../../create-styles";
import { theme } from "../../../constants/theme.constants";
import { CENTERED_FLEX, MUTED_CAPTION } from "../../../styles/templates.style";
import type { TCustomerSyncStepState } from "../../../interfaces/customer.interface";

const { palette, softShadow, radius } = theme;

const BADGE_BY_STATE: Record<TCustomerSyncStepState, { background: string; color: string }> = {
  done: { background: palette.primary, color: palette.white },
  failed: { background: palette.charcoal, color: palette.white },
  active: { background: palette.iceWhite, color: palette.charcoal },
};

export const useStyles = () =>
  createStyles({
    step: {
      gap: "14px",
      minWidth: 0,
      display: "flex",
      padding: "14px 16px",
      alignItems: "center",
      borderRadius: radius.panel,
      boxShadow: softShadow.inset,
    },
    badge: (state: TCustomerSyncStepState) => ({
      ...CENTERED_FLEX,
      width: 36,
      height: 36,
      flexShrink: 0,
      fontSize: 15,
      fontWeight: 800,
      borderRadius: "50%",
      color: BADGE_BY_STATE[state].color,
      backgroundColor: BADGE_BY_STATE[state].background,
      boxShadow: state === "active" ? softShadow.raisedSmall : "none",
    }),
    text: {
      gap: "2px",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
    },
    title: {
      fontSize: 15,
      fontWeight: 700,
    },
    caption: {
      ...MUTED_CAPTION,
      fontSize: 12,
    },
  });
