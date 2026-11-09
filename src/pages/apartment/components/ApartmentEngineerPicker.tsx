import type { FC } from "react";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import { USER_ROLES } from "../../../constants/user-role.constant";
import { toUserOptions } from "../../../utilities/mappers/user.mapper";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { ALL_USERS_QUERY } from "../../../constants/project-form.constant";
import { APARTMENT_TEAM_COPY } from "../../../constants/apartment.constant";
import { getUsersAssignedToRole } from "../../../utilities/user-role.utility";
import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

interface IApartmentEngineerPickerProps {
  disabled?: boolean;
  value: string | null;
  onChange: (userId: string | null) => void;
}

const ApartmentEngineerPicker: FC<IApartmentEngineerPickerProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const usersQuery = useUsersQuery(ALL_USERS_QUERY);
  const options = toUserOptions(getUsersAssignedToRole(usersQuery.data ?? [], USER_ROLES.ENGINEER));

  return (
    <Autocomplete
      isAutocomplete={false}
      options={getOptionLabels(options)}
      title={APARTMENT_TEAM_COPY.ENGINEER}
      value={findOptionLabelById(options, value)}
      placeholder={APARTMENT_TEAM_COPY.NO_ENGINEER}
      disabled={disabled || usersQuery.isPending || usersQuery.isError}
      onChange={label => onChange(findOptionIdByLabel(options, label))}
    />
  );
};

export default ApartmentEngineerPicker;
