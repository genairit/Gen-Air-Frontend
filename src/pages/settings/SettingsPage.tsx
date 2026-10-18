import SettingsContent from "./components/SettingsContent";
import { SETTINGS_COPY } from "../../constants/settings.constant";
import InlineError from "../../components/InlineError/InlineError";
import LoadingState from "../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { toStatusStage } from "../../utilities/mappers/project.mapper";
import { useProjectStagesQuery } from "../../hooks/queries/project.query";

const SettingsPage = () => {
  const stagesQuery = useProjectStagesQuery();

  if (stagesQuery.isPending) {
    return <LoadingState label={SETTINGS_COPY.LOADING} />;
  }

  if (stagesQuery.isError) {
    return <InlineError message={getApiErrorMessage(stagesQuery.error)} />;
  }

  const savedStages = stagesQuery.data.map(toStatusStage);

  return <SettingsContent stages={savedStages} />;
};

export default SettingsPage;
