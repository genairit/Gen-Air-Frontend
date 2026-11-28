import Icon from "../Icon/Icon";
import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./FileRow.style";
import { theme } from "../../constants/theme.constants";
import { ICON_NAMES } from "../../constants/icon.constant";
import type { IProjectFile } from "../../interfaces/project.interface";

interface IFileRowProps {
  linkLabel: string;
  file: IProjectFile;
  actions?: ReactNode;
}

const FileRow: FC<IFileRowProps> = ({ file, linkLabel, actions }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.row}>
      {file.icon && <Icon size={26} name={file.icon} color={theme.palette.primary} />}
      <Box sx={styles.details}>
        <Box
          component="a"
          href={file.url}
          target="_blank"
          sx={styles.name}
          rel="noopener noreferrer"
        >
          {file.name}
        </Box>
        <Box component="span" sx={styles.meta}>
          {file.meta}
        </Box>
      </Box>
      <Box component="a" target="_blank" href={file.url} sx={styles.link} rel="noopener noreferrer">
        <Icon size={18} name={ICON_NAMES.OPEN} />
        {linkLabel}
      </Box>
      {actions}
    </Box>
  );
};

export default FileRow;
