import { Box } from "@mui/material";
import { type FC, useState } from "react";
import DriveFileActions from "./DriveFileActions";
import Button from "../../../components/Button/Button";
import FileRow from "../../../components/FileRow/FileRow";
import { useSessionUser } from "../../../store/session.store";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import type { IProjectFile } from "../../../interfaces/project.interface";
import ExecutionPlanSubmissionDialog from "./ExecutionPlanSubmissionDialog";
import { PROJECT_PAGE_COPY } from "../../../constants/project-page.constant";
import { EXECUTION_PLAN_COPY } from "../../../constants/execution-plan.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IProjectDriveFileRowProps {
  compact?: boolean;
  projectId: string;
  folderName: string;
  file: IProjectFile;
}
const ProjectDriveFileRow: FC<IProjectDriveFileRowProps> = ({
  projectId,
  file,
  folderName,
  compact = false,
}) => {
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const user = useSessionUser();
  const canSubmit = [
    PERMISSIONS.EXECUTION_PLANS_SUBMIT,
    PERMISSIONS.QUOTATIONS_READ,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.DRIVE_READ,
  ].every(permission => hasPermission(user, permission));

  return (
    <>
      <FileRow
        file={file}
        compact={compact}
        linkLabel={PROJECT_PAGE_COPY.OPEN_IN_DRIVE}
        actions={
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {canSubmit && !/\.zip$/i.test(file.name) && (
              <Button
                size="compact"
                text={EXECUTION_PLAN_COPY.SUBMIT_ACTION}
                ariaLabel={`${EXECUTION_PLAN_COPY.SUBMIT_ACTION}: ${file.name}`}
                variant={BUTTON_VARIANTS.NEUTRAL}
                onClick={() => setSubmissionOpen(true)}
              />
            )}
            <DriveFileActions projectId={projectId} file={file} folderName={folderName} />
          </Box>
        }
      />
      {submissionOpen && (
        <ExecutionPlanSubmissionDialog
          file={file}
          projectId={projectId}
          onClose={() => setSubmissionOpen(false)}
        />
      )}
    </>
  );
};
export default ProjectDriveFileRow;
