import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const { palette, softShadow, radius } = theme;

export const useStyles = () =>
  createStyles({
    container: ({ disabled }: { disabled: boolean }) => ({
      gap: "12px",
      fontSize: 15,
      minHeight: 48,
      display: "flex",
      alignItems: "center",
      width: "fit-content",
      opacity: disabled ? 0.5 : 1,
      color: palette.charcoal,
      cursor: disabled ? "default" : "pointer",
    }),
    track: ({ checked }: { checked: boolean }) => ({
      width: 60,
      height: 32,
      flexShrink: 0,
      padding: "4px",
      display: "flex",
      transition: "all 0.2s ease",
      borderRadius: radius.pill,
      boxShadow: softShadow.insetTrack,
      justifyContent: checked ? "flex-start" : "flex-end",
      backgroundColor: checked ? palette.airBlue : palette.iceWhite,
    }),
    knob: ({ checked }: { checked: boolean }) => ({
      width: 24,
      height: 24,
      borderRadius: radius.pill,
      boxShadow: softShadow.knob,
      backgroundColor: checked ? palette.primary : palette.white,
    }),
  });
