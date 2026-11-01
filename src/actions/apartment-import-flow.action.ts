import {
  IMPORT_STAGE,
  IMPORT_DOWNLOAD,
  APARTMENT_IMPORT,
} from "../constants/apartment-import.constant";

import type {
  IImportFailure,
  IApartmentImportRequest,
  IApartmentImportStateActions,
} from "../interfaces/apartment-import.interface";

import {
  getCustomerImportErrorCode,
  getCustomerImportErrorMessage,
} from "../utilities/customer-import-error.utility";

import {
  CUSTOMER_IMPORT_ERROR_COPY,
  CUSTOMER_IMPORT_ERROR_MESSAGES,
} from "../constants/customer-import-error.constant";

import { isAxiosError } from "axios";
import { logger } from "../utilities/logger.utility";
import { queryClient } from "../providers/query-client";
import { isRecord } from "../utilities/guards/primitive.guard";
import { FileDownloadManager } from "../managers/file-download.manager";
import { QUERY_KEYS, QUERY_ROOTS } from "../constants/query-key.constant";
import { apartmentImportService } from "../services/apartment-import.service";
import { CUSTOMER_CONTACT_QUERY_ROOT } from "../constants/customer-contact.constant";

interface IStartImportOptions extends IApartmentImportStateActions {
  file: File;
  buildingId: string;
}

const getImportFailure = (error: unknown): IImportFailure => {
  const response = isAxiosError(error) ? (error.response ?? null) : null;
  const body: unknown = response?.data ?? null;
  const isTemplateStatus = response?.status === APARTMENT_IMPORT.INVALID_TEMPLATE_STATUS;
  const isTemplateError =
    isTemplateStatus && isRecord(body) && body.code === APARTMENT_IMPORT.INVALID_TEMPLATE;
  if (isTemplateError) {
    return {
      title: "הייבוא נכשל: מבנה הקובץ לא תואם",
      message: CUSTOMER_IMPORT_ERROR_COPY.TEMPLATE,
      code: APARTMENT_IMPORT.INVALID_TEMPLATE,
    };
  }

  const code = getCustomerImportErrorCode(error);
  const knownCode = code !== null && Object.hasOwn(CUSTOMER_IMPORT_ERROR_MESSAGES, code);
  if (knownCode) {
    return {
      title: "הייבוא נכשל",
      message: getCustomerImportErrorMessage(error),
      code,
    };
  }

  return {
    title: "לא התקבלו תוצאות הייבוא",
    message:
      "לא ניתן לקבל את תוצאות הייבוא. ייתכן ששורות כבר נקלטו; בייבוא חוזר דירות קיימות ידולגו ולא ישתנו.",
    code: null,
  };
};

export const startApartmentImportAction = async ({
  file,
  buildingId,
  setView,
  setReport,
}: IStartImportOptions): Promise<void> => {
  setReport(null);
  const processingView = {
    refreshRequired: true,
    stage: IMPORT_STAGE.PROCESSING,
    fileName: file.name,
    progress: null,
    failure: null,
    result: null,
  } as const;
  setView(processingView);
  const onProgress: IApartmentImportRequest["onProgress"] = progress =>
    setView({ ...processingView, progress });
  try {
    const response = await apartmentImportService.upload({ file, buildingId, onProgress });
    setReport(response.reportBase64);
    setView({
      refreshRequired: true,
      stage: IMPORT_STAGE.RESULTS,
      fileName: file.name,
      progress: null,
      failure: null,
      result: { counts: response.counts, rows: response.rows },
    });
  } catch (error) {
    logger.error("Apartment workbook import failed", {});
    setView({
      refreshRequired: true,
      stage: IMPORT_STAGE.SELECT,
      fileName: file.name,
      progress: null,
      failure: getImportFailure(error),
      result: null,
    });
  }
};

export const downloadApartmentTemplateAction = async (buildingId: string): Promise<void> => {
  const blob = await apartmentImportService.template(buildingId);
  FileDownloadManager.download(blob, IMPORT_DOWNLOAD.TEMPLATE);
};

export const downloadApartmentReportAction = async (report: string | null): Promise<void> => {
  if (!report) {
    throw new Error("Apartment error report is unavailable");
  }

  const blob = FileDownloadManager.decodeBase64(report, APARTMENT_IMPORT.MIME_TYPE);
  FileDownloadManager.download(blob, IMPORT_DOWNLOAD.REPORT);
};

export const refreshImportedApartmentsAction = async (buildingId: string): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries(
      { queryKey: [QUERY_ROOTS.CUSTOMER_PROJECTS] },
      { throwOnError: true },
    ),
    queryClient.invalidateQueries(
      { queryKey: [QUERY_ROOTS.APARTMENTS, buildingId] },
      { throwOnError: true },
    ),
    queryClient.invalidateQueries(
      { queryKey: QUERY_KEYS.apartmentStageCounts(buildingId) },
      { throwOnError: true },
    ),
    queryClient.invalidateQueries(
      { queryKey: QUERY_KEYS.project(buildingId) },
      { throwOnError: true },
    ),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMERS] }, { throwOnError: true }),
    queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.CUSTOMER] }, { throwOnError: true }),
    queryClient.invalidateQueries(
      { queryKey: [CUSTOMER_CONTACT_QUERY_ROOT] },
      { throwOnError: true },
    ),
  ]);
};
