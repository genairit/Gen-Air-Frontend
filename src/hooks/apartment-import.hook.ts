import {
  startApartmentImportAction,
  downloadApartmentReportAction,
  downloadApartmentTemplateAction,
  refreshImportedApartmentsAction,
} from "../actions/apartment-import-flow.action";

import { useRef, useState } from "react";
import { IMPORT_STAGE } from "../constants/apartment-import.constant";
import type { TApartmentImportView } from "../interfaces/apartment-import.interface";

export const useApartmentImport = (buildingId: string) => {
  const pending = useRef(false);
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [view, setView] = useState<TApartmentImportView>({
    stage: IMPORT_STAGE.SELECT,
    fileName: "",
    progress: null,
    failure: null,
    result: null,
  });
  const reset = (): void => {
    setReport(null);
    setView({
      stage: IMPORT_STAGE.SELECT,
      fileName: "",
      progress: null,
      failure: null,
      result: null,
    });
  };
  const retry = (): void => {
    const refreshRequired = view.refreshRequired === true || view.stage === IMPORT_STAGE.RESULTS;
    setReport(null);
    setView({
      stage: IMPORT_STAGE.SELECT,
      fileName: "",
      progress: null,
      failure: null,
      result: null,
      refreshRequired,
    });
  };
  const openImport = (): void => {
    reset();
    setOpen(true);
  };
  const closeImport = (): void => {
    setOpen(false);
    reset();
  };
  const selectFiles = async (files: File[]): Promise<void> => {
    const file = files[0] ?? null;
    if (!file) {
      return;
    }

    if (pending.current) {
      return;
    }

    pending.current = true;
    try {
      await startApartmentImportAction({ file, buildingId, setView, setReport });
    } finally {
      pending.current = false;
    }
  };
  const downloadTemplate = async (): Promise<void> => {
    await downloadApartmentTemplateAction(buildingId);
  };
  const downloadReport = async (): Promise<void> => {
    await downloadApartmentReportAction(report);
  };
  const finish = async (): Promise<void> => {
    await refreshImportedApartmentsAction(buildingId);
  };
  return {
    open,
    view,
    openImport,
    closeImport,
    retry,
    selectFiles,
    downloadTemplate,
    downloadReport,
    finish,
  };
};
