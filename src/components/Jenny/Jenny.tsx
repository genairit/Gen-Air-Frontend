import type { FC } from "react";
import JennyAssistant from "./components/JennyAssistant";
import { useSessionUser } from "../../store/session.store";
import { PERMISSIONS } from "../../constants/permission.constant";
import { hasPermission } from "../../utilities/permission.utility";
import { getJennyContextKey } from "../../utilities/jenny.utility";
import type { IJennyContext } from "../../interfaces/jenny.interface";

interface IJennyProps {
  contextLabel: string;
  context: IJennyContext;
}

const Jenny: FC<IJennyProps> = ({ context, contextLabel }) => {
  const sessionUser = useSessionUser();
  const canOpenSources = hasPermission(sessionUser, PERMISSIONS.DRIVE_READ);

  return (
    <JennyAssistant
      context={context}
      contextLabel={contextLabel}
      canOpenSources={canOpenSources}
      key={getJennyContextKey(context)}
    />
  );
};

export default Jenny;
