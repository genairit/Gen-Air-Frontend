import type { FC } from "react";
import ApartmentRedirect from "./components/ApartmentRedirect";
import ProjectRecordView from "./components/ProjectRecordView";
import type { IApiProject } from "../../interfaces/api.interface";
import type { ProjectKindType } from "../../utilities/apartment.utility";

export const PROJECT_VIEWS: Record<ProjectKindType, FC<{ project: IApiProject }>> = {
  building: ProjectRecordView,
  apartment: ApartmentRedirect,
  standalone: ProjectRecordView,
};
