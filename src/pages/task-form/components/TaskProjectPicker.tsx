import { type FC, useState } from "react";
import { useStyles } from "./TaskForm.style";
import { Box, ButtonBase } from "@mui/material";
import Chip from "../../../components/Chip/Chip";
import Button from "../../../components/Button/Button";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import type { IApiProject } from "../../../interfaces/api.interface";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { useProjectQuery, useProjectsQuery } from "../../../hooks/queries/project.query";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import { NEW_TASK_COPY, TASK_PROJECT_RESULT_LIMIT } from "../../../constants/task.constant";

interface ITaskProjectPickerProps {
  error: string | null;
  projectId: string | null;
  onChange: (project: IApiProject | null) => void;
}

const TaskProjectPicker: FC<ITaskProjectPickerProps> = ({ projectId, error, onChange }) => {
  const styles = useStyles();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const selectedQuery = useProjectQuery(projectId);
  const projectsQuery = useProjectsQuery({
    managerId: null,
    projectTypeId: null,
    search: debouncedSearch,
  });

  const results = (projectsQuery.data ?? []).slice(0, TASK_PROJECT_RESULT_LIMIT);
  const hasNoResults = projectsQuery.isSuccess && results.length === 0;

  if (projectId && selectedQuery.data) {
    return (
      <Box sx={styles.selected}>
        <Box sx={styles.optionText}>
          <Box component="b" sx={styles.optionName}>
            {selectedQuery.data.name}
          </Box>
          <Box component="span" sx={styles.caption}>
            {selectedQuery.data.code}
          </Box>
        </Box>
        <Box sx={styles.urgencyOptions}>
          <Chip label={selectedQuery.data.projectType?.name ?? ""} />
          <Button
            onClick={() => onChange(null)}
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={NEW_TASK_COPY.REPLACE_PROJECT}
          />
        </Box>
      </Box>
    );
  }

  return (
    <>
      <TextField
        value={search}
        onChange={setSearch}
        type={FIELD_TYPES.SEARCH}
        startIcon={ICON_NAMES.SEARCH}
        placeholder={NEW_TASK_COPY.PROJECT_SEARCH}
      />
      <Box role="listbox" sx={styles.list}>
        {projectsQuery.isPending && <LoadingState label={NEW_TASK_COPY.PROJECT_SEARCH} />}
        {results.map(project => (
          <ButtonBase
            role="option"
            key={project.id}
            sx={styles.option}
            aria-selected={false}
            onClick={() => onChange(project)}
          >
            <Box sx={styles.optionText}>
              <Box component="b" sx={styles.optionName}>
                {project.name}
              </Box>
              <Box component="span" sx={styles.caption}>
                {project.code}
              </Box>
            </Box>
            <Chip label={project.projectType?.name ?? ""} />
          </ButtonBase>
        ))}
        {hasNoResults && (
          <Box component="span" sx={styles.hint}>
            {NEW_TASK_COPY.NO_PROJECTS}
          </Box>
        )}
      </Box>
      {error && (
        <Box component="span" sx={styles.error}>
          {error}
        </Box>
      )}
    </>
  );
};

export default TaskProjectPicker;
