import { useState } from "react";
import { isAxiosError } from "axios";
import { logger } from "../utilities/logger.utility";
import { quotationService } from "../services/quotation.service";
import { FileDownloadManager } from "../managers/file-download.manager";

interface IQuotationPdfState {
  busy: boolean;
  error: string | null;
  download: () => Promise<void>;
}

export const useQuotationPdf = (quotationId: string): IQuotationPdfState => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const { pdf, filename } = await quotationService.exportPdf(quotationId);
      FileDownloadManager.download(pdf, filename);
    } catch (cause) {
      const status = isAxiosError(cause) ? (cause.response?.status ?? null) : null;
      const errorType = isAxiosError(cause)
        ? "http"
        : cause instanceof Error
          ? cause.name
          : "unknown";
      logger.error("Quotation PDF export failed", { status, errorType });
      setError("לא ניתן לייצא את הצעת המחיר. נסו שוב.");
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, download };
};
