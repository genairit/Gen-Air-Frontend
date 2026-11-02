import { useState, type FC } from "react";
import { Autocomplete } from "@mui/material";
import styles from "../quotation.module.css";
import QuotationEntityInput from "./QuotationEntityInput";
import { QUOTATION_INPUT_REASON } from "../../../constants/quotation.constant";

interface IEntityChoice {
  id: string;
  name: string;
}
interface IQuotationEntityPickerProps {
  label: string;
  loading: boolean;
  disabled?: boolean;
  placeholder: string;
  allowClear?: boolean;
  options: IEntityChoice[];
  value: IEntityChoice | null;
  onSearch: (search: string) => void;
  onChange: (id: string | null) => void;
}
const QuotationEntityPicker: FC<IQuotationEntityPickerProps> = ({
  label,
  value,
  options,
  loading,
  disabled,
  onSearch,
  onChange,
  placeholder,
  allowClear = false,
}) => {
  const [searchText, setSearchText] = useState<string | null>(null);
  const inputValue = searchText ?? value?.name ?? "";
  const resetSearch = () => {
    setSearchText(null);
    onSearch("");
  };
  return (
    <div className={styles.entityPicker}>
      <span className={styles.labelText}>{label}</span>
      <Autocomplete
        openOnFocus
        value={value}
        options={options}
        loading={loading}
        disabled={disabled}
        onClose={resetSearch}
        clearText="נקה בחירה"
        inputValue={inputValue}
        openText="הצג אפשרויות"
        closeText="סגור אפשרויות"
        loadingText="טוען אפשרויות..."
        disableClearable={!allowClear}
        noOptionsText="לא נמצאו תוצאות"
        getOptionKey={option => option.id}
        filterOptions={choices => choices}
        getOptionLabel={option => option.name}
        isOptionEqualToValue={(option, selected) => option.id === selected.id}
        onChange={(_event, option) => {
          onChange(option?.id ?? null);
          resetSearch();
        }}
        slotProps={{
          paper: { className: styles.entityOptions },
          listbox: { className: styles.entityListbox },
        }}
        renderInput={params => (
          <QuotationEntityInput params={params} label={label} placeholder={placeholder} />
        )}
        onInputChange={(_event, search, reason) => {
          if (reason === QUOTATION_INPUT_REASON.INPUT || reason === QUOTATION_INPUT_REASON.CLEAR) {
            setSearchText(search);
            onSearch(search);
          }
        }}
      />
    </div>
  );
};
export default QuotationEntityPicker;
