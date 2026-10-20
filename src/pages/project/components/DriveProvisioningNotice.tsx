import type { FC } from "react";
import Button from "../../../components/Button/Button";
import { useSessionUser } from "../../../store/session.store";
import InlineError from "../../../components/InlineError/InlineError";
import { hasPermission } from "../../../utilities/permission.utility";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import { DRIVE_FOLDER_COPY } from "../../../constants/drive-folder.constant";
import { getDriveRecoveryError } from "../../../utilities/drive-folder.utility";
import { useProvisionProjectDriveMutation } from "../../../hooks/mutations/project.mutation";

interface IDriveProvisioningNoticeProps {
  projectId: string;
}

const DriveProvisioningNotice: FC<IDriveProvisioningNoticeProps> = ({ projectId }) => {
  const user = useSessionUser();
  const mutation = useProvisionProjectDriveMutation();
  const canProvision = hasPermission(user, "EDIT_PROJECTS");

  const noticeLines = [
    canProvision
      ? DRIVE_FOLDER_COPY.MISSING_FOLDER_LINE
      : DRIVE_FOLDER_COPY.MISSING_FOLDER_READ_ONLY,
  ];
  const buttonLabel = mutation.isPending
    ? DRIVE_FOLDER_COPY.PREPARING_FOLDER
    : DRIVE_FOLDER_COPY.PREPARE_FOLDER;

  return (
    <>
      <NoticeBanner
        lines={noticeLines}
        title={DRIVE_FOLDER_COPY.MISSING_FOLDER_TITLE}
        actions={
          canProvision && (
            <Button
              isLoading={mutation.isPending}
              text={buttonLabel}
              ariaLabel={buttonLabel}
              onClick={() => mutation.mutate(projectId)}
            />
          )
        }
      />
      {mutation.isError && <InlineError message={getDriveRecoveryError(mutation.error)} />}
    </>
  );
};

export default DriveProvisioningNotice;
