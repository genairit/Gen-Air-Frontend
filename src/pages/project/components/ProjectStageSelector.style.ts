import { createStyles } from "../../../create-styles";

export const PROJECT_STAGE_SELECTOR_STYLES = createStyles({
  control: {
    width: 320,
    "@media (min-width:900px)": {
      "& > div:first-of-type": {
        display: "grid",
        gridTemplateColumns: "max-content minmax(0,1fr)",
        alignItems: "center",
        gap: "10px",
      },
      "& label": { margin: 0 },
      "& > div:first-of-type > label + div": { minHeight: 36 },
      "& [role=combobox]": { minHeight: 36 },
    },
    maxWidth: "100%",
  },
});
