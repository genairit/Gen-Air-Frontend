import {
  STAGE_REASON_COPY,
  STAGE_REASON_FIELD_ID,
  STAGE_REASON_SLOT_PROPS,
} from "../../constants/project-stage.constant";

import type { FC } from "react";
import TextField from "../TextField/TextField";
import { FIELD_TYPES } from "../TextField/constants/textfield.constants";
import { toStageReasonValidator } from "../../utilities/stage-reason.utility";
import { FIELD_INPUT_LIMITS } from "../../constants/field-validation.constant";

interface IStageReasonFieldProps {
  value: string;
  disabled?: boolean;
  autoFocus?: boolean;
  isErrorRevealed: boolean;
  onChange: (value: string) => void;
}

const StageReasonField: FC<IStageReasonFieldProps> = ({
  value,
  disabled,
  onChange,
  autoFocus,
  isErrorRevealed,
}) => (
  <TextField
    multiline
    isRequired
    minRows={3}
    value={value}
    showCharCounter
    disabled={disabled}
    onChange={onChange}
    autoFocus={autoFocus}
    type={FIELD_TYPES.TEXT}
    id={STAGE_REASON_FIELD_ID}
    title={STAGE_REASON_COPY.LABEL}
    infoText={STAGE_REASON_COPY.HELPER}
    slotProps={STAGE_REASON_SLOT_PROPS}
    placeholder={STAGE_REASON_COPY.PLACEHOLDER}
    validator={toStageReasonValidator(isErrorRevealed)}
    maxLength={FIELD_INPUT_LIMITS.STAGE_NOTE_CHARACTERS}
  />
);

export default StageReasonField;
