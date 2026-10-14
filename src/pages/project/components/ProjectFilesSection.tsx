import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../../page.style";
import ProjectDriveCard from "./ProjectDriveCard";
import ProjectTimelineCard from "./ProjectTimelineCard";
import DropZone from "../../../components/DropZone/DropZone";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { PROJECT_DRIVE_UPLOAD_DESCRIPTION } from "../../../constants/project.constant";
import { useUploadProjectFilesMutation } from "../../../hooks/mutations/project.mutation";

interface IProjectFilesSectionProps {
  projectId: string;
}

const ProjectFilesSection: FC<IProjectFilesSectionProps> = ({ projectId }) => {
  const styles = usePageStyles();
  const uploadMutation = useUploadProjectFilesMutation();

  return (
    <Box sx={styles.grid({ minColumnWidth: 380 })}>
      <Box sx={styles.stack({})}>
        <ProjectDriveCard projectId={projectId} />
        <DropZone
          title={PROJECT_PAGE_COPY.UPLOAD_TITLE}
          buttonLabel={PROJECT_PAGE_COPY.UPLOAD_BUTTON}
          description={PROJECT_DRIVE_UPLOAD_DESCRIPTION}
          onFilesSelected={files => uploadMutation.mutate({ projectId, files })}
        />
        {uploadMutation.isPending && <LoadingState label={PROJECT_PAGE_STATUS_COPY.UPLOADING} />}
        {uploadMutation.isError && (
          <InlineError message={getApiErrorMessage(uploadMutation.error)} />
        )}
      </Box>

      <ProjectTimelineCard projectId={projectId} />
    </Box>
  );
};

export default ProjectFilesSection;
