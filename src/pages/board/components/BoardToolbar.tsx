import { Box } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useStyles } from "./BoardToolbar.style";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { BOARD_COPY } from "../../../constants/board.constant";
import TextField from "../../../components/TextField/TextField";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import type { IDropdownOption } from "../../../interfaces/dropdown.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { getOptionLabels, findOptionLabelById } from "../../../utilities/option.utility";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { IAutocompleteOption } from "../../../vendor/smartbase/interfaces/autocomplete.interface";

interface IBoardFilter {
  selectedId: string | null;
  options: IDropdownOption[];
  onChange: (label: string | null) => void;
}

interface IBoardToolbarProps {
  search: string;
  canCreateTask: boolean;
  typeFilter: IBoardFilter;
  canCreateProject: boolean;
  onSearchChange: (search: string) => void;
  statusFilter: {
    value: string;
    items: IAutocompleteOption[];
    onChange: (id: string | null) => void;
  };
}

const getSelectedLabel = ({ options, selectedId }: IBoardFilter) =>
  findOptionLabelById(options, selectedId ?? "");

const BoardToolbar: FC<IBoardToolbarProps> = ({
  search,
  typeFilter,
  statusFilter,
  onSearchChange,
  canCreateTask,
  canCreateProject,
}) => {
  const navigate = useNavigate();
  const styles = useStyles();
  const accountMenu = useOutletContext<ReactNode>();

  return (
    <Box sx={styles.toolbar}>
      <Box sx={styles.filters}>
        <Box sx={styles.search}>
          <TextField
            value={search}
            onChange={onSearchChange}
            type={FIELD_TYPES.SEARCH}
            startIcon={ICON_NAMES.SEARCH}
            placeholder={BOARD_COPY.SEARCH_PLACEHOLDER}
          />
        </Box>
        <Box sx={styles.typeFilter}>
          <Autocomplete
            isAutocomplete={false}
            onChange={typeFilter.onChange}
            ariaLabel={BOARD_COPY.TYPE_FILTER}
            value={getSelectedLabel(typeFilter)}
            options={getOptionLabels(typeFilter.options)}
          />
        </Box>
        <Box sx={styles.statusFilter}>
          <Autocomplete
            isAutocomplete={false}
            ariaLabel={BOARD_COPY.STATUS_FILTER}
            {...statusFilter}
          />
        </Box>
      </Box>
      <Box sx={styles.actions}>
        <Button
          icon={ICON_NAMES.ADD}
          disabled={!canCreateTask}
          text={BOARD_COPY.NEW_TASK}
          variant={BUTTON_VARIANTS.NEUTRAL}
          onClick={() => navigate(ROUTE_PATHS.NEW_TASK)}
        />
        {canCreateProject && (
          <Button
            icon={ICON_NAMES.ADD}
            text={BOARD_COPY.NEW_PROJECT}
            onClick={() => navigate(ROUTE_PATHS.NEW_PROJECT)}
          />
        )}
        {accountMenu}
      </Box>
    </Box>
  );
};

export default BoardToolbar;
