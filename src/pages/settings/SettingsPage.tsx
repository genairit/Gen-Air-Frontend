import SettingsContent from "./components/SettingsContent";
import { useSessionUser } from "../../store/session.store";
import { SETTINGS_COPY } from "../../constants/settings.constant";
import InlineError from "../../components/InlineError/InlineError";
import { hasPermission } from "../../utilities/permission.utility";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { toStatusStage } from "../../utilities/mappers/project.mapper";
import { useProjectStagesQuery } from "../../hooks/queries/project.query";

const SettingsPage = () => {
  const sessionUser = useSessionUser();
  const stagesQuery = useProjectStagesQuery();

  if (stagesQuery.isPending) {
    return <LoadingState label={SETTINGS_COPY.LOADING} />;
  }

  if (stagesQuery.isError) {
    return <InlineError message={getApiErrorMessage(stagesQuery.error)} />;
  }

  const savedStages = stagesQuery.data.map(toStatusStage);

  return (
    <SettingsContent
      savedStages={savedStages}
      key={savedStages.map(stage => stage.id).join()}
      canManageSettings={hasPermission(sessionUser, "MANAGE_SETTINGS")}
    />
  );
};

export default SettingsPage;
