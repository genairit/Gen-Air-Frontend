import type { FC } from "react";
import TextField from "../../../components/TextField/TextField";
import { PROJECT_FORM_COPY } from "../../../constants/project-form.constant";
import { FIELD_INPUT_LIMITS } from "../../../constants/field-validation.constant";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IProjectNotesCardProps {
  notes: string;
  onChange: (notes: string) => void;
}

const ProjectNotesCard: FC<IProjectNotesCardProps> = ({ notes, onChange }) => (
  <TextField
    multiline
    minRows={3}
    value={notes}
    onChange={onChange}
    type={FIELD_TYPES.TEXT}
    title={PROJECT_FORM_COPY.NOTES_LABEL}
    titleHint={PROJECT_FORM_COPY.NOTES_SUBTITLE}
    placeholder={PROJECT_FORM_COPY.NOTES_PLACEHOLDER}
    maxLength={FIELD_INPUT_LIMITS.PROJECT_NOTES_CHARACTERS}
  />
);

export default ProjectNotesCard;
