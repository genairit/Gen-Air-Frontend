import { Box } from "@mui/material";
import { type FC, useState } from "react";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import { useUsersQuery } from "../../../hooks/queries/user.query";
import InlineError from "../../../components/InlineError/InlineError";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import type { IApiProjectMember } from "../../../interfaces/api.interface";
import { APARTMENT_TEAM_COPY } from "../../../constants/apartment.constant";
import { toApartmentTeamOptions } from "../../../utilities/apartment.utility";
import { getApartmentTeamCandidates } from "../../../utilities/apartment.utility";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IApartmentTeamPickerProps {
  disabled?: boolean;
  members: IApiProjectMember[];
  onChange: (members: IApiProjectMember[]) => void;
}
const ApartmentTeamPicker: FC<IApartmentTeamPickerProps> = ({
  members,
  onChange,
  disabled = false,
}) => {
  const styles = usePageStyles();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const usersQuery = useUsersQuery({ search: debouncedSearch, role: null });
  const candidates = getApartmentTeamCandidates(usersQuery.data ?? [], members);
  const options = toApartmentTeamOptions(candidates);
  const selectionKey = members.map(member => member.userId).join(",");
  const optionLabels = options.map(option => option.label);
  const addMember = (label: string | null) => {
    const selected = options.find(option => option.label === label)?.user;
    if (!selected) {
      return;
    }
    setSearch("");
    onChange([
      ...members,
      { id: selected.id, userId: selected.id, role: selected.role, user: selected },
    ]);
  };
  return (
    <Box sx={styles.stack({ gap: "10px" })}>
      <Autocomplete
        value={null}
        key={selectionKey}
        disabled={disabled}
        onSearch={setSearch}
        onChange={addMember}
        options={optionLabels}
        title={APARTMENT_TEAM_COPY.ADD}
        placeholder={APARTMENT_TEAM_COPY.ADD}
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
export default ApartmentTeamPicker;
