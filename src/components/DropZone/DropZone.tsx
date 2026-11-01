import {
  DROP_ZONE_APPEARANCE,
  type DropZoneAppearanceType,
} from "../../constants/drop-zone.constant";

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
  appearance?: DropZoneAppearanceType;
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
  appearance = DROP_ZONE_APPEARANCE.SOFT,
}) => {
  const isOutlined = appearance === DROP_ZONE_APPEARANCE.OUTLINED;
  const regularPadding = compact ? "20px 24px" : "40px 24px";
  const padding = isOutlined ? "44px 20px" : regularPadding;
  const styles = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectFiles = async (files: File[]): Promise<void> => {
    if (!disabled) {
      await onFilesSelected(files);
    }
  };
  const { isDragging, dropHandlers } = useFileDrop(selectFiles);
  const zoneStyle = styles.zone({ isDragging, compact, isOutlined });
  const iconStyle = styles.plus({ isOutlined });
  const inputStyle = styles.input({ isOutlined });

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = getSelectedFiles(event);
    // Reset so picking the same file again still fires a change event.
    event.target.value = "";
    await selectFiles(files);
  };
  const uploadIcon = isOutlined ? "↑" : <Icon size={44} name={ICON_NAMES.UPLOAD} />;
  const fileButton = !isOutlined && (
    <Button
      text={buttonLabel}
      disabled={disabled}
      icon={ICON_NAMES.FOLDER}
      variant={BUTTON_VARIANTS.SECONDARY}
      onClick={() => fileInputRef.current?.click()}
    />
  );

  return (
    <Box {...dropHandlers}>
      <Card sx={zoneStyle} padding={padding}>
        <Box sx={iconStyle}>{uploadIcon}</Box>
        <Box component="b" sx={styles.title}>
          {title}
        </Box>
        <Box component="span" sx={styles.description}>
          {description}
        </Box>
        {fileButton}
        <Box
          type="file"
          accept={accept}
          sx={inputStyle}
          component="input"
          ref={fileInputRef}
          multiple={multiple}
          disabled={disabled}
          aria-label={buttonLabel}
          onChange={handleInputChange}
        />
      </Card>
    </Box>
  );
};

export default DropZone;
