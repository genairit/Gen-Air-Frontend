import type { FC } from "react";
import { Box } from "@mui/material";
import Dot from "../../../components/Dot/Dot";
import { useStyles } from "./CustomerProjects.style";
import { theme } from "../../../constants/theme.constants";
import ProjectStageCell from "../../board/columns/cells/ProjectStageCell";
import type { IApiProjectStage } from "../../../interfaces/api.interface";
import type { IProjectListItem } from "../../../interfaces/project-list.interface";

interface ICustomerProjectStageCellProps {
  canMove: boolean;
  project: IProjectListItem;
  stages: IApiProjectStage[];
  onChange: (project: IProjectListItem, stageId: string) => void;
}

const CustomerProjectStageCell: FC<ICustomerProjectStageCellProps> = ({
  project,
  stages,
  canMove,
  onChange,
}) => {
  const styles = useStyles();
  const color = project.stage?.color ?? theme.palette.statusGray;
  return (
    <Box sx={styles.stageControl}>
      <ProjectStageCell stages={stages} project={project} canMove={canMove} onChange={onChange} />
      <Box sx={styles.stageDot}>
        <Dot size={9} color={color} />
      </Box>
    </Box>
  );
};
export default CustomerProjectStageCell;
