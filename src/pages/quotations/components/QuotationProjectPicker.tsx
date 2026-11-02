import type { FC } from "react";
import { useState } from "react";
import styles from "../quotation.module.css";
import QuotationInput from "./QuotationInput";
import QuotationSelect from "./QuotationSelect";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useQuotationProjectChoices } from "../../../hooks/queries/quotation.query";

interface IQuotationProjectPickerProps {
  disabled: boolean;
  customerId: string;
  value: string | null;
  onChange: (id: string | null) => void;
}
const QuotationProjectPicker: FC<IQuotationProjectPickerProps> = ({
  customerId,
  value,
  disabled,
  onChange,
}: IQuotationProjectPickerProps) => {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const projects = useQuotationProjectChoices(customerId, debounced);
  const options = projects.data ?? [];
  const selectedMissing = value !== null && !options.some(project => project.id === value);
  return (
    <div className={styles.picker}>
      <QuotationSelect
        value={value ?? ""}
        disabled={disabled}
        label="פרויקט (אופציונלי)"
        onChange={event => onChange(event.target.value || null)}
      >
        <option value="">ללא פרויקט</option>
        {selectedMissing && <option value={value ?? ""}>הפרויקט המקושר</option>}
        {options.map(project => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </QuotationSelect>
      <details className={styles.pickerSearch}>
        <summary>חיפוש פרויקט</summary>
        <QuotationInput
          value={search}
          disabled={disabled}
          label="חיפוש פרויקט"
          onChange={event => setSearch(event.target.value)}
        />
      </details>
      <span className={styles.muted}>לפרויקט יכולות להיות כמה הצעות.</span>
      {projects.isError && <span role="alert">{getApiErrorMessage(projects.error)}</span>}
    </div>
  );
};
export default QuotationProjectPicker;
