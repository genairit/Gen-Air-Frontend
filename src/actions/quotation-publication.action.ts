import type {
  IQuotationPublication,
  IQuotationPublicationRetry,
} from "../interfaces/quotation-publication.interface";

import { isAxiosError } from "axios";
import { logger } from "../utilities/logger.utility";
import { AuthorizationContext } from "../managers/authorization-context.manager";
import { quotationPublicationService } from "../services/quotation-publication.service";

export const readQuotationPublication = async (id: string): Promise<IQuotationPublication> => {
  const context = new AuthorizationContext();
  try {
    const publication = await quotationPublicationService.get(id);
    context.assertCurrent();
    return publication;
  } catch (cause) {
    const status = isAxiosError(cause) ? (cause.response?.status ?? null) : null;
    logger.error("Quotation publication read failed", { status });
    throw cause;
  }
};
export const retryQuotationPublication = async (
  id: string,
  input: IQuotationPublicationRetry,
): Promise<IQuotationPublication> => {
  const context = new AuthorizationContext();
  try {
    const publication = await quotationPublicationService.retry(id, input);
    context.assertCurrent();
    return publication;
  } catch (cause) {
    const status = isAxiosError(cause) ? (cause.response?.status ?? null) : null;
    logger.error("Quotation publication retry failed", { status });
    throw cause;
  }
};
