import { type FC } from "react";
import { useStyles } from "./SearchField.style";
import { Box, IconButton } from "@mui/material";
import XMarkIcon from "../../../../icons/XMarkIcon";
import SearchIcon from "../../../../icons/SearchIcon";
import ChevronDownIcon from "../../../../icons/ChevronDownIcon";
import { type ISearchFieldProps } from "../../../../interfaces/autocomplete.interface";

const SearchField: FC<ISearchFieldProps> = ({
  colors,
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
      <IconButton onClick={onClear} aria-label={clearLabel} sx={styles.clearButton}>
        <XMarkIcon sx={styles.clearIcon} />
      </IconButton>
    );
  };

  return (
    <Box sx={styles.field}>
      {startIcon ?? (isSearchIconShown && <SearchIcon sx={styles.startIcon} />)}
      {children}
      {renderFieldEnd()}
    </Box>
  );
};

export default SearchField;
