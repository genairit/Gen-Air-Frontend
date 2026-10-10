import { createStyles } from "../../create-styles";

const useStyles = () =>
  createStyles({
    signatureContainer: {
      "& .MuiSvgIcon-root": {
        width: "80 !important",
        fill: "none !important",
        height: "48 !important",
      },
      position: "relative",
      borderRadius: "13px",
      backgroundColor: "#F4F4F4",
      width: "100%",
      height: "300px",
      display: "flex",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    signatureIcon: { fontSize: "70px", fill: "none" },
    clearButton: {
      color: "#5459FF",
      position: "absolute",
      top: "1.2rem",
      left: "0.8rem",
      backgroundColor: "#DDDEFF !important",
      boxShadow: "none",
      borderRadius: "20%",
      pointerEvents: "unset !important" as "unset",
      fontFamily: "Rubik",
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
