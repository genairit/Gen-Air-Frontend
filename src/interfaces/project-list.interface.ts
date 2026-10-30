import type { IApiUser, IApiProject, IApiProjectType, IApiProjectStage } from "./api.interface";

export interface IProjectListMember {
  user?: Pick<IApiUser, "id" | "firstName" | "lastName"> | null;
}

export interface IProjectListItem extends Pick<
  IApiProject,
  "id" | "name" | "code" | "stageId" | "updatedAt" | "parentProjectId" | "apartmentCount"
> {
  members?: IProjectListMember[];
  stage?: IApiProjectStage | null;
  projectType?: IApiProjectType | null;
}
