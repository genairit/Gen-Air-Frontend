import {
  QUOTATION_QUERY_KEY,
  QUOTATION_STATUS_TABS,
  QUOTATION_STATUS_LABELS,
} from "../../constants/quotation.constant";

import type { FC } from "react";
import { useState } from "react";
import styles from "./quotation.module.css";
import Card from "../../components/Card/Card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "../../components/Button/Button";
import QuotationInput from "./components/QuotationInput";
import { useSessionUser } from "../../store/session.store";
import { formatRelativeTime } from "../../utilities/date.utility";
import { PERMISSIONS } from "../../constants/permission.constant";
import { buildQuotationPath } from "../../utilities/route.utility";
import { hasPermission } from "../../utilities/permission.utility";
import { quotationMoney } from "../../utilities/quotation.utility";
import { quotationService } from "../../services/quotation.service";
import { useDebouncedValue } from "../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../constants/search.constant";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { QUOTATION_COUNTS_KEY } from "../../constants/quotation.constant";
import QuotationCustomerPicker from "./components/QuotationCustomerPicker";
import type { TQuotationStatus } from "../../interfaces/quotation.interface";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const QuotationsPage: FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useSessionUser();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TQuotationStatus | null>(null);
  const [creating, setCreating] = useState(false);
  const [customerId, setCustomerId] = useState("");
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
      await queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEY });
      navigate(buildQuotationPath(quotation.id));
    },
  });
  const canCreate = hasPermission(user, PERMISSIONS.QUOTATIONS_CREATE);
  const list = quotations.data?.pages.flatMap(page => page.items) ?? [];
  const tabs = QUOTATION_STATUS_TABS;
  return (
    <main className={styles.page}>
      <section className={styles.listHeading}>
        <span className={styles.breadcrumb}>הצעות מחיר · נשמרות בשרת</span>
        <div className={styles.between}>
          <div>
            <h1 className={styles.listTitle}>הצעות מחיר</h1>
            <p className={styles.muted}>
              הצעה נפתחת מלקוח, עם או בלי פרויקט, וניתן לקשר אותה לפרויקט בהמשך. לפרויקט יכולות
              להיות כמה הצעות.
            </p>
          </div>
          {canCreate && (
            <Button
              text="+ הצעה חדשה"
              ariaLabel="הצעה חדשה"
              onClick={() => setCreating(!creating)}
            />
          )}
        </div>
        {creating && (
          <div className={styles.stack}>
            <QuotationCustomerPicker value={customerId} onChange={setCustomerId} />
            <Button
              text="יצירת הצעה"
              disabled={!customerId}
              isLoading={create.isPending}
              onClick={() => create.mutate(customerId)}
            />
            {create.isError && (
              <p role="alert" className={styles.error}>
                {getApiErrorMessage(create.error)}
              </p>
            )}
          </div>
        )}
      </section>
      <Card>
        <div className={styles.listToolbar}>
          <QuotationInput
            value={search}
            label="חיפוש לפי מספר, לקוח, פרויקט או חברה"
            placeholder="חיפוש לפי מספר, לקוח או פרויקט..."
            onChange={event => setSearch(event.target.value)}
          />
          <div className={styles.tabs}>
            {tabs.map(tab => (
              <button
                key={tab.key ?? "all"}
                className={styles.tab}
                aria-pressed={status === tab.key}
                onClick={() => setStatus(tab.key)}
              >
                {tab.label} <span>{counts.data?.[tab.key ?? "all"] ?? "—"}</span>
              </button>
            ))}
          </div>
        </div>
        {counts.isError && (
          <div role="alert" className={styles.error}>
            {getApiErrorMessage(counts.error)}
            <Button
              text="נסה שוב"
              onClick={async () => {
                await counts.refetch();
              }}
            />
          </div>
        )}
        {quotations.isPending && <p role="status">טוען הצעות מחיר...</p>}
        {quotations.isError && (
          <div role="alert" className={styles.error}>
            {getApiErrorMessage(quotations.error)}
            <Button
              text="נסה שוב"
              onClick={async () => {
                await quotations.refetch();
              }}
            />
          </div>
        )}
        {!quotations.isPending && !list.length && <p>לא נמצאו הצעות מחיר</p>}
        {list.map(quotation => (
          <button
            key={quotation.id}
            className={styles.quoteRow}
            onClick={() => navigate(buildQuotationPath(quotation.id))}
          >
            <span className={styles.number}>{quotation.number}</span>
            <div className={styles.quoteIdentity}>
              <b>{quotation.customerName ?? "לקוח"}</b>
              <span className={styles.muted}>{quotation.projectName ?? "לא מקושרת לפרויקט"}</span>
            </div>
            <span className={styles.muted}>{quotation.brand || "טרם נבחרה חברה"}</span>
            <span className={styles.badge} data-status={quotation.status}>
              {QUOTATION_STATUS_LABELS[quotation.status]}
            </span>
            <b className={styles.quoteAmount}>{quotationMoney(quotation.totals.total)}</b>
            <span className={styles.updated}>{formatRelativeTime(quotation.updatedAt)}</span>
          </button>
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
    </main>
  );
};
export default QuotationsPage;
