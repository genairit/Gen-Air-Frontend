import {
  BUTTON_TYPES,
  BUTTON_VARIANTS,
} from "../../../components/Button/constants/button.constants";

import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import EstimateProjectPicker from "./EstimateProjectPicker";
import TextField from "../../../components/TextField/TextField";
import InlineError from "../../../components/InlineError/InlineError";
import { focusConnectedElement } from "../../../utilities/focus.utility";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useEffect, useRef, useState, type FC, type FormEvent } from "react";
import { useCreateEstimate } from "../../../hooks/engineering-estimate.hook";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { IEngineeringEstimate } from "../../../interfaces/engineering-estimate.interface";

interface IEstimateCreateFormProps {
  onCancel: () => void;
  canLinkProject: boolean;
  onCreated: (estimate: IEngineeringEstimate) => void;
}

const EstimateCreateForm: FC<IEstimateCreateFormProps> = ({
  canLinkProject,
  onCancel,
  onCreated,
}) => {
  const styles = usePageStyles();
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const create = useCreateEstimate();
  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !create.isPending;

  useEffect((): void => {
    focusConnectedElement(nameRef.current);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    create.mutate({ name: trimmedName, projectId }, { onSuccess: onCreated });
  };

  return (
    <Card>
      <Box
        component="form"
        onSubmit={submit}
        aria-label="כתב כמויות חדש"
        sx={styles.stack({ gap: "12px" })}
      >
        <Box sx={styles.grid({ minColumnWidth: 240, gap: "12px" })}>
          <TextField
            value={name}
            maxLength={160}
            onChange={setName}
            inputRef={nameRef}
            title="שם כתב הכמויות"
            type={FIELD_TYPES.TEXT}
            disabled={create.isPending}
          />
          {canLinkProject && (
            <EstimateProjectPicker
              value={projectId}
              onChange={setProjectId}
              disabled={create.isPending}
            />
          )}
        </Box>
        {create.isError && <InlineError message={getApiErrorMessage(create.error)} />}
        <Box sx={styles.row({ gap: "8px" })}>
          <Button
            disabled={!canSubmit}
            text="יצירת כתב כמויות"
            type={BUTTON_TYPES.SUBMIT}
            isLoading={create.isPending}
          />
          <Button
            text="ביטול"
            onClick={onCancel}
            disabled={create.isPending}
            variant={BUTTON_VARIANTS.SECONDARY}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default EstimateCreateForm;
