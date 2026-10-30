import {
  toStageTiles,
  toStageFilter,
  countInStageFilter,
} from "../../../utilities/stage-tile.utility";

import {
  getCustomerProjectId,
  getCustomerProjectPath,
  flattenCustomerProjects,
} from "../../../utilities/customer-project.utility";

import {
  CUSTOMER_PROJECT_COPY,
  CUSTOMER_PROJECT_DISPLAY,
  CUSTOMER_PROJECT_PAGINATION,
  CUSTOMER_PROJECT_SKELETON_ROWS,
} from "../../../constants/customer-project.constant";

import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/Card/Card";
import Tabs from "../../../components/Tabs/Tabs";
import { Box, useMediaQuery } from "@mui/material";
import { useStyles } from "./CustomerProjects.style";
import Button from "../../../components/Button/Button";
import CustomerProjectsError from "./CustomerProjectsError";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { useSessionUser } from "../../../store/session.store";
import TextField from "../../../components/TextField/TextField";
import DataTable from "../../../components/DataTable/DataTable";
import { TABS_VARIANTS } from "../../../constants/tabs.constant";
import CustomerProjectMobileRow from "./CustomerProjectMobileRow";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { PERMISSIONS } from "../../../constants/permission.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { useScrollReached } from "../../../hooks/scroll-reached.hook";
import { hasPermission } from "../../../utilities/permission.utility";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { buildCustomerProjectColumns } from "./customer-project-columns";
import { MOBILE_LAYOUT_QUERY } from "../../../constants/layout.constant";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { formatVisibleProjects } from "../../../utilities/project.utility";
import { ALL_STAGES_TILE_ID } from "../../../constants/stage-tile.constant";
import { useProjectStagesQuery } from "../../../hooks/queries/project.query";
import type { IProjectListItem } from "../../../interfaces/project-list.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { useMoveProjectStageMutation } from "../../../hooks/mutations/project.mutation";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { ICustomerProjectItem } from "../../../interfaces/customer-project.interface";
import { useCustomerProjectPagesQuery } from "../../../hooks/queries/customer-project.query";

interface ICustomerProjectsCardProps {
  customerId: string;
}

