import { queryClient } from "../providers/query-client";
import { projectService } from "../services/project.service";
import { QUERY_ROOTS } from "../constants/query-key.constant";
import { apartmentService } from "../services/apartment.service";
import type { IStageMove } from "../interfaces/project.interface";
import { toApartmentPayload } from "../utilities/apartment.utility";
import type { IApartmentChanges } from "../interfaces/api-request.interface";
import type { IApartmentFormValues } from "../interfaces/apartment.interface";
import { AuthorizationContext } from "../managers/authorization-context.manager";

const invalidateApartmentQueries = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.APARTMENTS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMER_PROJECTS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.APARTMENT_STAGE_COUNTS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECT] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.PROJECTS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.TRANSITIONS] }),
  ]);

export const createApartmentAction = async ({
  values,
  buildingId,
}: {
  buildingId: string;
  values: IApartmentFormValues;
}): Promise<string> => {
  const context = new AuthorizationContext();
  const apartment = await apartmentService.create(buildingId, toApartmentPayload(values));
  context.assertCurrent();

  await invalidateApartmentQueries();
  context.assertCurrent();

  return apartment.id;
};

export const updateApartmentAction = async ({
  changes,
  apartmentId,
}: {
  apartmentId: string;
  changes: IApartmentChanges;
}): Promise<void> => {
  const context = new AuthorizationContext();
  await apartmentService.update(apartmentId, changes);
  context.assertCurrent();
  await invalidateApartmentQueries();
  context.assertCurrent();
};

export const moveApartmentsToStageAction = async ({
  apartmentIds,
  ...move
}: IStageMove & { apartmentIds: string[] }): Promise<void> => {
  const context = new AuthorizationContext();
  await Promise.all(apartmentIds.map(apartmentId => projectService.moveToStage(apartmentId, move)));
  context.assertCurrent();
  await invalidateApartmentQueries();
  context.assertCurrent();
};
