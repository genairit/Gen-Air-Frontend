import type { FC } from "react";
import Button from "../../../components/Button/Button";
import NoticeBanner from "../../../components/NoticeBanner/NoticeBanner";
import { DRIVE_FOLDER_COPY } from "../../../constants/drive-folder.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IDriveUnavailableBannerProps {
  onRetry: () => Promise<unknown>;
}

const DriveUnavailableBanner: FC<IDriveUnavailableBannerProps> = ({ onRetry }) => {
  const handleRetry = async () => {
    await onRetry();
  };

  return (
    <NoticeBanner
      title={DRIVE_FOLDER_COPY.UNAVAILABLE_TITLE}
      lines={[DRIVE_FOLDER_COPY.UNAVAILABLE_LINE]}
      actions={
        <Button
          onClick={handleRetry}
          text={DRIVE_FOLDER_COPY.RETRY}
          variant={BUTTON_VARIANTS.NEUTRAL}
        />
      }
    />
  );
};

export default DriveUnavailableBanner;
