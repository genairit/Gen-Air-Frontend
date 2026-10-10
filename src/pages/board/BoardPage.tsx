import {
  BOARD_COPY,
  ALL_OPTION_ID,
  BOARD_FILTER_ALL,
  PROJECT_MANAGERS_QUERY,
} from "../../constants/board.constant";

import {
  useProjectsQuery,
  useProjectTypesQuery,
  useProjectStagesQuery,
  useProjectStageCountsQuery,
} from "../../hooks/queries/project.query";

import { useState } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import { useNavigate } from "react-router-dom";
import BoardColumn from "./components/BoardColumn";
import BoardToolbar from "./components/BoardToolbar";
import { useSessionUser } from "../../store/session.store";
import { useDragSource } from "../../hooks/drag-source.hook";
import { useUsersQuery } from "../../hooks/queries/user.query";
import { buildProjectPath } from "../../utilities/route.utility";
import { getFullName } from "../../utilities/mappers/user.mapper";
import InlineError from "../../components/InlineError/InlineError";
import { hasPermission } from "../../utilities/permission.utility";
import { SEARCH_DEBOUNCE_MS } from "../../constants/search.constant";
import { useDebouncedValue } from "../../hooks/debounced-value.hook";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { toBoardColumn } from "../../utilities/mappers/project.mapper";
import type { IProjectQuery } from "../../interfaces/api-request.interface";
import { useMoveProjectMutation } from "../../hooks/mutations/project.mutation";
import { toOptions, toFilterId, withAllOption } from "../../utilities/option.utility";
import { getProjectsInStage, getVisibleBoardColumns } from "../../utilities/project.utility";

const BoardPage = () => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const [search, setSearch] = useState("");
  const [typeFilterId, setTypeFilterId] = useState<string | null>(null);
  const [stageFilterId, setStageFilterId] = useState<string | null>(null);
  const [managerFilterId, setManagerFilterId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const { draggingId, getDragSourceProps } = useDragSource();

  const query: IProjectQuery = {
    search: debouncedSearch,
    managerId: managerFilterId,
    projectTypeId: typeFilterId,
  };

  const stagesQuery = useProjectStagesQuery();
  const typesQuery = useProjectTypesQuery();
  const managersQuery = useUsersQuery(PROJECT_MANAGERS_QUERY);
  const projectsQuery = useProjectsQuery(query);
  const countsQuery = useProjectStageCountsQuery(query);
  const moveMutation = useMoveProjectMutation(query);

  const stages = stagesQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const columns = getVisibleBoardColumns(stages.map(toBoardColumn), stageFilterId);
  const stageOptions = withAllOption(BOARD_FILTER_ALL.STAGES, toOptions(stages));
  const typeOptions = withAllOption(BOARD_FILTER_ALL.TYPES, toOptions(typesQuery.data ?? []));
  const managerOptions = withAllOption(
    BOARD_FILTER_ALL.MANAGERS,
    (managersQuery.data ?? []).map(manager => ({ id: manager.id, label: getFullName(manager) })),
  );
  const loadError = stagesQuery.error ?? projectsQuery.error;
  const isLoading = stagesQuery.isPending || projectsQuery.isPending;

  const handleDropProject = (projectId: string, stageId: string) => {
    const isAlreadyInStage = projects.some(
      project => project.id === projectId && project.stageId === stageId,
    );

    if (isAlreadyInStage) {
      return;
    }

    moveMutation.mutate({ projectId, stageId });
  };

  return (
    <Box sx={styles.page}>
      <BoardToolbar
        search={search}
        onSearchChange={setSearch}
        canCreateProject={hasPermission(sessionUser, "EDIT_PROJECTS")}
        typeFilter={{
          options: typeOptions,
          selectedId: typeFilterId ?? ALL_OPTION_ID,
          onChange: label => setTypeFilterId(toFilterId(typeOptions, label)),
        }}
        stageFilter={{
          options: stageOptions,
          selectedId: stageFilterId ?? ALL_OPTION_ID,
          onChange: label => setStageFilterId(toFilterId(stageOptions, label)),
        }}
        managerFilter={{
          options: managerOptions,
          selectedId: managerFilterId ?? ALL_OPTION_ID,
          onChange: label => setManagerFilterId(toFilterId(managerOptions, label)),
        }}
      />

      {moveMutation.isError && <InlineError message={getApiErrorMessage(moveMutation.error)} />}
      {loadError && <InlineError message={getApiErrorMessage(loadError)} />}
      {isLoading && <LoadingState label={BOARD_COPY.LOADING} />}

      <Box sx={styles.grid({ minColumnWidth: 280 })}>
        {columns.map(column => (
          <BoardColumn
            column={column}
            key={column.stageId}
            draggingId={draggingId}
            onDropProject={handleDropProject}
            getDragSourceProps={getDragSourceProps}
            projects={getProjectsInStage(projects, column.stageId)}
            totalCount={countsQuery.data?.byStage[column.stageId] ?? 0}
            onOpenProject={projectId => navigate(buildProjectPath(projectId))}
          />
        ))}
      </Box>
    </Box>
  );
};

export default BoardPage;
