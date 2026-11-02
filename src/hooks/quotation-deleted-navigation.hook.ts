import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTE_PATHS } from "../constants/routes.constant";
import { QUOTATION_DETAIL_KEY } from "../constants/quotation.constant";

export const useQuotationDeletedNavigation = (deleted: boolean, id: string): void => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!deleted) {
      return;
    }
    navigate(ROUTE_PATHS.QUOTATIONS, { replace: true });
    queryClient.removeQueries({ queryKey: QUOTATION_DETAIL_KEY(id), exact: true });
  }, [deleted, id, navigate, queryClient]);
};
