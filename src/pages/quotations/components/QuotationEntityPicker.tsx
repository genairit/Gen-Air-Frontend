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
  const selectedItem = value ? { value: value.id, label: value.name } : null;

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
      selectedItem={selectedItem}
      items={options.map(option => ({ value: option.id, label: option.name }))}
    />
  );
};

export default QuotationEntityPicker;
