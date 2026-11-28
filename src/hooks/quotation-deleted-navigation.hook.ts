import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { getQuotationReturnPath } from "../utilities/route.utility";
import { QUOTATION_DETAIL_KEY } from "../constants/quotation.constant";

export const useQuotationDeletedNavigation = (
  deleted: boolean,
  id: string,
  projectId: string | null,
): void => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { state } = useLocation();
  const returnPath = getQuotationReturnPath(state?.quotationReturnTo, projectId);
  useEffect(() => {
    if (!deleted) {
      return;
    }
    navigate(returnPath, { replace: true, state: { buildingSearch: state?.buildingSearch } });
    queryClient.removeQueries({ queryKey: QUOTATION_DETAIL_KEY(id), exact: true });
  }, [deleted, id, navigate, queryClient, returnPath, state]);
};
