import type {
  IQuotation,
  IQuotationCancellation,
  TQuotationConfirmation,
  IQuotationConfirmationView,
} from "../interfaces/quotation.interface";

import { theme } from "../constants/theme.constants";
import { DATE_FORMAT } from "../constants/date.constants";
import { formatDate, normalizeDate } from "./date.utility";
import type { ITimelineEntry } from "../interfaces/project.interface";
import { QUOTATION_CONFIRMATION, QUOTATION_STATUS } from "../constants/quotation.constant";

export const quotationCancellationNoun = (quotation: IQuotation): "הזמנה" | "הצעה" => {
  const priorStatus =
    quotation.cancelledFromStatus ?? quotation.cancellationHistory.at(-1)?.fromStatus;
  const isOrder =
    quotation.status === QUOTATION_STATUS.APPROVED ||
    (quotation.status === QUOTATION_STATUS.CANCELLED && priorStatus === QUOTATION_STATUS.APPROVED);
  return isOrder ? "הזמנה" : "הצעה";
};

export const quotationCancellationView = (
  quotation: IQuotation,
  action: TQuotationConfirmation,
): IQuotationConfirmationView => {
  const noun = quotationCancellationNoun(quotation);
  const isOrder = noun === "הזמנה";
  const definiteNoun = isOrder ? "ההזמנה" : "ההצעה";

  const consequence = isOrder ? " הזמנות רכש ומסמכים שכבר נשלחו לא יבוטלו אוטומטית." : "";
  const views: Record<TQuotationConfirmation, IQuotationConfirmationView> = {
    [QUOTATION_CONFIRMATION.RETURN]: {
      title: "החזרה לעריכה",
      actionLabel: "החזר לעריכה",
      description: `המסמך יחזור לטיוטה ויידרש אישור מחדש. היסטוריית המסמך תישמר. קובץ המחזור יועבר לארכיון ב-Drive.${consequence}`,
    },
    [QUOTATION_CONFIRMATION.CANCEL]: {
      title: `ביטול ${noun}`,
      description: `${definiteNoun} תבוטל אך תישמר במערכת. קובץ המחזור יועבר לארכיון ב-Drive. שחזור לסטטוס הקודם זמין למנהל מערכת מורשה.${consequence}`,
      actionLabel: `בטל ${noun}`,
    },
    [QUOTATION_CONFIRMATION.RESTORE]: {
      title: `שחזור ${noun}`,
      description: `${definiteNoun} תשוחזר לסטטוס שבו הייתה מיד לפני הביטול.`,
      actionLabel: `שחזר ${noun}`,
    },
  };
  return views[action];
};

export const quotationCancellationTimeline = (
  history: IQuotationCancellation[],
): ITimelineEntry[] =>
  history
    .flatMap((record, index) => {
      const wasOrder = record.fromStatus === QUOTATION_STATUS.APPROVED;
      const cancellation: ITimelineEntry = {
        id: `${index}-cancelled`,
        label: wasOrder ? "ביטול הזמנה" : "ביטול הצעה",
        date: formatDate(normalizeDate(record.cancelledAt), DATE_FORMAT.FULL_DATE),
        author: `${record.cancelledByName} · סיבה: ${record.reason}`,
        dotColor: theme.palette.danger,
      };
      if (record.restoredAt === null || record.restoredById === null) {
        return [cancellation];
      }

      const restoration: ITimelineEntry = {
        id: `${index}-restored`,
        label: wasOrder ? "שחזור הזמנה" : "שחזור הצעה",
        date: formatDate(normalizeDate(record.restoredAt), DATE_FORMAT.FULL_DATE),
        author: record.restoredByName ?? record.restoredById,
        dotColor: theme.palette.statusBlue,
      };
      return [cancellation, restoration];
    })
    .reverse();
