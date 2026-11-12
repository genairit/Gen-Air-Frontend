import {
  QUOTATION_QUERY_KEY,
  QUOTATION_COUNTS_KEY,
  QUOTATION_ALL_TAB_ID,
  QUOTATION_STATUS_TABS,
} from "../../constants/quotation.constant";

import type { FC } from "react";
import { useState } from "react";
import { Box } from "@mui/material";
import styles from "./quotation.module.css";
import Card from "../../components/Card/Card";
import Tabs from "../../components/Tabs/Tabs";
import { useQuery } from "@tanstack/react-query";
import Button from "./components/QuotationButton";
import QuotationRow from "./components/QuotationRow";
import QuotationInput from "./components/QuotationInput";
import { TAB_MODES } from "../../constants/tabs.constant";
import { useSessionUser } from "../../store/session.store";
import { useNavigate, useLocation } from "react-router-dom";
import QuotationCloneForm from "./components/QuotationCloneForm";
import { PERMISSIONS } from "../../constants/permission.constant";
import { buildQuotationPath } from "../../utilities/route.utility";
import { hasPermission } from "../../utilities/permission.utility";
import { quotationService } from "../../services/quotation.service";
import { useDebouncedValue } from "../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../constants/search.constant";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import QuotationCustomerPicker from "./components/QuotationCustomerPicker";
import type { TQuotationStatus } from "../../interfaces/quotation.interface";
import QuotationSalesAgentPicker from "./components/QuotationSalesAgentPicker";
import { AuthorizationContext } from "../../managers/authorization-context.manager";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const QuotationsPage: FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(useLocation().search);
  const cloneFrom = searchParams.get("cloneFrom");
  const user = useSessionUser();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TQuotationStatus | null>(null);
  const [creating, setCreating] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [salesAgentId, setSalesAgentId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const quotations = useInfiniteQuery({
    queryKey: [...QUOTATION_QUERY_KEY, debouncedSearch, status],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      quotationService.list({ search: debouncedSearch, status, batchCursor: pageParam }),
    getNextPageParam: page => page.nextCursor,
  });
  const counts = useQuery({
    queryKey: [...QUOTATION_COUNTS_KEY, debouncedSearch],
    queryFn: () => quotationService.statusCounts(debouncedSearch),
  });
  const create = useMutation({
    mutationFn: quotationService.create,
    onSuccess: async quotation => {
      const context = new AuthorizationContext();
      await queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEY });
      context.assertCurrent();
      navigate(buildQuotationPath(quotation.id));
    },
  });
  const canCreate = hasPermission(user, PERMISSIONS.QUOTATIONS_CREATE);
  const canClone =
    canCreate &&
    hasPermission(user, PERMISSIONS.QUOTATIONS_READ) &&
    hasPermission(user, PERMISSIONS.PROJECTS_READ);
  const list = quotations.data?.pages.flatMap(page => page.items) ?? [];
  const tabs = QUOTATION_STATUS_TABS;
  const filterTabs = tabs.map(tab => ({
    id: tab.key ?? QUOTATION_ALL_TAB_ID,
    label: tab.label,
    count: counts.data?.[tab.key ?? QUOTATION_ALL_TAB_ID] ?? "—",
  }));

  const handleTabChange = (id: string) => {
    setStatus(tabs.find(tab => (tab.key ?? QUOTATION_ALL_TAB_ID) === id)?.key ?? null);
  };

  return (
    <Box component="main" className={styles.page}>
      <Box component="section" className={styles.listHeading}>
        <Box component="span" className={styles.breadcrumb}>
          הצעות מחיר · נשמרות בשרת
        </Box>
        <Box component="div" className={styles.between}>
          <Box component="div">
            <Box component="h1" className={styles.listTitle}>
              הצעות מחיר
            </Box>
            <Box component="p" className={styles.muted}>
              הצעה נפתחת מלקוח, עם או בלי פרויקט, וניתן לקשר אותה לפרויקט בהמשך. לפרויקט יכולות
              להיות כמה הצעות.
            </Box>
          </Box>
          {canCreate && !cloneFrom && (
            <Button
              text="+ הצעה חדשה"
              ariaLabel="הצעה חדשה"
              onClick={() => setCreating(!creating)}
            />
          )}
        </Box>
        {canClone && cloneFrom && (
          <QuotationCloneForm
            sourceId={cloneFrom}
            onCancel={() => navigate(buildQuotationPath(cloneFrom))}
          />
        )}
        {cloneFrom && !canClone && (
          <Box role="alert" component="p" className={styles.error}>
            אין הרשאה לשכפל הצעת מחיר.
          </Box>
        )}
        {creating && !cloneFrom && (
          <Box component="div" className={styles.stack}>
            <QuotationCustomerPicker value={customerId} onChange={setCustomerId} />
            <QuotationSalesAgentPicker
              value={salesAgentId}
              onChange={setSalesAgentId}
              disabled={create.isPending}
            />
            <Button
              text="יצירת הצעה"
              disabled={!customerId}
              isLoading={create.isPending}
              onClick={() => create.mutate({ customerId, salesAgentId })}
            />
            {create.isError && (
              <Box role="alert" component="p" className={styles.error}>
                {getApiErrorMessage(create.error)}
              </Box>
            )}
          </Box>
        )}
      </Box>
      <Card>
        <Box component="div" className={styles.listToolbar}>
          <QuotationInput
            type="search"
            value={search}
            label="חיפוש לפי מספר, לקוח, פרויקט או חברה"
            placeholder="חיפוש לפי מספר, לקוח או פרויקט..."
            onChange={event => setSearch(event.target.value)}
          />
          <Tabs
            items={filterTabs}
            formatCount={String}
            mode={TAB_MODES.FILTER}
            onChange={handleTabChange}
            ariaLabel="סינון הצעות מחיר"
            activeId={status ?? QUOTATION_ALL_TAB_ID}
          />
        </Box>
        {counts.isError && (
          <Box role="alert" component="div" className={styles.error}>
            {getApiErrorMessage(counts.error)}
            <Button
              text="נסה שוב"
              onClick={async () => {
                await counts.refetch();
              }}
            />
          </Box>
        )}
        {quotations.isPending && (
          <Box component="p" role="status">
            טוען הצעות מחיר...
          </Box>
        )}
        {quotations.isError && (
          <Box role="alert" component="div" className={styles.error}>
            {getApiErrorMessage(quotations.error)}
            <Button
              text="נסה שוב"
              onClick={async () => {
                await quotations.refetch();
              }}
            />
          </Box>
        )}
        {!quotations.isPending && !list.length && <Box component="p">לא נמצאו הצעות מחיר</Box>}
        {list.map(quotation => (
          <QuotationRow
            key={quotation.id}
            quotation={quotation}
            onOpen={() => navigate(buildQuotationPath(quotation.id))}
          />
        ))}
        {quotations.hasNextPage && (
          <Button
            text="טען עוד הצעות"
            isLoading={quotations.isFetchingNextPage}
            onClick={async () => {
              await quotations.fetchNextPage();
            }}
          />
        )}
      </Card>
    </Box>
  );
};
export default QuotationsPage;
