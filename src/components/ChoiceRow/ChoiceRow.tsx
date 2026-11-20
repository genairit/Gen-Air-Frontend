import type { FC } from "react";
import { useStyles } from "./ChoiceRow.style";
import { mergeSx } from "../../utilities/sx.utility";
import { ButtonBase, type ButtonBaseProps } from "@mui/material";

const ChoiceRow: FC<ButtonBaseProps> = ({ sx, ...props }) => {
  const styles = useStyles();

  return <ButtonBase type="button" sx={mergeSx(styles.root, sx ?? null)} {...props} />;
};

export default ChoiceRow;
