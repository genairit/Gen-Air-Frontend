import { IMPORT_STAGE, IMPORT_ROW_STATUS } from "../constants/apartment-import.constant";

export type ImportStageType = (typeof IMPORT_STAGE)[keyof typeof IMPORT_STAGE];
export type ImportRowStatusType = (typeof IMPORT_ROW_STATUS)[keyof typeof IMPORT_ROW_STATUS];

export type ImportSkippedStatusType = Exclude<
  ImportRowStatusType,
  typeof IMPORT_ROW_STATUS.CREATED
>;

export interface IImportSkippedRow {
  reason: string;
  rowNumber: number;
  apartment: string;
  status: ImportSkippedStatusType;
}

export type ImportCountsType = Record<ImportRowStatusType, number>;

export interface IApartmentImportResult {
  counts: ImportCountsType;
  rows: readonly IImportSkippedRow[];
}

export interface IImportFailure {
  title: string;
  message: string;
  code: string | null;
}

interface IApartmentImportViewBase {
  fileName: string;
  progress: number | null;
  refreshRequired?: boolean;
  failure: IImportFailure | null;
}

export type TApartmentImportView = IApartmentImportViewBase &
  (
    | { stage: typeof IMPORT_STAGE.SELECT | typeof IMPORT_STAGE.PROCESSING; result: null }
    | { stage: typeof IMPORT_STAGE.RESULTS; result: IApartmentImportResult }
  );

export interface IApartmentImportResponse extends IApartmentImportResult {
  reportBase64: string | null;
}

export interface IApartmentImportRequest {
  file: File;
  buildingId: string;
  onProgress: (value: number | null) => void;
}

export interface IApartmentImportStateActions {
  setReport: (report: string | null) => void;
  setView: (view: TApartmentImportView) => void;
}
