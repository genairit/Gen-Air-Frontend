import { type FC } from "react";
import { useStyles } from "./SearchField.style";
import { Box, IconButton } from "@mui/material";
import XMarkIcon from "../../../../icons/XMarkIcon";
import SearchIcon from "../../../../icons/SearchIcon";
import ChevronDownIcon from "../../../../icons/ChevronDownIcon";
import { type ISearchFieldProps } from "../../../../interfaces/autocomplete.interface";

const SearchField: FC<ISearchFieldProps> = ({
  colors,
  cursor = "text",
  onOpen,
  onClear,
  children,
  startIcon,
  hasShadow,
  clearLabel,
  isClearShown,
  isSearchIconShown,
}) => {
  const styles = useStyles({ colors, hasShadow });

  const renderFieldEnd = () => {
    if (!isClearShown) {
      return <ChevronDownIcon sx={styles.endIcon} />;
    }

    return (
      <IconButton
        sx={styles.clearButton}
        aria-label={clearLabel}
        onClick={event => {
          event.stopPropagation();
          onClear();
        }}
      >
        <XMarkIcon sx={styles.clearIcon} />
      </IconButton>
    );
  };

  return (
    <Box onClick={onOpen} sx={styles.field(cursor)}>
      {startIcon ?? (isSearchIconShown && <SearchIcon sx={styles.startIcon} />)}
      {children}
      {renderFieldEnd()}
    </Box>
  );
};

export default SearchField;
