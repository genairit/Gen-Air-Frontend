import {
  hasUnknownFolder,
  getFolderBadgeState,
  getRootContentStatus,
  isDriveUnavailableError,
} from "../../../utilities/drive-folder.utility";

import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import DriveFolderList from "./DriveFolderList";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import FileRow from "../../../components/FileRow/FileRow";
import DriveUnavailableBanner from "./DriveUnavailableBanner";
import { ICON_NAMES } from "../../../constants/icon.constant";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import { DRIVE_STATUS_BADGE_SIZES } from "../../../constants/drive-folder.constant";
import DriveStatusBadge from "../../../components/DriveStatusBadge/DriveStatusBadge";
import { toProjectFile, toProjectFolder } from "../../../utilities/mappers/project.mapper";

interface IProjectDriveCardProps {
  projectId: string;
}

const ProjectDriveCard: FC<IProjectDriveCardProps> = ({ projectId }) => {
  const styles = usePageStyles();
  const rootQuery = useProjectDriveQuery(projectId, null);

  const folders = (rootQuery.data?.folders ?? []).map(toProjectFolder);
  const rootFiles = (rootQuery.data?.files ?? []).filter(item => !item.isFolder).map(toProjectFile);
  const isEmpty = rootQuery.isSuccess && folders.length === 0 && rootFiles.length === 0;
  const isRefreshing = rootQuery.isSuccess && rootQuery.isFetching;
  const isDriveUnavailable = isDriveUnavailableError(rootQuery.error);
  const hasOtherError = rootQuery.isError && !isDriveUnavailable;
  const showUnavailableBanner = isDriveUnavailable || hasUnknownFolder(folders);

  const rootBadgeState = getFolderBadgeState({
    isRefreshing,
    contentStatus: getRootContentStatus({ folders, rootFileCount: rootFiles.length }),
  });

  const rootBadge = rootQuery.isSuccess && (
    <DriveStatusBadge state={rootBadgeState} size={DRIVE_STATUS_BADGE_SIZES.CARD} />
  );

  return (
    <Card>
      <CardHeader
        action={rootBadge}
        icon={ICON_NAMES.GDRIVE}
        title={PROJECT_PAGE_COPY.FOLDERS_TITLE}
        subtitle={PROJECT_PAGE_COPY.FOLDERS_SUBTITLE}
      />
      {rootQuery.isPending && <LoadingState label={PROJECT_PAGE_STATUS_COPY.LOADING_FILES} />}
      {showUnavailableBanner && <DriveUnavailableBanner onRetry={rootQuery.refetch} />}
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
        <FileRow file={file} key={file.id} linkLabel={PROJECT_PAGE_COPY.OPEN_IN_DRIVE} />
      ))}
    </Card>
  );
};

export default ProjectDriveCard;
