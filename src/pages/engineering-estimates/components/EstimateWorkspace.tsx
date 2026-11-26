import {
  useEstimateCommand,
  getEstimateCommandErrorMessage,
} from "../../../hooks/engineering-estimate.hook";

import {
  ESTIMATE_STATUS_LABELS,
  ESTIMATE_WORKSPACE_TAB,
  ESTIMATE_WORKSPACE_TABS,
} from "../../../constants/engineering-estimate.constant";

import type {
  TEstimatePatch,
  IEngineeringEstimate,
} from "../../../interfaces/engineering-estimate.interface";

import { Box, Typography } from "@mui/material";
import EstimateOutputs from "./EstimateOutputs";
import { useId, useState, type FC } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Tabs from "../../../components/Tabs/Tabs";
import EstimateQuestions from "./EstimateQuestions";
import EstimateQuantities from "./EstimateQuantities";
import EstimateScopeField from "./EstimateScopeField";
import Button from "../../../components/Button/Button";
import EstimateProjectPicker from "./EstimateProjectPicker";
import { TAB_MODES } from "../../../constants/tabs.constant";
import TextField from "../../../components/TextField/TextField";
import InlineError from "../../../components/InlineError/InlineError";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { engineeringEstimateService } from "../../../services/engineering-estimate.service";

interface IEstimateWorkspaceProps {
  canEdit: boolean;
  canBrowse: boolean;
  canApprove: boolean;
  canReadQuotation: boolean;
  canCreateQuotation: boolean;
  canExportQuotation: boolean;
  estimate: IEngineeringEstimate;
}

const EstimateWorkspace: FC<IEstimateWorkspaceProps> = ({
  estimate,
  canEdit,
  canApprove,
  canBrowse,
  canReadQuotation,
  canCreateQuotation,
  canExportQuotation,
}) => {
  const styles = usePageStyles();
  const detailsId = useId();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(ESTIMATE_WORKSPACE_TAB.QUANTITIES);
  const [name, setName] = useState(estimate.name);
  const command = useEstimateCommand(estimate.id);
  const busy = command.isPending;
  const run = command.mutate;
  const trimmedName = name.trim();
  const saveNameDisabled = busy || !trimmedName || estimate.name === trimmedName;
  const patch = (delta: Omit<TEstimatePatch, "version">): void => {
    run(async (): Promise<void> => {
      await engineeringEstimateService.patch(estimate.id, { version: estimate.version, ...delta });
    });
  };
  const panels: Record<string, React.JSX.Element> = {
    [ESTIMATE_WORKSPACE_TAB.QUANTITIES]: (
      <EstimateQuantities
        busy={busy}
        canEdit={canEdit}
        estimate={estimate}
        onChange={(areas): void => patch({ areas })}
      />
    ),
    [ESTIMATE_WORKSPACE_TAB.QUESTIONS]: (
      <EstimateQuestions
        busy={busy}
        canEdit={canEdit}
        questions={estimate.questions}
        onChange={(questions): void => patch({ questions })}
      />
    ),
    [ESTIMATE_WORKSPACE_TAB.OUTPUT]: (
      <EstimateOutputs
        run={run}
        busy={busy}
        canEdit={canEdit}
        estimate={estimate}
        canBrowse={canBrowse}
        canApprove={canApprove}
        canReadQuotation={canReadQuotation}
        canCreateQuotation={canCreateQuotation}
        canExportQuotation={canExportQuotation}
      />
    ),
  };

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      <Box sx={styles.spacedRow}>
        <Box sx={styles.headerText}>
          <Typography component="h2">{estimate.name}</Typography>
          <Typography sx={styles.caption}>
            גרסה {estimate.version} · {ESTIMATE_STATUS_LABELS[estimate.status]}
          </Typography>
        </Box>
        {canEdit && (
          <Button
            ariaExpanded={detailsOpen}
            variant={BUTTON_VARIANTS.SECONDARY}
            ariaControls={detailsOpen ? detailsId : null}
            onClick={(): void => setDetailsOpen(!detailsOpen)}
            text={detailsOpen ? "סגירת פרטי טיוטה" : "עריכת פרטי טיוטה"}
          />
        )}
      </Box>
      {canEdit && detailsOpen && (
        <Box id={detailsId}>
          <Card>
            <Box sx={styles.grid({ minColumnWidth: 240, gap: "12px" })}>
              <Box sx={styles.stack({ gap: "8px" })}>
                <TextField
                  value={name}
                  maxLength={160}
                  disabled={busy}
                  onChange={setName}
                  title="שם כתב הכמויות"
                  type={FIELD_TYPES.TEXT}
                />
                <Button
                  text="שמירת שם"
                  disabled={saveNameDisabled}
                  onClick={(): void => patch({ name: trimmedName })}
                />
              </Box>
              <EstimateProjectPicker
                disabled={busy}
                value={estimate.projectId}
                onChange={(projectId): void => patch({ projectId })}
              />
              <EstimateScopeField
                busy={busy}
                value={estimate.scope}
                onChange={(scope): void => patch({ scope })}
              />
            </Box>
          </Card>
        </Box>
      )}
      <Tabs
        activeId={activeTab}
        mode={TAB_MODES.FILTER}
        onChange={setActiveTab}
        ariaLabel="תצוגת כתב הכמויות"
        items={ESTIMATE_WORKSPACE_TABS}
      />
      {busy && <Typography role="status">מעדכן את כתב הכמויות…</Typography>}
      {command.isError && <InlineError message={getEstimateCommandErrorMessage(command.error)} />}
      {panels[activeTab]}
    </Box>
  );
};

export default EstimateWorkspace;
