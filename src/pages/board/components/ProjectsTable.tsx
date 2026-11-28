import type { FC, ReactNode } from "react";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import ProjectMobileRow from "./ProjectMobileRow";
import { Box, useMediaQuery } from "@mui/material";
import DataTable from "../../../components/DataTable/DataTable";
import type { IApiProject } from "../../../interfaces/api.interface";
import { useScrollReached } from "../../../hooks/scroll-reached.hook";
import InlineError from "../../../components/InlineError/InlineError";
import { MOBILE_LAYOUT_QUERY } from "../../../constants/layout.constant";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { formatVisibleProjects } from "../../../utilities/project.utility";
import { useProjectPagesQuery } from "../../../hooks/queries/project.query";
import type { IProjectPageQuery } from "../../../interfaces/api-request.interface";
import { buildProjectColumns, PROJECT_TABLE_MIN_WIDTH } from "../columns/project-columns";
import { BOARD_COPY, PROJECT_BOARD_SCROLL_ROOT_MARGIN } from "../../../constants/board.constant";

interface IProjectsTableProps {
  total: number;
  toolbar: ReactNode;
  query: IProjectPageQuery;
  onOpenProject: (projectId: string) => void;
}

const getProjectId = (project: IApiProject) => project.id;

const ProjectsTable: FC<IProjectsTableProps> = ({ toolbar, query, total, onOpenProject }) => {
  const styles = usePageStyles();
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const projectsQuery = useProjectPagesQuery(query);

  const projects = (projectsQuery.data?.pages ?? []).flatMap(page => page.items);
  const isEmpty = projectsQuery.isSuccess && projects.length === 0;
  const canLoadMore = projectsQuery.hasNextPage && !projectsQuery.isFetchingNextPage;
  const queryError = projectsQuery.error;

  const loadMoreRef = useScrollReached({
    isEnabled: canLoadMore,
    onReach: projectsQuery.fetchNextPage,
    rootMargin: PROJECT_BOARD_SCROLL_ROOT_MARGIN,
  });

  const columns = buildProjectColumns();

  const header = (
    <>
      {toolbar}
      {queryError && <InlineError message={getApiErrorMessage(queryError)} />}
      {projectsQuery.isPending && <LoadingState label={BOARD_COPY.LOADING} />}
      {isEmpty && (
        <Box component="span" sx={styles.caption}>
          {BOARD_COPY.NO_RESULTS}
        </Box>
      )}
    </>
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
      <Card gap="16px" ariaLabel={BOARD_COPY.TABLE_TITLE}>
        {header}
        {projects.map(project => (
          <ProjectMobileRow key={project.id} project={project} onOpen={onOpenProject} />
        ))}
        {footer}
      </Card>
    );
  }

  return (
    <DataTable
      footer={footer}
      rows={projects}
      toolbar={header}
      columns={columns}
      getRowId={getProjectId}
      ariaLabel={BOARD_COPY.TABLE_TITLE}
      minWidth={PROJECT_TABLE_MIN_WIDTH}
      onRowClick={project => onOpenProject(project.id)}
    />
  );
};

export default ProjectsTable;
