import { theme as genAirTheme } from "../../constants/theme.constants";

// GenAir's blue and white mapping for the Smartbase component source.

export const theme = {
  colors: {
    white: genAirTheme.palette.white,
    ink: genAirTheme.palette.charcoal,
    danger: genAirTheme.palette.danger,
    deepPurple: genAirTheme.palette.primary,
    violet: genAirTheme.palette.primary,
    lightPurple: genAirTheme.palette.primary,
  },
  border: {
    natural: genAirTheme.border.natural,
    segmented: genAirTheme.glass.border,
    subtle: genAirTheme.glass.border,
  },
  background: {
    purpleGradient: genAirTheme.glass.gradient,
    brandGradient: genAirTheme.glass.gradient,
    progressTrack: genAirTheme.palette.airBlue,
    progressFill: genAirTheme.glass.gradient,
  },
  shadow: {
    dark: "rgba(15, 23, 42, 0.25)",
    default: genAirTheme.glass.shadowSmall,
  },
  text: {
    segmentedInactive: genAirTheme.palette.charcoal,
    primary: genAirTheme.palette.charcoal,
    secondary: genAirTheme.palette.textMuted,
  },
  status: {
    info: genAirTheme.palette.primary,
    error: genAirTheme.palette.danger,
    warning: genAirTheme.colors.warning,
    success: genAirTheme.colors.success,
  },
} as const;
