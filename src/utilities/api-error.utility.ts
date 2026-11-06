import { isAxiosError } from "axios";
import { isRecord } from "./guards/primitive.guard";
import { UploadValidationError } from "./drive-upload.utility";
import { SETTINGS_COPY } from "../constants/settings.constant";
import { API_ERROR_CODES, HTTP_STATUS } from "../constants/api.constant";
import { AuthorizationContextChangedError } from "../managers/authorization-context.manager";

const GENERIC_ERROR_MESSAGE = "הפעולה נכשלה. נסה שוב בעוד רגע.";

const MESSAGE_BY_STATUS: Record<number, string> = {
  400: "הנתונים שנשלחו אינם תקינים",
  401: "פרטי ההתחברות שגויים או שפג תוקף החיבור",
  403: "אין לך הרשאה לבצע פעולה זו",
  404: "הפריט המבוקש לא נמצא",
  409: "הפעולה מתנגשת בנתונים קיימים",
};

const toMessage = (message: unknown) => {
  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    return message.filter(item => typeof item === "string").join(", ");
  }

  return null;
};

export const getApiErrorMessage = (error: unknown): string => {
  const isClientValidationError = error instanceof UploadValidationError;
  const hasChangedAuthorization = error instanceof AuthorizationContextChangedError;

  if (isClientValidationError || hasChangedAuthorization) {
    return error.message;
  }

  if (!isAxiosError(error)) {
    return GENERIC_ERROR_MESSAGE;
  }

  const body: unknown = error.response?.data;
  const serverMessage = isRecord(body) ? toMessage(body.message) : null;
  const statusMessage = MESSAGE_BY_STATUS[error.response?.status ?? 0] ?? GENERIC_ERROR_MESSAGE;

  if (!serverMessage) {
    return statusMessage;
  }

  return `${statusMessage} (${serverMessage})`;
};

export const getPasswordChangeErrorMessage = (error: unknown): string => {
  const body: unknown = isAxiosError(error) ? error.response?.data : null;
  const isWrongCurrentPassword =
    isAxiosError(error) &&
    error.response?.status === HTTP_STATUS.BAD_REQUEST &&
    isRecord(body) &&
    body.code === API_ERROR_CODES.INVALID_CURRENT_PASSWORD;

  return isWrongCurrentPassword
    ? SETTINGS_COPY.CURRENT_PASSWORD_INCORRECT
    : getApiErrorMessage(error);
};
