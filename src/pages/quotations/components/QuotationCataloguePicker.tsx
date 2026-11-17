import {
  quotationEquipmentTypes,
  requestedQuotationCapacity,
} from "../../../utilities/quotation.utility";

import type { FC } from "react";
import { useState } from "react";
import { Box } from "@mui/material";
import Button from "./QuotationButton";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationSelect from "./QuotationSelect";
import ChoiceRow from "../../../components/ChoiceRow/ChoiceRow";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { QUOTATION_DEFAULTS } from "../../../constants/quotation.constant";
import { initialQuotationRole } from "../../../utilities/quotation.utility";
import { QUOTATION_ROLE_OPTIONS } from "../../../constants/quotation.constant";
import { QUOTATION_EQUIPMENT_ROLES } from "../../../constants/quotation.constant";
import { useQuotationCatalogueQuery } from "../../../hooks/queries/quotation.query";
import { catalogueLine, quotationMoney } from "../../../utilities/quotation.utility";
import { QUOTATION_CIRCUITS, EQUIPMENT_ROLE } from "../../../constants/quotation.constant";
import type { IQuotationLine, IQuotationSection } from "../../../interfaces/quotation.interface";

interface IQuotationCataloguePickerProps {
  brand: string;
  section: IQuotationSection;
  onSelect: (line: IQuotationLine) => void;
}
const QuotationCataloguePicker: FC<IQuotationCataloguePickerProps> = ({
  brand,
  section,
  onSelect,
}: IQuotationCataloguePickerProps) => {
  const [showMatches, setShowMatches] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [location, setLocation] = useState("");
  const [circuit, setCircuit] = useState<string>(QUOTATION_DEFAULTS.CIRCUIT);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>(initialQuotationRole(section.systemType));
  const [equipmentType, setEquipmentType] = useState("");
  const [capacity, setCapacity] = useState("");
  const debounced = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const requested = requestedQuotationCapacity(capacity);
  const isEquipment = QUOTATION_EQUIPMENT_ROLES.some(value => value === role);
  const acceptsCapacity = !role || isEquipment;
  const typeOptions = quotationEquipmentTypes(section.systemType, role);
  const query = {
    search: debounced,
    brand,
    systemType: section.systemType,
    ...(role ? { equipmentRole: role } : {}),
    ...(acceptsCapacity && requested ? { capacityBtu: requested } : {}),
    ...(isEquipment && equipmentType ? { equipmentType } : {}),
  };
  const hasSearch = debounced.trim().length > 0;
  const hasRole = role.length > 0;
  const hasCapacity = requested !== null;
  const tracksCircuit = [EQUIPMENT_ROLE.INDOOR, EQUIPMENT_ROLE.OUTDOOR].some(
    value => value === role,
  );
  const queryEnabled = showMatches && (!brand || hasSearch || hasRole || hasCapacity);
  const catalogue = useQuotationCatalogueQuery(query, queryEnabled);
  const changeRole = (value: string): void => {
    setRole(value);
    setEquipmentType("");
    setCapacity("");
  };
  const select = (item: Parameters<typeof catalogueLine>[0]) => {
    onSelect({
      ...catalogueLine(item, requested),
      quantity,
      location,
      circuit: tracksCircuit ? circuit : null,
    });
    setShowMatches(false);
    setSearch("");
  };
  return (
    <Box component="div" className={styles.addTray}>
      <Box component="div" className={styles.addFields}>
        <QuotationSelect
          value={role}
          caption="יחידה"
          label="סוג פריט"
          onChange={event => changeRole(event.target.value)}
          items={[
            { value: "", label: "כל הפריטים המתאימים" },
            ...QUOTATION_ROLE_OPTIONS.map(option => ({ value: option.value, label: option.label })),
          ]}
        />
        {isEquipment && (
          <QuotationSelect
            caption="סוג"
            value={equipmentType}
            label="סוג ציוד / לחץ"
            onChange={event => {
              setEquipmentType(event.target.value);
              setShowMatches(true);
            }}
            items={[
              { value: "", label: "כל הסוגים" },
              ...typeOptions.map(type => ({ value: type, label: type })),
            ]}
          />
        )}
        {acceptsCapacity && (
          <QuotationInput
            min="1"
            type="number"
            caption="BTU"
            value={capacity}
            label="גודל מבוקש (BTU)"
            onChange={event => {
              setCapacity(event.target.value);
              setShowMatches(true);
            }}
          />
        )}
        <QuotationInput
          min="0.0001"
          type="number"
          step="0.0001"
          caption="כמות"
          value={quantity}
          label="כמות להוספה"
          onChange={event => setQuantity(event.target.value)}
        />
        <QuotationInput
          maxLength={200}
          caption="מיקום"
          value={location}
          label="מיקום להוספה"
          placeholder="סלון, מטבח..."
          onChange={event => setLocation(event.target.value)}
        />
        {tracksCircuit && (
          <QuotationSelect
            caption="מעגל"
            value={circuit}
            label="מעגל להוספה"
            onChange={event => setCircuit(event.target.value)}
            items={QUOTATION_CIRCUITS.map(value => ({ value, label: value }))}
          />
        )}
      </Box>
      <QuotationInput
        type="search"
        value={search}
        label="חיפוש פריט בקטלוג"
        onFocus={() => setShowMatches(true)}
        placeholder="חיפוש במחירון לפי מק״ט או תיאור (בקר, חנוכיה, צנרת...)"
        onChange={event => {
          setSearch(event.target.value);
          setShowMatches(true);
        }}
      />
      {catalogue.isFetching && (
        <Box component="p" role="status">
          מחפש פריטים מתאימים...
        </Box>
      )}
      {catalogue.isError && (
        <Box role="alert" component="div" className={styles.error}>
          {getApiErrorMessage(catalogue.error)}
          <Button
            text="נסה שוב"
            onClick={async () => {
              await catalogue.refetch();
            }}
          />
        </Box>
      )}
      {showMatches && catalogue.data && (
        <Box component="div" className={styles.results}>
          {!catalogue.data.length && (
            <Box component="p" role="status">
              לא נמצא פריט קטלוג מתאים. לא נוספה שורה.
            </Box>
          )}
          {catalogue.data.map(item => (
            <ChoiceRow
              key={item.id}
              className={styles.result}
              sx={{ display: "block" }}
              onClick={() => select(item)}
            >
              <Box component="b">{item.sku}</Box> · {item.description}
              <Box component="div" className={styles.muted}>
                {item.capacityBtu !== null && (
                  <Box dir="ltr" component="span" className={styles.btuPair}>
                    {item.capacityBtu.toLocaleString("he-IL")} BTU
                  </Box>
                )}{" "}
                · {quotationMoney(item.price)}
              </Box>
            </ChoiceRow>
          ))}
        </Box>
      )}
    </Box>
  );
};
export default QuotationCataloguePicker;
