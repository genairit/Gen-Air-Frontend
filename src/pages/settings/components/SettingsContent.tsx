import {
  isSameStageList,
  moveStatusStage,
  appendStatusStage,
  removeStatusStage,
} from "../../../utilities/status-stage.utility";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import PasswordCard from "./PasswordCard";
import { usePageStyles } from "../../page.style";
import StatusStagesCard from "./StatusStagesCard";
import FolderTemplateCard from "./FolderTemplateCard";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { SETTINGS_COPY } from "../../../constants/settings.constant";
import InlineError from "../../../components/InlineError/InlineError";
import type { IStatusStage } from "../../../interfaces/project.interface";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useSaveStageChangesMutation } from "../../../hooks/mutations/project-stage.mutation";

interface ISettingsContentProps {
  canManageSettings: boolean;
  savedStages: IStatusStage[];
}

const SettingsContent: FC<ISettingsContentProps> = ({ savedStages, canManageSettings }) => {
  const styles = usePageStyles();
  const saveMutation = useSaveStageChangesMutation();
  const [draftStages, setDraftStages] = useState(savedStages);
  const hasUnsavedChanges = !isSameStageList(savedStages, draftStages);

  const handleMove = (draggedStageId: string, targetStageId: string) =>
    setDraftStages(stages => moveStatusStage(stages, { draggedStageId, targetStageId }));

  const handleDelete = (stageId: string) =>
    setDraftStages(stages => removeStatusStage(stages, stageId));

  const handleAdd = () => setDraftStages(appendStatusStage);

  const handleSave = () => saveMutation.mutate({ savedStages, draftStages });

  return (
    <Box sx={styles.page}>
      <Box sx={styles.header}>
        <Box sx={styles.headerText}>
          <Box component="h1" sx={styles.heading}>
            {SETTINGS_COPY.TITLE}
          </Box>
          <Box component="span" sx={styles.description}>
            {SETTINGS_COPY.DESCRIPTION}
          </Box>
        </Box>
        {canManageSettings && (
          <Button
            onClick={handleSave}
            icon={ICON_NAMES.SAVE}
            text={SETTINGS_COPY.SAVE}
            disabled={!hasUnsavedChanges}
            isLoading={saveMutation.isPending}
          />
        )}
      </Box>

      {saveMutation.isError && <InlineError message={getApiErrorMessage(saveMutation.error)} />}

      <Box sx={styles.grid({ minColumnWidth: 400 })}>
        <StatusStagesCard
          onAdd={handleAdd}
          onMove={handleMove}
          stages={draftStages}
          onDelete={handleDelete}
          isEditable={canManageSettings}
        />
        <Box sx={styles.stack({})}>
          <FolderTemplateCard />
          <PasswordCard />
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsContent;
