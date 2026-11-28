import { useState, type FC } from "react";
import InlineError from "../../../components/InlineError/InlineError";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import Autocomplete from "../../../components/Autocomplete/Autocomplete";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useProjectPagesQuery, useProjectQuery } from "../../../hooks/queries/project.query";

interface IEstimateProjectPickerProps {
  disabled: boolean;
  value: string | null;
  onChange: (value: string | null) => void;
}

const EstimateProjectPicker: FC<IEstimateProjectPickerProps> = ({ value, disabled, onChange }) => {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const projects = useProjectPagesQuery({
    search: debounced,
    managerId: null,
    projectTypeId: null,
    stageId: null,
  });
  const project = useProjectQuery(value);
  const rows = projects.data?.pages.flatMap(page => page.items) ?? [];
  const items = rows.map(row => ({ value: row.id, label: `${row.name} · ${row.code}` }));
  const selected = project.data ? { value: project.data.id, label: project.data.name } : null;

  return (
    <>
      <Autocomplete
        value={value}
        items={items}
        title="פרויקט"
        isClearable={false}
        disabled={disabled}
        onChange={onChange}
        onSearch={setSearch}
        selectedItem={selected}
        isClientFiltered={false}
        isLoading={projects.isFetching}
        placeholder="חיפוש לפי שם או קוד"
      />
      {projects.isError && <InlineError message={getApiErrorMessage(projects.error)} />}
    </>
  );
};

export default EstimateProjectPicker;
