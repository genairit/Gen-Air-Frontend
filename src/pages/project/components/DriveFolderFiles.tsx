import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";

import type { FC } from "react";
import FileRow from "../../../components/FileRow/FileRow";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { toProjectFile } from "../../../utilities/mappers/project.mapper";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";

interface IDriveFolderFilesProps {
  folderId: string;
  projectId: string;
}

const DriveFolderFiles: FC<IDriveFolderFilesProps> = ({ projectId, folderId }) => {
  const contentsQuery = useProjectDriveQuery(projectId, folderId);

  if (contentsQuery.isPending) {
    return <LoadingState label={PROJECT_PAGE_STATUS_COPY.LOADING_FILES} />;
  }

  if (contentsQuery.isError) {
    return <InlineError message={getApiErrorMessage(contentsQuery.error)} />;
  }

  return contentsQuery.data.files.map(item => (
    <FileRow key={item.id} file={toProjectFile(item)} linkLabel={PROJECT_PAGE_COPY.OPEN_IN_DRIVE} />
  ));
};

export default DriveFolderFiles;
