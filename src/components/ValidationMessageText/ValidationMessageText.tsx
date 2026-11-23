import type { FC } from "react";
import { Box } from "@mui/material";
import styles from "./ValidationMessageText.module.css";
import { TEXT_DIRECTIONS } from "../../constants/direction.constant";
import { segmentValidationMessage } from "../../utilities/validation-message.utility";

interface IValidationMessageTextProps {
  text: string;
}

const ValidationMessageText: FC<IValidationMessageTextProps> = ({ text }) => {
  const segments = segmentValidationMessage(text);
  return (
    <Box component="span" dir={TEXT_DIRECTIONS.RTL} className={styles.message}>
      {segments.map(segment => {
        if (!segment.technical) {
          return segment.text;
        }

        return (
          <Box component="bdi" key={segment.start} dir={TEXT_DIRECTIONS.LTR}>
            {segment.text}
          </Box>
        );
      })}
    </Box>
  );
};
export default ValidationMessageText;
