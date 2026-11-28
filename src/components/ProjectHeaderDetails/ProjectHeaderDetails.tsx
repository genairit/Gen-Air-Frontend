import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { useStyles } from "./ProjectHeaderDetails.style";
import type { IApiProject } from "../../interfaces/api.interface";

interface IProjectHeaderDetailsProps {
  children: ReactNode;
  project: IApiProject;
}

const ProjectHeaderDetails = ({ project, children }: IProjectHeaderDetailsProps) => {
  const styles = useStyles();
  return (
    <Box sx={styles.section}>
      <Box component="dl" sx={styles.summary}>
        <Box>
          <Box component="dt" sx={styles.label}>
            לקוח
          </Box>
          <Box component="dd" sx={styles.value}>
            {project.customer?.name ?? project.customerName ?? "לא שויך לקוח"}
          </Box>
        </Box>
        <Box>
          <Box component="dt" sx={styles.label}>
            סוג פרויקט
          </Box>
          <Box component="dd" sx={styles.value}>
            {project.projectType?.name ?? "—"}
          </Box>
        </Box>
        <Box>
          <Box component="dt" sx={styles.label}>
            כתובת
          </Box>
          <Box component="dd" sx={styles.value}>
            {project.address ?? "לא צוינה כתובת"}
          </Box>
        </Box>
      </Box>
      <Box component="details" sx={styles.disclosure}>
        <Box sx={styles.toggle} component="summary">
          פרטים נוספים
        </Box>
        <Box sx={styles.content}>{children}</Box>
      </Box>
    </Box>
  );
};
export default ProjectHeaderDetails;
