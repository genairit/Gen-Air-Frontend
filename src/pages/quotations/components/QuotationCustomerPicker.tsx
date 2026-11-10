import type { FC } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../quotation.module.css";
import QuotationEntityPicker from "./QuotationEntityPicker";
import { buildCustomerPath } from "../../../utilities/route.utility";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useCustomersQuery, useCustomerQuery } from "../../../hooks/queries/customer.query";

interface IQuotationCustomerPickerProps {
  value: string;
  disabled?: boolean;
  lockedReason?: string | null;
  onChange: (id: string) => void;
}
const QuotationCustomerPicker: FC<IQuotationCustomerPickerProps> = ({
  value,
  onChange,
  disabled = false,
  lockedReason = null,
}: IQuotationCustomerPickerProps) => {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const customers = useCustomersQuery({ search: debounced, prioritySyncStatus: null });
  const selected = useCustomerQuery(value || null);
  const options = customers.data ?? [];
  const choice = options.find(customer => customer.id === value) ?? selected.data ?? null;
  const isLocked = lockedReason !== null;
  const isDisabled = disabled || isLocked;
  return (
    <div className={styles.picker}>
      <QuotationEntityPicker
        label="לקוח *"
        value={choice}
        options={options}
        onSearch={setSearch}
        disabled={isDisabled}
        loading={customers.isPending}
        placeholder="בחירת לקוח או חיפוש..."
        onChange={id => {
          if (id) {
            onChange(id);
          }
        }}
      />
      {isLocked && <span className={styles.muted}>{lockedReason}</span>}
      {value && !isDisabled && (
        <Link to={buildCustomerPath(value)} className={styles.customerLink}>
          פתיחת כרטיס הלקוח
        </Link>
      )}
      {customers.isError && <span role="alert">{getApiErrorMessage(customers.error)}</span>}
    </div>
  );
};
export default QuotationCustomerPicker;
