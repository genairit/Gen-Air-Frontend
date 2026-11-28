import { Box } from "@mui/material";
import { useId, useState, type FC } from "react";
import styles from "../estimate-document.module.css";
import Button from "../../../components/Button/Button";
import TextField from "../../../components/TextField/TextField";
import EstimateMeasurementFields from "./EstimateMeasurementFields";
import InlineError from "../../../components/InlineError/InlineError";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { validEstimateLine } from "../../../utilities/estimate-draft.utility";
import { useQuotationCatalogueQuery } from "../../../hooks/queries/quotation.query";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { IEstimateInputLine } from "../../../interfaces/engineering-estimate.interface";
import { initialEstimateMeasurements } from "../../../utilities/engineering-estimate.utility";

interface IEstimateCatalogueLineProps {
  busy: boolean;
  itemLabel: string;
  onRemove: () => void;
  line: IEstimateInputLine;
  onChange: (line: IEstimateInputLine) => void;
}
const EstimateCatalogueLine: FC<IEstimateCatalogueLineProps> = ({
  busy,
  line,
  itemLabel,
  onChange,
  onRemove,
}) => {
  const optionsId = useId();
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(itemLabel);
  const debounced = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const catalogue = useQuotationCatalogueQuery({ search: debounced }, debounced.length > 0);
  const items =
    catalogue.data?.map(item => ({ value: item.id, label: `${item.sku} · ${item.description}` })) ??
    [];
  const selected = line.catalogueItemId
    ? { value: line.catalogueItemId, label: selectedLabel || itemLabel }
    : null;
  const measurements = line.measurements ?? initialEstimateMeasurements();
  const measurementsLabel = line.measurements
    ? "ללא חישוב לפי כללים"
    : "הוספת מדידות לחישוב לפי כללים";
  const valid = validEstimateLine(line);
  const removeRules = (): void => {
    const { measurements: removed, ...remaining } = line;
    void removed;
    onChange(remaining);
  };
  const choose = (id: string | null): void => {
    const item = items.find(option => option.value === id);
    setSelectedLabel(item?.label ?? "");
    onChange({ ...line, catalogueItemId: id ?? "" });
  };
  return (
    <>
      <Box component="div" className={styles.line}>
        <Autocomplete
          isClearable
          items={items}
          disabled={busy}
          onChange={choose}
          onSearch={setSearch}
          selectedItem={selected}
          isClientFiltered={false}
          title="בחירת פריט מהקטלוג"
          isLoading={catalogue.isFetching}
          value={line.catalogueItemId || null}
          placeholder="חיפוש לפי מק״ט או תיאור"
        />
        <TextField
          compact
          disabled={busy}
          value={line.quantity}
          title="כמות לאזור אחד"
          type={FIELD_TYPES.NUMBER}
          onChange={quantity => onChange({ ...line, quantity })}
        />
      </Box>
      {catalogue.isError && <InlineError message={getApiErrorMessage(catalogue.error)} />}
      <Box component="div" className={styles.actions}>
        <Button
          disabled={busy}
          text="מדידות וכללים"
          ariaExpanded={expanded}
          ariaControls={optionsId}
          variant={BUTTON_VARIANTS.SECONDARY}
          onClick={() => setExpanded(!expanded)}
        />
        <Button
          disabled={busy}
          text="הסרת פריט"
          onClick={onRemove}
          variant={BUTTON_VARIANTS.SECONDARY}
        />
      </Box>
      {!valid && (
        <Box component="p" role="status">
          בחרו פריט והשלימו כמות ומדידות תקינות לחישוב.
        </Box>
      )}
      <Box id={optionsId} component="div" hidden={!expanded}>
        <Box component="div" className={styles.options}>
          <TextField
            compact
            maxLength={500}
            disabled={busy}
            type={FIELD_TYPES.TEXT}
            value={line.source ?? ""}
            title="מקור המדידה (אופציונלי)"
            onChange={source => onChange({ ...line, source })}
          />
          <Button
            disabled={busy}
            text={measurementsLabel}
            variant={BUTTON_VARIANTS.SECONDARY}
            onClick={() =>
              line.measurements ? removeRules() : onChange({ ...line, measurements })
            }
          />
          {line.measurements && (
            <EstimateMeasurementFields
              busy={busy}
              value={measurements}
              onChange={next => onChange({ ...line, measurements: next })}
            />
          )}
        </Box>
      </Box>
    </>
  );
};
export default EstimateCatalogueLine;
