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
  description: string;
  buttonLabel: string;
  onFilesSelected: (files: File[]) => void;
}

const DropZone: FC<IDropZoneProps> = ({
  title,
  accept,
  description,
  buttonLabel,
  onFilesSelected,
}) => {
  const styles = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDragging, dropHandlers } = useFileDrop(onFilesSelected);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(getSelectedFiles(event));
    // Reset so picking the same file again still fires a change event.
    event.target.value = "";
  };

  return (
    <Box {...dropHandlers}>
      <Card padding="40px 24px" sx={styles.zone({ isDragging })}>
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
          icon={ICON_NAMES.FOLDER}
          variant={BUTTON_VARIANTS.SECONDARY}
          onClick={() => fileInputRef.current?.click()}
        />
        <Box
          multiple
          type="file"
          accept={accept}
          component="input"
          sx={styles.input}
          ref={fileInputRef}
          onChange={handleInputChange}
        />
      </Card>
    </Box>
  );
};

export default DropZone;
