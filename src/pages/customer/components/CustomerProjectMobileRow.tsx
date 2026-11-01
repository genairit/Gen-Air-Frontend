import {
  getCustomerProjectPath,
  getCustomerProjectContext,
} from "../../../utilities/customer-project.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import Card from "../../../components/Card/Card";
import { useStyles } from "./CustomerProjects.style";
import CustomerProjectTypeCell from "./CustomerProjectTypeCell";
import CustomerProjectStageCell from "./CustomerProjectStageCell";
import { stopPropagation } from "../../../utilities/event.utility";
import { formatRelativeTime } from "../../../utilities/date.utility";
import type { IApiProjectStage } from "../../../interfaces/api.interface";
import type { IProjectListItem } from "../../../interfaces/project-list.interface";
import type { ICustomerProjectItem } from "../../../interfaces/customer-project.interface";

interface ICustomerProjectMobileRowProps {
  canMove: boolean;
  stages: IApiProjectStage[];
  project: ICustomerProjectItem;
  onOpen: (project: ICustomerProjectItem) => void;
  onStageChange: (project: IProjectListItem, stageId: string) => void;
}

const CustomerProjectMobileRow: FC<ICustomerProjectMobileRowProps> = ({
  project,
  stages,
  canMove,
  onOpen,
  onStageChange,
}) => {
  const styles = useStyles();
  const context = getCustomerProjectContext(project);
  const path = getCustomerProjectPath(project);
  const updatedLabel = formatRelativeTime(project.updatedAt);
  return (
    <Card gap="10px" padding="14px" onClick={() => onOpen(project)}>
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
      </Box>
      <CustomerProjectStageCell
        stages={stages}
        project={project}
        canMove={canMove}
        onChange={onStageChange}
      />
    </Card>
  );
};
export default CustomerProjectMobileRow;
