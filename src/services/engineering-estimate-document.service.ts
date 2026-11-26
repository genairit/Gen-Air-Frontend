import { getApiErrorMessage } from "../utilities/api-error.utility";
import { AxiosError, isAxiosError, type AxiosResponse } from "axios";
import { ESTIMATE_PDF_TYPE } from "../constants/engineering-estimate.constant";

export class EstimateDocumentError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.status = status;
  }
}

const parseErrorResponse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const readErrorResponse = async (error: unknown): Promise<never> => {
  if (!isAxiosError(error) || !(error.response?.data instanceof Blob)) {
    throw error;
  }

  const { status, data } = error.response;
  const response = { ...error.response, data: parseErrorResponse(await data.text()) };
  const parsed = new AxiosError(error.message, error.code, error.config, error.request, response);
  throw new EstimateDocumentError(getApiErrorMessage(parsed), status);
};

export const receiveEstimateDocument = async (
  response: Promise<AxiosResponse<Blob>>,
): Promise<Blob> => {
  const result = await response.catch(readErrorResponse);
  return result.data;
};

export const receiveEstimatePdf = async (response: Promise<AxiosResponse<Blob>>): Promise<Blob> => {
  const content = await receiveEstimateDocument(response);
  if (content.type !== ESTIMATE_PDF_TYPE) {
    throw new EstimateDocumentError("קובץ ה־PDF שהתקבל אינו תקין.");
  }

  return content;
};
