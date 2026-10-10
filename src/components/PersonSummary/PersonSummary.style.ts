import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";
import type { SurfaceToneType } from "../../constants/tone.constant";

const { palette } = theme;

const TEXT_COLORS_BY_SURFACE: Record<SurfaceToneType, { name: string; caption: string }> = {
  light: { name: palette.charcoal, caption: palette.textMuted },
  dark: { name: palette.iceWhite, caption: palette.sidebarMuted },
};

export const useStyles = () =>
  createStyles({
    container: {
      gap: "12px",
      minWidth: 0,
      display: "flex",
      alignItems: "center",
    },
    text: {
      minWidth: 0,
      display: "flex",
      lineHeight: 1.3,
      flexDirection: "column",
    },
    name: ({ surface, nameSize }: { surface: SurfaceToneType; nameSize: number }) => ({
      gap: "6px",
      display: "flex",
      alignItems: "center",
      fontWeight: 700,
      fontSize: nameSize,
      color: TEXT_COLORS_BY_SURFACE[surface].name,
    }),
    caption: ({ surface }: { surface: SurfaceToneType }) => ({
      fontSize: 12,
      color: TEXT_COLORS_BY_SURFACE[surface].caption,
    }),
  });
