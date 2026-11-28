import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import { useState, useEffect, type FC } from "react";
import EstimateQuantities from "./EstimateQuantities";
import EstimateScopeField from "./EstimateScopeField";
import Button from "../../../components/Button/Button";
import TextField from "../../../components/TextField/TextField";
import EstimateDraftNavigation from "./EstimateDraftNavigation";
import InlineError from "../../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useCreateEstimate } from "../../../hooks/engineering-estimate.hook";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { ESTIMATE_NAME_MAX_LENGTH } from "../../../constants/engineering-estimate.constant";
import type { IEngineeringEstimate } from "../../../interfaces/engineering-estimate.interface";
import { emptyEstimateDraft, validEstimateDraft } from "../../../utilities/estimate-draft.utility";

interface IEstimateCreateFormProps {
  projectId: string;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onCreated: (estimate: IEngineeringEstimate) => void;
}
const EstimateCreateForm: FC<IEstimateCreateFormProps> = ({
  projectId,
  onCancel,
  onCreated,
  onDirtyChange,
}) => {
  const styles = usePageStyles();
  const [draft, setDraft] = useState(() => ({ ...emptyEstimateDraft(), projectId }));
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const create = useCreateEstimate();
  const busy = create.isPending;
  const scopeChanged = draft.scope !== emptyEstimateDraft().scope;
  const dirty = Boolean(draft.name || draft.areas.length || scopeChanged);
  const valid = Boolean(draft.name.trim()) && validEstimateDraft(draft.areas);
  const pending = dirty && !create.isSuccess && !discarding;
  useEffect(() => {
    onDirtyChange?.(pending);
  }, [pending, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);
  useEffect(() => {
    if (discarding) {
      onCancel();
    }
  }, [discarding, onCancel]);
  useEffect(() => {
    if (create.isSuccess) {
      onCreated(create.data);
    }
  }, [create.isSuccess, create.data, onCreated]);
  const save = (): void => {
    if (!valid || busy) {
      return;
    }
    create.mutate({
      name: draft.name.trim(),
      projectId: draft.projectId,
      scope: draft.scope,
      areas: draft.areas,
    });
  };
  const cancel = (): void => {
    if (dirty) {
      setConfirmCancel(true);
      return;
    }
    onCancel();
  };
  return (
    <Box
      component="form"
      aria-label="כתב כמויות חדש"
      sx={styles.stack({ gap: "16px" })}
      onSubmit={event => {
        event.preventDefault();
        save();
      }}
    >
      <Box sx={styles.grid({ minColumnWidth: 220, gap: "12px" })}>
        <TextField
          required
          autoFocus
          isRequired
          disabled={busy}
          value={draft.name}
          title="שם כתב הכמויות"
          type={FIELD_TYPES.TEXT}
          maxLength={ESTIMATE_NAME_MAX_LENGTH}
          onChange={name => setDraft({ ...draft, name })}
        />
        <EstimateScopeField
          busy={busy}
          value={draft.scope}
          onChange={scope => setDraft({ ...draft, scope })}
        />
      </Box>
      <Box sx={styles.row({ gap: "8px" })}>
        <Button type="submit" isLoading={busy} text="יצירת כתב כמויות" disabled={!valid || busy} />
        <Button text="ביטול" disabled={busy} onClick={cancel} variant={BUTTON_VARIANTS.SECONDARY} />
      </Box>
      {create.isError && <InlineError message={getApiErrorMessage(create.error)} />}
      {confirmCancel && (
        <Box role="alert">
          <Box component="p">לצאת ללא שמירת כתב הכמויות?</Box>
          <Button text="המשך עריכה" onClick={() => setConfirmCancel(false)} />
          <Button text="יציאה ללא שמירה" onClick={() => setDiscarding(true)} />
        </Box>
      )}
      <EstimateQuantities
        canEdit
        busy={busy}
        estimate={draft}
        onChange={areas => setDraft({ ...draft, areas })}
      />
      <EstimateDraftNavigation pending={pending} />
    </Box>
  );
};
export default EstimateCreateForm;
