import {
  useEstimateCommand,
  getEstimateCommandErrorMessage,
} from "../../../hooks/engineering-estimate.hook";

import {
  ESTIMATE_SCOPE_LABELS,
  ESTIMATE_STATUS_LABELS,
  ESTIMATE_WORKSPACE_TAB,
  ESTIMATE_WORKSPACE_TABS,
  ESTIMATE_NAME_MAX_LENGTH,
} from "../../../constants/engineering-estimate.constant";

import type {
  TEstimatePatch,
  IEngineeringEstimate,
} from "../../../interfaces/engineering-estimate.interface";

import { createPortal } from "react-dom";
import { Box, Typography } from "@mui/material";
import Chip from "../../../components/Chip/Chip";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Tabs from "../../../components/Tabs/Tabs";
import EstimateQuestions from "./EstimateQuestions";
import EstimateQuantities from "./EstimateQuantities";
import EstimateScopeField from "./EstimateScopeField";
import Button from "../../../components/Button/Button";
import EstimateDriveExport from "./EstimateDriveExport";
import EstimateProjectPicker from "./EstimateProjectPicker";
import { TAB_MODES } from "../../../constants/tabs.constant";
import { CHIP_SIZES } from "../../../constants/chip.constant";
import EstimateDraftNavigation from "./EstimateDraftNavigation";
import TextField from "../../../components/TextField/TextField";
import { useEstimateStyles } from "../engineering-estimates.style";
import InlineError from "../../../components/InlineError/InlineError";
import { useId, useState, useEffect, useContext, type FC } from "react";
import { validEstimateDraft } from "../../../utilities/estimate-draft.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { ESTIMATE_TYPOGRAPHY } from "../../../styles/engineering-estimate-typography.style";
import { engineeringEstimateService } from "../../../services/engineering-estimate.service";
import { WorkspaceToolbarContext } from "../../../components/ProjectWorkspace/WorkspaceToolbar.context";

interface IEstimateWorkspaceProps {
  canEdit: boolean;
  canExportToDrive: boolean;
  estimate: IEngineeringEstimate;
  onEditingChange: (editing: boolean) => void;
}

