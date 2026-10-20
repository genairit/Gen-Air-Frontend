import type { FC } from "react";
import { Box } from "@mui/material";
import ParentNotesCard from "./ParentNotesCard";
import { usePageStyles } from "../../page.style";
import ApartmentNotesCard from "./ApartmentNotesCard";
import ApartmentHeaderCard from "./ApartmentHeaderCard";
import ApartmentContactCard from "./ApartmentContactCard";
import ApartmentInheritedCard from "./ApartmentInheritedCard";
import { useSessionUser } from "../../../store/session.store";
import ApartmentEndCustomerCard from "./ApartmentEndCustomerCard";
import { hasPermission } from "../../../utilities/permission.utility";
import ProjectTeamCard from "../../project/components/ProjectTeamCard";
import ProjectDriveCard from "../../project/components/ProjectDriveCard";
import type { IApiProject, IApiProjectStage } from "../../../interfaces/api.interface";

interface IApartmentViewProps {
  building: IApiProject;
  apartment: IApiProject;
  stages: IApiProjectStage[];
}

const ApartmentView: FC<IApartmentViewProps> = ({ stages, building, apartment }) => {
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const canEdit = hasPermission(sessionUser, "EDIT_PROJECTS");

  return (
    <Box sx={styles.page}>
      <ApartmentHeaderCard stages={stages} building={building} apartment={apartment} />

      <ProjectDriveCard projectId={apartment.id} />

      <Box sx={styles.grid({ minColumnWidth: 380 })}>
        <Box sx={styles.stack({})}>
          <ApartmentEndCustomerCard apartment={apartment} />
          <ApartmentContactCard apartment={apartment} />
          <ProjectTeamCard members={apartment.members ?? []} />
        </Box>
        <ApartmentInheritedCard canEdit={canEdit} building={building} apartment={apartment} />
      </Box>

      <Box sx={styles.grid({ minColumnWidth: 380 })}>
        <ParentNotesCard apartment={apartment} />
        <ApartmentNotesCard canEdit={canEdit} apartment={apartment} />
      </Box>
    </Box>
  );
};

export default ApartmentView;
