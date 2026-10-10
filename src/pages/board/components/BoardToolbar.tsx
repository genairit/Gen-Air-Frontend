import type { FC } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { BOARD_COPY } from "../../../constants/board.constant";
import TextField from "../../../components/TextField/TextField";
import { ROUTE_PATHS } from "../../../constants/routes.constant";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import type { IDropdownOption } from "../../../interfaces/dropdown.interface";
import { getOptionLabels, findOptionLabelById } from "../../../utilities/option.utility";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";

interface IBoardFilter {
  selectedId: string | null;
  options: IDropdownOption[];
  onChange: (label: string | null) => void;
}

interface IBoardToolbarProps {
  search: string;
  typeFilter: IBoardFilter;
  stageFilter: IBoardFilter;
  canCreateProject: boolean;
  managerFilter: IBoardFilter;
  onSearchChange: (search: string) => void;
}

const getSelectedLabel = ({ options, selectedId }: IBoardFilter) =>
  findOptionLabelById(options, selectedId ?? "");

const BoardToolbar: FC<IBoardToolbarProps> = ({
  search,
  typeFilter,
  stageFilter,
  managerFilter,
  onSearchChange,
  canCreateProject,
}) => {
  const navigate = useNavigate();
  const styles = usePageStyles();

  return (
    <Card padding="20px" sx={styles.row({})}>
      <Box sx={styles.flexItem({ basis: "2 1 280px" })}>
        <TextField
          value={search}
          onChange={onSearchChange}
          type={FIELD_TYPES.SEARCH}
          startIcon={ICON_NAMES.SEARCH}
          placeholder={BOARD_COPY.SEARCH_PLACEHOLDER}
        />
      </Box>
      <Box sx={styles.flexItem({ basis: "1 1 170px" })}>
        <Autocomplete
          isAutocomplete={false}
          startIcon={ICON_NAMES.FOREMAN}
          onChange={managerFilter.onChange}
          value={getSelectedLabel(managerFilter)}
          options={getOptionLabels(managerFilter.options)}
        />
      </Box>
      <Box sx={styles.flexItem({ basis: "1 1 170px" })}>
        <Autocomplete
          isAutocomplete={false}
          startIcon={ICON_NAMES.FILTER}
          onChange={stageFilter.onChange}
          value={getSelectedLabel(stageFilter)}
          options={getOptionLabels(stageFilter.options)}
        />
      </Box>
      <Box sx={styles.flexItem({ basis: "1 1 220px" })}>
        <Autocomplete
          isAutocomplete={false}
          onChange={typeFilter.onChange}
          startIcon={ICON_NAMES.BUILDING}
          value={getSelectedLabel(typeFilter)}
          options={getOptionLabels(typeFilter.options)}
        />
      </Box>
      {canCreateProject && (
        <Button
          icon={ICON_NAMES.ADD}
          text={BOARD_COPY.NEW_PROJECT}
          onClick={() => navigate(ROUTE_PATHS.NEW_PROJECT)}
        />
      )}
    </Card>
  );
};

export default BoardToolbar;
