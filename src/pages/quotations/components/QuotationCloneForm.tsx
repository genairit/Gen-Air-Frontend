import {
  CATALOGUE_STATUS,
  QUOTATION_BRANDS,
  QUOTATION_QUERY_KEY,
} from "../../../constants/quotation.constant";

import type { FC } from "react";
import { useState } from "react";
import { isAxiosError } from "axios";
import Button from "./QuotationButton";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import { useNavigate } from "react-router-dom";
import QuotationSelect from "./QuotationSelect";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { buildQuotationPath } from "../../../utilities/route.utility";
import { quotationService } from "../../../services/quotation.service";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { AuthorizationContext } from "../../../managers/authorization-context.manager";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ICatalogueItem, IQuotationLine } from "../../../interfaces/quotation.interface";

interface ICloneLine {
  systemType: string;
  sourceBrand: string;
  item: IQuotationLine;
}

const isRetiredItem = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 404;

const CloneLinePicker: FC<{
  line: ICloneLine;
  targetBrand: string;
  selected: ICatalogueItem | null;
  onChange: (item: ICatalogueItem | null) => void;
}> = ({ line, targetBrand, selected, onChange }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const candidates = useQuery({
    queryKey: ["quotation-clone-candidates", targetBrand, line.item.id, debouncedSearch],
    enabled: Boolean(targetBrand),
    queryFn: () =>
      quotationService.catalogue({
        brand: targetBrand,
        systemType: line.systemType,
        equipmentRole: line.item.equipmentRole,
        ...(line.item.equipmentType ? { equipmentType: line.item.equipmentType } : {}),
        ...(line.item.capacityBtu ? { capacityBtu: line.item.capacityBtu } : {}),
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        limit: 100,
      }),
  });
  const choices = (candidates.data ?? []).filter(
    item =>
      item.brand === targetBrand &&
      item.status === CATALOGUE_STATUS.ACTIVE &&
      item.equipmentRole === line.item.equipmentRole &&
      (!line.item.equipmentType || item.equipmentTypes.includes(line.item.equipmentType)) &&
      (!item.systemType || item.systemType === line.systemType),
  );
  const shownChoices =
    selected && !choices.some(item => item.id === selected.id) ? [selected, ...choices] : choices;
  return (
    <div className={styles.cloneLine}>
      <div>
        <strong>{line.item.sku}</strong> · {line.item.description}
        <p className={styles.muted}>
          כמות {line.item.quantity} ·{" "}
          {line.item.capacityBtu ? `${line.item.capacityBtu} BTU · ` : ""}
          {line.sourceBrand}
        </p>
      </div>
      <QuotationInput
        type="search"
        value={search}
        label={`חיפוש חלופה עבור ${line.item.sku}`}
        placeholder="חיפוש מק״ט או תיאור בחברה החדשה"
        onChange={event => setSearch(event.target.value)}
      />
      <QuotationSelect
        value={selected?.id ?? ""}
        label={`חלופה עבור ${line.item.sku}`}
        onChange={event =>
          onChange(shownChoices.find(item => item.id === event.target.value) ?? null)
        }
      >
        <option value="">בחר חלופה לאחר בדיקה</option>
        {shownChoices.map(item => (
          <option key={item.id} value={item.id}>
            {item.sku} · {item.description} · ₪{item.price}
            {item.capacityBtu ? ` · ${item.capacityBtu} BTU` : ""}
          </option>
        ))}
      </QuotationSelect>
      {!selected && choices[0] && (
        <div className={styles.row}>
          <span>
            הצעה לבדיקה: {choices[0].sku} · {choices[0].description} · ₪{choices[0].price}
          </span>
          <Button text="אשר חלופה מוצעת" onClick={() => onChange(choices[0])} />
        </div>
      )}
      {candidates.isPending && <span role="status">מחפש חלופות...</span>}
      {candidates.isError && (
        <p role="alert" className={styles.error}>
          {getApiErrorMessage(candidates.error)}
        </p>
      )}
      {candidates.isSuccess && !choices.length && (
        <p className={styles.error}>לא נמצאה חלופה תואמת. חפש מק״ט אחר או בחר חברה אחרת.</p>
      )}
    </div>
  );
};

