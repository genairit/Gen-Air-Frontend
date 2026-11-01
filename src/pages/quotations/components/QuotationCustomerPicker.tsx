import type { FC } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationSelect from "./QuotationSelect";
import { buildCustomerPath } from "../../../utilities/route.utility";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useCustomersQuery, useCustomerQuery } from "../../../hooks/queries/customer.query";

interface IQuotationCustomerPickerProps {
  value: string;
  disabled?: boolean;
  onChange: (id: string) => void;
}
const QuotationCustomerPicker: FC<IQuotationCustomerPickerProps> = ({
  value,
  disabled,
  onChange,
}: IQuotationCustomerPickerProps) => {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const customers = useCustomersQuery({ search: debounced, prioritySyncStatus: null });
  const selected = useCustomerQuery(value || null);
  const options = customers.data ?? [];
  const selectedMissing = selected.data && !options.some(customer => customer.id === value);
  return (
    <div className={styles.stack}>
      <QuotationSelect
        value={value}
        label="לקוח *"
        disabled={disabled || customers.isPending}
        onChange={event => onChange(event.target.value)}
      >
        <option value="">בחרו לקוח...</option>
        {selectedMissing && <option value={value}>{selected.data?.name}</option>}
        {options.map(customer => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
      </QuotationSelect>
      <details className={styles.pickerSearch}>
        <summary>חיפוש לקוח</summary>
        <QuotationInput
          value={search}
          label="חיפוש לקוח"
          disabled={disabled}
          onChange={event => setSearch(event.target.value)}
        />
      </details>
      {value && (
        <Link className={styles.muted} to={buildCustomerPath(value)}>
          פתיחת כרטיס הלקוח
        </Link>
      )}
      {customers.isError && <span role="alert">{getApiErrorMessage(customers.error)}</span>}
    </div>
  );
};
export default QuotationCustomerPicker;
