import {
  ALL_OPTION_ID,
  BOARD_FILTER_ALL,
  PROJECT_MANAGERS_QUERY,
} from "../../constants/board.constant";

import {
  useProjectTypesQuery,
  useProjectStagesQuery,
  useProjectStageCountsQuery,
} from "../../hooks/queries/project.query";

import {
  toStageFilter,
  toStageFilterTabs,
  countInStageFilter,
} from "../../utilities/stage-tile.utility";

import { useState } from "react";
import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import { useNavigate } from "react-router-dom";
import BoardToolbar from "./components/BoardToolbar";
import ProjectsTable from "./components/ProjectsTable";
import { useSessionUser } from "../../store/session.store";
import { useUsersQuery } from "../../hooks/queries/user.query";
import { buildProjectPath } from "../../utilities/route.utility";
import { getFullName } from "../../utilities/mappers/user.mapper";
import { hasPermission } from "../../utilities/permission.utility";
import { SEARCH_DEBOUNCE_MS } from "../../constants/search.constant";
import { useDebouncedValue } from "../../hooks/debounced-value.hook";
import { ALL_STAGES_TILE_ID } from "../../constants/stage-tile.constant";
import type { IProjectQuery } from "../../interfaces/api-request.interface";
import { toOptions, toFilterId, withAllOption } from "../../utilities/option.utility";

const BoardPage = () => {
  const navigate = useNavigate();
  const styles = usePageStyles();
  const sessionUser = useSessionUser();
  const [search, setSearch] = useState("");
  const [typeFilterId, setTypeFilterId] = useState<string | null>(null);
  const [managerFilterId, setManagerFilterId] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<string>(ALL_STAGES_TILE_ID);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const query: IProjectQuery = {
    search: debouncedSearch,
    managerId: managerFilterId,
    projectTypeId: typeFilterId,
  };

  const stagesQuery = useProjectStagesQuery();
  const typesQuery = useProjectTypesQuery();
  const managersQuery = useUsersQuery(PROJECT_MANAGERS_QUERY);
  const countsQuery = useProjectStageCountsQuery(query);

  const stages = stagesQuery.data ?? [];
  const counts = countsQuery.data ?? null;
  const stageId = toStageFilter(activeTabId);
  const typeOptions = withAllOption(BOARD_FILTER_ALL.TYPES, toOptions(typesQuery.data ?? []));
  const managerOptions = withAllOption(
    BOARD_FILTER_ALL.MANAGERS,
    (managersQuery.data ?? []).map(manager => ({ id: manager.id, label: getFullName(manager) })),
  );

  return (
    <Box sx={styles.page}>
      <BoardToolbar
        search={search}
        onSearchChange={setSearch}
        canCreateProject={hasPermission(sessionUser, "CREATE_PROJECTS")}
        typeFilter={{
          options: typeOptions,
          selectedId: typeFilterId ?? ALL_OPTION_ID,
          onChange: label => setTypeFilterId(toFilterId(typeOptions, label)),
        }}
        managerFilter={{
          options: managerOptions,
          selectedId: managerFilterId ?? ALL_OPTION_ID,
          onChange: label => setManagerFilterId(toFilterId(managerOptions, label)),
        }}
      />

      <ProjectsTable
        stages={stages}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        query={{ ...query, stageId }}
        tabs={toStageFilterTabs(stages, counts)}
        total={countInStageFilter(counts, stageId)}
        onOpenProject={projectId => navigate(buildProjectPath(projectId))}
      />
    </Box>
  );
};

export default BoardPage;
