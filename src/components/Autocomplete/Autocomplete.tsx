import {
  Box,
  Backdrop,
  TextField as TextFieldMui,
  Autocomplete as AutocompleteMui,
  type AutocompleteRenderInputParams,
} from "@mui/material";

import Icon from "../Icon/Icon";
import Close from "../../icons/Close";
import Arrow from "../../icons/Arrow";
import { useStyles } from "./Autocomplete.style";
import FieldLabel from "../FieldLabel/FieldLabel";
import { type FC, type SyntheticEvent, useState } from "react";
import type { IconNameType } from "../../constants/icon.constant";

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
  isRequired,
  value = "",
  options = [],
  disabled = false,
  onChange = () => {},
  isAutocomplete = true,
  placeholder = "בחר אופציה",
  noOptionsText = "אין אפשרויות",
}) => {
  const styles = useStyles();

  const [inputValue, setInputValue] = useState("");
  const [isSpotlight, setIsSpotlight] = useState(false);

  const showClearIcon = Boolean((isAutocomplete ? inputValue : value) && !disabled);

  const handleInputChange = (_: SyntheticEvent, newInputValue: string) => {
    if (!isAutocomplete || disabled) return;
    setInputValue(newInputValue);
    onSearch?.(newInputValue);
  };

  const handleSelectChange = (_: SyntheticEvent, newValue: string | null) => {
    if (disabled) return;
    onChange(newValue);
    if (!isAutocomplete) setInputValue(newValue ?? "");
    setIsSpotlight(false);
  };

  const renderInputWithIcons = (params: AutocompleteRenderInputParams, autoFocus = false) => (
    <TextFieldMui
      {...params}
      variant="outlined"
      disabled={disabled}
      autoFocus={autoFocus}
      placeholder={placeholder}
      value={isAutocomplete ? inputValue : (value ?? "")}
      sx={styles.textfield({ disabled, isAutocomplete })}
      onFocus={() => !disabled && isAutocomplete && setIsSpotlight(true)}
      onChange={e => {
        if (!isAutocomplete || disabled) return;
        setInputValue(e.target.value);
        onSearch?.(e.target.value);
      }}
      slotProps={{
        htmlInput: {
          ...params.slotProps.htmlInput,
          readOnly: !isAutocomplete,
        },
        input: {
          ...params.slotProps.input,
          startAdornment: startIcon && <Icon name={startIcon} />,
          endAdornment: (
            <Box sx={styles.iconContainer({ disabled })}>
              {showClearIcon && isAutocomplete ? (
                <Close
                  sx={styles.icon({ disabled })}
                  onClick={() => {
                    if (disabled) return;
                    setInputValue("");
                    onSearch?.("");
                    onChange(null);
                  }}
                />
              ) : (
                <Arrow sx={styles.icon({ disabled })} />
              )}
            </Box>
          ),
        },
      }}
    />
  );
  return (
    <Box sx={styles.container}>
      {title && <FieldLabel title={title} isRequired={isRequired} />}
      {isAutocomplete ? (
        <>
          <TextFieldMui
            variant="outlined"
            value={inputValue}
            disabled={disabled}
            placeholder={placeholder}
            onFocus={() => !disabled && setIsSpotlight(true)}
            sx={styles.textfield({ disabled, isAutocomplete })}
            slotProps={{
              input: {
                endAdornment: (
                  <Box sx={styles.iconContainer({ disabled })}>
                    {showClearIcon ? (
                      <Close
                        sx={styles.icon({ disabled })}
                        onClick={() => {
                          if (disabled) return;
                          setInputValue("");
                          onSearch?.("");
                          onChange(null);
                        }}
                      />
                    ) : (
                      <Arrow sx={styles.icon({ disabled })} />
                    )}
                  </Box>
                ),
              },
            }}
          />

          {isSpotlight && (
            <Backdrop
              open
              sx={theme => styles.backdrop(theme)}
              onClick={() => setIsSpotlight(false)}
            >
              <div style={styles.spotlightTextfield} onClick={e => e.stopPropagation()}>
                <AutocompleteMui
                  freeSolo
                  disablePortal
                  disableClearable
                  options={options}
                  disabled={disabled}
                  value={value || ""}
                  inputValue={inputValue}
                  onChange={handleSelectChange}
                  onInputChange={handleInputChange}
                  renderInput={params => renderInputWithIcons(params, true)}
                  slotProps={{
                    listbox: { sx: styles.menuItem },
                    paper: { sx: styles.menuContainer },
                  }}
                />
              </div>
            </Backdrop>
          )}
        </>
      ) : (
        <AutocompleteMui
          disablePortal
          options={options}
          disabled={disabled}
          value={value || ""}
          filterOptions={x => x}
          onChange={handleSelectChange}
          noOptionsText={noOptionsText}
          renderInput={params => renderInputWithIcons(params)}
          slotProps={{
            listbox: { sx: styles.menuItem },
            paper: { sx: styles.menuContainer },
          }}
        />
      )}
    </Box>
  );
};

export default Autocomplete;
