import { createStyles } from "../../create-styles";
import { theme } from "../../constants/theme.constants";

const useStyles = () =>
  createStyles({
    signatureContainer: {
      "& .MuiSvgIcon-root": {
        width: "80 !important",
        fill: "none !important",
        height: "48 !important",
      },
      position: "relative",
      borderRadius: "17px",
      border: `1px solid ${theme.glass.border}`,
      backgroundColor: theme.palette.white,
      width: "100%",
      height: "300px",
      display: "flex",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    signatureIcon: { fontSize: "70px", fill: "none" },
    clearButton: {
      color: theme.palette.primary,
      position: "absolute",
      top: "1.2rem",
      left: "0.8rem",
      backgroundColor: `${theme.palette.airBlue} !important`,
      boxShadow: "none",
      borderRadius: "12px",
      pointerEvents: "unset !important" as "unset",
      fontFamily: theme.font.body,
      "&.Mui-disabled": {
        backgroundColor: "#E1E1E1 !important",
        color: "#717171",
      },
    },
    signatureCanvas: {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
    },
  });

export default useStyles;
