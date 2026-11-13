import { useMutation } from "@tanstack/react-query";
import { saveQuotationApartmentLinksAction } from "../../actions/quotation-sharing.action";

export const useSaveQuotationApartmentLinksMutation = () =>
  useMutation({ mutationFn: saveQuotationApartmentLinksAction });
