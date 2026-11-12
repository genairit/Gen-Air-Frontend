import type { FC, ReactNode } from "react";
import { useStyles } from "./FieldLabel.style";
import { Box, Typography } from "@mui/material";

interface IFieldLabelProps {
  title: string;
  hint?: string;
  htmlFor?: string;
  hasError?: boolean;
  action?: ReactNode;
  isRequired?: boolean;
}

const FieldLabel: FC<IFieldLabelProps> = ({
  hint,
  title,
  htmlFor,
  action,
  hasError = false,
  isRequired = false,
}) => {
  const styles = useStyles();

  return (
    <Box sx={styles.container}>
      <Typography
        sx={styles.title({ hasError })}
        component={htmlFor ? "label" : "span"}
        {...(htmlFor ? { htmlFor } : {})}
      >
        {title}
        {isRequired && (
          <Box component="span" sx={styles.requiredMark}>
            {" *"}
          </Box>
        )}
        {hint && <Box component="span" sx={styles.hint}>{` ${hint}`}</Box>}
      </Typography>
      {action}
    </Box>
  );
};

export default FieldLabel;
