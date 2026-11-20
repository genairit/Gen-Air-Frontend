import type {
  ISupplierInput,
  IAgreementInput,
} from "../../interfaces/supplier-agreement.interface";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supplierAgreementService } from "../../services/supplier-agreement.service";

export const useSupplierAgreements = (projectId: string, enabled: boolean) => {
  const queryClient = useQueryClient();
  const suppliers = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => supplierAgreementService.suppliers(),
    enabled,
  });
  const agreements = useQuery({
    queryKey: ["supplier-agreements", projectId],
    queryFn: () => supplierAgreementService.agreements(projectId),
    enabled: enabled && projectId.length > 0,
  });
  const saveSupplier = async (input: ISupplierInput, id: string | null = null) => {
    const saved = id
      ? await supplierAgreementService.updateSupplier(id, input)
      : await supplierAgreementService.createSupplier(input);
    await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    return saved;
  };
  const saveAgreement = async (input: IAgreementInput, id: string | null = null) => {
    const saved = id
      ? await supplierAgreementService.updateAgreement(projectId, id, input)
      : await supplierAgreementService.createAgreement(projectId, input);
    await queryClient.invalidateQueries({ queryKey: ["supplier-agreements", projectId] });
    return saved;
  };
  return { suppliers, agreements, saveSupplier, saveAgreement };
};
