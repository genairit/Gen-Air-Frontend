const PALETTE = {
  white: "#FFFFFF",
  danger: "#DE4040",
  primary: "#1668BD",
  outline: "#C9CBD1",
  divider: "#E2E3E8",
  airBlue: "#E1EDFA",
  charcoal: "#0F172A",
  iceWhite: "#F8FAFC",
  textBody: "#0F172A",
  textMuted: "#64748B",
  statusBlue: "#3E7BC4",
  statusGray: "#8A8D93",
  primaryHover: "#0F5CA8",
  surfaceHover: "#EFF6FD",
  placeholder: "#64748B",
  errorSurface: "#FFF1F0",
  sidebarMuted: "#A3A6AD",
  disabledText: "#B5B7BC",
  mobileNavDot: "#4A4D52",
  dangerSurface: "#FFE5E3",
  airBlueStrong: "#B8D3F2",
  airBlueOutline: "#A7C6EA",
  spinnerTrack: "#D6D7DC",
} as const;

const GLASS_BORDER = "#E2E8F0";

export const theme = {
  background: {
    lightGray: "#F8FAFC",
    purpleGradient: "linear-gradient(135deg, #0F5CA8 0%, #1668BD 100%)",
    flippedPurpleGradient: "linear-gradient(135deg, #1668BD 0%, #0F5CA8 100%)",
  },
  colors: {
    info: "#262E3A",
    error: "#DE4040",
    white: "#FFFFFF",
    black: "#000000",
    purple: "#1668BD",
    warning: "#DEA140",
    success: "#5ADE40",
    lightPurple: "#1F7FDB",
  },
  palette: PALETTE,
  button: {
    primary: "#1668BD",
    secondary: "#E1EDFA",
  },
  border: {
    primary: "#262E3A",
    natural: "#E5E5EA",
  },
  shadow: {
    default: "#e0e0e0",
    card: "0 10px 32px -10px rgba(15, 23, 42, 0.18), 0 2px 8px -2px rgba(15, 23, 42, 0.08)",
    secondary: "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
  },
  radius: {
    card: "22px",
    pill: "999px",
    panel: "20px",
    badge: "14px",
    checkbox: "7px",
  },
  controlHeight: {
    large: 56,
    medium: 48,
    compact: 44,
  },
  font: {
    body: "'Rubik', 'Heebo', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  glass: {
    edge: `inset 0 0 0 1px ${GLASS_BORDER}`,
    selectedEdge: `inset 0 0 0 1px ${PALETTE.primary}`,
    card: "rgba(255, 255, 255, 0.82)",
    strong: "rgba(255, 255, 255, 0.94)",
    rim: "rgba(255, 255, 255, 0.72)",
    border: GLASS_BORDER,
    blur: "blur(16px) saturate(160%)",
    shadow:
      "0 10px 32px -10px rgba(15, 23, 42, 0.18), 0 2px 8px -2px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    shadowSmall: "0 4px 14px -6px rgba(15, 23, 42, 0.16)",
    focus: "0 0 0 3px rgba(22, 104, 189, 0.18)",
    gradient: "linear-gradient(135deg, #0F5CA8 0%, #1668BD 100%)",
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
