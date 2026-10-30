import {
  getCustomerProjectPath,
  getCustomerProjectContext,
} from "../../../utilities/customer-project.utility";

import type { FC } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useStyles } from "./CustomerProjects.style";
import { stopPropagation } from "../../../utilities/event.utility";
import type { ICustomerProjectItem } from "../../../interfaces/customer-project.interface";

interface ICustomerProjectNameCellProps {
  project: ICustomerProjectItem;
}

const CustomerProjectNameCell: FC<ICustomerProjectNameCellProps> = ({ project }) => {
  const styles = useStyles();
  const context = getCustomerProjectContext(project);
  const path = getCustomerProjectPath(project);
  return (
    <Box>
      <Box
        to={path}
        component={Link}
        sx={styles.link}
        title={project.name}
        onClick={stopPropagation}
      >
        <Box component="b" sx={styles.name}>
          {project.name}
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
    </Box>
  );
};
export default CustomerProjectNameCell;