const CustomerProjectsCard: FC<ICustomerProjectsCardProps> = ({ customerId }) => {
  const navigate = useNavigate();
  const styles = useStyles();
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const user = useSessionUser();
  const [search, setSearch] = useState("");
  const [activeTabId, setActiveTabId] = useState<string>(ALL_STAGES_TILE_ID);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const stageId = toStageFilter(activeTabId);
  const projectsQuery = useCustomerProjectPagesQuery(customerId, {
    search: debouncedSearch,
    stageId,
  });
  const stagesQuery = useProjectStagesQuery();
  const moveMutation = useMoveProjectStageMutation();

  const firstPage = projectsQuery.data?.pages[0] ?? null;
  const projects = flattenCustomerProjects(projectsQuery.data?.pages ?? []);
  const stages = stagesQuery.data ?? [];
  const hasRows = projects.length > 0;
  const isEmpty = projectsQuery.isSuccess && firstPage?.total === 0;
  const hasNoResults = projectsQuery.isSuccess && !hasRows && !isEmpty;
  const canMove = hasPermission(user, PERMISSIONS.PROJECTS_STATUS_CHANGE);
  const canLoadMore =
    scrollRoot !== null &&
    projectsQuery.hasNextPage &&
    !projectsQuery.isFetching &&
    !projectsQuery.isFetchNextPageError;
  const total = countInStageFilter(firstPage?.counts ?? null, stageId);
  const tabs = toStageTiles(stages, firstPage?.counts ?? null);
  const footerLabel = formatVisibleProjects({ visible: projects.length, total });
  const mutationError = moveMutation.isError ? getApiErrorMessage(moveMutation.error) : null;
  const showLoadMoreButton = projectsQuery.hasNextPage && !projectsQuery.isFetchingNextPage;
  const loadMore = async () => {
    await projectsQuery.fetchNextPage();
  };
  const loadMoreRef = useScrollReached({
    root: scrollRoot,
    isEnabled: canLoadMore,
    onReach: projectsQuery.fetchNextPage,
    rootMargin: CUSTOMER_PROJECT_PAGINATION.SCROLL_MARGIN,
  });

  const clearFilters = () => {
    setSearch("");
    setActiveTabId(ALL_STAGES_TILE_ID);
  };
  const openProject = (project: ICustomerProjectItem) => navigate(getCustomerProjectPath(project));
  const moveStage = (project: IProjectListItem, nextStageId: string) =>
    moveMutation.mutate({ projectId: project.id, stageId: nextStageId });
  const retryProjects = async () => {
    if (projectsQuery.isFetchNextPageError) {
      await projectsQuery.fetchNextPage();

      return;
    }

    await projectsQuery.refetch();
  };
  const retryStages = async () => {
    await stagesQuery.refetch();
  };
  const columns = buildCustomerProjectColumns({ stages, canMove, onStageChange: moveStage });
  const toolbar = (
    <Box sx={styles.toolbar}>
      <CardHeader icon={ICON_NAMES.BUILDING} title={CUSTOMER_PROJECT_COPY.TITLE} />
      <Box sx={styles.filters}>
        <Box sx={styles.search}>
          <TextField
            value={search}
            onChange={setSearch}
            type={FIELD_TYPES.SEARCH}
            startIcon={ICON_NAMES.SEARCH}
            placeholder={CUSTOMER_PROJECT_COPY.SEARCH}
          />
        </Box>
        <Tabs
          items={tabs}
          formatCount={String}
          activeId={activeTabId}
          onChange={setActiveTabId}
          variant={TABS_VARIANTS.PILLS}
        />
      </Box>
      {projectsQuery.isPending && (
        <Box aria-busy="true" sx={styles.toolbar}>
          <LoadingState label={CUSTOMER_PROJECT_COPY.LOADING} />
          {CUSTOMER_PROJECT_SKELETON_ROWS.map(index => (
            <Box key={index} sx={styles.skeleton} />
          ))}
        </Box>
      )}
      {projectsQuery.isError && <CustomerProjectsError onRetry={retryProjects} />}
      {stagesQuery.isError && <CustomerProjectsError onRetry={retryStages} />}
      {mutationError && <InlineError message={mutationError} />}
      {isEmpty && (
        <Box sx={styles.empty}>
          <Box component="b">{CUSTOMER_PROJECT_COPY.EMPTY}</Box>
          <Box sx={styles.caption}>{CUSTOMER_PROJECT_COPY.EMPTY_DESCRIPTION}</Box>
        </Box>
      )}
      {hasNoResults && (
        <Box sx={styles.empty}>
          <Box component="b">{CUSTOMER_PROJECT_COPY.NO_RESULTS}</Box>
          <Button
            onClick={clearFilters}
            variant={BUTTON_VARIANTS.NEUTRAL}
            text={CUSTOMER_PROJECT_COPY.CLEAR}
          />
        </Box>
      )}
    </Box>
  );
  const endAdornment = (
    <Box ref={loadMoreRef} sx={styles.sentinel}>
      {projectsQuery.isFetchingNextPage && (
        <LoadingState label={CUSTOMER_PROJECT_COPY.LOADING_MORE} />
      )}
      {showLoadMoreButton && (
        <Button
          onClick={loadMore}
          text={CUSTOMER_PROJECT_COPY.MORE}
          variant={BUTTON_VARIANTS.NEUTRAL}
        />
      )}
    </Box>
  );
  const footer = hasRows ? (
    <Box sx={styles.footer}>
      <Box component="span" sx={styles.caption}>
        {footerLabel}
      </Box>
    </Box>
  ) : null;

  if (isMobile || !hasRows) {
    return (
      <Card gap="18px" padding="24px">
        {toolbar}
        {hasRows && (
          <Box sx={styles.scroll} ref={setScrollRoot}>
            {projects.map(project => (
              <CustomerProjectMobileRow
                stages={stages}
                key={project.id}
                project={project}
                canMove={canMove}
                onOpen={openProject}
                onStageChange={moveStage}
              />
            ))}
            {endAdornment}
          </Box>
        )}
        {footer}
      </Card>
    );
  }

  return (
    <DataTable
      padding="24px"
      rows={projects}
      footer={footer}
      columns={columns}
      toolbar={toolbar}
      onRowClick={openProject}
      scrollerRef={setScrollRoot}
      endAdornment={endAdornment}
      getRowId={getCustomerProjectId}
      minWidth={CUSTOMER_PROJECT_DISPLAY.TABLE_MIN_WIDTH}
      scrollMaxHeight={CUSTOMER_PROJECT_DISPLAY.SCROLL_MAX_HEIGHT}
    />
  );
};
export default CustomerProjectsCard;
