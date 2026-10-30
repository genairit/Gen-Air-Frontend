import type {
  ImportStageType,
  TApartmentImportView,
} from "../../interfaces/apartment-import.interface";

import { Box } from "@mui/material";
import { useStyles } from "./ApartmentImport.style";
import ImportHeader from "./components/ImportHeader";
import ImportResults from "./components/ImportResults";
import GenericPopup from "../GenericPopup/GenericPopup";
import { type FC, type ReactNode, useState } from "react";
import ImportSelection from "./components/ImportSelection";
import ImportProcessing from "./components/ImportProcessing";
import ServerErrorBanner from "./components/ServerErrorBanner";
import { performApartmentImportAction } from "../../actions/apartment-import.action";
import { APARTMENT_IMPORT, IMPORT_STAGE } from "../../constants/apartment-import.constant";
import { validateApartmentImportSelection } from "../../utilities/apartment-import.utility";

interface IApartmentImportProps {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  buildingName: string;
  existingCount: number;
  view: TApartmentImportView;
  onFinish: () => Promise<void>;
  onDownloadReport: () => Promise<void>;
  onDownloadTemplate: () => Promise<void>;
  onFilesSelected: (files: File[]) => Promise<void>;
}

const ApartmentImport: FC<IApartmentImportProps> = ({
  open,
  view,
  onClose,
  onRetry,
  onFinish,
  buildingName,
  existingCount,
  onFilesSelected,
  onDownloadReport,
  onDownloadTemplate,
}) => {
  const styles = useStyles();
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const isProcessing = view.stage === IMPORT_STAGE.PROCESSING;
  const isFinished = view.stage === IMPORT_STAGE.RESULTS;
  const requiresRefresh = isFinished || view.refreshRequired === true;
  const activeStep = isFinished ? 1 : 0;
  const buttonText = isFinished ? "סיום" : "סגור";
  const popupStyle = styles.popup({ finished: isFinished });
  const handleClose = async (): Promise<void> => {
    if (isProcessing) {
      return;
    }

    const error = requiresRefresh ? await performApartmentImportAction(onFinish) : null;
    setSelectionError(error);
    if (error) {
      return;
    }

    setSelectionError(null);
    onClose();
  };
  const handleDownloadTemplate = async (): Promise<void> => {
    setSelectionError(await performApartmentImportAction(onDownloadTemplate));
  };
  const handleDownloadReport = async (): Promise<void> => {
    setSelectionError(await performApartmentImportAction(onDownloadReport));
  };
  const handleFilesSelected = async (files: File[]): Promise<void> => {
    const error = validateApartmentImportSelection(files);
    setSelectionError(error);
    if (error) {
      return;
    }

    setSelectionError(await performApartmentImportAction(() => onFilesSelected(files)));
  };
  const handleRetry = (): void => {
    setSelectionError(null);
    onRetry();
  };
  const selectionFailure = selectionError
    ? { title: "לא ניתן להשלים את הפעולה", message: selectionError, code: null }
    : null;
  const failure = selectionFailure ?? view.failure;
  const selectionButtonLabel = failure ? "נסה קובץ אחר" : "בחירת קובץ";
  const renderers: Record<ImportStageType, () => ReactNode> = {
    [IMPORT_STAGE.SELECT]: () => {
      if (failure) {
        return null;
      }

      return (
        <ImportSelection
          existingCount={existingCount}
          buttonLabel={selectionButtonLabel}
          onFilesSelected={handleFilesSelected}
          onDownloadTemplate={handleDownloadTemplate}
        />
      );
    },
    [IMPORT_STAGE.PROCESSING]: () => (
      <ImportProcessing fileName={view.fileName} progress={view.progress} />
    ),
    [IMPORT_STAGE.RESULTS]: () =>
      view.result && (
        <ImportResults
          result={view.result}
          onRetry={handleRetry}
          onDownloadReport={handleDownloadReport}
        />
      ),
  };
  const stageContent = renderers[view.stage]();
  const content = (
    <Box dir="rtl" sx={styles.stack}>
      {failure && (
        <ServerErrorBanner
          failure={failure}
          onRetry={handleRetry}
          onDownloadTemplate={handleDownloadTemplate}
        />
      )}
      {stageContent}
    </Box>
  );
  const header = (
    <ImportHeader
      onClose={handleClose}
      activeStep={activeStep}
      disabled={isProcessing}
      buildingName={buildingName}
    />
  );
  const buttons = {
    primary: { text: buttonText, onClick: handleClose, isDisabled: isProcessing },
  };
  return (
    <GenericPopup
      open={open}
      align="right"
      maxWidth="lg"
      sx={popupStyle}
      header={header}
      content={content}
      buttons={buttons}
      onClose={handleClose}
      closeAfterAction={false}
      title={APARTMENT_IMPORT.TITLE}
    />
  );
};

export default ApartmentImport;
