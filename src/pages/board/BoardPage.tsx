import {
  useProjectTypesQuery,
  useProjectStagesQuery,
  useProjectStageCountsQuery,
} from "../../hooks/queries/project.query";

import {
  toStageFilter,
  countInStageFilter,
  toStageFilterOptions,
} from "../../utilities/stage-tile.utility";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BoardToolbar from "./components/BoardToolbar";
import ProjectsTable from "./components/ProjectsTable";
import { useSessionUser } from "../../store/session.store";
import { buildProjectPath } from "../../utilities/route.utility";
import { PERMISSIONS } from "../../constants/permission.constant";
import { hasPermission } from "../../utilities/permission.utility";
import { SEARCH_DEBOUNCE_MS } from "../../constants/search.constant";
import { useDebouncedValue } from "../../hooks/debounced-value.hook";
import { ALL_STAGES_TILE_ID } from "../../constants/stage-tile.constant";
import type { IProjectQuery } from "../../interfaces/api-request.interface";
import { ALL_OPTION_ID, BOARD_FILTER_ALL } from "../../constants/board.constant";
import { toOptions, toFilterId, withAllOption } from "../../utilities/option.utility";

const BoardPage = () => {
  const navigate = useNavigate();
  const sessionUser = useSessionUser();
  const [search, setSearch] = useState("");
  const [typeFilterId, setTypeFilterId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string>(ALL_STAGES_TILE_ID);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const query: IProjectQuery = {
    search: debouncedSearch,
    managerId: null,
    projectTypeId: typeFilterId,
  };

  const stagesQuery = useProjectStagesQuery();
  const typesQuery = useProjectTypesQuery();
  const countsQuery = useProjectStageCountsQuery(query);

  const stages = stagesQuery.data ?? [];
  const counts = countsQuery.data ?? null;
  const stageId = toStageFilter(selectedStageId);
  const typeOptions = withAllOption(BOARD_FILTER_ALL.TYPES, toOptions(typesQuery.data ?? []));

  const toolbar = (
    <BoardToolbar
      search={search}
      onSearchChange={setSearch}
      canCreateProject={hasPermission(sessionUser, PERMISSIONS.PROJECTS_CREATE)}
      typeFilter={{
        options: typeOptions,
        selectedId: typeFilterId ?? ALL_OPTION_ID,
        onChange: label => setTypeFilterId(toFilterId(typeOptions, label)),
      }}
      statusFilter={{
        items: toStageFilterOptions(stages, counts),
        value: selectedStageId,
        onChange: id => setSelectedStageId(id ?? ALL_STAGES_TILE_ID),
      }}
    />
  );

  return (
    <ProjectsTable
      toolbar={toolbar}
      query={{ ...query, stageId }}
      total={countInStageFilter(counts, stageId)}
      onOpenProject={projectId => navigate(buildProjectPath(projectId))}
    />
  );
};

export default BoardPage;
