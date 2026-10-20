import type { FC } from "react";
import { Box } from "@mui/material";
import { useStyles } from "./DriveFileManager.style";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import type { IDriveFolderLocation } from "../../../interfaces/drive-file.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { DRIVE_FILE_COPY, ROOT_DRIVE_LOCATION } from "../../../constants/drive-file.constant";

interface IDriveFolderPickerProps {
  projectId: string;
  disabled: boolean;
  path: IDriveFolderLocation[];
  onChange: (path: IDriveFolderLocation[]) => void;
}

const DriveFolderPicker: FC<IDriveFolderPickerProps> = ({
  projectId,
  path,
  disabled,
  onChange,
}) => {
  const styles = useStyles();
  const location = path.at(-1) ?? ROOT_DRIVE_LOCATION;
  const query = useProjectDriveQuery(projectId, location.folderId);
  const pathLabel = path.map(folder => folder.name).join(" / ");
  const canGoBack = path.length > 1;
  const isEmpty = query.isSuccess && query.data.folders.length === 0;

  const folders = query.data?.folders ?? [];
  const retry = async () => {
    await query.refetch();
  };

  return (
    <Box sx={styles.stack}>
      <Box component="span" sx={styles.path}>
        {DRIVE_FILE_COPY.DESTINATION}: {pathLabel}
      </Box>
      {canGoBack && (
        <Button
          disabled={disabled}
          text={DRIVE_FILE_COPY.BACK}
          onClick={() => onChange(path.slice(0, -1))}
        />
      )}
      {query.isPending && <LoadingState label={DRIVE_FILE_COPY.LOADING} />}
      {query.isError && (
        <Box>
          <InlineError message={DRIVE_FILE_COPY.FOLDER_ERROR} />
          <Button onClick={retry} text={DRIVE_FILE_COPY.RETRY} />
        </Box>
      )}
      {folders.map(folder => (
        <Button
          key={folder.id}
          sx={styles.folder}
          text={folder.name}
          disabled={disabled}
          icon={ICON_NAMES.FOLDER}
          variant={BUTTON_VARIANTS.NEUTRAL}
          onClick={() => onChange([...path, { folderId: folder.id, name: folder.name }])}
        />
      ))}
      {isEmpty && (
        <Box component="span" sx={styles.path}>
          {DRIVE_FILE_COPY.NO_FOLDERS}
        </Box>
      )}
    </Box>
  );
};
export default DriveFolderPicker;
