import {
  hasUnknownFolder,
  getFolderBadgeState,
  getRootContentStatus,
  isDriveUnavailableError,
  isDriveFolderMissingError,
} from "../../../utilities/drive-folder.utility";

import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { Alert } from "@mui/material";
import DriveFolderList from "./DriveFolderList";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import ProjectDriveActions from "./ProjectDriveActions";
import ProjectDriveFileRow from "./ProjectDriveFileRow";
import DriveUnavailableBanner from "./DriveUnavailableBanner";
import { ICON_NAMES } from "../../../constants/icon.constant";
import DriveProvisioningNotice from "./DriveProvisioningNotice";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import { DRIVE_FILE_COPY } from "../../../constants/drive-file.constant";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useDriveFeedbackStore } from "../../../store/drive-feedback.store";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import { DRIVE_STATUS_BADGE_SIZES } from "../../../constants/drive-folder.constant";
import { toProjectFile, toProjectFolder } from "../../../utilities/mappers/project.mapper";

interface IProjectDriveCardProps {
  projectId: string;
}

const ProjectDriveCard: FC<IProjectDriveCardProps> = ({ projectId }) => {
  const styles = usePageStyles();
  const feedback = useDriveFeedbackStore();
  const showFeedback = feedback.projectId === projectId && Boolean(feedback.message);
  const rootQuery = useProjectDriveQuery(projectId, null);

  const folders = (rootQuery.data?.folders ?? []).map(toProjectFolder);
  const rootFiles = (rootQuery.data?.files ?? []).filter(item => !item.isFolder).map(toProjectFile);
  const isEmpty = rootQuery.isSuccess && folders.length === 0 && rootFiles.length === 0;
  const isRefreshing = rootQuery.isSuccess && rootQuery.isFetching;
  const isDriveUnavailable = isDriveUnavailableError(rootQuery.error);
  const isMissingFolder = isDriveFolderMissingError(rootQuery.error);
  const hasOtherError = rootQuery.isError && !isDriveUnavailable && !isMissingFolder;
  const showUnavailableBanner = isDriveUnavailable || hasUnknownFolder(folders);

  const rootBadgeState = getFolderBadgeState({
    isRefreshing,
    contentStatus: getRootContentStatus({ folders, rootFileCount: rootFiles.length }),
  });

  return (
    <Box component="section" aria-label={PROJECT_PAGE_COPY.FOLDERS_TITLE}>
      <Card>
        <CardHeader
          icon={ICON_NAMES.GDRIVE}
          title={PROJECT_PAGE_COPY.FOLDERS_TITLE}
          subtitle={PROJECT_PAGE_COPY.FOLDERS_SUBTITLE}
          action={
            rootQuery.isSuccess && (
              <ProjectDriveActions state={rootBadgeState} folderId={rootQuery.data.folderId} />
            )
          }
        />
        {showFeedback && <Alert severity="success">{feedback.message}</Alert>}
        {rootQuery.isPending && <LoadingState label={PROJECT_PAGE_STATUS_COPY.LOADING_FILES} />}
        {showUnavailableBanner && <DriveUnavailableBanner onRetry={rootQuery.refetch} />}
        {isMissingFolder && <DriveProvisioningNotice projectId={projectId} />}
        {hasOtherError && <InlineError message={getApiErrorMessage(rootQuery.error)} />}
        {isEmpty && (
          <Box component="span" sx={styles.caption}>
            {PROJECT_PAGE_STATUS_COPY.NO_FOLDERS}
          </Box>
        )}
        <DriveFolderList
          folders={folders}
          projectId={projectId}
          isRefreshing={isRefreshing}
          badgeSize={DRIVE_STATUS_BADGE_SIZES.ACCORDION}
        />
        {rootFiles.map(file => (
          <ProjectDriveFileRow
            file={file}
            key={file.id}
            projectId={projectId}
            folderName={DRIVE_FILE_COPY.ROOT}
          />
        ))}
      </Card>
    </Box>
  );
};

export default ProjectDriveCard;
