import { Box } from "@mui/material";
import { useState, type FC } from "react";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import TextField from "../../../components/TextField/TextField";
import type { IEstimateArea } from "../../../interfaces/engineering-estimate.interface";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { validEstimateRepeatCount } from "../../../utilities/engineering-estimate.utility";

interface IEstimateAreaUpdateProps {
  busy: boolean;
  area: IEstimateArea;
  onChange: (area: IEstimateArea) => void;
}

const EstimateAreaUpdate: FC<IEstimateAreaUpdateProps> = ({ area, busy, onChange }) => {
  const styles = usePageStyles();
  const [name, setName] = useState(area.name);
  const [repeats, setRepeats] = useState(String(area.repeatCount));
  const trimmedName = name.trim();
  const repeatCount = Number(repeats);
  const unchanged = area.name === trimmedName && area.repeatCount === repeatCount;
  const blocked = busy || unchanged || !trimmedName || !validEstimateRepeatCount(repeatCount);
  const save = (): void => {
    if (blocked) {
      return;
    }

    onChange({ ...area, name: trimmedName, repeatCount });
  };

  return (
    <Box sx={styles.stack({ gap: "8px" })}>
      <TextField
        value={name}
        maxLength={120}
        disabled={busy}
        onChange={setName}
        title="שם האזור הנבחר"
        type={FIELD_TYPES.TEXT}
      />
      <TextField
        value={repeats}
        disabled={busy}
        onChange={setRepeats}
        type={FIELD_TYPES.NUMBER}
        title="מספר החזרות באזור הנבחר"
      />
      <Button onClick={save} text="שמירת אזור" disabled={blocked} />
    </Box>
  );
};

export default EstimateAreaUpdate;
