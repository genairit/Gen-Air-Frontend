import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import CardHeader from "../../../components/CardHeader/CardHeader";
import type { IApiProject } from "../../../interfaces/api.interface";
import InlineError from "../../../components/InlineError/InlineError";
import { toOptionalText } from "../../../utilities/apartment.utility";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { APARTMENT_PAGE_COPY } from "../../../constants/apartment.constant";
import { FIELD_INPUT_LIMITS } from "../../../constants/field-validation.constant";
import { useUpdateApartmentMutation } from "../../../hooks/mutations/apartment.mutation";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IApartmentNotesCardProps {
  canEdit: boolean;
  apartment: IApiProject;
}

const ApartmentNotesCard: FC<IApartmentNotesCardProps> = ({ canEdit, apartment }) => {
  const styles = usePageStyles();
  const [draft, setDraft] = useState(apartment.notes ?? "");
  const updateMutation = useUpdateApartmentMutation();

  const isDirty = draft !== (apartment.notes ?? "");
  const isSaved = updateMutation.isSuccess && !isDirty;

  const saveNotes = () =>
    updateMutation.mutate({ apartmentId: apartment.id, changes: { notes: toOptionalText(draft) } });

  return (
    <Card gap="16px">
      <CardHeader
        icon={ICON_NAMES.DOCUMENT}
        title={APARTMENT_PAGE_COPY.NOTES_TITLE}
        subtitle={APARTMENT_PAGE_COPY.NOTES_SUBTITLE}
      />
      <TextField
        multiline
        minRows={5}
        value={draft}
        onChange={setDraft}
        readonly={!canEdit}
        type={FIELD_TYPES.TEXT}
        placeholder={APARTMENT_PAGE_COPY.NOTES_PLACEHOLDER}
        maxLength={FIELD_INPUT_LIMITS.PROJECT_NOTES_CHARACTERS}
      />
      <Box sx={styles.row({})}>
        {canEdit && (
          <Button
            onClick={saveNotes}
            disabled={!isDirty}
            icon={ICON_NAMES.SAVE}
            isLoading={updateMutation.isPending}
            text={APARTMENT_PAGE_COPY.SAVE_NOTES}
          />
        )}
        {isSaved && (
          <Box role="status" component="span" sx={styles.caption}>
            {APARTMENT_PAGE_COPY.NOTES_SAVED}
          </Box>
        )}
      </Box>
      {updateMutation.isError && <InlineError message={getApiErrorMessage(updateMutation.error)} />}
    </Card>
  );
};

export default ApartmentNotesCard;
