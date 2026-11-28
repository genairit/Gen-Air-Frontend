import { TIMEZONE } from "../../constants/date.constants";
import { useSessionUser } from "../../store/session.store";
import { API_ENDPOINTS } from "../../constants/api.constant";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { IQuotation } from "../../interfaces/quotation.interface";
import { QUOTATION_DETAIL_KEY } from "../../constants/quotation.constant";
import { SessionRequestManager } from "../../managers/session-request.manager";
import { httpClient, ensureResponse } from "../../services/http-client.service";
import { isQuotationDocumentContext } from "../../utilities/guards/quotation-document.guard";

export const useQuotationDocumentContext = (quotation: IQuotation) => {
  const { id } = quotation;
  const queryClient = useQueryClient();
  const saved = queryClient.getQueryData<IQuotation>(QUOTATION_DETAIL_KEY(id)) ?? quotation;
  const user = useSessionUser();
  const generation = SessionRequestManager.getAuthorizationGeneration();
  const key = ["quotation-document", user?.id ?? null, generation, id] as const;
  const printDay = new Intl.DateTimeFormat("he-IL", { timeZone: TIMEZONE }).format(new Date());
  return useQuery({
    enabled: Boolean(user),
    queryKey: [
      ...key,
      saved.customerId,
      saved.projectId,
      saved.salesAgentId,
      saved.status,
      printDay,
    ],
    queryFn: async ({ signal }) => {
      const endpoint = `${API_ENDPOINTS.quotationById(id)}/document-preview`;
      const response = await httpClient.get<unknown>(endpoint, { signal });
      return ensureResponse(endpoint, response.data, isQuotationDocumentContext);
    },
    placeholderData: (previous, previousQuery) => {
      if (key.every((part, index) => previousQuery?.queryKey[index] === part)) {
        return previous;
      }
      return undefined;
    },
  });
};
