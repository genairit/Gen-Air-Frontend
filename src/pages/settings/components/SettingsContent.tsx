import type { FC } from "react";
import { Box } from "@mui/material";
import PasswordCard from "./PasswordCard";
import { usePageStyles } from "../../page.style";
import StatusStagesCard from "./StatusStagesCard";
import { SETTINGS_COPY } from "../../../constants/settings.constant";
import type { IStatusStage } from "../../../interfaces/project.interface";

interface ISettingsContentProps {
  stages: IStatusStage[];
}
const SettingsContent: FC<ISettingsContentProps> = ({ stages }) => {
  const styles = usePageStyles();
  return (
    <Box sx={styles.page}>
      <Box sx={styles.header}>
        <Box sx={styles.headerText}>
          <Box component="h1" sx={styles.heading}>
            {SETTINGS_COPY.TITLE}
          </Box>
          <Box component="span" sx={styles.description}>
            {SETTINGS_COPY.DESCRIPTION}
          </Box>
        </Box>
      </Box>
      <Box sx={styles.grid({ minColumnWidth: 400 })}>
        <StatusStagesCard stages={stages} />
        <Box sx={styles.stack({})}>
          <PasswordCard />
        </Box>
      </Box>
    </Box>
  );
};
export default SettingsContent;
