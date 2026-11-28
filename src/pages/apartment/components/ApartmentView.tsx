import type { FC } from "react";
import { Box } from "@mui/material";
import ParentNotesCard from "./ParentNotesCard";
import { usePageStyles } from "../../page.style";
import ApartmentNotesCard from "./ApartmentNotesCard";
import ApartmentHeaderCard from "./ApartmentHeaderCard";
import ApartmentContactCard from "./ApartmentContactCard";
import ApartmentLightingCard from "./ApartmentLightingCard";
import ApartmentInheritedCard from "./ApartmentInheritedCard";
import { useSessionUser } from "../../../store/session.store";
import ApartmentCommercialCard from "./ApartmentCommercialCard";
import ApartmentEndCustomerCard from "./ApartmentEndCustomerCard";
import SharedProjectDocumentCard from "./SharedProjectDocumentCard";
import { PERMISSIONS } from "../../../constants/permission.constant";
import { hasPermission } from "../../../utilities/permission.utility";
import ProjectDriveCard from "../../project/components/ProjectDriveCard";
import ProjectTasksCard from "../../project/components/ProjectTasksCard";
import { PROJECT_TABS } from "../../../constants/project-workspace.constant";
import ProjectTimelineCard from "../../project/components/ProjectTimelineCard";
import ProjectContacts from "../../../components/ProjectContacts/ProjectContacts";
import ProjectEstimatesPanel from "../../project/components/ProjectEstimatesPanel";
import ProjectQuotationsCard from "../../project/components/ProjectQuotationsCard";
import ProjectWorkspace from "../../../components/ProjectWorkspace/ProjectWorkspace";
import type { IApiProject, IApiProjectStage } from "../../../interfaces/api.interface";
import ProjectPurchaseDocuments from "../../project/components/ProjectPurchaseDocuments";
import ProjectPeoplePanel from "../../../components/ProjectPeoplePanel/ProjectPeoplePanel";
import CustomerContactSummary from "../../../components/CustomerContacts/CustomerContactSummary";

interface IApartmentViewProps {
  building: IApiProject;
  apartment: IApiProject;
  stages: IApiProjectStage[];
}

const ApartmentView: FC<IApartmentViewProps> = ({ stages, building, apartment }) => {
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const canReadDrive = hasPermission(sessionUser, PERMISSIONS.DRIVE_READ);
  const canReadTasks = hasPermission(sessionUser, PERMISSIONS.TASKS_READ);
  const canEdit = hasPermission(sessionUser, PERMISSIONS.PROJECTS_UPDATE);
  const canReadQuotations = hasPermission(sessionUser, PERMISSIONS.QUOTATIONS_READ);

  const canReadEstimates = hasPermission(sessionUser, PERMISSIONS.ENGINEERING_ESTIMATES_READ);
  const canReadPurchase = hasPermission(sessionUser, PERMISSIONS.PROJECT_BOQ_READ);
  const panels = [
    ...(canReadTasks
      ? [
          {
            ...PROJECT_TABS.tasks,
            content: <ProjectTasksCard key={apartment.id} project={apartment} />,
          },
        ]
      : []),
    ...(canReadDrive
      ? [
          {
            ...PROJECT_TABS.files,
            content: (
              <>
                <ProjectDriveCard projectId={apartment.id} />
                <SharedProjectDocumentCard apartmentId={apartment.id} />
              </>
            ),
          },
        ]
      : []),
    ...(canReadQuotations
      ? [
          {
            ...PROJECT_TABS.quotations,
            content: <ProjectQuotationsCard projectId={apartment.id} />,
          },
        ]
      : []),
    ...(canReadEstimates
      ? [
          {
            ...PROJECT_TABS.estimates,
            content: <ProjectEstimatesPanel projectId={apartment.id} />,
          },
        ]
      : []),
    ...(canReadPurchase
      ? [
          {
            ...PROJECT_TABS.purchase,
            content: <ProjectPurchaseDocuments projectId={apartment.id} />,
          },
        ]
      : []),
    {
      ...PROJECT_TABS.details,
      content: (
        <Box sx={styles.grid({ minColumnWidth: 380, gap: "12px" })}>
          <ApartmentEndCustomerCard building={building} apartment={apartment} />
          <ApartmentInheritedCard apartment={apartment} />
          <ApartmentCommercialCard apartment={apartment} />
          <ApartmentLightingCard canEdit={canEdit} apartment={apartment} />
          <ParentNotesCard apartment={apartment} />
          <ApartmentNotesCard canEdit={canEdit} apartment={apartment} />
        </Box>
      ),
    },
    {
      ...PROJECT_TABS.people,
      content: (
        <ProjectPeoplePanel
          team={<ApartmentContactCard canEdit={canEdit} apartment={apartment} />}
          contacts={
            <>
              {apartment.customer && hasPermission(sessionUser, PERMISSIONS.CUSTOMERS_READ) && (
                <CustomerContactSummary
                  contacts={
                    apartment.customer.primaryContact ? [apartment.customer.primaryContact] : []
                  }
                />
              )}
              <ProjectContacts canEdit={canEdit} projectId={apartment.id} />
            </>
          }
        />
      ),
    },
    { ...PROJECT_TABS.history, content: <ProjectTimelineCard projectId={apartment.id} /> },
  ];

  return (
    <ProjectWorkspace
      panels={panels}
      defaultTab={canReadTasks ? PROJECT_TABS.tasks.id : PROJECT_TABS.details.id}
      header={<ApartmentHeaderCard stages={stages} building={building} apartment={apartment} />}
    />
  );
};

export default ApartmentView;
