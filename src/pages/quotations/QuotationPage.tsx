import type { FC } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "../../components/Button/Button";
import { useSessionUser } from "../../store/session.store";
import QuotationEditor from "./components/QuotationEditor";
import { PERMISSIONS } from "../../constants/permission.constant";
import { quotationService } from "../../services/quotation.service";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { QUOTATION_DETAIL_KEY } from "../../constants/quotation.constant";
import {
  canCancelQuotation,
  canRestoreQuotation,
  hasPermission,
} from "../../utilities/permission.utility";

const QuotationPage: FC = () => {
  const user = useSessionUser();
  const { quotationId } = useParams();
  const canCancel = canCancelQuotation(user);
  const canRestore = canRestoreQuotation(user);
  const canEditQuotation = hasPermission(user, PERMISSIONS.QUOTATIONS_UPDATE);
  const canDeleteQuotation = hasPermission(user, PERMISSIONS.QUOTATIONS_DELETE);
  const canApproveQuotation = hasPermission(user, PERMISSIONS.QUOTATIONS_APPROVE);
  const query = useQuery({
    queryKey: QUOTATION_DETAIL_KEY(quotationId ?? ""),
    queryFn: () => quotationService.get(quotationId ?? ""),
    enabled: quotationId != null && quotationId.length > 0,
    refetchOnWindowFocus: false,
  });
  if (query.isPending) {
    return <p role="status">טוען הצעת מחיר...</p>;
  }
  if (query.isError) {
    return (
      <div role="alert">
        {getApiErrorMessage(query.error)}
        <Button
          text="נסה שוב"
          onClick={async () => {
            await query.refetch();
          }}
        />
      </div>
    );
  }
  return (
    <QuotationEditor
      key={query.data.id}
      initial={query.data}
      canCancel={canCancel}
      canRestore={canRestore}
      editable={canEditQuotation}
      canDelete={canDeleteQuotation}
      canApprove={canApproveQuotation}
    />
  );
};
export default QuotationPage;
