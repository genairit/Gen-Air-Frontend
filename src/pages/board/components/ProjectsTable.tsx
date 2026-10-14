import { type FC } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { Box, useMediaQuery } from "@mui/material";
import DataTable from "../../../components/DataTable/DataTable";
import { useScrollReached } from "../../../hooks/scroll-reached.hook";
import ProjectCard from "../../../components/ProjectCard/ProjectCard";
import InlineError from "../../../components/InlineError/InlineError";
import { MOBILE_LAYOUT_QUERY } from "../../../constants/layout.constant";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { formatVisibleProjects } from "../../../utilities/project.utility";
import { useProjectPagesQuery } from "../../../hooks/queries/project.query";
import { toProjectSummary } from "../../../utilities/mappers/project.mapper";
import type { IProjectPageQuery } from "../../../interfaces/api-request.interface";
import type { IApiProject, IApiProjectStage } from "../../../interfaces/api.interface";
import { useMoveProjectStageMutation } from "../../../hooks/mutations/project.mutation";
import { buildProjectColumns, PROJECT_TABLE_MIN_WIDTH } from "../columns/project-columns";
import { BOARD_COPY, PROJECT_BOARD_SCROLL_ROOT_MARGIN } from "../../../constants/board.constant";

interface IProjectsTableProps {
  total: number;
  query: IProjectPageQuery;
  stages: IApiProjectStage[];
  onOpenProject: (projectId: string) => void;
}

const getProjectId = (project: IApiProject) => project.id;

const ProjectsTable: FC<IProjectsTableProps> = ({ query, total, stages, onOpenProject }) => {
  const styles = usePageStyles();
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const projectsQuery = useProjectPagesQuery(query);
  const moveMutation = useMoveProjectStageMutation();

  const projects = (projectsQuery.data?.pages ?? []).flatMap(page => page.items);
  const isEmpty = projectsQuery.isSuccess && projects.length === 0;
  const canLoadMore = projectsQuery.hasNextPage && !projectsQuery.isFetchingNextPage;
  const queryError = projectsQuery.error ?? moveMutation.error;

  const loadMoreRef = useScrollReached({
    isEnabled: canLoadMore,
    onReach: projectsQuery.fetchNextPage,
    rootMargin: PROJECT_BOARD_SCROLL_ROOT_MARGIN,
  });

  const moveToStage = (project: IApiProject, stageId: string) =>
    moveMutation.mutate({ projectId: project.id, stageId });

  const columns = buildProjectColumns({ stages, onStageChange: moveToStage });

  const toolbar = (
    <Box sx={styles.stack({ gap: "12px" })}>
      {queryError && <InlineError message={getApiErrorMessage(queryError)} />}
      {projectsQuery.isPending && <LoadingState label={BOARD_COPY.LOADING} />}
      {isEmpty && (
        <Box component="span" sx={styles.caption}>
          {BOARD_COPY.NO_RESULTS}
        </Box>
      )}
    </Box>
  );

  const footer = (
    <Box ref={loadMoreRef} sx={styles.stack({ gap: "8px" })}>
      {projectsQuery.isFetchingNextPage && <LoadingState label={BOARD_COPY.LOADING_MORE} />}
      <Box component="span" sx={styles.caption}>
        {formatVisibleProjects({ visible: projects.length, total })}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Card gap="16px">
        {toolbar}
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            onOpen={onOpenProject}
            project={toProjectSummary(project)}
          />
        ))}
        {footer}
      </Card>
    );
  }

  return (
    <DataTable
      footer={footer}
      rows={projects}
      columns={columns}
      toolbar={toolbar}
      getRowId={getProjectId}
      minWidth={PROJECT_TABLE_MIN_WIDTH}
      onRowClick={project => onOpenProject(project.id)}
    />
  );
};

export default ProjectsTable;
