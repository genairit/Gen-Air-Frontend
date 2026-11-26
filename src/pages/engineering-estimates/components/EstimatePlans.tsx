import {
  estimatePlanType,
  validateEstimatePlanSelection,
} from "../../../utilities/engineering-estimate.utility";

import { useState, type FC } from "react";
import { Box, Typography } from "@mui/material";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import DropZone from "../../../components/DropZone/DropZone";
import SelectField from "../../../components/SelectField/SelectField";
import InlineError from "../../../components/InlineError/InlineError";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { useProjectDriveQuery } from "../../../hooks/queries/project.query";
import { ROOT_DRIVE_LOCATION } from "../../../constants/drive-file.constant";
import { FileDownloadManager } from "../../../managers/file-download.manager";
import type { IDriveFolderLocation } from "../../../interfaces/drive-file.interface";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { engineeringEstimateService } from "../../../services/engineering-estimate.service";
import type { IEngineeringEstimate } from "../../../interfaces/engineering-estimate.interface";

interface IEstimatePlansProps {
  busy: boolean;
  canEdit: boolean;
  canBrowse: boolean;
  estimate: IEngineeringEstimate;
  run: (command: () => Promise<void>) => void;
}

const EstimatePlans: FC<IEstimatePlansProps> = ({ estimate, busy, canEdit, canBrowse, run }) => {
  const styles = usePageStyles();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [marked, setMarked] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [path, setPath] = useState<IDriveFolderLocation[]>([ROOT_DRIVE_LOCATION]);
  const location = path.at(-1) ?? ROOT_DRIVE_LOCATION;
  const projectId = estimate.projectId ?? "";
  const browseAllowed = canEdit && canBrowse && projectId !== "";
  const library = useProjectDriveQuery(projectId, location.folderId, browsing && browseAllowed);
  const folders = library.data?.folders ?? [];
  const files = (library.data?.files ?? []).filter(
    file => estimatePlanType({ name: file.name, type: file.mimeType }) !== null,
  );
  const hasParentFolder = path.length > 1;
  const planType = marked ? "marked" : "source";
  const upload = ([file]: File[]): void => {
    if (!file) {
      return;
    }

    const validation = validateEstimatePlanSelection(file, marked);
    if (validation) {
      setUploadError(validation);
      return;
    }

    setUploadError(null);
    run((): Promise<void> =>
      engineeringEstimateService.upload(estimate.id, estimate.version, file, marked),
    );
  };
  const download = (id: string, name: string): void => {
    run(async (): Promise<void> => {
      const blob = await engineeringEstimateService.plan(estimate.id, id);
      FileDownloadManager.download(blob, name);
    });
  };

  return (
    <Box sx={styles.stack({ gap: "12px" })}>
      {estimate.plans.map((plan): React.JSX.Element => (
        <Button
          key={plan.id}
          disabled={busy}
          variant={BUTTON_VARIANTS.NEUTRAL}
          onClick={(): void => download(plan.id, plan.name)}
          text={plan.marked ? `${plan.name} · מסומנת` : plan.name}
        />
      ))}
      {canEdit && (
        <>
          <SelectField
            disabled={busy}
            value={planType}
            ariaLabel="סוג תוכנית"
            onChange={(event): void => setMarked(event.target.value === "marked")}
            items={[
              { value: "source", label: "תוכנית מקור" },
              { value: "marked", label: "תשריט מסומן לסקיצה" },
            ]}
          />
          <DropZone
            compact
            disabled={busy}
            multiple={false}
            title="העלאת תוכנית"
            onFilesSelected={upload}
            buttonLabel="בחירת קובץ"
            description={marked ? "PNG או JPEG" : "PDF, PNG או JPEG"}
            accept={marked ? "image/png,image/jpeg" : "application/pdf,image/png,image/jpeg"}
          />
        </>
      )}
      {uploadError && <InlineError message={uploadError} />}
      {browseAllowed && (
        <Button
          disabled={busy}
          variant={BUTTON_VARIANTS.SECONDARY}
          onClick={(): void => setBrowsing(!browsing)}
          text={browsing ? "סגירת קובצי הפרויקט" : "בחירה מקובצי הפרויקט"}
        />
      )}
      {browsing && browseAllowed && (
        <Box sx={styles.stack({ gap: "8px" })}>
          <Typography>{location.name}</Typography>
          {hasParentFolder && (
            <Button
              disabled={busy}
              text="לתיקייה הקודמת"
              onClick={(): void => setPath(path.slice(0, -1))}
            />
          )}
          {library.isPending && <LoadingState />}
          {library.isError && <InlineError message={getApiErrorMessage(library.error)} />}
          {folders.map((folder): React.JSX.Element => (
            <Button
              key={folder.id}
              disabled={busy}
              text={folder.name}
              variant={BUTTON_VARIANTS.NEUTRAL}
              onClick={(): void => setPath([...path, { folderId: folder.id, name: folder.name }])}
            />
          ))}
          {files.map((file): React.JSX.Element => (
            <Button
              key={file.id}
              disabled={busy}
              text={`צירוף ${file.name}`}
              variant={BUTTON_VARIANTS.SECONDARY}
              onClick={(): void =>
                run((): Promise<void> =>
                  engineeringEstimateService.attach(estimate.id, estimate.version, file.id),
                )
              }
            />
          ))}
          {library.isSuccess && folders.length + files.length === 0 && (
            <Typography>התיקייה ריקה.</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EstimatePlans;
