import { queryClient } from "../providers/query-client";
import { projectService } from "../services/project.service";
import { QUERY_ROOTS } from "../constants/query-key.constant";
import { apartmentService } from "../services/apartment.service";
import { toApartmentPayload } from "../utilities/apartment.utility";
import type { IApartmentChanges } from "../interfaces/api-request.interface";
import type { IApartmentFormValues } from "../interfaces/apartment.interface";

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
}) => {
  const apartment = await apartmentService.create(buildingId, toApartmentPayload(values));

  await invalidateApartmentQueries();

  return apartment.id;
};

export const updateApartmentAction = async ({
  changes,
  apartmentId,
}: {
  apartmentId: string;
  changes: IApartmentChanges;
}) => {
  await apartmentService.update(apartmentId, changes);
  await invalidateApartmentQueries();
};

export const moveApartmentsToStageAction = async ({
  stageId,
  apartmentIds,
}: {
  stageId: string;
  apartmentIds: string[];
}) => {
  await Promise.all(
    apartmentIds.map(apartmentId => projectService.moveToStage(apartmentId, stageId)),
  );
  await invalidateApartmentQueries();
};