const EstimateWorkspace: FC<IEstimateWorkspaceProps> = ({
  estimate,
  canEdit,
  canExportToDrive,
  onEditingChange,
}) => {
  useEffect(() => () => onEditingChange(false), [onEditingChange]);
  const styles = usePageStyles();
  const estimateStyles = useEstimateStyles();
  const toolbar = useContext(WorkspaceToolbarContext);
  const detailsId = useId();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(ESTIMATE_WORKSPACE_TAB.QUANTITIES);
  const [draft, setDraft] = useState(estimate);
  const [editing, setEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const command = useEstimateCommand(estimate.id);
  const busy = command.isPending;
  const run = command.mutate;
  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(estimate);
  const valid = Boolean(draft.name.trim()) && validEstimateDraft(draft.areas);
  const shown = editing ? draft : estimate;
  const startEditing = (): void => {
    setDraft(estimate);
    setEditing(true);
    onEditingChange(true);
  };
  const finishEditing = (): void => {
    setEditing(false);
    setConfirmCancel(false);
    onEditingChange(false);
  };
  const cancel = (): void => {
    if (dirty) {
      setConfirmCancel(true);
      return;
    }
    finishEditing();
  };
  const save = (): void => {
    if (!valid || busy) {
      return;
    }
    run(async (): Promise<void> => {
      await engineeringEstimateService.patch(estimate.id, {
        version: draft.version,
        name: draft.name.trim(),
        projectId: draft.projectId,
        scope: draft.scope,
        areas: draft.areas,
        questions: draft.questions,
      });
      finishEditing();
    });
  };
  const patch = (delta: Omit<TEstimatePatch, "version">): void => {
    setDraft({ ...draft, ...delta });
  };
  const editAction =
    canEdit && !editing ? (
      <Button disabled={busy} onClick={startEditing} text="עריכת כתב כמויות" />
    ) : null;
  const panels: Record<string, React.JSX.Element> = {
    [ESTIMATE_WORKSPACE_TAB.QUANTITIES]: (
      <EstimateQuantities
        busy={busy}
        estimate={shown}
        canEdit={canEdit && editing}
        onChange={(areas): void => patch({ areas })}
      />
    ),
    [ESTIMATE_WORKSPACE_TAB.QUESTIONS]: (
      <EstimateQuestions
        busy={busy}
        questions={shown.questions}
        canEdit={canEdit && editing}
        onChange={(questions): void => patch({ questions })}
      />
    ),
  };

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      {editing && (
        <Box sx={styles.spacedRow}>
          <Box sx={estimateStyles.details}>
            <Chip
              size={CHIP_SIZES.MEDIUM}
              sx={ESTIMATE_TYPOGRAPHY.status}
              label={ESTIMATE_STATUS_LABELS[estimate.status]}
            />
            <Typography component="span" sx={ESTIMATE_TYPOGRAPHY.status}>
              גרסה {estimate.version}
            </Typography>
            <Typography component="span" sx={ESTIMATE_TYPOGRAPHY.status}>
              {ESTIMATE_SCOPE_LABELS[estimate.scope]}
            </Typography>
          </Box>
          {canEdit && editing && (
            <Button
              ariaExpanded={detailsOpen}
              variant={BUTTON_VARIANTS.SECONDARY}
              ariaControls={detailsOpen ? detailsId : null}
              onClick={(): void => setDetailsOpen(!detailsOpen)}
              text={detailsOpen ? "סגירת פרטי טיוטה" : "עריכת פרטי טיוטה"}
            />
          )}
        </Box>
      )}
      {canEdit && editing && detailsOpen && (
        <Box id={detailsId}>
          <Card gap="18px" padding="24px">
            <Typography component="h2" sx={ESTIMATE_TYPOGRAPHY.section}>
              פרטי כתב הכמויות
            </Typography>
            <Box sx={styles.grid({ minColumnWidth: 240, gap: "12px" })}>
              <Box sx={styles.stack({ gap: "8px" })}>
                <TextField
                  disabled={busy}
                  value={draft.name}
                  title="שם כתב הכמויות"
                  type={FIELD_TYPES.TEXT}
                  onChange={name => patch({ name })}
                  maxLength={ESTIMATE_NAME_MAX_LENGTH}
                />
              </Box>
              <EstimateProjectPicker
                disabled={busy}
                value={draft.projectId}
                onChange={(projectId): void => patch({ projectId })}
              />
              <EstimateScopeField
                busy={busy}
                value={draft.scope}
                onChange={(scope): void => patch({ scope })}
              />
            </Box>
          </Card>
        </Box>
      )}
      {editAction &&
        (toolbar ? createPortal(editAction, toolbar) : <Box sx={styles.endRow}>{editAction}</Box>)}
      {canExportToDrive && (
        <EstimateDriveExport
          busy={busy}
          id={estimate.id}
          disabled={editing}
          key={estimate.version}
          version={estimate.version}
          projectId={estimate.projectId}
        />
      )}
      {editing && (
        <Box sx={styles.row({ gap: "8px" })}>
          <Button
            onClick={save}
            isLoading={busy}
            text="שמירת שינויים"
            disabled={!valid || !dirty || busy}
          />
          <Button
            disabled={busy}
            onClick={cancel}
            text="ביטול עריכה"
            variant={BUTTON_VARIANTS.SECONDARY}
          />
          <Typography role="status">
            {dirty ? "שינויים שטרם נשמרו" : "כל השינויים נשמרו"}
          </Typography>
        </Box>
      )}
      {confirmCancel && (
        <Box role="alert">
          <Box component="p">לבטל את השינויים שטרם נשמרו?</Box>
          <Button text="המשך עריכה" onClick={() => setConfirmCancel(false)} />
          <Button text="ביטול השינויים" onClick={finishEditing} />
        </Box>
      )}
      {editing && estimate.version !== draft.version && (
        <Typography role="alert">
          הגרסה השמורה השתנתה. השינויים שלכם נשמרו בעורך. בטלו עריכה ופתחו את הגרסה המעודכנת לפני
          שמירה נוספת.
        </Typography>
      )}
      <EstimateDraftNavigation pending={dirty} />
      {editing && (
        <Tabs
          activeId={activeTab}
          mode={TAB_MODES.FILTER}
          onChange={setActiveTab}
          ariaLabel="תצוגת כתב הכמויות"
          items={ESTIMATE_WORKSPACE_TABS}
        />
      )}
      {busy && <Typography role="status">מעדכן את כתב הכמויות…</Typography>}
      {command.isError && <InlineError message={getEstimateCommandErrorMessage(command.error)} />}
      {panels[editing ? activeTab : ESTIMATE_WORKSPACE_TAB.QUANTITIES]}
    </Box>
  );
};

export default EstimateWorkspace;
