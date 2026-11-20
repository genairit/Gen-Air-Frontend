import {
  CATALOGUE_STATUS,
  QUOTATION_BRANDS,
  QUOTATION_QUERY_KEY,
} from "../../../constants/quotation.constant";

import type { FC } from "react";
import { useState } from "react";
import { Box } from "@mui/material";
import { isAxiosError } from "axios";
import Button from "./QuotationButton";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import { useNavigate } from "react-router-dom";
import QuotationSelect from "./QuotationSelect";
import Card from "../../../components/Card/Card";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import { QUOTATION_CLONE_STYLES } from "./QuotationCloneForm.style";
import { quotationMoney } from "../../../utilities/quotation.utility";
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
  const canSuggest = selected === null && !candidates.isError;
  const suggested = canSuggest ? (choices[0] ?? null) : null;
  const showNoMatch = candidates.isSuccess && choices.length === 0 && selected === null;
  const selectedLabel = selected ? `נבחרה חלופה: ${selected.sku}` : "";
  const suggestedPrice = suggested ? quotationMoney(suggested.price) : "";
  const cardLabel = `חלופה לפריט ${line.item.sku}`;
  return (
    <Card ariaLabel={cardLabel} sx={QUOTATION_CLONE_STYLES.card}>
      <Box sx={QUOTATION_CLONE_STYLES.header}>
        <Box component="h3" sx={QUOTATION_CLONE_STYLES.title}>
          <Box component="bdi">{line.item.sku}</Box> · {line.item.description}
        </Box>
        <Box component="p" sx={QUOTATION_CLONE_STYLES.metadata}>
          כמות {line.item.quantity} ·{" "}
          {line.item.capacityBtu ? `${line.item.capacityBtu} BTU · ` : ""}
          {line.sourceBrand}
        </Box>
      </Box>
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
        items={[
          { value: "", label: "בחר חלופה לאחר בדיקה" },
          ...shownChoices.map(item => ({
            value: item.id,
            label: `${item.sku} · ${item.description} · ₪${item.price}${item.capacityBtu ? ` · ${item.capacityBtu} BTU` : ""}`,
          })),
        ]}
      />
      <Box sx={QUOTATION_CLONE_STYLES.feedback}>
        {suggested && (
          <>
            <Box sx={QUOTATION_CLONE_STYLES.candidate}>
              <Box component="span" className={styles.muted}>
                הצעה לבדיקה
              </Box>
              <Box component="strong">
                <Box component="bdi">{suggested.sku}</Box>
              </Box>
              <Box component="span">{suggested.description}</Box>
              <Box component="bdi" sx={QUOTATION_CLONE_STYLES.price}>
                {suggestedPrice}
              </Box>
            </Box>
            <Button
              text="אשר חלופה מוצעת"
              sx={QUOTATION_CLONE_STYLES.action}
              onClick={() => onChange(suggested)}
            />
          </>
        )}
        {selected && (
          <Box role="status" component="p" sx={QUOTATION_CLONE_STYLES.selected}>
            {selectedLabel}
          </Box>
        )}
        {candidates.isPending && <Box role="status">מחפש חלופות...</Box>}
        {candidates.isError && (
          <Box role="alert" className={styles.error}>
            {getApiErrorMessage(candidates.error)}
          </Box>
        )}
        {showNoMatch && (
          <Box role="status" className={styles.muted}>
            לא נמצאה חלופה תואמת. חפש מק״ט אחר או בחר חברה אחרת.
          </Box>
        )}
      </Box>
    </Card>
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
  if (source.isPending)
    return (
      <Box component="p" role="status">
        טוען הצעת מקור...
      </Box>
    );
  if (source.isError)
    return (
      <Box role="alert" component="div" className={styles.error}>
        <Box component="p">{getApiErrorMessage(source.error)}</Box>
        <Box component="div" className={styles.row}>
          <Button
            text="נסה שוב"
            onClick={async () => {
              await source.refetch();
            }}
          />
          <Button text="חזרה להצעות מחיר" onClick={() => navigate(ROUTE_PATHS.QUOTATIONS)} />
        </Box>
      </Box>
    );
  if (source.data.brands.length !== 1)
    return (
      <Box role="alert" component="div" className={styles.error}>
        <Box component="p">אפשר לשכפל רק הצעה עם חברת מיזוג אחת.</Box>
        <Button onClick={onCancel} text="חזרה להצעת המקור" />
      </Box>
    );
  return (
    <Box component="div" className={styles.stack}>
      <Box component="h2">יצירת העתק לחברת מיזוג אחרת · {source.data.number}</Box>
      <Box component="p" className={styles.muted}>
        הלקוח, הפרויקט, סוכן המכירות ותנאי התשלום יועתקו. {generalCount} פריטים כלליים יישמרו.
        התאריך וההנחה יתאפסו בהצעה החדשה.
      </Box>
      <QuotationSelect
        value={targetBrand}
        label="חברת מיזוג חדשה"
        onChange={event => {
          setTargetBrand(event.target.value);
          setSelected({});
        }}
        items={[
          { value: "", label: "בחר חברה" },
          ...QUOTATION_BRANDS.filter(brand => brand !== source.data.brands[0]).map(brand => ({
            value: brand,
            label: brand,
          })),
        ]}
      />
      {sourceItems.some(result => result.isPending) && (
        <Box component="p" role="status">
          בודק פריטי מקור...
        </Box>
      )}
      {sourceItems.some(result => result.isError && isRetiredItem(result.error)) && (
        <Box component="p" className={styles.muted}>
          חלק מפריטי המקור כבר אינם זמינים בקטלוג. יש לבחור להם חלופה חדשה.
        </Box>
      )}
      {failedLookups.length > 0 && (
        <Box role="alert" component="div" className={styles.error}>
          לא ניתן לבדוק את פריטי המקור כעת.
          <Button
            text="נסה שוב"
            onClick={async () => {
              await Promise.all(failedLookups.map(result => result.refetch()));
            }}
          />
        </Box>
      )}
      {targetBrand && ready && (
        <>
          <Box component="p">
            בדוק ובחר חלופה לכל פריט של {source.data.brands[0]}. הבחירה לא משנה את הצעת המקור.
          </Box>
          <Box component="div" className={styles.cloneGrid}>
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
          </Box>
          <Box component="p">
            {lines.filter(line => !selected[line.item.id]).length} שורות ממתינות לבחירת חלופה
          </Box>
        </>
      )}
      <Box component="div" className={styles.row}>
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
      </Box>
      {clone.isError && (
        <Box role="alert" component="p" className={styles.error}>
          {getApiErrorMessage(clone.error)}
        </Box>
      )}
    </Box>
  );
};

export default QuotationCloneForm;
