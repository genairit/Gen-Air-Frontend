import { Box } from "@mui/material";
import EstimateSection from "./EstimateSection";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import EstimateProjectPicker from "./EstimateProjectPicker";
import TextField from "../../../components/TextField/TextField";
import { useRef, useState, type FC, type FormEvent } from "react";
import { useElementFocus } from "../../../hooks/element-focus.hook";
import InlineError from "../../../components/InlineError/InlineError";
import { BUTTON_TYPES } from "../../../constants/button-type.constant";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useCreateEstimate } from "../../../hooks/engineering-estimate.hook";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { ESTIMATE_NAME_MAX_LENGTH } from "../../../constants/engineering-estimate.constant";
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

  useElementFocus(nameRef, true);

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    create.mutate({ name: trimmedName, projectId }, { onSuccess: onCreated });
  };

  return (
    <EstimateSection title="פרטי כתב הכמויות">
      <Box
        component="form"
        onSubmit={submit}
        aria-label="כתב כמויות חדש"
        sx={styles.stack({ gap: "20px" })}
      >
        <Box sx={styles.grid({ minColumnWidth: 240, gap: "20px" })}>
          <TextField
            required
            isRequired
            value={name}
            onChange={setName}
            inputRef={nameRef}
            title="שם כתב הכמויות"
            type={FIELD_TYPES.TEXT}
            disabled={create.isPending}
            maxLength={ESTIMATE_NAME_MAX_LENGTH}
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
    </EstimateSection>
  );
};

export default EstimateCreateForm;
