import {
  createCssVariableReferences,
  createCssVariableDeclarations,
} from "../utilities/css-variable.utility";

import { createInsetShadow, createRaisedShadow } from "../utilities/shadow.utility";

const PALETTE = {
  white: "#FFFFFF",
  orange: "#FF5A36",
  danger: "#D8401F",
  outline: "#C9CBD1",
  divider: "#E2E3E8",
  airBlue: "#E1EDFA",
  charcoal: "#1E2022",
  iceWhite: "#F5F5F7",
  textBody: "#45484D",
  textMuted: "#6E7178",
  statusBlue: "#3E7BC4",
  statusGray: "#8A8D93",
  orangeHover: "#FF6A48",
  placeholder: "#9A9DA3",
  errorSurface: "#FFF4F1",
  sidebarMuted: "#A3A6AD",
  disabledText: "#B5B7BC",
  mobileNavDot: "#4A4D52",
  dangerSurface: "#FFE9E3",
  airBlueStrong: "#B8D3F2",
  airBlueOutline: "#A7C6EA",
  charcoalRaised: "#26292C",
} as const;

const SHADOW_COLORS = {
  light: PALETTE.white,
  dark: "#DCDCE2",
  deep: "#D2D2D8",
  hover: "#D6D6DC",
  error: "#F1D9D2",
  track: "#D2D6DD",
  disabled: "#E2E2E7",
  airBlueDark: "#C6D6E8",
  airBlueLight: "#F7FBFF",
  charcoalDark: "#16181A",
  charcoalLight: "#2E3236",
  navActive: "#B8C6D6",
  primaryGlow: "rgba(255, 90, 54, 0.30)",
  primaryPressed: "rgba(150, 40, 15, 0.35)",
  knob: "rgba(0, 0, 0, 0.18)",
} as const;

const surfaceShadow = { darkColor: SHADOW_COLORS.dark, lightColor: SHADOW_COLORS.light };

const SOFT_SHADOW_VARIABLE_PREFIX = "soft-shadow";

// stylis-plugin-rtl flips only the first box-shadow layer; CSS variables bypass it.
const SOFT_SHADOW_VALUES = {
  raised: createRaisedShadow({ ...surfaceShadow, offset: 8, blur: 18 }),
  raisedSmall: createRaisedShadow({ ...surfaceShadow, offset: 3, blur: 7 }),
  raisedMedium: createRaisedShadow({ ...surfaceShadow, offset: 5, blur: 12 }),
  raisedLarge: createRaisedShadow({ ...surfaceShadow, offset: 6, blur: 14 }),
  raisedCompact: createRaisedShadow({ ...surfaceShadow, offset: 4, blur: 10 }),
  raisedHover: createRaisedShadow({
    ...surfaceShadow,
    darkColor: SHADOW_COLORS.hover,
    offset: 8,
    blur: 18,
  }),
  elevated: createRaisedShadow({
    ...surfaceShadow,
    darkColor: SHADOW_COLORS.deep,
    offset: 10,
    blur: 24,
  }),
  raisedDark: createRaisedShadow({
    ...surfaceShadow,
    darkColor: SHADOW_COLORS.deep,
    offset: 5,
    blur: 12,
  }),
  inset: createInsetShadow({ ...surfaceShadow, offset: 3, blur: 7 }),
  insetSmall: createInsetShadow({ ...surfaceShadow, offset: 2, blur: 5 }),
  insetField: createInsetShadow({ ...surfaceShadow, offset: 4, blur: 9 }),
  insetDeep: createInsetShadow({ ...surfaceShadow, offset: 4, blur: 10 }),
  insetLarge: createInsetShadow({ ...surfaceShadow, offset: 5, blur: 12 }),
  insetError: createInsetShadow({
    ...surfaceShadow,
    darkColor: SHADOW_COLORS.error,
    offset: 4,
    blur: 9,
  }),
  insetTrack: createInsetShadow({
    ...surfaceShadow,
    darkColor: SHADOW_COLORS.track,
    offset: 3,
    blur: 6,
  }),
  insetDisabled: createInsetShadow({
    ...surfaceShadow,
    darkColor: SHADOW_COLORS.disabled,
    offset: 2,
    blur: 5,
  }),
  insetSelected: createInsetShadow({
    offset: 4,
    blur: 10,
    darkColor: SHADOW_COLORS.airBlueDark,
    lightColor: SHADOW_COLORS.airBlueLight,
  }),
  insetCharcoal: createInsetShadow({
    offset: 3,
    blur: 7,
    darkColor: SHADOW_COLORS.charcoalDark,
    lightColor: SHADOW_COLORS.charcoalLight,
  }),
  primary: createRaisedShadow({
    ...surfaceShadow,
    darkColor: SHADOW_COLORS.primaryGlow,
    offset: 5,
    blur: 12,
  }),
  primaryPressed: `inset 3px 3px 8px ${SHADOW_COLORS.primaryPressed}`,
  navActive: `inset 2px 2px 4px ${SHADOW_COLORS.navActive}`,
  pageActive: `inset 2px 2px 5px ${PALETTE.charcoal}`,
  knob: `2px 2px 5px ${SHADOW_COLORS.knob}`,
  progressFill: `inset 0 0 0 1px ${PALETTE.airBlueOutline}`,
};

export const SOFT_SHADOW_CSS_VARIABLES = createCssVariableDeclarations(
  SOFT_SHADOW_VALUES,
  SOFT_SHADOW_VARIABLE_PREFIX,
);

export const theme = {
  background: {
    lightGray: "#F6F8FB",
    purpleGradient: "linear-gradient(90deg, rgba(71, 118, 230, 1) 0%, rgba(142, 84, 233, 1) 100%)",
    flippedPurpleGradient:
      "linear-gradient(90deg, rgba(142, 84, 233, 1) 0%, rgba(71, 118, 230, 1) 100%)",
  },
  colors: {
    info: "#262E3A",
    error: "#DE4040",
    white: "#FFFFFF",
    black: "#000000",
    purple: "#5f42ff",
    warning: "#DEA140",
    success: "#5ADE40",
    lightPurple: "#707CDF",
  },
  palette: PALETTE,
  button: {
    primary: "#707CDF",
    secondary: "#9EA8F1",
  },
  border: {
    primary: "#262E3A",
    natural: "#E5E5EA",
  },
  shadow: {
    default: "#e0e0e0",
    card: "0 2px 12px rgba(0,0,0,0.06)",
    secondary: "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
  },
  softShadow: createCssVariableReferences(SOFT_SHADOW_VALUES, SOFT_SHADOW_VARIABLE_PREFIX),
  radius: {
    card: "24px",
    pill: "999px",
    panel: "20px",
    badge: "14px",
    checkbox: "9px",
  },
  controlHeight: {
    large: 56,
    medium: 48,
    compact: 44,
  },
  font: {
    body: "'Heebo', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  severity: {
    info: PALETTE.textMuted,
    warning: "#DEA140",
    error: PALETTE.danger,
  },
  text: {
    textfield: {
      default: "#262E3A",
      disabled: "#73737C",
    },
  },
} as const;
