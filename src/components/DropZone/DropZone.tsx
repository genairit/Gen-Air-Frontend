import Card from "../Card/Card";
import Icon from "../Icon/Icon";
import { Box } from "@mui/material";
import Button from "../Button/Button";
import { useStyles } from "./DropZone.style";
import { useFileDrop } from "../../hooks/file-drop.hook";
import { type FC, type ChangeEvent, useRef } from "react";
import { ICON_NAMES } from "../../constants/icon.constant";
import { getSelectedFiles } from "../../utilities/file.utility";
import { BUTTON_VARIANTS } from "../Button/constants/button.constants";

interface IDropZoneProps {
  title: string;
  accept?: string;
  compact?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  description: string;
  buttonLabel: string;
  onFilesSelected: (files: File[]) => void | Promise<void>;
}

const DropZone: FC<IDropZoneProps> = ({
  title,
  accept,
  compact = false,
  multiple = true,
  disabled = false,
  description,
  buttonLabel,
  onFilesSelected,
}) => {
  const padding = compact ? "20px 24px" : "40px 24px";
  const styles = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectFiles = async (files: File[]): Promise<void> => {
    if (!disabled) {
      await onFilesSelected(files);
    }
  };
  const { isDragging, dropHandlers } = useFileDrop(selectFiles);

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = getSelectedFiles(event);
    // Reset so picking the same file again still fires a change event.
    event.target.value = "";
    await selectFiles(files);
  };

  return (
    <Box {...dropHandlers}>
      <Card padding={padding} sx={styles.zone({ isDragging, compact })}>
        <Box sx={styles.plus}>
          <Icon size={44} name={ICON_NAMES.UPLOAD} />
        </Box>
        <Box component="b" sx={styles.title}>
          {title}
        </Box>
        <Box component="span" sx={styles.description}>
          {description}
        </Box>
        <Button
          text={buttonLabel}
          disabled={disabled}
          icon={ICON_NAMES.FOLDER}
          variant={BUTTON_VARIANTS.SECONDARY}
          onClick={() => fileInputRef.current?.click()}
        />
        <Box
          type="file"
          accept={accept}
          component="input"
          sx={styles.input}
          ref={fileInputRef}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
        />
      </Card>
    </Box>
  );
};

export default DropZone;
