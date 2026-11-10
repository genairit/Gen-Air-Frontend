import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { logger } from "../utilities/logger.utility";
import { quotationService } from "../services/quotation.service";

interface IQuotationPdfState {
  busy: boolean;
  close: () => void;
  url: string | null;
  error: string | null;
  open: () => Promise<void>;
  download: () => Promise<void>;
}

export const useQuotationPdf = (quotationId: string, filename: string): IQuotationPdfState => {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    },
    [url],
  );

  const open = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const pdf = await quotationService.exportPdf(quotationId);
      setUrl(URL.createObjectURL(pdf));
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
  const download = async (): Promise<void> => {
    if (!url) {
      return;
    }
    const file = await fetch(url).then(response => response.blob());
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000);
  };
  return { url, busy, error, open, download, close: () => setUrl(null) };
};
