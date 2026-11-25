import { HTTP_STATUS, type HttpStatusType } from "../../constants/api.constant";

const HTTP_STATUS_VALUES: readonly number[] = Object.values(HTTP_STATUS);

export const isHttpStatus = (value?: number | null): value is HttpStatusType =>
  value != null && HTTP_STATUS_VALUES.includes(value);
