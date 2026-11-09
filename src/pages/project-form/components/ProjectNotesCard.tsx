import type { FC } from "react";
import Card from "../../../components/Card/Card";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { PROJECT_FORM_COPY } from "../../../constants/project-form.constant";
import { FIELD_INPUT_LIMITS } from "../../../constants/field-validation.constant";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IProjectNotesCardProps {
  notes: string;
  onChange: (notes: string) => void;
}

const ProjectNotesCard: FC<IProjectNotesCardProps> = ({ notes, onChange }) => (
  <Card gap="16px">
    <CardHeader
      icon={ICON_NAMES.DOCUMENT}
      title={PROJECT_FORM_COPY.NOTES_TITLE}
      subtitle={PROJECT_FORM_COPY.NOTES_SUBTITLE}
    />
    <TextField
      multiline
      minRows={5}
      value={notes}
      onChange={onChange}
      type={FIELD_TYPES.TEXT}
      title={PROJECT_FORM_COPY.NOTES_LABEL}
      placeholder={PROJECT_FORM_COPY.NOTES_PLACEHOLDER}
      maxLength={FIELD_INPUT_LIMITS.PROJECT_NOTES_CHARACTERS}
    />
  </Card>
);

export default ProjectNotesCard;
