import {
  getCustomerProjectPath,
  getCustomerProjectContext,
} from "../../../utilities/customer-project.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import Card from "../../../components/Card/Card";
import Chip from "../../../components/Chip/Chip";
import { useStyles } from "./CustomerProjects.style";
import { theme } from "../../../constants/theme.constants";
import CustomerProjectTypeCell from "./CustomerProjectTypeCell";
import { formatStageLabel } from "../../../utilities/text.utility";
import { stopPropagation } from "../../../utilities/event.utility";
import { formatRelativeTime } from "../../../utilities/date.utility";
import type { ICustomerProjectItem } from "../../../interfaces/customer-project.interface";

interface ICustomerProjectMobileRowProps {
  project: ICustomerProjectItem;
  onOpen: (project: ICustomerProjectItem) => void;
}

const CustomerProjectMobileRow: FC<ICustomerProjectMobileRowProps> = ({ project, onOpen }) => {
  const styles = useStyles();
  const context = getCustomerProjectContext(project);
  const path = getCustomerProjectPath(project);
  const updatedLabel = formatRelativeTime(project.updatedAt);
  return (
    <Card gap="10px" padding="14px" ariaLabel={project.name} onClick={() => onOpen(project)}>
      <Box sx={styles.mobileHeader}>
        <Box to={path} component={Link} sx={styles.link} onClick={stopPropagation}>
          <Box component="b" sx={styles.mobileName}>
            {project.name}
          </Box>
        </Box>
        <Box component="span" sx={styles.code}>
          {project.code}
        </Box>
      </Box>
      {context && (
        <Box component="span" sx={styles.caption}>
          {context}
        </Box>
      )}
      <Box sx={styles.type}>
        <CustomerProjectTypeCell project={project} />
        <Box component="span" sx={styles.caption}>
          {updatedLabel}
        </Box>
        {project.stage && (
          <Chip
            label={formatStageLabel(project.stage.name)}
            dotColor={project.stage.color ?? theme.palette.statusGray}
          />
        )}
      </Box>
    </Card>
  );
};
export default CustomerProjectMobileRow;
