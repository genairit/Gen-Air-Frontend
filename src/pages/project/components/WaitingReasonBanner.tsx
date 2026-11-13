import {
  toWaitingReasonLines,
  isWaitingForResponseStage,
} from "../../../utilities/stage-reason.utility";

import type { FC } from "react";
import { sortByNewest } from "../../../utilities/date.utility";
import type { IApiProject } from "../../../interfaces/api.interface";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import { STAGE_REASON_COPY } from "../../../constants/project-stage.constant";
import { useProjectTransitionsQuery } from "../../../hooks/queries/project.query";

interface IWaitingReasonBannerProps {
  project: IApiProject;
}

const WaitingReasonBanner: FC<IWaitingReasonBannerProps> = ({ project }) => {
  const transitionsQuery = useProjectTransitionsQuery(project.id);
  const latestTransition = sortByNewest(transitionsQuery.data ?? [])[0] ?? null;

  if (!isWaitingForResponseStage(project.stageId)) {
    return null;
  }

  const lines = toWaitingReasonLines({
    latestTransition,
    waitingReason: project.waitingReason ?? null,
  });

  return <NoticeBanner lines={lines} title={STAGE_REASON_COPY.BANNER_TITLE} />;
};

export default WaitingReasonBanner;
