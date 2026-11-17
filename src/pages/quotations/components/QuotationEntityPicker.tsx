import type { FC } from "react";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";

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
  const choices =
    value && !options.some(option => option.id === value.id) ? [value, ...options] : options;

  return (
    <Autocomplete
      title={label}
      disabled={disabled}
      isLoading={loading}
      onSearch={onSearch}
      onChange={onChange}
      isClearable={allowClear}
      isClientFiltered={false}
      value={value?.id ?? null}
      placeholder={placeholder}
      items={choices.map(option => ({ value: option.id, label: option.name }))}
    />
  );
};

export default QuotationEntityPicker;
