import { type FC, useState } from "react";
import DriveFolderFiles from "./DriveFolderFiles";
import { toggleSelectedId } from "../../../utilities/selection.utility";
import { toDriveFolderView } from "../../../utilities/drive-folder.utility";
import type { IProjectFolder } from "../../../interfaces/project.interface";
import FolderAccordion from "../../../components/FolderAccordion/FolderAccordion";
import DriveStatusBadge from "../../../components/DriveStatusBadge/DriveStatusBadge";

interface IDriveFolderListProps {
  projectId: string;
  badgeSize: number;
  isRefreshing: boolean;
  folders: IProjectFolder[];
}

const DriveFolderList: FC<IDriveFolderListProps> = ({
  folders,
  projectId,
  badgeSize,
  isRefreshing,
}) => {
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);

  const folderViews = folders.map(folder => toDriveFolderView({ folder, isRefreshing }));

  const handleFolderToggle = (folderId: string) =>
    setExpandedFolderId(currentId => toggleSelectedId(currentId, folderId));

  return folderViews.map(({ folder, badgeState, caption }) => (
    <FolderAccordion
      key={folder.id}
      caption={caption}
      icon={folder.icon}
      title={folder.name}
      isExpanded={folder.id === expandedFolderId}
      onToggle={() => handleFolderToggle(folder.id)}
      badge={<DriveStatusBadge size={badgeSize} state={badgeState} />}
    >
      <DriveFolderFiles folder={folder} projectId={projectId} />
    </FolderAccordion>
  ));
};

export default DriveFolderList;
