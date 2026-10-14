import type { FC } from "react";
import BuildingView from "./components/building/BuildingView";
import ApartmentRedirect from "./components/ApartmentRedirect";
import type { IApiProject } from "../../interfaces/api.interface";
import StandaloneProjectView from "./components/StandaloneProjectView";
import type { ProjectKindType } from "../../utilities/apartment.utility";

export const PROJECT_VIEWS: Record<ProjectKindType, FC<{ project: IApiProject }>> = {
  building: BuildingView,
  apartment: ApartmentRedirect,
  standalone: StandaloneProjectView,
};
