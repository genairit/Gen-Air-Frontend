import type { FC } from "react";
import Icon from "../Icon/Icon";
import type { IconNameType } from "../../constants/icon.constant";
import SmartbaseAutocomplete from "../../vendor/smartbase/components/Autocomplete/Autocomplete";
import type { IAutocompleteOption } from "../../vendor/smartbase/interfaces/autocomplete.interface";

interface IAutocompleteProps {
  title?: string;
  options?: string[];
  disabled?: boolean;
  isLoading?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  value?: string | null;
  isClearable?: boolean;
  noOptionsText?: string;
  startIcon?: IconNameType;
  isAutocomplete?: boolean;
  isClientFiltered?: boolean;
  items?: IAutocompleteOption[];
  onSearch?: (value: string) => void;
  selectedItem?: IAutocompleteOption | null;
  onChange?: (value: string | null) => void;
}

const Autocomplete: FC<IAutocompleteProps> = ({
  title,
  onSearch,
  startIcon,
  value = null,
  options = [],
  items,
  selectedItem = null,
  isLoading = false,
  disabled = false,
  isRequired = false,
  onChange = () => {},
  isAutocomplete = true,
  isClearable = isAutocomplete,
  isClientFiltered = true,
  placeholder = "בחר אופציה",
  noOptionsText = "אין אפשרויות",
}) => (
  <SmartbaseAutocomplete
    label={title}
    value={value}
    disabled={disabled}
    onSearch={onSearch}
    onChange={onChange}
    isLoading={isLoading}
    required={isRequired}
    placeholder={placeholder}
    emptyText={noOptionsText}
    isClearable={isClearable}
    selectedItem={selectedItem}
    isSearchMode={isAutocomplete}
    isInputReadOnly={!isAutocomplete}
    isSearchIconShown={isAutocomplete}
    isClientFiltered={isClientFiltered}
    startIcon={startIcon ? <Icon name={startIcon} /> : null}
    options={items ?? options.map(option => ({ value: option, label: option }))}
  />
);

export default Autocomplete;
