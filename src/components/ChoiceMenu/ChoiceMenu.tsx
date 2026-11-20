import { useStyles } from "./ChoiceMenu.style";
import { Box, Menu, MenuItem, ListSubheader } from "@mui/material";

export interface IChoiceMenuOption {
  id: string;
  label: string;
  disabled?: boolean;
  description?: string;
  onSelect: () => void;
}

interface IChoiceMenuProps {
  title: string;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  options: IChoiceMenuOption[];
}

const ChoiceMenu = ({ title, anchorEl, options, onClose }: IChoiceMenuProps) => {
  const styles = useStyles();

  return (
    <Menu
      onClose={onClose}
      anchorEl={anchorEl}
      open={anchorEl !== null}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: { sx: styles.menuPaper },
        list: { "aria-label": title, sx: styles.menuList },
      }}
    >
      <ListSubheader sx={styles.menuHeading}>{title}</ListSubheader>
      {options.map(option => (
        <MenuItem
          key={option.id}
          sx={styles.menuItem}
          onClick={option.onSelect}
          disabled={option.disabled}
        >
          <Box component="span" sx={styles.itemTitle}>
            {option.label}
          </Box>
          {option.description && (
            <Box component="span" sx={styles.itemDescription}>
              {option.description}
            </Box>
          )}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ChoiceMenu;
