import type { FC } from "react";
import { Box } from "@mui/material";
import styles from "./ValidationMessageText.module.css";
import { segmentValidationMessage } from "../../utilities/validation-message.utility";

interface IValidationMessageTextProps {
  text: string;
}

const ValidationMessageText: FC<IValidationMessageTextProps> = ({ text }) => {
  const segments = segmentValidationMessage(text);
  return (
    <Box dir="rtl" component="span" className={styles.message}>
      {segments.map(segment => {
        if (!segment.technical) {
          return segment.text;
        }

        return (
          <Box dir="ltr" component="bdi" key={segment.start}>
            {segment.text}
          </Box>
        );
      })}
    </Box>
  );
};
export default ValidationMessageText;
