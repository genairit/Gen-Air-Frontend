import type { FC } from "react";
import Button from "../../../components/Button/Button";
import { useSessionUser } from "../../../store/session.store";
import { PERMISSIONS } from "../../../constants/permission.constant";
import InlineError from "../../../components/InlineError/InlineError";
import { hasPermission } from "../../../utilities/permission.utility";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { EXISTING_DRIVE_FOLDER_COPY } from "../../../constants/existing-drive-folder.constant";
import { formatMissingTemplateFolders } from "../../../utilities/existing-drive-folder.utility";
import { useCompleteProjectDriveTemplateMutation } from "../../../hooks/mutations/project.mutation";
import { getExistingDriveFolderError } from "../../../utilities/existing-drive-folder-error.utility";
import { NOTICE_VARIANTS } from "../../../vendor/smartbase/components/NoticeCard/constants/notice-card.constant";

interface IDriveTemplateCompletionNoticeProps {
  projectId: string;
  missingFolders: string[];
}

const DriveTemplateCompletionNotice: FC<IDriveTemplateCompletionNoticeProps> = ({
  projectId,
  missingFolders,
}) => {
  const user = useSessionUser();
  const mutation = useCompleteProjectDriveTemplateMutation();
  const canComplete = hasPermission(user, PERMISSIONS.PROJECTS_UPDATE);
  const label = mutation.isPending
    ? EXISTING_DRIVE_FOLDER_COPY.COMPLETING
    : EXISTING_DRIVE_FOLDER_COPY.COMPLETE;
  const hint = canComplete
    ? EXISTING_DRIVE_FOLDER_COPY.MISSING_HINT
    : EXISTING_DRIVE_FOLDER_COPY.MISSING_READ_ONLY;
  const lines = [formatMissingTemplateFolders(missingFolders), hint];
  const error = mutation.isError ? getExistingDriveFolderError(mutation.error) : null;

  return (
    <>
      <NoticeBanner
        lines={lines}
        variant={NOTICE_VARIANTS.warning}
        title={EXISTING_DRIVE_FOLDER_COPY.MISSING_TITLE}
        actions={
          canComplete && (
            <Button
              text={label}
              isLoading={mutation.isPending}
              disabled={mutation.isPending}
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={() => mutation.mutate(projectId)}
            />
          )
        }
      />
      {error && <InlineError message={error} />}
    </>
  );
};

export default DriveTemplateCompletionNotice;
