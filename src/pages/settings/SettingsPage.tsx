import { useSessionUser } from "../../store/session.store";
import SettingsContent from "./components/SettingsContent";
import { PERMISSIONS } from "../../constants/permission.constant";
import { SETTINGS_COPY } from "../../constants/settings.constant";
import { hasPermission } from "../../utilities/permission.utility";
import InlineError from "../../components/InlineError/InlineError";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { toStatusStage } from "../../utilities/mappers/project.mapper";
import { useProjectStagesQuery } from "../../hooks/queries/project.query";

const SettingsPage = () => {
  const user = useSessionUser();
  const canReadStages = hasPermission(user, PERMISSIONS.PROJECTS_READ);
  const stagesQuery = useProjectStagesQuery(canReadStages);

  if (canReadStages && stagesQuery.isPending) {
    return <LoadingState label={SETTINGS_COPY.LOADING} />;
  }

  if (canReadStages && stagesQuery.isError) {
    return <InlineError message={getApiErrorMessage(stagesQuery.error)} />;
  }

  const savedStages = (stagesQuery.data ?? []).map(toStatusStage);

  return <SettingsContent stages={savedStages} canReadStages={canReadStages} />;
};

export default SettingsPage;
