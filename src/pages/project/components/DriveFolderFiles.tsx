import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";

import {
  FOLDER_CONTENT_STATUSES,
  DRIVE_STATUS_BADGE_SIZES,
} from "../../../constants/drive-folder.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import DriveFolderList from "./DriveFolderList";
import { usePageStyles } from "../../page.style";
import FileRow from "../../../components/FileRow/FileRow";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { IProjectFolder } from "../../../interfaces/project.interface";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import { getEmptyFolderNote } from "../../../utilities/drive-folder.utility";
import { toProjectFile, toProjectFolder } from "../../../utilities/mappers/project.mapper";

interface IDriveFolderFilesProps {
  projectId: string;
  folder: IProjectFolder;
}

const DriveFolderFiles: FC<IDriveFolderFilesProps> = ({ projectId, folder }) => {
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
        isRefreshing={contentsQuery.isFetching}
        badgeSize={DRIVE_STATUS_BADGE_SIZES.SUBFOLDER}
      />
      {files.map(file => (
        <FileRow file={file} key={file.id} linkLabel={PROJECT_PAGE_COPY.OPEN_IN_DRIVE} />
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
