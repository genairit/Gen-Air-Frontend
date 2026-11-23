import {
  QUOTATION_STATUS_LABELS,
  QUOTATION_LIFECYCLE_LABELS,
} from "../constants/quotation.constant";

import { sortByNewest } from "./date.utility";
import { theme } from "../constants/theme.constants";
import { DATE_FORMAT } from "../constants/date.constants";
import { formatDate, normalizeDate } from "./date.utility";
import type { ITimelineEntry } from "../interfaces/project.interface";
import { QUOTATION_LIFECYCLE_COPY } from "../constants/quotation.constant";
import { QUOTATION_LIFECYCLE_ACTION } from "../constants/quotation.constant";
import { PUBLICATION_COPY } from "../constants/quotation-publication.constant";
import { publicationHistoryDescription } from "./quotation-publication.utility";
import type { IQuotationActionAvailability } from "../interfaces/quotation.interface";
import type { IQuotationPublication } from "../interfaces/quotation-publication.interface";
import type { IQuotation, IQuotationTimelineEntry } from "../interfaces/quotation.interface";

export const quotationLifecycleTimeline = (
  quotation: IQuotation,
  publication: IQuotationPublication | null = null,
): ITimelineEntry[] => {
  const legacyCancellations = quotation.cancellationHistory.flatMap(
    (record, index): IQuotationTimelineEntry[] => {
      const cancellation = {
        createdAt: record.cancelledAt,
        id: `legacy-cancel-${index}`,
        label: QUOTATION_LIFECYCLE_LABELS[QUOTATION_LIFECYCLE_ACTION.CANCEL],
        date: formatDate(normalizeDate(record.cancelledAt), DATE_FORMAT.FULL_DATE),
        author: `${record.cancelledByName} · סיבה: ${record.reason}`,
        dotColor: theme.palette.danger,
      };
      if (!record.restoredAt) {
        return [cancellation];
      }
      return [
        cancellation,
        {
          createdAt: record.restoredAt,
          id: `legacy-restore-${index}`,
          label: QUOTATION_LIFECYCLE_LABELS[QUOTATION_LIFECYCLE_ACTION.RESTORE],
          date: formatDate(normalizeDate(record.restoredAt), DATE_FORMAT.FULL_DATE),
          author: record.restoredByName ?? record.restoredById ?? "",
          dotColor: theme.palette.statusBlue,
        },
      ];
    },
  );
  const legacyRejections = quotation.rejectionHistory.map(
    (record, index): IQuotationTimelineEntry => ({
      createdAt: record.rejectedAt,
      id: `legacy-reject-${index}`,
      label: QUOTATION_LIFECYCLE_LABELS[QUOTATION_LIFECYCLE_ACTION.REJECT],
      date: formatDate(normalizeDate(record.rejectedAt), DATE_FORMAT.FULL_DATE),
      author: `${record.rejectedByName} · סיבה: ${record.reason}`,
      dotColor: theme.palette.danger,
    }),
  );
  const lifecycle = (quotation.lifecycleHistory ?? []).map((event): IQuotationTimelineEntry => {
    const stages =
      publication?.history.filter((stage): boolean => stage.lifecycleEventId === event.id) ?? [];
    const fileStage = stages.findLast((stage): boolean => stage.fileUrl !== null);
    const fileUrl = fileStage?.fileUrl ?? null;
    const detail = stages.map(publicationHistoryDescription).join(" · ");
    const fileLink =
      fileUrl === null ? null : { href: fileUrl, label: PUBLICATION_COPY.HISTORY_OPEN };
    const transition = `${QUOTATION_STATUS_LABELS[event.fromStatus]} ← ${QUOTATION_STATUS_LABELS[event.toStatus]}`;
    return {
      id: event.id,
      createdAt: event.occurredAt,
      label: `${QUOTATION_LIFECYCLE_LABELS[event.action]} · ${transition}`,
      date: formatDate(normalizeDate(event.occurredAt), DATE_FORMAT.FULL_DATE),
      author: event.actorName,
      note: event.reason,
      detail,
      fileLink,
      dotColor: theme.palette.statusBlue,
    };
  });
  const legacy = [...legacyCancellations, ...legacyRejections].filter(
    (entry): boolean =>
      !lifecycle.some(
        (event): boolean =>
          event.createdAt === entry.createdAt && event.label.startsWith(entry.label),
      ),
  );
  return sortByNewest([...legacy, ...lifecycle]).reverse();
};

export const quotationActionAvailabilityMessage = ({
  available,
  forbidden,
}: IQuotationActionAvailability): string | null => {
  if (forbidden) {
    return QUOTATION_LIFECYCLE_COPY.FORBIDDEN;
  }
  if (!available) {
    return QUOTATION_LIFECYCLE_COPY.SOURCE_CHANGED;
  }
  return null;
};
