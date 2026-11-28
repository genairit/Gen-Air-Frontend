import type { FC } from "react";
import { Box } from "@mui/material";
import ProjectTeamCard from "./ProjectTeamCard";
import { usePageStyles } from "../../page.style";
import ProjectDriveCard from "./ProjectDriveCard";
import ProjectTasksCard from "./ProjectTasksCard";
import ProjectPageHeader from "./ProjectPageHeader";
import ProjectIntakeCard from "./ProjectIntakeCard";
import ProjectTimelineCard from "./ProjectTimelineCard";
import ProjectCustomerCard from "./ProjectCustomerCard";
import ProjectEstimatesPanel from "./ProjectEstimatesPanel";
import ProjectQuotationsCard from "./ProjectQuotationsCard";
import { useSessionUser } from "../../../store/session.store";
import ProjectPurchaseDocuments from "./ProjectPurchaseDocuments";
import BuildingInheritedCard from "./building/BuildingInheritedCard";
import { PERMISSIONS } from "../../../constants/permission.constant";
import type { IApiProject } from "../../../interfaces/api.interface";
import { getProjectKind } from "../../../utilities/apartment.utility";
import { hasPermission } from "../../../utilities/permission.utility";
import BuildingApartmentsPanel from "./building/BuildingApartmentsPanel";
import { PROJECT_TABS } from "../../../constants/project-workspace.constant";
import { toErpSyncCaption } from "../../../utilities/mappers/project.mapper";
import ProjectContacts from "../../../components/ProjectContacts/ProjectContacts";
import ProjectWorkspace from "../../../components/ProjectWorkspace/ProjectWorkspace";
import ProjectPeoplePanel from "../../../components/ProjectPeoplePanel/ProjectPeoplePanel";
import CustomerContactSummary from "../../../components/CustomerContacts/CustomerContactSummary";

interface IProjectRecordViewProps {
  project: IApiProject;
}

const ProjectRecordView: FC<IProjectRecordViewProps> = ({ project }) => {
  const building = getProjectKind(project) === "building";
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const fieldSet = project.projectType?.detailFieldSet ?? null;
  const canReadDrive = hasPermission(sessionUser, PERMISSIONS.DRIVE_READ);
  const canReadTasks = hasPermission(sessionUser, PERMISSIONS.TASKS_READ);
  const canEdit = hasPermission(sessionUser, PERMISSIONS.PROJECTS_UPDATE);
  const canReadQuotations = building && hasPermission(sessionUser, PERMISSIONS.QUOTATIONS_READ);
  const canReadEstimates = hasPermission(sessionUser, PERMISSIONS.ENGINEERING_ESTIMATES_READ);
  const canReadPurchase = hasPermission(sessionUser, PERMISSIONS.PROJECT_BOQ_READ);
  const panels = [
    ...(canReadTasks
      ? [
          {
            ...PROJECT_TABS.tasks,
            content: <ProjectTasksCard key={project.id} project={project} />,
          },
        ]
      : []),
    ...(canReadDrive
      ? [
          {
            ...PROJECT_TABS.files,
            content: <ProjectDriveCard projectId={project.id} shareWithApartments={building} />,
          },
        ]
      : []),
    ...(building
      ? [
          {
            ...PROJECT_TABS.apartments,
            content: <BuildingApartmentsPanel project={project} />,
          },
        ]
      : []),
    ...(canReadQuotations
      ? [
          {
            ...PROJECT_TABS.quotations,
            content: <ProjectQuotationsCard projectId={project.id} />,
          },
        ]
      : []),
    ...(canReadEstimates
      ? [
          {
            ...PROJECT_TABS.estimates,
            content: <ProjectEstimatesPanel projectId={project.id} />,
          },
        ]
      : []),
    ...(canReadPurchase
      ? [{ ...PROJECT_TABS.purchase, content: <ProjectPurchaseDocuments projectId={project.id} /> }]
      : []),
    {
      ...PROJECT_TABS.details,
      content: (
        <>
          <Box sx={styles.grid({ minColumnWidth: 400, gap: "12px" })}>
            {building ? (
              <BuildingInheritedCard building={project} />
            ) : (
              <ProjectIntakeCard onEdit={null} project={project} />
            )}
            {fieldSet && (
              <ProjectCustomerCard
                onEdit={null}
                project={project}
                fieldSet={fieldSet}
                typeName={project.projectType?.name ?? ""}
              />
            )}
          </Box>
          <Box component="p" sx={styles.caption}>
            {toErpSyncCaption(project.prioritySyncedAt)}
          </Box>
        </>
      ),
    },
    {
      ...PROJECT_TABS.people,
      content: (
        <ProjectPeoplePanel
          team={<ProjectTeamCard members={project.members ?? []} />}
          contacts={
            <>
              {project.customer && hasPermission(sessionUser, PERMISSIONS.CUSTOMERS_READ) && (
                <CustomerContactSummary
                  contacts={
                    project.customer.primaryContact ? [project.customer.primaryContact] : []
                  }
                />
              )}
              <ProjectContacts canEdit={canEdit} projectId={project.id} />
            </>
          }
        />
      ),
    },
    { ...PROJECT_TABS.history, content: <ProjectTimelineCard projectId={project.id} /> },
  ];
  return (
    <ProjectWorkspace
      panels={panels}
      header={<ProjectPageHeader project={project} />}
      defaultTab={canReadTasks ? PROJECT_TABS.tasks.id : PROJECT_TABS.details.id}
    />
  );
};
export default ProjectRecordView;
