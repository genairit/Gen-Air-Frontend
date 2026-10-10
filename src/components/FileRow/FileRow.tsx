import type { FC } from "react";
import Icon from "../Icon/Icon";
import { Box } from "@mui/material";
import { useStyles } from "./FileRow.style";
import { ICON_NAMES } from "../../constants/icon.constant";
import type { IProjectFile } from "../../interfaces/project.interface";

interface IFileRowProps {
  linkLabel: string;
  file: IProjectFile;
}

const FileRow: FC<IFileRowProps> = ({ file, linkLabel }) => {
  const styles = useStyles();

  return (
    <Box sx={styles.row}>
      {file.icon && <Icon size={26} name={file.icon} />}
      <Box sx={styles.details}>
        <Box component="span" sx={styles.name}>
          {file.name}
        </Box>
        <Box component="span" sx={styles.meta}>
          {file.meta}
        </Box>
      </Box>
      <Box component="a" target="_blank" href={file.url} rel="noreferrer" sx={styles.link}>
        <Icon size={18} name={ICON_NAMES.OPEN} />
        {linkLabel}
      </Box>
    </Box>
  );
};

export default FileRow;
