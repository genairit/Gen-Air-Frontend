import { useState, type FC } from "react";
import { Box, Typography } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import TextField from "../../../components/TextField/TextField";
import { CommandIdentityManager } from "../../../managers/command-identity.manager";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import type { IEstimateArea } from "../../../interfaces/engineering-estimate.interface";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { validEstimateRepeatCount } from "../../../utilities/engineering-estimate.utility";

interface IEstimateAreaEditorProps {
  busy: boolean;
  areas: IEstimateArea[];
  onChange: (areas: IEstimateArea[]) => void;
}

const EstimateAreaEditor: FC<IEstimateAreaEditorProps> = ({ busy, areas, onChange }) => {
  const styles = usePageStyles();
  const [name, setName] = useState("");
  const [repeats, setRepeats] = useState("1");
  const count = Number(repeats);
  const trimmedName = name.trim();
  const validCount = validEstimateRepeatCount(count);
  const addBlocked = busy || !validCount || !trimmedName;
  const addArea = (): void => {
    if (addBlocked) {
      return;
    }

    onChange([
      ...areas,
      { id: CommandIdentityManager.create(), name: trimmedName, repeatCount: count, lines: [] },
    ]);
  };

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      {areas.map((area): React.JSX.Element => (
        <Typography key={area.id}>
          {area.name} · {area.repeatCount} יחידות
        </Typography>
      ))}
      <TextField
        value={name}
        maxLength={120}
        disabled={busy}
        onChange={setName}
        type={FIELD_TYPES.TEXT}
        title="שם אזור או טיפוס"
        placeholder="למשל חדר סטנדרטי"
      />
      <TextField
        value={repeats}
        disabled={busy}
        title="מספר חזרות"
        onChange={setRepeats}
        type={FIELD_TYPES.NUMBER}
      />
      <Button
        text="הוספת אזור"
        onClick={addArea}
        disabled={addBlocked}
        variant={BUTTON_VARIANTS.SECONDARY}
      />
    </Box>
  );
};

export default EstimateAreaEditor;
