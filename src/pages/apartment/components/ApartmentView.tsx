import type { FC } from "react";
import { Box } from "@mui/material";
import ParentNotesCard from "./ParentNotesCard";
import { usePageStyles } from "../../page.style";
import ApartmentNotesCard from "./ApartmentNotesCard";
import ApartmentHeaderCard from "./ApartmentHeaderCard";
import ApartmentContactCard from "./ApartmentContactCard";
import ApartmentInheritedCard from "./ApartmentInheritedCard";
import { useSessionUser } from "../../../store/session.store";
import ApartmentCommercialCard from "./ApartmentCommercialCard";
import ApartmentEndCustomerCard from "./ApartmentEndCustomerCard";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import ProjectDriveCard from "../../project/components/ProjectDriveCard";
import ProjectTimelineCard from "../../project/components/ProjectTimelineCard";
import type { IApiProject, IApiProjectStage } from "../../../interfaces/api.interface";

interface IApartmentViewProps {
  building: IApiProject;
  apartment: IApiProject;
  stages: IApiProjectStage[];
}

const ApartmentView: FC<IApartmentViewProps> = ({ stages, building, apartment }) => {
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const canReadDrive = hasPermission(sessionUser, PERMISSIONS.DRIVE_READ);
  const canEdit = hasPermission(sessionUser, PERMISSIONS.PROJECTS_UPDATE);

  return (
    <Box sx={styles.page}>
      <ApartmentHeaderCard stages={stages} building={building} apartment={apartment} />

      <Box sx={styles.grid({ minColumnWidth: 380 })}>
        <Box sx={styles.stack({})}>
          <ApartmentEndCustomerCard building={building} apartment={apartment} />
          <ApartmentContactCard canEdit={canEdit} apartment={apartment} />
        </Box>
        <ApartmentInheritedCard canEdit={canEdit} building={building} apartment={apartment} />
      </Box>

      <ApartmentCommercialCard apartment={apartment} />
      {canReadDrive && <ProjectDriveCard projectId={apartment.id} />}

      <Box sx={styles.grid({ minColumnWidth: 380 })}>
        <ParentNotesCard apartment={apartment} />
        <ApartmentNotesCard canEdit={canEdit} apartment={apartment} />
      </Box>
      <ProjectTimelineCard projectId={apartment.id} />
    </Box>
  );
};

export default ApartmentView;
