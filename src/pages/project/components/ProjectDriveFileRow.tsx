import type { FC } from "react";
import DriveFileActions from "./DriveFileActions";
import FileRow from "../../../components/FileRow/FileRow";
import type { IProjectFile } from "../../../interfaces/project.interface";
import { PROJECT_PAGE_COPY } from "../../../constants/project-page.constant";

interface IProjectDriveFileRowProps {
  projectId: string;
  folderName: string;
  file: IProjectFile;
}
const ProjectDriveFileRow: FC<IProjectDriveFileRowProps> = ({ projectId, file, folderName }) => (
  <FileRow
    file={file}
    linkLabel={PROJECT_PAGE_COPY.OPEN_IN_DRIVE}
    actions={<DriveFileActions projectId={projectId} file={file} folderName={folderName} />}
  />
);
export default ProjectDriveFileRow;