const QuotationCloneForm: FC<{ sourceId: string; onCancel: () => void }> = ({
  sourceId,
  onCancel,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [targetBrand, setTargetBrand] = useState("");
  const [selected, setSelected] = useState<Record<string, ICatalogueItem>>({});
  const source = useQuery({
    queryKey: ["quotation-clone-source", sourceId],
    queryFn: () => quotationService.get(sourceId),
  });
  const brandedLines =
    source.data?.sections.flatMap(section =>
      section.brand === null
        ? []
        : section.items.map(item => ({
            item,
            systemType: section.systemType,
            sourceBrand: section.brand!,
          })),
    ) ?? [];
  const sourceItems = useQueries({
    queries: brandedLines.map(line => ({
      queryKey: ["quotation-clone-source-item", line.item.catalogueItemId],
      queryFn: () => quotationService.catalogueItem(line.item.catalogueItemId),
    })),
  });
  const lines = brandedLines.filter((_line, index) => sourceItems[index]?.data?.brand !== "");
  const ready =
    source.data &&
    source.data.brands.length === 1 &&
    sourceItems.every(
      result => result.isSuccess || (result.isError && isRetiredItem(result.error)),
    );
  const failedLookups = sourceItems.filter(
    result => result.isError && !isRetiredItem(result.error),
  );
  const generalCount =
    source.data?.sections
      .filter(section => section.brand === null)
      .reduce((sum, section) => sum + section.items.length, 0) ?? 0;
  const clone = useMutation({
    mutationFn: quotationService.clone,
    onSuccess: async quotation => {
      const context = new AuthorizationContext();
      await queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEY });
      context.assertCurrent();
      navigate(buildQuotationPath(quotation.id));
    },
  });
  if (source.isPending) return <p role="status">טוען הצעת מקור...</p>;
  if (source.isError)
    return (
      <div role="alert" className={styles.error}>
        <p>{getApiErrorMessage(source.error)}</p>
        <div className={styles.row}>
          <Button
            text="נסה שוב"
            onClick={async () => {
              await source.refetch();
            }}
          />
          <Button text="חזרה להצעות מחיר" onClick={() => navigate(ROUTE_PATHS.QUOTATIONS)} />
        </div>
      </div>
    );
  if (source.data.brands.length !== 1)
    return (
      <div role="alert" className={styles.error}>
        <p>אפשר לשכפל רק הצעה עם חברת מיזוג אחת.</p>
        <Button onClick={onCancel} text="חזרה להצעת המקור" />
      </div>
    );
  return (
    <div className={styles.stack}>
      <h2>יצירת העתק לחברת מיזוג אחרת · {source.data.number}</h2>
      <p className={styles.muted}>
        הלקוח, הפרויקט, סוכן המכירות ותנאי התשלום יועתקו. {generalCount} פריטים כלליים יישמרו.
        התאריך וההנחה יתאפסו בהצעה החדשה.
      </p>
      <QuotationSelect
        value={targetBrand}
        label="חברת מיזוג חדשה"
        onChange={event => {
          setTargetBrand(event.target.value);
          setSelected({});
        }}
      >
        <option value="">בחר חברה</option>
        {QUOTATION_BRANDS.filter(brand => brand !== source.data.brands[0]).map(brand => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </QuotationSelect>
      {sourceItems.some(result => result.isPending) && <p role="status">בודק פריטי מקור...</p>}
      {sourceItems.some(result => result.isError && isRetiredItem(result.error)) && (
        <p className={styles.muted}>
          חלק מפריטי המקור כבר אינם זמינים בקטלוג. יש לבחור להם חלופה חדשה.
        </p>
      )}
      {failedLookups.length > 0 && (
        <div role="alert" className={styles.error}>
          לא ניתן לבדוק את פריטי המקור כעת.
          <Button
            text="נסה שוב"
            onClick={async () => {
              await Promise.all(failedLookups.map(result => result.refetch()));
            }}
          />
        </div>
      )}
      {targetBrand && ready && (
        <>
          <p>בדוק ובחר חלופה לכל פריט של {source.data.brands[0]}. הבחירה לא משנה את הצעת המקור.</p>
          <div className={styles.cloneGrid}>
            {lines.map(line => (
              <CloneLinePicker
                line={line}
                targetBrand={targetBrand}
                key={`${targetBrand}-${line.item.id}`}
                selected={selected[line.item.id] ?? null}
                onChange={item =>
                  setSelected(current => {
                    const next = { ...current };
                    if (item) next[line.item.id] = item;
                    else delete next[line.item.id];
                    return next;
                  })
                }
              />
            ))}
          </div>
          <p>{lines.filter(line => !selected[line.item.id]).length} שורות ממתינות לבחירת חלופה</p>
        </>
      )}
      <div className={styles.row}>
        <Button
          text="צור הצעה חדשה"
          isLoading={clone.isPending}
          disabled={
            !targetBrand || !ready || lines.some(line => !selected[line.item.id]) || clone.isPending
          }
          onClick={() =>
            clone.mutate({
              sourceId,
              sourceVersion: source.data.version,
              targetBrand,
              mappings: lines.map(line => ({
                sourceLineId: line.item.id,
                targetCatalogueItemId: selected[line.item.id].id,
              })),
            })
          }
        />
        <Button onClick={onCancel} text="חזרה להצעת המקור" disabled={clone.isPending} />
      </div>
      {clone.isError && (
        <p role="alert" className={styles.error}>
          {getApiErrorMessage(clone.error)}
        </p>
      )}
    </div>
  );
};

export default QuotationCloneForm;
