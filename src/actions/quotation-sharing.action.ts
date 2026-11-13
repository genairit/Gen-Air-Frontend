import { queryClient } from "../providers/query-client";
import { quotationService } from "../services/quotation.service";
import type { IQuotation } from "../interfaces/quotation.interface";
import { QUOTATION_DETAIL_KEY } from "../constants/quotation.constant";
import { AuthorizationContext } from "../managers/authorization-context.manager";
import { QUOTATION_SHARING_KEYS } from "../constants/quotation-sharing.constant";

interface IQuotationApartmentLinksChange {
  quotationId: string;
  apartmentIds: string[];
  expectedApartmentIds: string[];
}

const keepSharedLinks = (shared: IQuotation) => (cached?: IQuotation) =>
  cached ? { ...cached, apartmentLinks: shared.apartmentLinks } : shared;

export const saveQuotationApartmentLinksAction = async ({
  quotationId,
  apartmentIds,
  expectedApartmentIds,
}: IQuotationApartmentLinksChange): Promise<IQuotation> => {
  const context = new AuthorizationContext();
  const shared = await quotationService.setApartmentLinks(
    quotationId,
    apartmentIds,
    expectedApartmentIds,
  );
  context.assertCurrent();
  queryClient.setQueryData(QUOTATION_DETAIL_KEY(quotationId), keepSharedLinks(shared));
  await queryClient.invalidateQueries({
    queryKey: [QUOTATION_SHARING_KEYS.PROJECT_QUOTATIONS_ROOT],
  });
  context.assertCurrent();

  return shared;
};
