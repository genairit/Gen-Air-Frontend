import type {
  TEstimatePatch,
  IEngineeringEstimate,
} from "../../../interfaces/engineering-estimate.interface";

import { useState, type FC } from "react";
import { Box, Typography } from "@mui/material";
import EstimateOutputs from "./EstimateOutputs";
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
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useEstimateCommand } from "../../../hooks/engineering-estimate.hook";
import { ESTIMATE_STATUS_LABELS } from "../../../constants/engineering-estimate.constant";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { engineeringEstimateService } from "../../../services/engineering-estimate.service";

interface IEstimateWorkspaceProps {
  canEdit: boolean;
  canQuote: boolean;
  canBrowse: boolean;
  canApprove: boolean;
  estimate: IEngineeringEstimate;
}

const TABS = {
  QUANTITIES: "quantities",
  QUESTIONS: "questions",
  OUTPUT: "output",
} as const;

const TABS_OPTIONS = [
  { id: TABS.QUANTITIES, label: "כמויות ותמחור" },
  { id: TABS.QUESTIONS, label: "שאלות לבירור" },
  { id: TABS.OUTPUT, label: "סקיצה ותוצרים" },
];

const EstimateWorkspace: FC<IEstimateWorkspaceProps> = ({
  estimate,
  canEdit,
  canApprove,
  canBrowse,
  canQuote,
}) => {
  const styles = usePageStyles();
  const [activeTab, setActiveTab] = useState<string>(TABS.QUANTITIES);
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
    [TABS.QUANTITIES]: (
      <EstimateQuantities
        busy={busy}
        canEdit={canEdit}
        estimate={estimate}
        onChange={(areas): void => patch({ areas })}
      />
    ),
    [TABS.QUESTIONS]: (
      <EstimateQuestions
        busy={busy}
        canEdit={canEdit}
        questions={estimate.questions}
        onChange={(questions): void => patch({ questions })}
      />
    ),
    [TABS.OUTPUT]: (
      <EstimateOutputs
        run={run}
        busy={busy}
        canEdit={canEdit}
        canQuote={canQuote}
        estimate={estimate}
        canBrowse={canBrowse}
        canApprove={canApprove}
      />
    ),
  };

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      <Box sx={styles.headerText}>
        <Typography component="h2">{estimate.name}</Typography>
        <Typography sx={styles.caption}>
          גרסה {estimate.version} · {ESTIMATE_STATUS_LABELS[estimate.status]}
        </Typography>
      </Box>
      {canEdit && (
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
      )}
      <Tabs
        isScrollable
        items={TABS_OPTIONS}
        activeId={activeTab}
        mode={TAB_MODES.FILTER}
        onChange={setActiveTab}
        ariaLabel="תצוגת כתב הכמויות"
      />
      {busy && <Typography role="status">מעדכן את כתב הכמויות…</Typography>}
      {command.isError && <InlineError message={getApiErrorMessage(command.error)} />}
      {panels[activeTab]}
    </Box>
  );
};

export default EstimateWorkspace;
