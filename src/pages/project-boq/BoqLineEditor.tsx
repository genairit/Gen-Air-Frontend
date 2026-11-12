import {
  PROJECT_BOQ_BASIS,
  PROJECT_BOQ_REVIEW,
  PROJECT_BOQ_COST_PATTERN,
  PROJECT_BOQ_QUANTITY_PATTERN,
} from "../../constants/project-boq.constant";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import Button from "../../components/Button/Button";
import TextField from "../../components/TextField/TextField";
import InlineError from "../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import type { IBoqLine, IBoqLineEdit } from "../../interfaces/project-boq.interface";
import { FIELD_TYPES } from "../../components/TextField/constants/textfield.constants";

interface IProps {
  line: IBoqLine;
  revision: number;
  canManage: boolean;
  onSave: (lineId: string, edit: IBoqLineEdit) => Promise<void>;
}

const BoqLineEditor = ({ line, revision, onSave, canManage }: IProps) => {
  const [quantity, setQuantity] = useState(line.requiredQuantity ?? "");
  const [cost, setCost] = useState(line.estimatedUnitCost ?? "");
  const [notes, setNotes] = useState(line.notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const changed =
    quantity !== (line.requiredQuantity ?? "") ||
    cost !== (line.estimatedUnitCost ?? "") ||
    notes !== line.notes;
  const valid =
    (quantity === "" || PROJECT_BOQ_QUANTITY_PATTERN.test(quantity)) &&
    (cost === "" || PROJECT_BOQ_COST_PATTERN.test(cost)) &&
    notes.length <= 1000;
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(line.id, {
        expectedRevision: revision,
        requiredQuantity: quantity || null,
        estimatedUnitCost: cost || null,
        reviewState: quantity ? PROJECT_BOQ_REVIEW.CONFIRMED : PROJECT_BOQ_REVIEW.PENDING,
        notes,
      });
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(180px,2fr) repeat(3,minmax(100px,1fr)) minmax(140px,1fr) auto",
        gap: 1.5,
        alignItems: "end",
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        minWidth: 740,
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{line.materialName}</Typography>
        <Typography variant="caption">
          {line.materialCode} · {line.materialSpecification ?? "ללא מפרט"} ·{" "}
          {line.sourceBasis === PROJECT_BOQ_BASIS.MANUAL
            ? "נוסף ידנית"
            : line.sourceBasis === PROJECT_BOQ_BASIS.FIXED
              ? "לפי קטלוג"
              : "נדרשת בדיקה"}
        </Typography>
      </Box>
      <TextField
        value={quantity}
        disabled={!canManage}
        onChange={setQuantity}
        placeholder="לא נקבעה"
        type={FIELD_TYPES.NUMBER}
        title={`כמות (${line.materialUnit})`}
      />
      <TextField
        value={cost}
        onChange={setCost}
        disabled={!canManage}
        placeholder="לא הוזנה"
        type={FIELD_TYPES.NUMBER}
        title="עלות יחידה משוערת ₪"
      />
      <Box>
        <Typography variant="caption">סה״כ משוער</Typography>
        <Typography>
          {line.estimatedLineCost === null
            ? "—"
            : `₪${Number(line.estimatedLineCost).toLocaleString("he-IL")}`}
        </Typography>
      </Box>
      <TextField
        value={notes}
        title="הערת תכנון"
        onChange={setNotes}
        disabled={!canManage}
        type={FIELD_TYPES.TEXT}
      />
      {canManage && (
        <Button
          text="שמור"
          onClick={save}
          isLoading={saving}
          disabled={!changed || !valid || saving}
        />
      )}
      {error && (
        <Box sx={{ gridColumn: "1 / -1" }}>
          <InlineError message={error} />
        </Box>
      )}
    </Box>
  );
};
export default BoqLineEditor;
