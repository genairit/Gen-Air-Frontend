import type { FC } from "react";
import Icon from "../Icon/Icon";
import type { IconNameType } from "../../constants/icon.constant";
import SmartbaseAutocomplete from "../../vendor/smartbase/components/Autocomplete/Autocomplete";

interface IAutocompleteProps {
  title?: string;
  options?: string[];
  disabled?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  value?: string | null;
  noOptionsText?: string;
  startIcon?: IconNameType;
  isAutocomplete?: boolean;
  onSearch?: (value: string) => void;
  onChange?: (value: string | null) => void;
}

const Autocomplete: FC<IAutocompleteProps> = ({
  title,
  onSearch,
  startIcon,
  value = null,
  options = [],
  disabled = false,
  isRequired = false,
  onChange = () => {},
  isAutocomplete = true,
  placeholder = "בחר אופציה",
  noOptionsText = "אין אפשרויות",
}) => (
  <SmartbaseAutocomplete
    label={title}
    value={value}
    disabled={disabled}
    onSearch={onSearch}
    onChange={onChange}
    required={isRequired}
    placeholder={placeholder}
    emptyText={noOptionsText}
    isClearable={isAutocomplete}
    isSearchMode={isAutocomplete}
    isInputReadOnly={!isAutocomplete}
    isSearchIconShown={isAutocomplete}
    startIcon={startIcon ? <Icon name={startIcon} /> : null}
    options={options.map(option => ({ value: option, label: option }))}
  />
);

export default Autocomplete;
