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

import {
  SHARED_DOCUMENT_COPY,
  SHARED_DOCUMENT_STATUS,
} from "../../../constants/shared-document.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import { Alert } from "@mui/material";
import DriveFolderList from "./DriveFolderList";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import ProjectDriveUpload from "./ProjectDriveUpload";
import Button from "../../../components/Button/Button";
import ProjectDriveActions from "./ProjectDriveActions";
import ProjectDriveFileRow from "./ProjectDriveFileRow";
import DriveUnavailableBanner from "./DriveUnavailableBanner";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useSessionUser } from "../../../store/session.store";
import DriveProvisioningNotice from "./DriveProvisioningNotice";
import { SharedDocumentContext } from "./SharedDocumentContext";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { PERMISSIONS } from "../../../constants/permission.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { hasPermission } from "../../../utilities/permission.utility";
import { DRIVE_FILE_COPY } from "../../../constants/drive-file.constant";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useDriveFeedbackStore } from "../../../store/drive-feedback.store";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import { useSharedDocumentQuery } from "../../../hooks/queries/project.query";
import { DRIVE_STATUS_BADGE_SIZES } from "../../../constants/drive-folder.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { toProjectFile, toProjectFolder } from "../../../utilities/mappers/project.mapper";
import { useSelectSharedDocumentMutation } from "../../../hooks/mutations/project.mutation";

interface IProjectDriveCardProps {
  projectId: string;
  shareWithApartments?: boolean;
}

const ProjectDriveCard: FC<IProjectDriveCardProps> = ({
  projectId,
  shareWithApartments = false,
}) => {
  const styles = usePageStyles();
  const feedback = useDriveFeedbackStore();
  const showFeedback = feedback.projectId === projectId && Boolean(feedback.message);
  const rootQuery = useProjectDriveQuery(projectId, null);
  const sharedQuery = useSharedDocumentQuery(projectId, shareWithApartments);
  const selectSharedDocument = useSelectSharedDocumentMutation();
  const canChangeSharedDocument = hasPermission(useSessionUser(), PERMISSIONS.DRIVE_MOVE);
  const sharedDocument = shareWithApartments
    ? {
        selectedFileId: sharedQuery.data?.file?.id ?? null,
        canSelect: sharedQuery.isSuccess,
        isPending: selectSharedDocument.isPending,
        selectFile: (fileId: string) => selectSharedDocument.mutate({ projectId, fileId }),
      }
    : null;
  const sharedStatusMessages = {
    [SHARED_DOCUMENT_STATUS.NONE]: SHARED_DOCUMENT_COPY.PARENT_EMPTY,
    [SHARED_DOCUMENT_STATUS.UNAVAILABLE]: SHARED_DOCUMENT_COPY.PARENT_UNAVAILABLE,
    [SHARED_DOCUMENT_STATUS.AVAILABLE]: `${SHARED_DOCUMENT_COPY.PARENT_TITLE}: ${sharedQuery.data?.file?.name ?? ""}`,
  };
  const sharedStatusMessage = sharedQuery.data
    ? sharedStatusMessages[sharedQuery.data.status]
    : null;

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
      <SharedDocumentContext.Provider value={sharedDocument}>
        <Card>
          <CardHeader
            stackActionsOnMobile
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
          {shareWithApartments && sharedQuery.isSuccess && (
            <Alert
              severity={
                sharedQuery.data.status === SHARED_DOCUMENT_STATUS.UNAVAILABLE ? "warning" : "info"
              }
            >
              {sharedStatusMessage}
              {sharedQuery.data.status !== SHARED_DOCUMENT_STATUS.NONE &&
                canChangeSharedDocument && (
                  <Button
                    text={SHARED_DOCUMENT_COPY.CLEAR}
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    disabled={selectSharedDocument.isPending}
                    onClick={() => selectSharedDocument.mutate({ projectId, fileId: null })}
                  />
                )}
            </Alert>
          )}
          {shareWithApartments && sharedQuery.isError && (
            <InlineError message={getApiErrorMessage(sharedQuery.error)} />
          )}
          {selectSharedDocument.isError && <InlineError message={SHARED_DOCUMENT_COPY.ERROR} />}
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
          <ProjectDriveUpload projectId={projectId} />
        </Card>
      </SharedDocumentContext.Provider>
    </Box>
  );
};

export default ProjectDriveCard;
