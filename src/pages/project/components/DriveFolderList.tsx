import { type FC, useState } from "react";
import DriveFolderFiles from "./DriveFolderFiles";
import { toggleSelectedId } from "../../../utilities/selection.utility";
import { DRIVE_FILE_COPY } from "../../../constants/drive-file.constant";
import { toDriveFolderView } from "../../../utilities/drive-folder.utility";
import type { IProjectFolder } from "../../../interfaces/project.interface";
import FolderAccordion from "../../../components/FolderAccordion/FolderAccordion";
import DriveStatusBadge from "../../../components/DriveStatusBadge/DriveStatusBadge";

interface IDriveFolderListProps {
  projectId: string;
  badgeSize: number;
  parentPath?: string;
  isRefreshing: boolean;
  folders: IProjectFolder[];
}

const DriveFolderList: FC<IDriveFolderListProps> = ({
  folders,
  projectId,
  parentPath = DRIVE_FILE_COPY.ROOT,
  badgeSize,
  isRefreshing,
}) => {
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);

  const folderViews = folders.map(folder => ({
    ...toDriveFolderView({ folder, isRefreshing }),
    path: `${parentPath} / ${folder.name}`,
  }));

  const handleFolderToggle = (folderId: string) =>
    setExpandedFolderId(currentId => toggleSelectedId(currentId, folderId));

  return folderViews.map(({ folder, badgeState, caption, path }) => (
    <FolderAccordion
      key={folder.id}
      caption={caption}
      icon={folder.icon}
      title={folder.name}
      isExpanded={folder.id === expandedFolderId}
      onToggle={() => handleFolderToggle(folder.id)}
      badge={<DriveStatusBadge size={badgeSize} state={badgeState} />}
    >
      <DriveFolderFiles folder={folder} folderPath={path} projectId={projectId} />
    </FolderAccordion>
  ));
};

export default DriveFolderList;
