import {
  FOLDER_CONTENT_STATUSES,
  DRIVE_STATUS_BADGE_SIZES,
} from "../../../constants/drive-folder.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import DriveFolderList from "./DriveFolderList";
import { usePageStyles } from "../../page.style";
import ProjectDriveFileRow from "./ProjectDriveFileRow";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { IProjectFolder } from "../../../interfaces/project.interface";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import { getEmptyFolderNote } from "../../../utilities/drive-folder.utility";
import { PROJECT_PAGE_STATUS_COPY } from "../../../constants/project-page.constant";
import { toProjectFile, toProjectFolder } from "../../../utilities/mappers/project.mapper";

interface IDriveFolderFilesProps {
  projectId: string;
  folderPath: string;
  folder: IProjectFolder;
}

const DriveFolderFiles: FC<IDriveFolderFilesProps> = ({ projectId, folder, folderPath }) => {
  const styles = usePageStyles();
  const contentsQuery = useProjectDriveQuery(projectId, folder.id);

  if (contentsQuery.isPending) {
    return <LoadingState label={PROJECT_PAGE_STATUS_COPY.LOADING_FILES} />;
  }

  if (contentsQuery.isError) {
    return <InlineError message={getApiErrorMessage(contentsQuery.error)} />;
  }

  const subfolders = contentsQuery.data.folders.map(toProjectFolder);
  const files = contentsQuery.data.files.map(toProjectFile);
  const isEmpty = folder.contentStatus === FOLDER_CONTENT_STATUSES.EMPTY;
  const emptyFolderNote = getEmptyFolderNote(subfolders);

  return (
    <>
      <DriveFolderList
        folders={subfolders}
        projectId={projectId}
        parentPath={folderPath}
        isRefreshing={contentsQuery.isFetching}
        badgeSize={DRIVE_STATUS_BADGE_SIZES.SUBFOLDER}
      />
      {files.map(file => (
        <ProjectDriveFileRow
          file={file}
          key={file.id}
          projectId={projectId}
          folderName={folderPath}
        />
      ))}
      {isEmpty && (
        <Box component="span" sx={styles.caption}>
          {emptyFolderNote}
        </Box>
      )}
    </>
  );
};

export default DriveFolderFiles;
