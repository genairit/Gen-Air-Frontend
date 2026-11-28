import { useState, type FC } from "react";
import ProjectDriveUpload from "./ProjectDriveUpload";
import Button from "../../../components/Button/Button";
import ProjectDriveFileRow from "./ProjectDriveFileRow";
import { DRIVE_BROWSER_STYLES } from "./DriveBrowser.style";
import { Box, ButtonBase, useMediaQuery } from "@mui/material";
import Pagination from "../../../components/Pagination/Pagination";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import DriveStatusBadge from "../../../components/DriveStatusBadge/DriveStatusBadge";
import type { IDriveFolderLocation } from "../../../interfaces/drive-file.interface";
import { toProjectFile, toProjectFolder } from "../../../utilities/mappers/project.mapper";
import { toDriveFolderView, toDriveFolderUrl } from "../../../utilities/drive-folder.utility";
import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";
import {
  DRIVE_BROWSER_COPY,
  DRIVE_BROWSER_PAGE_SIZE,
  DRIVE_FILE_COPY,
  ROOT_DRIVE_LOCATION,
} from "../../../constants/drive-file.constant";

interface IDriveBrowserProps {
  projectId: string;
  rootFolderId: string;
}

const DriveBrowser: FC<IDriveBrowserProps> = ({ projectId, rootFolderId }) => {
  const [path, setPath] = useState<IDriveFolderLocation[]>([ROOT_DRIVE_LOCATION]);
  const [requestedPage, setPage] = useState(1);
  const shortScreen = useMediaQuery("(max-height: 800px), (max-width: 899px)");
  const pageSize = shortScreen ? DRIVE_BROWSER_PAGE_SIZE.SHORT : DRIVE_BROWSER_PAGE_SIZE.TALL;
  const current = path.at(-1) ?? ROOT_DRIVE_LOCATION;
  const query = useProjectDriveQuery(projectId, current.folderId);
  const folders = (query.data?.folders ?? []).map(toProjectFolder);
  const files = (query.data?.files ?? []).filter(file => !file.isFolder).map(toProjectFile);
  const entries = [
    ...folders.map(folder => ({ id: folder.id, folder, file: null })),
    ...files.map(file => ({ id: file.id, folder: null, file })),
  ];
  const pageCount = Math.ceil(entries.length / pageSize);
  const page = Math.min(requestedPage, Math.max(1, pageCount));
  const navigate = (next: IDriveFolderLocation[]) => {
    setPath(next);
    setPage(1);
  };
  return (
    <Box sx={DRIVE_BROWSER_STYLES.browser}>
      <Box sx={DRIVE_BROWSER_STYLES.toolbar}>
        <Box
          component="nav"
          aria-label={DRIVE_BROWSER_COPY.PATH}
          sx={DRIVE_BROWSER_STYLES.breadcrumb}
        >
          {path.map((folder, index) => (
            <Button
              size="compact"
              variant="neutral"
              text={folder.name}
              key={folder.folderId ?? "root"}
              disabled={index === path.length - 1}
              onClick={() => navigate(path.slice(0, index + 1))}
            />
          ))}
        </Box>
        <Box sx={DRIVE_BROWSER_STYLES.breadcrumb}>
          <ProjectDriveUpload
            initialPath={path}
            projectId={projectId}
            key={current.folderId ?? "root"}
          />
          <Box
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            sx={DRIVE_BROWSER_STYLES.driveLink}
            href={toDriveFolderUrl(query.data?.folderId ?? current.folderId ?? rootFolderId)}
          >
            {PROJECT_PAGE_COPY.OPEN_IN_DRIVE}
          </Box>
        </Box>
      </Box>
      {query.isPending && <LoadingState label={PROJECT_PAGE_STATUS_COPY.LOADING_FILES} />}
      {query.isError && (
        <>
          <InlineError message={getApiErrorMessage(query.error)} />
          <Button
            size="compact"
            text={DRIVE_FILE_COPY.RETRY}
            onClick={() => {
              void query.refetch();
            }}
          />
        </>
      )}
      {query.isSuccess && entries.length === 0 && (
        <Box sx={DRIVE_BROWSER_STYLES.empty}>{DRIVE_BROWSER_COPY.EMPTY}</Box>
      )}
      {entries.slice((page - 1) * pageSize, page * pageSize).map(({ id, folder, file }) => {
        const view = folder && toDriveFolderView({ folder, isRefreshing: query.isFetching });
        return folder && view ? (
          <ButtonBase
            key={id}
            sx={DRIVE_BROWSER_STYLES.folder}
            onClick={() => navigate([...path, { folderId: id, name: folder.name }])}
          >
            <Box component="b">{folder.name}</Box>
            <Box sx={DRIVE_BROWSER_STYLES.breadcrumb}>
              <Box component="span">{view.caption}</Box>
              <DriveStatusBadge size={18} state={view.badgeState} />
            </Box>
          </ButtonBase>
        ) : (
          file && (
            <ProjectDriveFileRow
              compact
              key={id}
              file={file}
              projectId={projectId}
              folderName={path.map(item => item.name).join(" / ")}
            />
          )
        );
      })}
      {pageCount > 1 && (
        <Pagination
          page={page}
          onChange={setPage}
          pageCount={pageCount}
          nextLabel={DRIVE_BROWSER_COPY.NEXT}
          previousLabel={DRIVE_BROWSER_COPY.PREVIOUS}
        />
      )}
    </Box>
  );
};
export default DriveBrowser;
