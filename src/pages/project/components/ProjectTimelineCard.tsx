import {
  PROJECT_PAGE_COPY,
  PROJECT_PAGE_STATUS_COPY,
} from "../../../constants/project-page.constant";

import type { FC } from "react";
import { Box } from "@mui/material";
import Dot from "../../../components/Dot/Dot";
import { usePageStyles } from "../../page.style";
import Card from "../../../components/Card/Card";
import { theme } from "../../../constants/theme.constants";
import Timeline from "../../../components/Timeline/Timeline";
import { ICON_NAMES } from "../../../constants/icon.constant";
import { sortByNewest } from "../../../utilities/date.utility";
import CardHeader from "../../../components/CardHeader/CardHeader";
import { formatUpdatesBadge } from "../../../utilities/text.utility";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { toTimelineEntry } from "../../../utilities/mappers/project.mapper";
import { useProjectTransitionsQuery } from "../../../hooks/queries/project.query";

interface IProjectTimelineCardProps {
  projectId: string;
}

const ProjectTimelineCard: FC<IProjectTimelineCardProps> = ({ projectId }) => {
  const styles = usePageStyles();
  const transitionsQuery = useProjectTransitionsQuery(projectId);
  const entries = sortByNewest(transitionsQuery.data ?? []).map(toTimelineEntry);
  const isEmpty = transitionsQuery.isSuccess && entries.length === 0;

  return (
    <Card gap="20px">
      <CardHeader
        icon={ICON_NAMES.PROGRESS}
        title={PROJECT_PAGE_COPY.TIMELINE_TITLE}
        badge={formatUpdatesBadge(entries.length)}
        action={
          <Box component="span" sx={styles.statusCaption}>
            <Dot color={theme.palette.statusBlue} />
            {PROJECT_PAGE_COPY.TIMELINE_STATUS}
          </Box>
        }
      />
      {transitionsQuery.isPending && <LoadingState />}
      {transitionsQuery.isError && (
        <InlineError message={getApiErrorMessage(transitionsQuery.error)} />
      )}
      {isEmpty && (
        <Box component="span" sx={styles.caption}>
          {PROJECT_PAGE_STATUS_COPY.NO_TRANSITIONS}
        </Box>
      )}
      <Timeline entries={entries} />
    </Card>
  );
};

export default ProjectTimelineCard;
