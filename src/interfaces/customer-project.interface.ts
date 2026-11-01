import type { IProjectListItem } from "./project-list.interface";
import type { ICursorPage, IProjectStageCounts } from "./api.interface";
import type { CustomerProjectKindType } from "../constants/customer-project.constant";

export interface ICustomerProjectBuilding {
  id: string;
  name: string;
  code: string;
}

export interface ICustomerProjectItem extends IProjectListItem {
  apartmentCount: number;
  customerFloor: number | null;
  kind: CustomerProjectKindType;
  building: ICustomerProjectBuilding | null;
}

export interface ICustomerProjectPage extends ICursorPage<ICustomerProjectItem> {
  total: number;
  counts: IProjectStageCounts;
}

export interface ICustomerProjectQuery {
  search: string;
  stageId: string | null;
}
