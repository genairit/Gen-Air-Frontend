import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import DriveFolderFiles from "./DriveFolderFiles";
import FileRow from "../../../components/FileRow/FileRow";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { formatFileCount } from "../../../utilities/text.utility";
import CardHeader from "../../../components/CardHeader/CardHeader";
import InlineError from "../../../components/InlineError/InlineError";
import { toggleSelectedId } from "../../../utilities/selection.utility";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import FolderAccordion from "../../../components/FolderAccordion/FolderAccordion";
import { toProjectFile, toProjectFolder } from "../../../utilities/mappers/project.mapper";

interface IProjectDriveCardProps {
  projectId: string;
}

const ProjectDriveCard: FC<IProjectDriveCardProps> = ({ projectId }) => {
  const styles = usePageStyles();
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const rootQuery = useProjectDriveQuery(projectId, null);

  const folders = (rootQuery.data?.folders ?? []).map(toProjectFolder);
  const rootFiles = (rootQuery.data?.files ?? []).filter(item => !item.isFolder).map(toProjectFile);
  const isEmpty = rootQuery.isSuccess && folders.length === 0 && rootFiles.length === 0;

  const handleFolderToggle = (folderId: string) =>
    setExpandedFolderId(currentId => toggleSelectedId(currentId, folderId));

  return (
    <Card>
      <CardHeader
        icon={ICON_NAMES.GDRIVE}
        title={PROJECT_PAGE_COPY.FOLDERS_TITLE}
        subtitle={PROJECT_PAGE_COPY.FOLDERS_SUBTITLE}
      />
      {rootQuery.isPending && <LoadingState label={PROJECT_PAGE_STATUS_COPY.LOADING_FILES} />}
      {rootQuery.isError && <InlineError message={getApiErrorMessage(rootQuery.error)} />}
      {isEmpty && (
        <Box component="span" sx={styles.caption}>
          {PROJECT_PAGE_STATUS_COPY.NO_FOLDERS}
        </Box>
      )}
      {folders.map(folder => (
        <FolderAccordion
          key={folder.id}
          icon={folder.icon}
          title={folder.name}
          caption={formatFileCount(folder.fileCount)}
          isExpanded={folder.id === expandedFolderId}
          onToggle={() => handleFolderToggle(folder.id)}
        >
          <DriveFolderFiles folderId={folder.id} projectId={projectId} />
        </FolderAccordion>
      ))}
      {rootFiles.map(file => (
        <FileRow file={file} key={file.id} linkLabel={PROJECT_PAGE_COPY.OPEN_IN_DRIVE} />
      ))}
    </Card>
  );
};

export default ProjectDriveCard;
