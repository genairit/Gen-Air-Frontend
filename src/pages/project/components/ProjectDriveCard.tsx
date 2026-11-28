import {
  hasUnknownFolder,
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

import {
  getProjectMutationError,
  isExistingDriveFolderError,
} from "../../../utilities/existing-drive-folder-error.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import DriveBrowser from "./DriveBrowser";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import DriveUnavailableBanner from "./DriveUnavailableBanner";
import { useSessionUser } from "../../../store/session.store";
import DriveProvisioningNotice from "./DriveProvisioningNotice";
import { SharedDocumentContext } from "./SharedDocumentContext";
import { PERMISSIONS } from "../../../constants/permission.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { hasPermission } from "../../../utilities/permission.utility";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import DriveTemplateCompletionNotice from "./DriveTemplateCompletionNotice";
import { useDriveFeedbackStore } from "../../../store/drive-feedback.store";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import { useSharedDocumentQuery } from "../../../hooks/queries/project.query";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { toProjectFile, toProjectFolder } from "../../../utilities/mappers/project.mapper";
import { useSelectSharedDocumentMutation } from "../../../hooks/mutations/project.mutation";
import { EXISTING_DRIVE_FOLDER_COPY } from "../../../constants/existing-drive-folder.constant";
import { NOTICE_VARIANTS } from "../../../vendor/smartbase/components/NoticeCard/constants/notice-card.constant";

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
  const sharedStatusIsUnavailable = sharedQuery.data?.status === SHARED_DOCUMENT_STATUS.UNAVAILABLE;
  const sharedNoticeVariant = sharedStatusIsUnavailable
    ? NOTICE_VARIANTS.warning
    : NOTICE_VARIANTS.info;

  const missingFolders = rootQuery.data?.missingTemplateFolders ?? [];
  const hasMissingTemplateFolders = missingFolders.length > 0;
  const isLinkedFolder = rootQuery.data?.missingTemplateFolders != null;
  const folders = (rootQuery.data?.folders ?? []).map(toProjectFolder);
  const rootFiles = (rootQuery.data?.files ?? []).filter(item => !item.isFolder).map(toProjectFile);
  const isEmpty = rootQuery.isSuccess && folders.length === 0 && rootFiles.length === 0;
  const hasLinkedFolderError = isExistingDriveFolderError(rootQuery.error);
  const isDriveUnavailable = isDriveUnavailableError(rootQuery.error) && !hasLinkedFolderError;
  const isMissingFolder = isDriveFolderMissingError(rootQuery.error) && !hasLinkedFolderError;
  const hasOtherError = rootQuery.isError && !isDriveUnavailable && !isMissingFolder;
  const showUnavailableBanner = isDriveUnavailable || hasUnknownFolder(folders);

  return (
    <Box component="section" aria-label={PROJECT_PAGE_COPY.FOLDERS_TITLE}>
      <SharedDocumentContext.Provider value={sharedDocument}>
        <Card>
          {isLinkedFolder && <Box sx={styles.caption}>{EXISTING_DRIVE_FOLDER_COPY.LINKED}</Box>}
          {hasMissingTemplateFolders && (
            <DriveTemplateCompletionNotice projectId={projectId} missingFolders={missingFolders} />
          )}
          {showFeedback && (
            <NoticeBanner title={feedback.message} variant={NOTICE_VARIANTS.success} />
          )}
          {shareWithApartments && sharedQuery.isSuccess && (
            <NoticeBanner
              variant={sharedNoticeVariant}
              title={sharedStatusMessage ?? ""}
              actions={
                sharedQuery.data.status !== SHARED_DOCUMENT_STATUS.NONE &&
                canChangeSharedDocument ? (
                  <Button
                    text={SHARED_DOCUMENT_COPY.CLEAR}
                    variant={BUTTON_VARIANTS.NEUTRAL}
                    disabled={selectSharedDocument.isPending}
                    onClick={() => selectSharedDocument.mutate({ projectId, fileId: null })}
                  />
                ) : null
              }
            />
          )}
          {shareWithApartments && sharedQuery.isError && (
            <InlineError message={getApiErrorMessage(sharedQuery.error)} />
          )}
          {selectSharedDocument.isError && <InlineError message={SHARED_DOCUMENT_COPY.ERROR} />}
          {rootQuery.isPending && <LoadingState label={PROJECT_PAGE_STATUS_COPY.LOADING_FILES} />}
          {showUnavailableBanner && <DriveUnavailableBanner onRetry={rootQuery.refetch} />}
          {isMissingFolder && <DriveProvisioningNotice projectId={projectId} />}
          {hasOtherError && <InlineError message={getProjectMutationError(rootQuery.error)} />}
          {hasLinkedFolderError && (
            <Button
              variant={BUTTON_VARIANTS.NEUTRAL}
              text={EXISTING_DRIVE_FOLDER_COPY.RETRY}
              onClick={async () => {
                await rootQuery.refetch();
              }}
            />
          )}
          {isEmpty && (
            <Box component="span" sx={styles.caption}>
              {PROJECT_PAGE_STATUS_COPY.NO_FOLDERS}
            </Box>
          )}
          {rootQuery.isSuccess && (
            <DriveBrowser projectId={projectId} rootFolderId={rootQuery.data.folderId} />
          )}
        </Card>
      </SharedDocumentContext.Provider>
    </Box>
  );
};

export default ProjectDriveCard;
