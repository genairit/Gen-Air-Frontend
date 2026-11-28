import type { FC } from "react";

import { useMutation } from "@tanstack/react-query";
import { Box, Link, Typography } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import InlineError from "../../../components/InlineError/InlineError";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { ESTIMATE_EXPORT_COPY } from "../../../constants/engineering-estimate.constant";
import { engineeringEstimateService } from "../../../services/engineering-estimate.service";
import { PUBLICATION_DRIVE_URL_PATTERNS } from "../../../constants/quotation-publication.constant";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";

interface IEstimateDriveExportProps {
  id: string;
  busy: boolean;
  version: number;
  disabled: boolean;
  projectId: string | null;
}

const isDriveUrl = (url: string | null): url is string =>
  url !== null &&
  (PUBLICATION_DRIVE_URL_PATTERNS.FILE.test(url) || PUBLICATION_DRIVE_URL_PATTERNS.OPEN.test(url));

const EstimateDriveExport: FC<IEstimateDriveExportProps> = ({
  id,
  busy,
  version,
  disabled,
  projectId,
}) => {
  const styles = usePageStyles();
  const exportToDrive = useMutation({
    mutationFn: () => engineeringEstimateService.exportToDrive(id, version),
  });
  const missingProject = projectId === null;
  const fileUrl = exportToDrive.data?.fileUrl ?? null;

  return (
    <Box sx={styles.stack({ gap: "8px" })}>
      <Box sx={styles.row({ gap: "8px" })}>
        <Button
          variant={BUTTON_VARIANTS.SECONDARY}
          onClick={(): void => exportToDrive.mutate()}
          isLoading={exportToDrive.isPending}
          disabled={disabled || busy || missingProject || exportToDrive.isPending}
          text={exportToDrive.isPending ? ESTIMATE_EXPORT_COPY.BUSY : ESTIMATE_EXPORT_COPY.BUTTON}
        />
        {disabled && !missingProject && (
          <Typography role="status">{ESTIMATE_EXPORT_COPY.SAVE_FIRST}</Typography>
        )}
        {missingProject && <Typography role="status">{ESTIMATE_EXPORT_COPY.NO_PROJECT}</Typography>}
      </Box>
      {exportToDrive.isSuccess && (
        <Typography role="status">
          {ESTIMATE_EXPORT_COPY.SUCCESS}
          {isDriveUrl(fileUrl) && (
            <>
              {" · "}
              <Link href={fileUrl} target="_blank" rel="noopener noreferrer">
                {ESTIMATE_EXPORT_COPY.OPEN}
              </Link>
            </>
          )}
        </Typography>
      )}
      {exportToDrive.isError && <InlineError message={getApiErrorMessage(exportToDrive.error)} />}
    </Box>
  );
};

export default EstimateDriveExport;
