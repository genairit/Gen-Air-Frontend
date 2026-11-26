import {
  isValidEstimateQuantity,
  validEstimateMeasurements,
  initialEstimateMeasurements,
} from "../../../utilities/engineering-estimate.utility";

import { Box } from "@mui/material";
import { useState, type FC } from "react";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import TextField from "../../../components/TextField/TextField";
import EstimateMeasurementFields from "./EstimateMeasurementFields";
import InlineError from "../../../components/InlineError/InlineError";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useQuotationCatalogueQuery } from "../../../hooks/queries/quotation.query";
import { CommandIdentityManager } from "../../../managers/command-identity.manager";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { IEstimateInputLine } from "../../../interfaces/engineering-estimate.interface";

interface IEstimateCatalogueLineProps {
  busy: boolean;
  itemLabel?: string;
  initial?: IEstimateInputLine;
  onSave: (line: IEstimateInputLine) => void;
}

const EstimateCatalogueLine: FC<IEstimateCatalogueLineProps> = ({
  busy,
  initial,
  itemLabel,
  onSave,
}) => {
  const styles = usePageStyles();
  const [sku, setSku] = useState<string | null>(initial?.catalogueItemId ?? null);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState(initial?.quantity ?? "1");
  const [source, setSource] = useState(initial?.source ?? "");
  const [useRules, setUseRules] = useState(Boolean(initial?.measurements));
  const [measurements, setMeasurements] = useState(
    (): ReturnType<typeof initialEstimateMeasurements> =>
      initial?.measurements ?? initialEstimateMeasurements(),
  );
  const debounced = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const catalogue = useQuotationCatalogueQuery({ search: debounced }, debounced.length > 0);
  const items =
    catalogue.data?.map(item => ({ value: item.id, label: `${item.sku} · ${item.description}` })) ??
    [];
  const selected =
    sku && initial?.catalogueItemId === sku ? { value: sku, label: itemLabel ?? sku } : null;
  const saveLabel = initial ? "שמירת פריט" : "הוספת פריט";
  const validQuantity = isValidEstimateQuantity(quantity);
  const validRules = !useRules || validEstimateMeasurements(measurements);
  const disabled = busy || sku === null || !validQuantity || !validRules;
  const add = (): void => {
    if (!sku || disabled) {
      return;
    }

    const line = {
      id: initial?.id ?? CommandIdentityManager.create(),
      ...(source.trim() ? { source: source.trim() } : {}),
      catalogueItemId: sku,
      quantity,
      ...(useRules ? { measurements } : {}),
    };
    onSave(line);
  };

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      <Autocomplete
        isClearable
        value={sku}
        items={items}
        disabled={busy}
        onChange={setSku}
        onSearch={setSearch}
        selectedItem={selected}
        isClientFiltered={false}
        title="בחירת פריט מהקטלוג"
        isLoading={catalogue.isFetching}
        placeholder="חיפוש לפי מק״ט או תיאור"
      />
      {catalogue.isError && <InlineError message={getApiErrorMessage(catalogue.error)} />}
      <TextField
        disabled={busy}
        value={quantity}
        onChange={setQuantity}
        title="כמות לאזור אחד"
        type={FIELD_TYPES.NUMBER}
      />
      <TextField
        value={source}
        disabled={busy}
        maxLength={500}
        onChange={setSource}
        type={FIELD_TYPES.TEXT}
        title="מקור המדידה (אופציונלי)"
        placeholder="מספר תוכנית, קומה או הפניה"
      />
      <Button
        disabled={busy}
        variant={BUTTON_VARIANTS.SECONDARY}
        onClick={(): void => setUseRules(!useRules)}
        text={useRules ? "ללא חישוב לפי כללים" : "הוספת מדידות לחישוב לפי כללים"}
      />
      {useRules && (
        <EstimateMeasurementFields busy={busy} value={measurements} onChange={setMeasurements} />
      )}
      <Button onClick={add} text={saveLabel} disabled={disabled} />
    </Box>
  );
};

export default EstimateCatalogueLine;
