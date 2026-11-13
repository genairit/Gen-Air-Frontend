import {
  getOptionLabels,
  findOptionIdByLabel,
  findOptionLabelById,
} from "../../../utilities/option.utility";

import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import { USER_ROLES } from "../../../constants/user-role.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { toUserOptions } from "../../../utilities/mappers/user.mapper";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import LoadingState from "../../../components/LoadingState/LoadingState";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { IApiProjectMember } from "../../../interfaces/api.interface";
import { APARTMENT_TEAM_COPY } from "../../../constants/apartment.constant";
import { getUsersAssignedToRole } from "../../../utilities/user-role.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IApartmentEngineerPickerProps {
  disabled?: boolean;
  value: string | null;
  selectedMember?: IApiProjectMember | null;
  onChange: (userId: string | null) => void;
}

const ApartmentEngineerPicker: FC<IApartmentEngineerPickerProps> = ({
  value,
  onChange,
  disabled,
  selectedMember,
}) => {
  const styles = usePageStyles();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const usersQuery = useUsersQuery({ search: debouncedSearch, role: USER_ROLES.ENGINEER });
  const users = getUsersAssignedToRole(usersQuery.data ?? [], USER_ROLES.ENGINEER);
  const selectedUser = selectedMember?.user;
  const options = toUserOptions(
    selectedUser && !users.some(user => user.id === selectedUser.id)
      ? [selectedUser, ...users]
      : users,
  );

  return (
    <Box sx={styles.stack({ gap: "10px" })}>
      <Autocomplete
        disabled={disabled}
        onSearch={setSearch}
        title={APARTMENT_TEAM_COPY.ENGINEER}
        placeholder={APARTMENT_TEAM_COPY.NO_ENGINEER}
        options={[APARTMENT_TEAM_COPY.NO_ENGINEER, ...getOptionLabels(options)]}
        value={findOptionLabelById(options, value) ?? APARTMENT_TEAM_COPY.NO_ENGINEER}
        onChange={label => {
          setSearch("");
          onChange(findOptionIdByLabel(options, label));
        }}
      />
      {usersQuery.isPending && <LoadingState label={APARTMENT_TEAM_COPY.LOADING} />}
      {usersQuery.isError && (
        <>
          <InlineError message={getApiErrorMessage(usersQuery.error)} />
          <Button
            text={APARTMENT_TEAM_COPY.RETRY}
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={async () => {
              await usersQuery.refetch();
            }}
          />
        </>
      )}
    </Box>
  );
};

export default ApartmentEngineerPicker;
