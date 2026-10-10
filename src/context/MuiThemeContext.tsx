import { type FC } from "react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider, ThemeProvider } from "@emotion/react";
import { type IProviderProps } from "../interfaces/provider-props";
import { CssBaseline, GlobalStyles, createTheme } from "@mui/material";
import { theme, SOFT_SHADOW_CSS_VARIABLES } from "../constants/theme.constants";

const MUI_OVERRIDES = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: theme.font.body,
  },
  palette: {
    primary: { main: theme.palette.orange },
    secondary: { main: theme.palette.airBlue },
    background: { default: theme.palette.iceWhite, paper: theme.palette.iceWhite },
    text: { primary: theme.palette.charcoal, secondary: theme.palette.textMuted },
  },
});

const GLOBAL_STYLES = { ":root": SOFT_SHADOW_CSS_VARIABLES };

const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [rtlPlugin],
});

const MuiThemeProvider: FC<IProviderProps> = ({ children }) => {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={MUI_OVERRIDES}>
        <CssBaseline />
        <GlobalStyles styles={GLOBAL_STYLES} />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
};

export default MuiThemeProvider;
