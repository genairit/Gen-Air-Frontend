import type { FC } from "react";
import { useState } from "react";
import { Box } from "@mui/material";
import styles from "../quotation.module.css";
import QuotationEntityPicker from "./QuotationEntityPicker";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useQuotationProjectChoices } from "../../../hooks/queries/quotation.query";
import type { IQuotationProjectChoice } from "../../../interfaces/quotation.interface";

interface IQuotationProjectPickerProps {
  disabled: boolean;
  customerId: string;
  value: string | null;
  lockedReason?: string | null;
  selectedName?: string | null;
  onChange: (id: string | null) => void;
}
const QuotationProjectPicker: FC<IQuotationProjectPickerProps> = ({
  customerId,
  selectedName,
  value,
  disabled,
  onChange,
  lockedReason = null,
}: IQuotationProjectPickerProps) => {
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<IQuotationProjectChoice | null>(null);
  const debounced = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const initialProjects = useQuotationProjectChoices(customerId, "");
  const projects = useQuotationProjectChoices(customerId, debounced);
  const options = projects.data ?? [];
  const selectedChoice = selection?.id === value ? selection : null;
  const choice =
    options.find(project => project.id === value) ??
    initialProjects.data?.find(project => project.id === value) ??
    selectedChoice ??
    (value ? { id: value, name: selectedName || "הפרויקט המקושר" } : null);
  const isDisabled = disabled || lockedReason !== null;
  const caption = lockedReason ?? "לפרויקט יכולות להיות כמה הצעות.";
  return (
    <Box component="div" className={styles.picker}>
      <QuotationEntityPicker
        allowClear
        value={choice}
        options={options}
        onSearch={setSearch}
        disabled={isDisabled}
        label="פרויקט (אופציונלי)"
        loading={projects.isPending}
        placeholder="ללא פרויקט · חיפוש פרויקט..."
        onChange={id => {
          setSelection(options.find(project => project.id === id) ?? null);
          onChange(id);
        }}
      />
      <Box component="span" className={styles.muted}>
        {caption}
      </Box>
      {projects.isError && (
        <Box role="alert" component="span">
          {getApiErrorMessage(projects.error)}
        </Box>
      )}
    </Box>
  );
};
export default QuotationProjectPicker;
